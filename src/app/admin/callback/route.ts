import { NextResponse, type NextRequest } from 'next/server';
import { getUserLogin } from '@/lib/admin/github';
import { getMissingEnv, getSession } from '@/lib/admin/session';
import { ADMIN_GITHUB_LOGIN } from '@/lib/site';

// GitHub kirishdan keyin shu yerga qaytaradi: kodni token'ga almashtiramiz va akkauntni tekshiramiz
export async function GET(request: NextRequest) {
  if (getMissingEnv().length > 0) return NextResponse.redirect(new URL('/admin', request.url));

  const session = await getSession();
  const expectedState = session.oauthState;
  session.oauthState = undefined;
  await session.save();

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!code || !state || state !== expectedState) {
    return new Response('Invalid sign-in request. Open /admin and try again.', { status: 400 });
  }

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
  if (!token.access_token) {
    return new Response(`GitHub sign-in failed: ${token.error_description ?? token.error ?? 'unknown error'}`, { status: 400 });
  }

  const login = await getUserLogin(token.access_token);
  if (login.toLowerCase() !== ADMIN_GITHUB_LOGIN.toLowerCase()) {
    session.destroy();
    return new Response(`The GitHub account "${login}" is not allowed to use this admin panel.`, { status: 403 });
  }

  session.login = login;
  session.accessToken = token.access_token;
  session.expiresAt = Date.now() + Number(token.expires_in ?? 8 * 60 * 60) * 1000;
  await session.save();
  return NextResponse.redirect(new URL('/admin', request.url));
}
