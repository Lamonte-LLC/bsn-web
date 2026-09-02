import { getPlayerIndex } from '@/archivo/lib/data';

export const dynamic = 'force-static';

// Lightweight player index for the client-side search (src/archivo/hooks/usePlayerSearch.ts).
export function GET() {
  return Response.json(getPlayerIndex(), {
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  });
}
