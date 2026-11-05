export const SITE_NAME = "Kamalovic's Blog";
export const SITE_DESCRIPTION = 'Dasturlash, Linux va texnologiyalar haqida maqolalar';

// Saytning asosiy manzili: sitemap, RSS, ulashish havolalari va Telegram preview'lar shu manzil bilan yasaladi
export const SITE_URL = 'https://blog.kamalovic.uz';

// RSS lentasi: brauzerlar va RSS o'quvchilar uni har bir sahifadagi <link rel="alternate"> orqali topadi
export const RSS_FEED = { 'application/rss+xml': '/rss.xml' };

// Sahifaning asl (canonical) manzili: bitta sahifa bir nechta manzilda ochilishi mumkin (netlify.app, deploy
// preview'lar, ?so'rov qo'shilgan havolalar), bu teg Google'ga qaysi manzilni indekslashni aytadi. Next.js metadata'ni
// sayoz birlashtiradi: sahifadagi `alternates` layout'dagisini to'liq almashtiradi, shuning uchun RSS ham shu yerda beriladi
export function pageAlternates(path: string) {
  return { canonical: path, types: RSS_FEED };
}

// Postlar ro'yxatida har bir post yonida ko'rsatiladigan muallif
export const AUTHOR_NAME = 'Kamalovic';

export const SOCIAL = {
  github: 'https://github.com/kamalovicdev-sys',
  telegram: 'https://t.me/kama1ovic',
  telegramChannel: 'https://t.me/datacurio',
  portfolio: 'https://kamalovic.uz',
};

// Admin panel postlar va rasmlarni shu repo'ga commit qiladi
export const GITHUB_REPO = {
  owner: 'kamalovicdev-sys',
  name: 'my-blog',
  branch: 'master',
};

// Admin panelga faqat shu GitHub akkaunt kira oladi
export const ADMIN_GITHUB_LOGIN = 'kamalovicdev-sys';

// Izohlar GitHub Discussions'da saqlanadi (https://giscus.app). categoryId bo'sh bo'lsa izohlar o'chiq
export const GISCUS = {
  repo: 'kamalovicdev-sys/my-blog',
  repoId: 'R_kgDORoAHYw',
  category: 'Announcements',
  categoryId: 'DIC_kwDORoAHY84DKBKy' as string,
};

// Statistika: Cloudflare Web Analytics (dash.cloudflare.com → Web Analytics → Add a site → JS snippet'dagi token).
// Bo'sh bo'lsa skript qo'shilmaydi
export const CLOUDFLARE_ANALYTICS_TOKEN = 'f5d8569e97ce4c3190bb561a1c7f0317' as string;
