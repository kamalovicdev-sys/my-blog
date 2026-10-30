import { NextResponse, type NextRequest } from 'next/server';
import { getUserLogin } from '@/lib/admin/github';
import { getMissingEnv, getSession } from '@/lib/admin/session';
import { ADMIN_GITHUB_LOGIN } from '@/lib/site';

// GitHub token endpoint'ining xato kodlari → /admin sahifasidagi xabar kodi
const GITHUB_ERRORS: Record<string, string> = {
  incorrect_client_credentials: 'credentials',
  // Client ID umuman topilmasa GitHub shunday javob beradi
  'Not Found': 'credentials',
  redirect_uri_mismatch: 'redirect',
  bad_verification_code: 'code',
};

// Xatoda /admin'ga qaytaramiz, u yerda tushunarli xabar chiqadi
function fail(request: NextRequest, reason: string) {
  return NextResponse.redirect(new URL(`/admin?error=${reason}`, request.url));
}

// GitHub kirishdan keyin shu yerga qaytaradi: kodni token'ga almashtiramiz va akkauntni tekshiramiz
export async function GET(request: NextRequest) {
  if (getMissingEnv().length > 0) return NextResponse.redirect(new URL('/admin', request.url));

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const session = await getSession();
  // State faqat mos kelganda o'chiriladi: tasodifiy so'rov (sahifani yangilash, boshqa tab) haqiqiy kirishni buzmasin
  if (!code || !state || state !== session.oauthState) return fail(request, 'state');
  session.oauthState = undefined;
  await session.save();

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/admin/callback', request.url).toString(),
    }),
    cache: 'no-store',
  });
  const token = await tokenResponse.json();
  if (!token.access_token) return fail(request, GITHUB_ERRORS[token.error] ?? 'github');

  const login = await getUserLogin(token.access_token);
  if (login.toLowerCase() !== ADMIN_GITHUB_LOGIN.toLowerCase()) {
    session.destroy();
    return fail(request, 'account');
  }

  session.login = login;
  session.accessToken = token.access_token;
  session.expiresAt = Date.now() + Number(token.expires_in ?? 8 * 60 * 60) * 1000;
  await session.save();
  return NextResponse.redirect(new URL('/admin', request.url));
}
