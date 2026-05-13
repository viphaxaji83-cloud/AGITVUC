import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const SESSION_COOKIE = 'agitvuc_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const HASH_ITERATIONS = 210_000;
const HASH_KEY_LENGTH = 32;
const DEFAULT_ADMIN_LOGIN = 'admin';
const DEFAULT_ADMIN_PASSWORD_HASH =
  'pbkdf2-sha256$210000$YrAkFusZS3mQP4DPXHTYgQ$uM2V4N7_ovUWvClym0qgD65MNsnktWMOs73rIoRW990';
const DEFAULT_AUTH_SECRET = 'agitvuc-default-admin-secret-change-in-production';

interface SessionPayload {
  login: string;
  exp: number;
}

const getEnv = (key: string) => process.env[key] ?? import.meta.env[key];

const base64Url = (value: Buffer | string) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const fromBase64Url = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const getAuthSecret = () => getEnv('AUTH_SECRET') ?? DEFAULT_AUTH_SECRET;

const getAdminLogin = () => getEnv('ADMIN_LOGIN') ?? DEFAULT_ADMIN_LOGIN;

const getAdminPasswordHash = () =>
  getEnv('ADMIN_PASSWORD_HASH') ?? DEFAULT_ADMIN_PASSWORD_HASH;

export const createPasswordHash = (password: string) => {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    'sha256',
  );

  return `pbkdf2-sha256$${HASH_ITERATIONS}$${base64Url(salt)}$${base64Url(hash)}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [algorithm, iterationsRaw, saltRaw, hashRaw] = storedHash.split('$');

  if (algorithm !== 'pbkdf2-sha256' || !iterationsRaw || !saltRaw || !hashRaw) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;

  const salt = fromBase64Url(saltRaw);
  const expected = fromBase64Url(hashRaw);
  const actual = pbkdf2Sync(
    password,
    salt,
    iterations,
    expected.length,
    'sha256',
  );

  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
};

const sign = (data: string) =>
  base64Url(createHmac('sha256', getAuthSecret()).update(data).digest());

const createSessionToken = (login: string) => {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      login,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    } satisfies SessionPayload),
  );
  const data = `${header}.${payload}`;

  return `${data}.${sign(data)}`;
};

const verifySessionToken = (token: string): SessionPayload | null => {
  if (!getAuthSecret()) return null;

  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const data = `${header}.${payload}`;
  if (!safeEqual(signature, sign(data))) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload).toString('utf8')) as SessionPayload;

    if (!parsed.login || parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return parsed;
  } catch {
    return null;
  }
};

const parseCookies = (request: Request) => {
  const header = request.headers.get('cookie') ?? '';
  const cookies = new Map<string, string>();

  header.split(';').forEach((part) => {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name) return;

    cookies.set(name, decodeURIComponent(valueParts.join('=')));
  });

  return cookies;
};

const serializeCookie = (
  request: Request,
  name: string,
  value: string,
  maxAge: number,
) => {
  const isHttps = new URL(request.url).protocol === 'https:';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];

  if (isHttps) parts.push('Secure');

  return parts.join('; ');
};

export const isAuthConfigured = () =>
  Boolean(getAdminLogin() && getAdminPasswordHash() && getAuthSecret());

export const loginAdmin = (login: string, password: string) => {
  if (!isAuthConfigured()) return null;
  if (!safeEqual(login, getAdminLogin())) return null;
  if (!verifyPassword(password, getAdminPasswordHash())) return null;

  return createSessionToken(login);
};

export const getAdminSession = async (request: Request) => {
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session || session.login !== getAdminLogin()) return null;

  return session;
};

export const createSessionCookie = (request: Request, token: string) =>
  serializeCookie(request, SESSION_COOKIE, token, SESSION_TTL_SECONDS);

export const clearSessionCookie = (request: Request) =>
  serializeCookie(request, SESSION_COOKIE, '', 0);

export const isSameOriginMutation = (request: Request) => {
  if (request.method === 'GET' || request.method === 'HEAD') return true;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  return new URL(origin).origin === new URL(request.url).origin;
};

export const requireAdminSession = async (request: Request) => {
  const session = await getAdminSession(request);

  if (!session) {
    return {
      session: null,
      response: new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  if (!isSameOriginMutation(request)) {
    return {
      session: null,
      response: new Response(JSON.stringify({ ok: false, error: 'forbidden_origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { session, response: null };
};
