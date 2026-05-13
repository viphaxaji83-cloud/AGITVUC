import type { APIRoute } from 'astro';
import { getPublishedNews } from '../../../lib/server/newsStore';
import { json, methodNotAllowed } from '../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = async () =>
  json({ ok: true, news: await getPublishedNews() });

export const POST: APIRoute = () => methodNotAllowed('GET');
