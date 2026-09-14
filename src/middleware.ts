import { NextResponse, type NextRequest } from 'next/server';

/**
 * Preview-only gate. When ARCHIVO_PREVIEW_ONLY is set (Vercel preview), the deployment serves the Archivo BSN
 * section and nothing else: every other page redirects to /archivo, and the API routes outside the archive
 * answer 404. Production never sets the variable, so this is inert there.
 */
const PREVIEW_ONLY = process.env.ARCHIVO_PREVIEW_ONLY === '1';

/** Paths the archive itself needs. Everything else is out of scope for the preview. */
const ALLOWED_PREFIXES = ['/archivo', '/assets', '/images', '/fonts', '/favicon', '/icon', '/apple-icon', '/opengraph-image', '/og-image', '/robots', '/sitemap'];

export function middleware(request: NextRequest) {
  if (!PREVIEW_ONLY) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}.`))) {
    return NextResponse.next();
  }

  // API routes outside the archive must not answer at all in the preview.
  if (pathname.startsWith('/api')) {
    return new NextResponse('No disponible en este preview.', { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/archivo';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  // Node runtime: the Vercel "services" build target does not accept Edge Functions.
  runtime: 'nodejs',
  // Skip Next internals and static files; the archive's own assets are handled by ALLOWED_PREFIXES.
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|mp4|json|txt|xml)$).*)'],
};
