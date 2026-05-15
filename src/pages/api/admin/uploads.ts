import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { requireAdminSession } from '../../../lib/server/auth';
import { json, methodNotAllowed } from '../../../lib/server/responses';
import { getRuntimeEnv } from '../../../lib/server/runtimeEnv';

export const prerender = false;

const MAX_FILES = 12;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const configuredUploadDirectory = getRuntimeEnv('NEWS_UPLOAD_DIR');
const uploadDirectory = configuredUploadDirectory
  ? path.resolve(configuredUploadDirectory)
  : path.resolve(
      process.cwd(),
      import.meta.env.DEV ? 'public/uploads/news' : 'dist/client/uploads/news',
    );

const publicBase = (getRuntimeEnv('NEWS_UPLOAD_PUBLIC_BASE') || '/uploads/news').replace(
  /\/+$/,
  '',
);

const isUploadFile = (value: unknown): value is File =>
  typeof value === 'object' &&
  value !== null &&
  'arrayBuffer' in value &&
  'name' in value &&
  'size' in value &&
  'type' in value;

const safeNamePart = (name: string) =>
  path
    .parse(name)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36);

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdminSession(request);
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const files = formData.getAll('images').filter(isUploadFile);

    if (files.length === 0) {
      return json({ ok: false, error: 'no_files' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return json({ ok: false, error: 'too_many_files' }, { status: 400 });
    }

    await mkdir(uploadDirectory, { recursive: true });

    const images = [];

    for (const file of files) {
      const extension = allowedTypes.get(file.type);

      if (!extension) {
        return json({ ok: false, error: 'unsupported_file_type' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return json({ ok: false, error: 'file_too_large' }, { status: 400 });
      }

      const originalName = safeNamePart(file.name);
      const fileName = [
        Date.now(),
        randomUUID().slice(0, 8),
        originalName,
      ]
        .filter(Boolean)
        .join('-');
      const finalName = `${fileName}.${extension}`;
      const filePath = path.join(uploadDirectory, finalName);

      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

      images.push({
        src: `${publicBase}/${finalName}`,
        alt: path.parse(file.name).name || 'Изображение новости',
      });
    }

    return json({ ok: true, images });
  } catch {
    return json({ ok: false, error: 'unexpected' }, { status: 500 });
  }
};

export const GET: APIRoute = () => methodNotAllowed('POST');
export const PUT: APIRoute = () => methodNotAllowed('POST');
export const DELETE: APIRoute = () => methodNotAllowed('POST');
