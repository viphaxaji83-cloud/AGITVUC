import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getRuntimeEnv } from './runtimeEnv';

export interface SiteSettings {
  contactEmail: string;
  updatedAt?: string;
}

export class SettingsValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Invalid settings payload');
  }
}

const defaultContactEmail = 'vip.haxaji@mail.ru';
const configuredStoragePath = getRuntimeEnv('SETTINGS_STORAGE_PATH');
const storagePath = configuredStoragePath
  ? path.resolve(configuredStoragePath)
  : path.resolve(process.cwd(), 'storage/settings.json');

const getEnv = (key: string) => getRuntimeEnv(key)?.trim();

const getEnvContactEmail = () =>
  getEnv('MAIL_TO') ?? getEnv('CONTACT_TO_EMAIL') ?? defaultContactEmail;

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizeSettings = (settings: Partial<SiteSettings> = {}): SiteSettings => {
  const contactEmail = String(settings.contactEmail ?? '').trim();

  return {
    contactEmail: contactEmail || getEnvContactEmail(),
    updatedAt: settings.updatedAt,
  };
};

const ensureStorage = async () => {
  await mkdir(path.dirname(storagePath), { recursive: true });
};

const writeSettings = async (settings: SiteSettings) => {
  await ensureStorage();

  const tmpPath = `${storagePath}.${process.pid}.tmp`;
  const payload = JSON.stringify(settings, null, 2) + '\n';

  await writeFile(tmpPath, payload, 'utf8');
  await rename(tmpPath, storagePath);
};

export const getSettings = async (): Promise<SiteSettings> => {
  await ensureStorage();

  try {
    const file = await readFile(storagePath, 'utf8');
    const parsed = JSON.parse(file);

    return normalizeSettings(parsed);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error;

    const settings = normalizeSettings();
    await writeSettings(settings);

    return settings;
  }
};

export const updateSettings = async (payload: unknown) => {
  const source = payload && typeof payload === 'object' ? (payload as any) : {};
  const contactEmail = String(source.contactEmail ?? '').trim();
  const errors: Record<string, string> = {};

  if (!contactEmail) {
    errors.contactEmail = 'Укажите email для заявок';
  } else if (!isValidEmail(contactEmail)) {
    errors.contactEmail = 'Укажите корректный email';
  }

  if (Object.keys(errors).length > 0) {
    throw new SettingsValidationError(errors);
  }

  const settings: SiteSettings = {
    contactEmail,
    updatedAt: new Date().toISOString(),
  };

  await writeSettings(settings);

  return settings;
};

export const getContactRecipientEmail = async () =>
  (await getSettings()).contactEmail;

export const settingsStoragePath = storagePath;
