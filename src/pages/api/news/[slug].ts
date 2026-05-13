import type { APIRoute } from 'astro';
import { getPublishedNewsBySlug } from '../../../lib/server/newsStore';
import { json, methodNotAllowed } from '../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const item = await getPublishedNewsBySlug(params.slug ?? '');

  if (!item) {
    return json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  return json({ ok: true, news: item });
};

export const POST: APIRoute = () => methodNotAllowed('GET');
