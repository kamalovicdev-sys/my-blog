import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { today } from './date';
import { findFirstImage, resolveImageUrl } from './images';
import { getExcerpt, getReadingTime, renderMarkdown } from './markdown';
import { slugify } from './slug';
import { TOPICS, topicHasTag } from './topics';

const postsDirectory = path.join(process.cwd(), 'content/posts');

// Qoralamalar (draft: true) va sanasi hali kelmagan postlar `npm run dev`da ko'rinadi, lekin saytga chiqmaydi
const isProduction = process.env.NODE_ENV === 'production';

export type Tag = { name: string; slug: string };

// Bir necha qismli maqola: frontmatter'dagi "series" (nomi) va "part" (qism raqami)
export type SeriesInfo = { name: string; slug: string; part: number | null; total: number };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: Tag[];
  imageUrl: string | null;
  draft: boolean;
  // E'lon qilingan, lekin sanasi kelajakda: sayt o'sha kuni qayta build qilinganda chiqadi (.github/workflows/publish-scheduled.yml)
  scheduled: boolean;
  series: SeriesInfo | null;
  readingTime: number;
};

type Post = { meta: PostMeta; content: string };

// Obsidian teglarni ro'yxat qilib yozadi, qo'lda esa "linux, ubuntu" deb ham yozish mumkin
export function parseTags(value: unknown): Tag[] {
  return (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map((tag) => String(tag).trim().replace(/^#/, ''))
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }));
}

// Obsidian sanani qo'shtirnoqsiz yozadi va gray-matter uni Date obyektiga aylantiradi
export function parseDate(value: unknown) {
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '');
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

// Fayl matnidan post yasash. Sayt build'i ham, GitHub'dan o'qiydigan admin panel ham shuni ishlatadi
export function parsePost(fileName: string, fileContents: string): Post | null {
  // Frontmatter'siz fayl hali post emas (masalan, shablon qo'yilmagan yangi qayd)
  if (!matter.test(fileContents)) return null;
  const { data, content } = matter(fileContents);
  const name = fileName.replace(/\.md$/, '');

  const date = parseDate(data.date);
  if (!date) {
    throw new Error(`content/posts/${fileName}: "date" maydoni YYYY-MM-DD ko'rinishida bo'lishi kerak`);
  }

  // cover berilmagan bo'lsa, matndagi birinchi rasm olinadi
  const cover = data.cover || findFirstImage(content);
  const draft = data.draft === true;
  const seriesName = String(data.series ?? '').trim();
  const part = Number.parseInt(String(data.part ?? ''), 10);

  return {
    meta: {
      slug: data.slug ? String(data.slug) : slugify(name),
      // Obsidian shablonida bo'sh qolgan maydonlar uchun fayl nomi va matndan olingan tavsif ishlatiladi
      title: String(data.title || name).trim(),
      date,
      description: String(data.description || getExcerpt(content)),
      tags: parseTags(data.tags),
      imageUrl: cover ? resolveImageUrl(String(cover)) : null,
      draft,
      scheduled: !draft && date > today(),
      // total (seriyadagi qismlar soni) getPosts'da, hamma postlar o'qilgandan keyin hisoblanadi
      series: seriesName ? { name: seriesName, slug: slugify(seriesName), part: part > 0 ? part : null, total: 1 } : null,
      readingTime: getReadingTime(content),
    },
    content,
  };
}

function readPost(fileName: string) {
  return parsePost(fileName, fs.readFileSync(path.join(postsDirectory, fileName), 'utf8'));
}

// Build paytida fayllar o'zgarmaydi, shuning uchun postlar bir marta o'qiladi
let cachedPosts: Post[] | null = null;

function getPosts() {
  if (cachedPosts) return cachedPosts;

  const posts = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map(readPost)
    .filter((post) => post !== null)
    .filter((post) => !isProduction || (!post.meta.draft && !post.meta.scheduled))
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

  const slugs = posts.map((post) => post.meta.slug);
  const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicate) {
    throw new Error(`content/posts: bir nechta post "${duplicate}" manziliga to'g'ri keladi, birining nomini yoki slug'ini o'zgartiring`);
  }

  countSeriesParts(posts.map((post) => post.meta));
  if (isProduction) cachedPosts = posts;
  return posts;
}

