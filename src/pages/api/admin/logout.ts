import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../lib/server/responses';

export const prerender = false;

export const GET: APIRoute = () => methodNotAllowed('POST');

export const POST: APIRoute = ({ request }) =>
  json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(request),
      },
    },
  );
