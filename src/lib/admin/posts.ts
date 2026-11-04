import { adminImageUrl } from '@/lib/images';
import { parsePost } from '@/lib/posts';
import { listFiles } from './github';
import { isPostFileName, POSTS_DIRECTORY } from './post-file';

export type AdminPostRow =
  | {
      fileName: string;
      ok: true;
      title: string;
      date: string;
      slug: string;
      draft: boolean;
      scheduled: boolean;
      series: string | null;
      description: string;
      tags: string[];
      imageUrl: string | null;
      readingTime: number;
    }
  | { fileName: string; ok: false; error: string };

function toRow(fileName: string, text: string | null): AdminPostRow {
  try {
    const post = parsePost(fileName, text ?? '');
    if (!post) return { fileName, ok: false, error: 'No frontmatter' };
    const { title, date, slug, draft, scheduled, series, description, tags, imageUrl, readingTime } = post.meta;
    return {
      fileName,
      ok: true,
      title,
      date,
      slug,
      draft,
      scheduled,
      series: series?.name ?? null,
      description,
      tags: tags.map((tag) => tag.name),
      imageUrl: imageUrl && adminImageUrl(imageUrl),
      readingTime,
    };
  } catch (error) {
    return { fileName, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// GitHub'dagi postlar, yangisi oldin: build'ni kutmasdan eng oxirgi holat ko'rinadi
export async function listPosts(token: string) {
  const files = await listFiles(token, POSTS_DIRECTORY);
  return files
    .filter((file) => isPostFileName(file.name))
    .map((file) => toRow(file.name, file.text))
    .sort((a, b) => (b.ok ? b.date : '').localeCompare(a.ok ? a.date : ''));
}

// Avval ishlatilgan teglar, ko'p ishlatilgani oldin: teg maydonida taklif qilinadi
export function collectTags(rows: AdminPostRow[]) {
  // "Linux" va "linux" bitta teg hisoblanadi
  const counts = new Map<string, { name: string; count: number }>();
  for (const row of rows) {
    if (!row.ok) continue;
    for (const name of row.tags) {
      const entry = counts.get(name.toLowerCase()) ?? { name, count: 0 };
      entry.count += 1;
      counts.set(name.toLowerCase(), entry);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map((entry) => entry.name);
}

// Avval ishlatilgan seriya nomlari: Series maydonida taklif qilinadi
export function collectSeries(rows: AdminPostRow[]) {
  const names = new Map<string, string>();
  for (const row of rows) {
    if (row.ok && row.series) names.set(row.series.toLowerCase(), row.series);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}