// "2 qismdan 1-si" uchun: saytdagi qismlar soni, raqamlar orasida bo'shliq bo'lsa eng katta qism raqami
function countSeriesParts(posts: PostMeta[]) {
  const counts = new Map<string, number>();
  const maxParts = new Map<string, number>();
  for (const { series } of posts) {
    if (!series) continue;
    counts.set(series.slug, (counts.get(series.slug) ?? 0) + 1);
    maxParts.set(series.slug, Math.max(maxParts.get(series.slug) ?? 0, series.part ?? 0));
  }
  for (const { series } of posts) {
    if (series) series.total = Math.max(counts.get(series.slug) ?? 1, maxParts.get(series.slug) ?? 0);
  }
}

function findPost(slug: string) {
  return getPosts().find((post) => post.meta.slug === slug) ?? null;
}

export function getAllPostSlugs() {
  return getPosts().map((post) => post.meta.slug);
}

export function getSortedPostsData() {
  return getPosts().map((post) => post.meta);
}

export function getPostMeta(slug: string) {
  return findPost(slug)?.meta ?? null;
}

export async function getPostData(slug: string) {
  const post = findPost(slug);
  if (!post) return null;

  const { html, toc } = await renderMarkdown(post.content);
  return { ...post.meta, contentHtml: html, toc };
}

// Har bir teg va undagi postlar soni, ko'p ishlatilgani oldin
export function getAllTags() {
  const tags = new Map<string, Tag & { count: number }>();
  for (const { meta } of getPosts()) {
    for (const tag of meta.tags) {
      const entry = tags.get(tag.slug) ?? { ...tag, count: 0 };
      entry.count += 1;
      tags.set(tag.slug, entry);
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPostsByTag(tagSlug: string) {
  return getSortedPostsData().filter((post) => post.tags.some((tag) => tag.slug === tagSlug));
}

// Teglari eng ko'p mos keladigan postlar; mos kelmasa, eng yangilari
export function getRelatedPosts(slug: string, limit = 3) {
  const current = getPostMeta(slug);
  if (!current) return [];
  const currentTags = new Set(current.tags.map((tag) => tag.slug));

  return getSortedPostsData()
    .filter((post) => post.slug !== slug)
    .map((post) => ({ post, score: post.tags.filter((tag) => currentTags.has(tag.slug)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getTopic(slug: string) {
  return TOPICS.find((topic) => topic.slug === slug) ?? null;
}

export function getPostsByTopic(slug: string) {
  const topic = getTopic(slug);
  if (!topic) return [];
  return getSortedPostsData().filter((post) => post.tags.some((tag) => topicHasTag(topic, tag.slug)));
}

// Mavzular va ulardagi postlar soni (bo'sh mavzular ham qaytadi, ko'rsatish-ko'rsatmaslikni sahifa hal qiladi)
export function getAllTopics() {
  return TOPICS.map((topic) => ({ ...topic, count: getPostsByTopic(topic.slug).length }));
}

function sortByPart(posts: PostMeta[]) {
  return [...posts].sort((a, b) => (a.series?.part ?? Infinity) - (b.series?.part ?? Infinity) || a.date.localeCompare(b.date));
}

// Seriyalar va ularning qismlari tartib bilan, eng yangi seriya oldin
export function getAllSeries() {
  const series = new Map<string, { name: string; slug: string; posts: PostMeta[] }>();
  for (const post of getSortedPostsData()) {
    if (!post.series) continue;
    const entry = series.get(post.series.slug) ?? { name: post.series.name, slug: post.series.slug, posts: [] };
    entry.posts.push(post);
    series.set(post.series.slug, entry);
  }
  return [...series.values()].map((entry) => ({ ...entry, posts: sortByPart(entry.posts) }));
}

export function getSeriesPosts(slug: string) {
  return getAllSeries().find((entry) => entry.slug === slug)?.posts ?? [];
}

// O'qish vaqti eng uzun postlar: bosh sahifadagi "Long reads"
export function getLongReads(limit = 5) {
  return [...getSortedPostsData()].sort((a, b) => b.readingTime - a.readingTime).slice(0, limit);
}
