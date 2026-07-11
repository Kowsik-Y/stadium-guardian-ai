import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware).
 * Intercepts incoming requests, logs traffic, and manages session controls.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Basic console auditing for request lifecycle
  console.log(`[PROXY REQUEST] Intercepted path: ${pathname}`);

  return NextResponse.next();
}

// Config matcher to filter which routes run through this Proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
