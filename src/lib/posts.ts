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

export function getAllPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
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

// Obsidian rasmga postdan nisbiy yo'l bilan murojaat qiladi: ../images/rasm.png → /images/rasm.png
function resolveImageUrl(url: string) {
  return url.replace(/^(\.\.\/)?images\//, '/images/');
}

function remarkLocalImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node) => {
      node.url = resolveImageUrl(node.url);
    });
  };
}

function readPost(slug: string) {
  const fileContents = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), 'utf8');
  const { data, content } = matter(fileContents);

  // Matndan birinchi rasmni ajratib olish
  const imageMatch = /!\[.*?\]\((.*?)\)/.exec(content);

  return {
    meta: {
      slug,
      // Obsidian shablonida bo'sh qolgan maydonlar uchun fayl nomi va matndan olingan tavsif ishlatiladi
      title: String(data.title || slug).trim(),
      // Obsidian sanani qo'shtirnoqsiz yozadi va gray-matter uni Date obyektiga aylantiradi
      date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
      description: String(data.description || getExcerpt(content)),
      imageUrl: imageMatch ? resolveImageUrl(imageMatch[1]) : null,
    },
    content,
  };
}

export function getSortedPostsData() {
  return getAllPostSlugs()
    .map((slug) => readPost(slug).meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostMeta(slug: string) {
  return getAllPostSlugs().includes(slug) ? readPost(slug).meta : null;
}

export async function getPostData(slug: string) {
  if (!getAllPostSlugs().includes(slug)) return null;
  const { meta, content } = readPost(slug);

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
    .process(content);

  return {
    ...meta,
    contentHtml: processedContent.toString(),
  };
}
