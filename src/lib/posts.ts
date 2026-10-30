import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { Heading, Paragraph, Root } from 'mdast';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const EXCERPT_LENGTH = 160;

// Qoralamalar (draft: true) `npm run dev`da ko'rinadi, lekin saytga chiqmaydi
const showDrafts = process.env.NODE_ENV !== 'production';

// Fayl nomidan URL yasash: "Docker o'rnatish.md" → "docker-ornatish"
function slugify(fileName: string) {
  return fileName
    .replace(/\.md$/, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['‘’ʻʼ`]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

// Matndagi oddiy paragraflardan (sarlavha, rasm va HTML teglarsiz) qisqa tavsif yasash
function getExcerpt(markdown: string) {
  const tree = remark().use(remarkGfm).use(remarkMath).parse(markdown);
  const text = tree.children
    .filter((node): node is Paragraph => node.type === 'paragraph')
    .map((paragraph) =>
      paragraph.children
        .filter((node) => node.type !== 'html')
        .map((node) => toString(node, { includeImageAlt: false }))
        .join('')
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= EXCERPT_LENGTH) return text;
  return text.slice(0, text.lastIndexOf(' ', EXCERPT_LENGTH)) + '…';
}

// Sahifadagi yagona <h1> post sarlavhasi bo'lishi uchun, matnda `#` ishlatilgan bo'lsa
// barcha sarlavhalarni bir pog'ona pastga suramiz (# → h2, ## → h3, ...)
function remarkShiftHeadings() {
  return (tree: Root) => {
    const headings: Heading[] = [];
    visit(tree, 'heading', (node) => {
      headings.push(node);
    });

    if (!headings.some((heading) => heading.depth === 1)) return;
    for (const heading of headings) {
      heading.depth = Math.min(heading.depth + 1, 6) as Heading['depth'];
    }
  };
}

// Obsidian rasmga matnda nisbiy yo'l bilan (../images/rasm.png), property'da esa [[rasm.png]] bilan murojaat qiladi
function resolveImageUrl(url: string) {
  return url
    .replace(/^\[\[(.+)\]\]$/, (_, name: string) => `/images/${encodeURI(name)}`)
    .replace(/^(\.\.\/)?images\//, '/images/');
}

function remarkLocalImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node) => {
      node.url = resolveImageUrl(node.url);
    });
  };
}

// Obsidian teglarni ro'yxat qilib yozadi, qo'lda esa "linux, ubuntu" deb ham yozish mumkin
function parseTags(value: unknown) {
  const tags = Array.isArray(value) ? value : String(value ?? '').split(',');
  return tags.map((tag) => String(tag).trim().replace(/^#/, '')).filter(Boolean);
}

function readPost(fileName: string) {
  const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8');
  // Frontmatter'siz fayl hali post emas (masalan, shablon qo'yilmagan yangi qayd)
  if (!matter.test(fileContents)) return null;
  const { data, content } = matter(fileContents);

  // Obsidian sanani qo'shtirnoqsiz yozadi va gray-matter uni Date obyektiga aylantiradi
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`content/posts/${fileName}: "date" maydoni YYYY-MM-DD ko'rinishida bo'lishi kerak`);
  }

  // cover berilmagan bo'lsa, matndagi birinchi rasm olinadi
  const cover = data.cover || /!\[.*?\]\((.*?)\)/.exec(content)?.[1];

  return {
    meta: {
      slug: data.slug ? String(data.slug) : slugify(fileName),
      // Obsidian shablonida bo'sh qolgan maydonlar uchun fayl nomi va matndan olingan tavsif ishlatiladi
      title: String(data.title || fileName.replace(/\.md$/, '')).trim(),
      date,
      description: String(data.description || getExcerpt(content)),
      tags: parseTags(data.tags),
      imageUrl: cover ? resolveImageUrl(String(cover)) : null,
      draft: data.draft === true,
    },
    content,
  };
}

function getPosts() {
  const posts = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map(readPost)
    .filter((post) => post !== null)
    .filter((post) => showDrafts || !post.meta.draft);

  const slugs = posts.map((post) => post.meta.slug);
  const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicate) {
    throw new Error(`content/posts: bir nechta post "${duplicate}" manziliga to'g'ri keladi, birining nomini yoki slug'ini o'zgartiring`);
  }

  return posts;
}

function findPost(slug: string) {
  return getPosts().find((post) => post.meta.slug === slug) ?? null;
}

export function getAllPostSlugs() {
  return getPosts().map((post) => post.meta.slug);
}

export function getSortedPostsData() {
  return getPosts()
    .map((post) => post.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostMeta(slug: string) {
  return findPost(slug)?.meta ?? null;
}

export async function getPostData(slug: string) {
  const post = findPost(slug);
  if (!post) return null;

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkShiftHeadings)
    .use(remarkLocalImages)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(post.content);

  return {
    ...post.meta,
    contentHtml: processedContent.toString(),
  };
}
