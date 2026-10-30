import { GITHUB_REPO } from './site';

// Saytda beriladigan va admin panel orqali yuklash mumkin bo'lgan rasm turlari
export const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

// Obsidian rasmga matnda nisbiy yo'l bilan (../images/rasm.png), property'da esa [[rasm.png]] bilan murojaat qiladi
export function resolveImageUrl(url: string) {
  return url
    .replace(/^\[\[(.+)\]\]$/, (_, name: string) => `/images/${encodeURI(name)}`)
    .replace(/^(\.\.\/)?images\//, '/images/');
}

// Matndagi birinchi rasm: cover berilmagan postlarda kartochka va link preview uchun ishlatiladi
export function findFirstImage(markdown: string) {
  return /!\[.*?\]\((.*?)\)/.exec(markdown)?.[1] ?? null;
}

// Yangi yuklangan rasmlar hali saytga deploy qilinmagan bo'ladi, shuning uchun admin panelda ular GitHub'dan olinadi
export const RAW_IMAGES_URL = `https://raw.githubusercontent.com/${GITHUB_REPO.owner}/${GITHUB_REPO.name}/${GITHUB_REPO.branch}/content/images/`;

// next/image faqat to'liq yoki "/" bilan boshlanadigan manzilni qabul qiladi: qo'lda yozilayotgan yo'l sahifani buzmasin
export function adminImageUrl(url: string) {
  const resolved = resolveImageUrl(url.trim()).replace(/^\/images\//, RAW_IMAGES_URL);
  return /^(https?:\/\/|\/)/.test(resolved) ? resolved : null;
}
