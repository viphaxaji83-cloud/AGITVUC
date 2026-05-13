import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  NEWS_PLACEHOLDER_IMAGE,
  sortNewsByDate,
  type NewsDraft,
  type NewsItem,
} from '../news';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const storagePath = process.env.NEWS_STORAGE_PATH
  ? path.resolve(process.env.NEWS_STORAGE_PATH)
  : path.resolve(process.cwd(), 'storage/news.json');

export class NewsValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Invalid news payload');
  }
}

const toCleanString = (value: unknown, maxLength = 10000) =>
  String(value ?? '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const normalizeImage = (value: string) => {
  if (!value) return NEWS_PLACEHOLDER_IMAGE;

  try {
    if (value.startsWith('/')) return value;

    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return value;
  } catch {
    return NEWS_PLACEHOLDER_IMAGE;
  }

  return NEWS_PLACEHOLDER_IMAGE;
};

const normalizeNewsItem = (item: any, fallbackId?: string): NewsItem => {
  const now = new Date().toISOString();
  const content = Array.isArray(item.content)
    ? item.content.join('\n\n')
    : String(item.content ?? '');

  return {
    id: String(item.id ?? fallbackId ?? randomUUID()),
    slug: toCleanString(item.slug, 140).toLowerCase(),
    title: toCleanString(item.title, 220),
    date: toCleanString(item.date, 20),
    image: normalizeImage(toCleanString(item.image, 1000)),
    imageAlt: toCleanString(item.imageAlt, 240),
    excerpt: toCleanString(item.excerpt, 600),
    content: toCleanString(content, 30000),
    isPublished: item.isPublished !== false,
    createdAt: toCleanString(item.createdAt, 40) || now,
    updatedAt: toCleanString(item.updatedAt, 40) || now,
  };
};

const ensureStorage = async () => {
  await mkdir(path.dirname(storagePath), { recursive: true });
};

const readRawNews = async () => {
  await ensureStorage();

  try {
    const file = await readFile(storagePath, 'utf8');
    const parsed = JSON.parse(file);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item, index) => normalizeNewsItem(item, String(index + 1)));
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error;

    const items: NewsItem[] = [];
    await writeNews(items);
    return items;
  }
};

const writeNews = async (items: NewsItem[]) => {
  await ensureStorage();

  const tmpPath = `${storagePath}.${process.pid}.tmp`;
  const payload = JSON.stringify(sortNewsByDate(items), null, 2) + '\n';

  await writeFile(tmpPath, payload, 'utf8');
  await rename(tmpPath, storagePath);
};

const validateNewsPayload = (
  payload: unknown,
  existingItems: NewsItem[],
  editingId?: string,
): NewsDraft => {
  const source = payload && typeof payload === 'object' ? (payload as any) : {};
  const draft: NewsDraft = {
    title: toCleanString(source.title, 220),
    slug: toCleanString(source.slug, 140).toLowerCase(),
    date: toCleanString(source.date, 20),
    image: normalizeImage(toCleanString(source.image, 1000)),
    imageAlt: toCleanString(source.imageAlt, 240),
    excerpt: toCleanString(source.excerpt, 600),
    content: toCleanString(source.content, 30000),
    isPublished: Boolean(source.isPublished),
  };
  const errors: Record<string, string> = {};

  if (!draft.title) errors.title = 'Укажите заголовок';
  if (!draft.slug) errors.slug = 'Укажите slug';
  if (draft.slug && !slugPattern.test(draft.slug)) {
    errors.slug = 'Slug должен содержать латиницу, цифры и дефисы';
  }
  if (
    draft.slug &&
    existingItems.some((item) => item.slug === draft.slug && item.id !== editingId)
  ) {
    errors.slug = 'Такой slug уже используется';
  }
  if (!draft.date) errors.date = 'Укажите дату публикации';
  if (draft.date && !isValidDate(draft.date)) errors.date = 'Дата должна быть в формате YYYY-MM-DD';
  if (!draft.excerpt) errors.excerpt = 'Укажите короткое описание';
  if (!draft.content) errors.content = 'Добавьте полный текст новости';

  if (Object.keys(errors).length > 0) {
    throw new NewsValidationError(errors);
  }

  if (!draft.imageAlt) draft.imageAlt = draft.title;

  return draft;
};

export const getAllNews = async () => sortNewsByDate(await readRawNews());

export const getPublishedNews = async () =>
  sortNewsByDate((await readRawNews()).filter((item) => item.isPublished));

export const getPublishedNewsBySlug = async (slug: string) =>
  (await getPublishedNews()).find((item) => item.slug === slug);

export const getAdminNews = getAllNews;

export const createNews = async (payload: unknown) => {
  const items = await readRawNews();
  const now = new Date().toISOString();
  const draft = validateNewsPayload(payload, items);
  const item: NewsItem = {
    id: randomUUID(),
    ...draft,
    createdAt: now,
    updatedAt: now,
  };

  await writeNews([item, ...items]);

  return item;
};

export const updateNews = async (id: string, payload: unknown) => {
  const items = await readRawNews();
  const current = items.find((item) => item.id === id);

  if (!current) return null;

  const draft = validateNewsPayload(payload, items, id);
  const updated: NewsItem = {
    ...current,
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  await writeNews(items.map((item) => (item.id === id ? updated : item)));

  return updated;
};

export const deleteNews = async (id: string) => {
  const items = await readRawNews();
  const nextItems = items.filter((item) => item.id !== id);

  if (nextItems.length === items.length) return false;

  await writeNews(nextItems);

  return true;
};

export const newsStoragePath = storagePath;
