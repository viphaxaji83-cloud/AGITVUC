import type { APIRoute } from 'astro';
import { getAdminSession, isAuthConfigured } from '../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = await getAdminSession(request);

  return json({
    ok: true,
    configured: isAuthConfigured(),
    authenticated: Boolean(session),
    login: session?.login ?? null,
  });
};

export const POST: APIRoute = () => methodNotAllowed('GET');
