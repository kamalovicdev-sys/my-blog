import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { findFirstImage, resolveImageUrl } from './images';
import { getExcerpt, getReadingTime, renderMarkdown } from './markdown';
import { slugify } from './slug';

const postsDirectory = path.join(process.cwd(), 'content/posts');

// Qoralamalar (draft: true) `npm run dev`da ko'rinadi, lekin saytga chiqmaydi
const isProduction = process.env.NODE_ENV === 'production';

export type Tag = { name: string; slug: string };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: Tag[];
  imageUrl: string | null;
  draft: boolean;
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

  return {
    meta: {
      slug: data.slug ? String(data.slug) : slugify(name),
      // Obsidian shablonida bo'sh qolgan maydonlar uchun fayl nomi va matndan olingan tavsif ishlatiladi
      title: String(data.title || name).trim(),
      date,
      description: String(data.description || getExcerpt(content)),
      tags: parseTags(data.tags),
      imageUrl: cover ? resolveImageUrl(String(cover)) : null,
      draft: data.draft === true,
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
    .filter((post) => !isProduction || !post.meta.draft)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

  const slugs = posts.map((post) => post.meta.slug);
  const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicate) {
    throw new Error(`content/posts: bir nechta post "${duplicate}" manziliga to'g'ri keladi, birining nomini yoki slug'ini o'zgartiring`);
  }

  if (isProduction) cachedPosts = posts;
  return posts;
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
