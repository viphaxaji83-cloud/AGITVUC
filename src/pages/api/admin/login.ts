import type { APIRoute } from 'astro';
import {
  createSessionCookie,
  isSameOriginMutation,
  isAuthConfigured,
  loginAdmin,
} from '../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = () => methodNotAllowed('POST');

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginMutation(request)) {
    return json({ ok: false, error: 'forbidden_origin' }, { status: 403 });
  }

  if (!isAuthConfigured()) {
    return json(
      {
        ok: false,
        error: 'auth_not_configured',
        message: 'ADMIN_LOGIN, ADMIN_PASSWORD_HASH и AUTH_SECRET не настроены',
      },
      { status: 500 },
    );
  }

  const payload = await request.json().catch(() => null);
  const login = String(payload?.login ?? '').trim();
  const password = String(payload?.password ?? '');
  const token = loginAdmin(login, password);

  if (!token) {
    return json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  return json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': createSessionCookie(request, token),
      },
    },
  );
};
