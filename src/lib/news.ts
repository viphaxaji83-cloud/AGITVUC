export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewsDraft = Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>;

export const NEWS_PLACEHOLDER_IMAGE = '/images/news/news-1.svg';

export const sortNewsByDate = <T extends Pick<NewsItem, 'date' | 'createdAt'>>(
  items: T[],
) =>
  [...items].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();

    if (dateDiff !== 0) return dateDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export const getNewsParagraphs = (content: string | string[]) => {
  if (Array.isArray(content)) return content.filter(Boolean);

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

export const formatNewsDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};
