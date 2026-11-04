import matter from 'gray-matter';
import { today } from '@/lib/date';
import { parseDate, parseTags } from '@/lib/posts';

// Admin paneldagi forma. extra: forma ko'rsatmaydigan, lekin faylda saqlanib qolishi kerak bo'lgan maydonlar (masalan slug)
export type PostForm = {
  title: string;
  date: string;
  description: string;
  tags: string;
  cover: string;
  draft: boolean;
  body: string;
  extra: Record<string, unknown>;
};

const FORM_KEYS = ['title', 'date', 'description', 'tags', 'cover', 'draft'];

export const POSTS_DIRECTORY = 'content/posts';

// Faqat content/posts ichidagi .md fayl nomi (papka yo'li emas)
export function isPostFileName(fileName: string) {
  return /^[^/\\]+\.md$/.test(fileName) && !fileName.startsWith('.');
}

export function emptyPostForm(): PostForm {
  return { title: '', date: today(), description: '', tags: '', cover: '', draft: true, body: '', extra: {} };
}

export function readPostForm(source: string): PostForm {
  const { data, content } = matter(source);
  const extra = Object.fromEntries(Object.entries(data).filter(([key]) => !FORM_KEYS.includes(key)));

  return {
    title: String(data.title ?? ''),
    date: parseDate(data.date) ?? today(),
    description: String(data.description ?? ''),
    tags: parseTags(data.tags).map((tag) => tag.name).join(', '),
    cover: String(data.cover ?? ''),
    draft: data.draft === true,
    body: content.replace(/^\n+/, ''),
    extra,
  };
}

export function serializePostForm(form: PostForm) {
  const tags = parseTags(form.tags).map((tag) => tag.name);
  const extra = Object.fromEntries(Object.entries(form.extra).filter(([key]) => !FORM_KEYS.includes(key)));
  const data = {
    title: form.title.trim(),
    date: form.date,
    ...(form.description.trim() && { description: form.description.trim() }),
    ...(tags.length > 0 && { tags }),
    ...(form.cover.trim() && { cover: form.cover.trim() }),
    draft: form.draft,
    ...extra,
  };
  return matter.stringify(`\n${form.body.replace(/^\n+/, '')}`, data);
}

// Brauzerdan kelgan formani tekshiradi: xato bo'lsa matn, aks holda forma qaytaradi
export function parsePostForm(value: unknown): PostForm | string {
  if (!value || typeof value !== 'object') return 'Post data is missing';
  const form = value as Record<string, unknown>;
  if (typeof form.title !== 'string' || !form.title.trim()) return 'Title is required';
  if (typeof form.date !== 'string' || !parseDate(form.date)) return 'Date must be in YYYY-MM-DD format';
  if (typeof form.body !== 'string') return 'Post text is missing';

  const extra = form.extra && typeof form.extra === 'object' && !Array.isArray(form.extra) ? (form.extra as Record<string, unknown>) : {};
  return {
    title: form.title,
    date: form.date,
    description: String(form.description ?? ''),
    tags: String(form.tags ?? ''),
    cover: String(form.cover ?? ''),
    draft: form.draft === true,
    body: form.body,
    extra,
  };
}
