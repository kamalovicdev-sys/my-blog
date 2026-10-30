import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type AdminSession = {
  login?: string;
  accessToken?: string;
  expiresAt?: number;
  // GitHub'ga yo'naltirishdan oldin yaratiladi va qaytishda tekshiriladi (CSRF himoyasi)
  oauthState?: string;
};

// GitHub App'ning user token'i 8 soat amal qiladi, sessiya ham shuncha
const SESSION_MAX_AGE = 8 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

// Netlify'da (va lokalda .env.local'da) berilishi kerak bo'lgan o'zgaruvchilar
export function getMissingEnv() {
  const missing: string[] = [];
  if (!process.env.GITHUB_APP_CLIENT_ID) missing.push('GITHUB_APP_CLIENT_ID');
  if (!process.env.GITHUB_APP_CLIENT_SECRET) missing.push('GITHUB_APP_CLIENT_SECRET');
  if ((process.env.SESSION_SECRET ?? '').length < MIN_SECRET_LENGTH) missing.push(`SESSION_SECRET (min ${MIN_SECRET_LENGTH} chars)`);
  return missing;
}

function sessionOptions(): SessionOptions {
  return {
    password: process.env.SESSION_SECRET!,
    cookieName: 'blog_admin',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    },
  };
}

export async function getSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

// Kirgan va token'i hali eskirmagan admin sessiyasi, aks holda null
export async function getAdminSession() {
  if (getMissingEnv().length > 0) return null;
  const session = await getSession();
  if (!session.login || !session.accessToken || !session.expiresAt || session.expiresAt < Date.now()) return null;
  return { login: session.login, accessToken: session.accessToken };
}

// API so'rovlari uchun: boshqa saytdan yuborilgan so'rovlarni ham rad etadi
export async function authorizeRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) return null;
  return getAdminSession();
}
