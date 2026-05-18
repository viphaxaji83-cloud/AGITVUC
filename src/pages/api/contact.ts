import type { APIRoute } from 'astro';
import { createTransport } from 'nodemailer';
import { getRuntimeEnv } from '../../lib/server/runtimeEnv';
import { getContactRecipientEmail } from '../../lib/server/settingsStore';

export const prerender = false;

type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  direction: string;
  status: string;
  comment: string;
  consent: boolean;
  receivedAt: string;
};

const getEnv = (key: string) => getRuntimeEnv(key)?.trim();
const getFirstEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = getEnv(key);

    if (value) return value;
  }

  return undefined;
};

const parseBoolean = (value: string | undefined) => {
  if (!value) return undefined;

  const normalized = value.toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return undefined;
};

const json = (body: Record<string, unknown>, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });

export const GET: APIRoute = () =>
  json(
    { ok: false, error: 'method_not_allowed' },
    405,
    { Allow: 'POST' },
  );

const isLikelyEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return replacements[char] ?? char;
  });

const formatValue = (value: string) => value || '-';

const buildTextMessage = (payload: ContactPayload) =>
  [
    'Новая заявка с сайта bpla.mkgtu.ru',
    '',
    `Имя: ${formatValue(payload.name)}`,
    `Телефон: ${formatValue(payload.phone)}`,
    `Email: ${formatValue(payload.email)}`,
    `Статус студента: ${formatValue(payload.status)}`,
    `Направление: ${formatValue(payload.direction)}`,
    `Комментарий: ${formatValue(payload.comment)}`,
    `Согласие на обработку ПДн: ${payload.consent ? 'Да' : 'Нет'}`,
    `Дата получения: ${payload.receivedAt}`,
  ].join('\n');

const buildHtmlMessage = (payload: ContactPayload) => {
  const rows = [
    ['Имя', payload.name],
    ['Телефон', payload.phone],
    ['Email', payload.email],
    ['Статус студента', payload.status],
    ['Направление', payload.direction],
    ['Комментарий', payload.comment],
    ['Согласие на обработку ПДн', payload.consent ? 'Да' : 'Нет'],
    ['Дата получения', payload.receivedAt],
  ];

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2 style="margin: 0 0 16px;">Новая заявка с сайта bpla.mkgtu.ru</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border: 1px solid #e2e8f0; font-weight: 700;">${escapeHtml(label)}</td>
                <td style="border: 1px solid #e2e8f0;">${escapeHtml(formatValue(value))}</td>
              </tr>
            `,
          )
          .join('')}
      </table>
    </div>
  `;
};

const getSmtpConfig = async () => {
  const host = getEnv('SMTP_HOST');
  const port = Number.parseInt(getEnv('SMTP_PORT') ?? '465', 10);
  const user = getEnv('SMTP_USER');
  const pass = getFirstEnv('SMTP_PASS', 'SMTP_PASSWORD');
  const from = getFirstEnv('MAIL_FROM', 'SMTP_FROM') ?? user;
  const secure = parseBoolean(getEnv('SMTP_SECURE')) ?? port === 465;
  const useTls = parseBoolean(getEnv('SMTP_USE_TLS'));

  if (!host || !from) {
    throw new Error('SMTP_HOST and MAIL_FROM, SMTP_FROM or SMTP_USER are required');
  }

  return {
    host,
    port,
    secure,
    requireTLS: !secure && useTls ? true : undefined,
    auth: user && pass ? { user, pass } : undefined,
    from,
    to: await getContactRecipientEmail(),
  };
};

const sendContactEmail = async (payload: ContactPayload) => {
  const { from, to, ...transportConfig } = await getSmtpConfig();
  const transporter = createTransport(transportConfig);

  await transporter.sendMail({
    from,
    to,
    replyTo: isLikelyEmail(payload.email) ? payload.email : undefined,
    subject: 'Новая заявка с сайта bpla.mkgtu.ru',
    text: buildTextMessage(payload),
    html: buildHtmlMessage(payload),
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const payload: ContactPayload = {
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      direction: String(formData.get('direction') ?? '').trim(),
      status: String(formData.get('status') ?? '').trim(),
      comment: String(formData.get('comment') ?? '').trim(),
      consent: formData.get('consent') === 'on',
      receivedAt: new Date().toLocaleString('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Europe/Moscow',
      }),
    };

    if (!payload.name || !payload.phone) {
      return json({ ok: false, error: 'invalid_input' }, 400);
    }

    if (!payload.consent) {
      return json({ ok: false, error: 'consent_required' }, 400);
    }

    await sendContactEmail(payload);

    return json({ ok: true });
  } catch (err) {
    console.error('[contact-form] failed to send email', err);

    return json({ ok: false, error: 'email_send_failed' }, 500);
  }
};
