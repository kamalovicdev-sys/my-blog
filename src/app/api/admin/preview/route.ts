import { authorizeRequest } from '@/lib/admin/session';
import { renderMarkdown } from '@/lib/markdown';
import { GITHUB_REPO } from '@/lib/site';

// Yangi yuklangan rasmlar hali saytga deploy qilinmagan bo'ladi, shuning uchun ko'rinishda ular GitHub'dan olinadi
const RAW_IMAGES_URL = `https://raw.githubusercontent.com/${GITHUB_REPO.owner}/${GITHUB_REPO.name}/${GITHUB_REPO.branch}/content/images/`;

export async function POST(request: Request) {
  if (!(await authorizeRequest(request))) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { markdown } = await request.json();
  const { html } = await renderMarkdown(String(markdown ?? ''));
  return Response.json({ html: html.replaceAll('src="/images/', `src="${RAW_IMAGES_URL}`) });
}
