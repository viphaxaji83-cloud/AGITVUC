import type { APIRoute } from 'astro';
import { requireAdminSession } from '../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../lib/server/responses';
import {
  SettingsValidationError,
  getSettings,
  updateSettings,
} from '../../../lib/server/settingsStore';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  return json({ ok: true, settings: await getSettings() });
};

export const PUT: APIRoute = async ({ request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  try {
    const payload = await request.json();
    const settings = await updateSettings(payload);

    return json({ ok: true, settings });
  } catch (error) {
    if (error instanceof SettingsValidationError) {
      return json(
        { ok: false, error: 'validation_error', errors: error.errors },
        { status: 400 },
      );
    }

    return json({ ok: false, error: 'unexpected' }, { status: 500 });
  }
};

export const POST: APIRoute = () => methodNotAllowed('GET, PUT');
export const DELETE: APIRoute = () => methodNotAllowed('GET, PUT');
