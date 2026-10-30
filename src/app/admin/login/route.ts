import { NextResponse, type NextRequest } from 'next/server';
import { getMissingEnv, getSession } from '@/lib/admin/session';

// "Sign in with GitHub": GitHub App'ning ruxsat sahifasiga yo'naltiradi
export async function GET(request: NextRequest) {
  if (getMissingEnv().length > 0) return NextResponse.redirect(new URL('/admin', request.url));

  const session = await getSession();
  session.oauthState = crypto.randomUUID();
  await session.save();

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_APP_CLIENT_ID!);
  url.searchParams.set('redirect_uri', new URL('/admin/callback', request.url).toString());
  url.searchParams.set('state', session.oauthState);
  return NextResponse.redirect(url);
}
