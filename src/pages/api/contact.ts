import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({ ok: false, error: 'method_not_allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    },
  );

/**
 * Stub endpoint for the contact form.
 *
 * Сейчас не передаёт данные во внешние системы. Здесь нужно подключить
 * настоящий backend (CRM, SMTP, очередь и т.д.):
 *
 * 1. Валидация входных данных и согласия на обработку ПДн.
 * 2. Антиспам (rate-limit, honeypot, токен).
 * 3. Передача в целевую систему.
 * 4. Журналирование.
 *
 * При статической сборке (`output: 'static'`) этот route недоступен —
 * включите режим `server` или `hybrid` в astro.config и адаптер по выбору
 * (Node, Vercel, Cloudflare и т.п.) перед использованием на проде.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      direction: String(formData.get('direction') ?? '').trim(),
      status: String(formData.get('status') ?? '').trim(),
      comment: String(formData.get('comment') ?? '').trim(),
      consent: formData.get('consent') === 'on',
      receivedAt: new Date().toISOString(),
    };

    if (!payload.name || !payload.phone) {
      return new Response(
        JSON.stringify({ ok: false, error: 'invalid_input' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!payload.consent) {
      return new Response(
        JSON.stringify({ ok: false, error: 'consent_required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // TODO(api): подключить отправку в целевой backend / CRM / email.
    // Пока что просто возвращаем подтверждение приёма.
    if (import.meta.env.DEV) {
      console.log('[contact-form:stub] received', payload);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'unexpected' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
