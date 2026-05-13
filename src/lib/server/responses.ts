export const json = (data: unknown, init?: ResponseInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

export const methodNotAllowed = (allow: string) =>
  json(
    { ok: false, error: 'method_not_allowed' },
    {
      status: 405,
      headers: { Allow: allow },
    },
  );
