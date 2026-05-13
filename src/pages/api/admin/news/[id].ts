import type { APIRoute } from 'astro';
import {
  NewsValidationError,
  deleteNews,
  updateNews,
} from '../../../../lib/server/newsStore';
import { requireAdminSession } from '../../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = () => methodNotAllowed('PUT, DELETE');

export const PUT: APIRoute = async ({ params, request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  try {
    const payload = await request.json();
    const item = await updateNews(params.id ?? '', payload);

    if (!item) {
      return json({ ok: false, error: 'not_found' }, { status: 404 });
    }

    return json({ ok: true, news: item });
  } catch (error) {
    if (error instanceof NewsValidationError) {
      return json({ ok: false, error: 'validation_error', errors: error.errors }, { status: 400 });
    }

    return json({ ok: false, error: 'unexpected' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  const deleted = await deleteNews(params.id ?? '');

  if (!deleted) {
    return json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return json({ ok: true });
};

export const POST: APIRoute = () => methodNotAllowed('PUT, DELETE');
