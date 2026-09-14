import { getPlayerIndex, getSeason } from '@/archivo/lib/data';
import { linkLiveName } from '@/historia/lib/identity';
import type { UnifiedIndexEntry } from '../../../../../types/historia';

export const dynamic = 'force-static';

/**
 * Search index for the comparison: every archive player plus the 2026 roster players that have no historical
 * record yet (they get their providerId as slug and a single season). Active players carry `isActive`.
 */
export function GET() {
  const results = getSeason(2026)?.results;
  const activeByArchiveId = new Map<string, string>();
  const unlinked: UnifiedIndexEntry[] = [];
  for (const r of results?.rosters ?? []) {
    const id = r.playerId ?? linkLiveName(r.name)?.entry.id;
    if (id) activeByArchiveId.set(id, r.playerProviderId);
    else if (!unlinked.some((u) => u.providerId === r.playerProviderId)) {
      unlinked.push({ id: r.playerProviderId, slug: r.playerProviderId, name: r.name, aliases: [], fy: 2026, ly: 2026, franchiseSlugs: r.franchiseSlug ? [r.franchiseSlug] : [], g: null, pts: null, isMvp: false, mvpYears: [], isActive: true, providerId: r.playerProviderId });
    }
  }
  const archive: UnifiedIndexEntry[] = getPlayerIndex().map((p) => {
    const providerId = activeByArchiveId.get(p.id) ?? null;
    return { ...p, isActive: providerId !== null, providerId, ly: providerId ? 2026 : p.ly };
  });
  return Response.json([...archive, ...unlinked], { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } });
}
