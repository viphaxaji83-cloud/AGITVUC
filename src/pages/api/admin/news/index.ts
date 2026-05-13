import type { APIRoute } from 'astro';
import {
  NewsValidationError,
  createNews,
  getAdminNews,
} from '../../../../lib/server/newsStore';
import { requireAdminSession } from '../../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  return json({ ok: true, news: await getAdminNews() });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  try {
    const payload = await request.json();
    const item = await createNews(payload);

    return json({ ok: true, news: item }, { status: 201 });
  } catch (error) {
    if (error instanceof NewsValidationError) {
      return json({ ok: false, error: 'validation_error', errors: error.errors }, { status: 400 });
    }

    return json({ ok: false, error: 'unexpected' }, { status: 500 });
  }
};

export const PUT: APIRoute = () => methodNotAllowed('GET, POST');
export const DELETE: APIRoute = () => methodNotAllowed('GET, POST');
