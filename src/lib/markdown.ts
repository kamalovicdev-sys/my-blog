import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { toString } from 'mdast-util-to-string';
import { SKIP, visit } from 'unist-util-visit';
import type { Heading, Paragraph, Root } from 'mdast';
import type { Root as HtmlRoot } from 'hast';
import { resolveImageUrl } from './images';
import { slugify } from './slug';

const EXCERPT_LENGTH = 160;
const WORDS_PER_MINUTE = 200;

export type TocItem = { id: string; text: string; depth: number };

function parseMarkdown(markdown: string) {
  return remark().use(remarkGfm).use(remarkMath).parse(markdown);
}

// Matndagi oddiy paragraflardan (sarlavha, rasm va HTML teglarsiz) qisqa tavsif yasash
export function getExcerpt(markdown: string) {
  const text = parseMarkdown(markdown)
    .children.filter((node): node is Paragraph => node.type === 'paragraph')
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

export function countWords(markdown: string) {
  return toString(parseMarkdown(markdown)).split(/\s+/).filter(Boolean).length;
}

// O'qish vaqti daqiqalarda
export function getReadingTime(markdown: string) {
  return Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));
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

// Sarlavhalarga id beradi va h2/h3'larni mundarijaga yig'adi
function remarkHeadingIds(toc: TocItem[]) {
  return (tree: Root) => {
    const usedIds = new Map<string, number>();
    visit(tree, 'heading', (node) => {
      const text = toString(node).trim();
      const baseId = slugify(text) || 'section';
      const count = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, count + 1);
      const id = count ? `${baseId}-${count}` : baseId;

      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
      if (node.depth <= 3) toc.push({ id, text, depth: node.depth });
    });
  };
}

function remarkLocalImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node) => {
      node.url = resolveImageUrl(node.url);
    });
  };
}

// Har bir kod blokini nusxalash tugmasi bilan o'raydi. Bosish CodeCopyButtons komponentida ishlanadi
function rehypeCodeCopy() {
  return (tree: HtmlRoot) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block'] },
        children: [
          node,
          {
            type: 'element',
            tagName: 'button',
            properties: { type: 'button', className: ['copy-code'], dataCopyCode: true },
            children: [{ type: 'text', value: 'Copy' }],
          },
        ],
      };
      return SKIP;
    });
  };
}

export async function renderMarkdown(markdown: string) {
  const toc: TocItem[] = [];
  const file = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkShiftHeadings)
    .use(remarkHeadingIds, toc)
    .use(remarkLocalImages)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeCodeCopy)
    .use(rehypeStringify)
    .process(markdown);

  return { html: file.toString(), toc };
}
