export const SITE_NAME = "Kamalovic's Blog";
export const SITE_DESCRIPTION = 'Dasturlash, Linux va texnologiyalar haqida maqolalar';

// Netlify build paytida URL o'zgaruvchisiga saytning asosiy manzilini beradi
export const SITE_URL = process.env.URL ?? 'https://kamalovic-blog.netlify.app';

export const SOCIAL = {
  github: 'https://github.com/kamalovicdev-sys',
  telegram: 'https://t.me/kama1ovic',
  telegramChannel: 'https://t.me/datacurio',
  portfolio: 'https://kamalovic.netlify.app',
};

// Izohlar GitHub Discussions'da saqlanadi (https://giscus.app). categoryId bo'sh bo'lsa izohlar o'chiq
export const GISCUS = {
  repo: 'kamalovicdev-sys/my-blog',
  repoId: 'R_kgDORoAHYw',
  category: 'Announcements',
  categoryId: 'DIC_kwDORoAHY84DKBKy' as string,
};

// Statistika: Cloudflare Web Analytics (dash.cloudflare.com → Web Analytics → Add a site → JS snippet'dagi token).
// Bo'sh bo'lsa skript qo'shilmaydi
export const CLOUDFLARE_ANALYTICS_TOKEN = '' as string;
