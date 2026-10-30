import { NextResponse, type NextRequest } from 'next/server';
import { getMissingEnv, getSession } from '@/lib/admin/session';

export async function POST(request: NextRequest) {
  if (getMissingEnv().length === 0) (await getSession()).destroy();
  return NextResponse.redirect(new URL('/admin', request.url), 303);
}
