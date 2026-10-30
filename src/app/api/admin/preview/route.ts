import { authorizeRequest } from '@/lib/admin/session';
import { RAW_IMAGES_URL } from '@/lib/images';
import { countWords, getExcerpt, getReadingTime, renderMarkdown } from '@/lib/markdown';

// Jonli ko'rinish va sayt bilan bir xil hisoblangan so'zlar soni, o'qish vaqti va avtomatik tavsif
export async function POST(request: Request) {
  if (!(await authorizeRequest(request))) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { markdown } = await request.json();
  const source = String(markdown ?? '');
  const { html } = await renderMarkdown(source);
  return Response.json({
    // Yangi yuklangan rasmlar hali saytga deploy qilinmagan bo'ladi, shuning uchun ko'rinishda ular GitHub'dan olinadi
    html: html.replaceAll('src="/images/', `src="${RAW_IMAGES_URL}`),
    words: countWords(source),
    readingTime: getReadingTime(source),
    excerpt: getExcerpt(source),
  });
}
