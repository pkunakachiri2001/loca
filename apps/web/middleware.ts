import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();
  const { pathname } = request.nextUrl;

  // Determine if domain is Famba's main vehicle domain
  const isFambaDomain =
    host.includes('famba.co.zw') ||
    host.includes('famba.app') ||
    host.includes('localhost:');

  // Any non-Famba custom domain (e.g. your .com or .co domain from Namecheap, parentanova, etc.)
  const isEcosystemDomain = !isFambaDomain || host.includes('parentanova');

  if (isEcosystemDomain && pathname === '/') {
    return NextResponse.rewrite(new URL('/ecosystem', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (images, icons, videos, fonts)
     */
    '/((?!api|_next/static|_next/image|icons|favicon.ico|videos|.*\\..*).*)',
  ],
};
