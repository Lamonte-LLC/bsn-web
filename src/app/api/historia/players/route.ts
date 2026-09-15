import { getPlayerIndex, getSeason } from '@/archivo/lib/data';
import { linkLiveName } from '@/historia/lib/identity';
import type { UnifiedIndexEntry } from '../../../../../types/historia';

export const dynamic = 'force-static';

/**
 * Search index for the comparison: every archive player plus the 2026 players (roster and stats) that have no
 * historical record yet (they get their providerId as slug and a single season). Active players carry
 * `isActive` and, when the live roster has one, their photo.
 */
export function GET() {
  const results = getSeason(2026)?.results;
  const activeByArchiveId = new Map<string, string>();
  const avatarByProviderId = new Map<string, string | null>();
  const unlinked: UnifiedIndexEntry[] = [];
  for (const r of results?.rosters ?? []) {
    const id = r.playerId ?? linkLiveName(r.name)?.entry.id;
    avatarByProviderId.set(r.playerProviderId, r.avatarUrl);
    if (id) activeByArchiveId.set(id, r.playerProviderId);
    else if (!unlinked.some((u) => u.providerId === r.playerProviderId)) {
      unlinked.push({ id: r.playerProviderId, slug: r.playerProviderId, name: r.name, aliases: [], fy: 2026, ly: 2026, franchiseSlugs: r.franchiseSlug ? [r.franchiseSlug] : [], g: null, pts: null, isMvp: false, mvpYears: [], isActive: true, providerId: r.playerProviderId, avatarUrl: r.avatarUrl });
    }
  }
  // Players with 2026 stats but off today's roster (traded, released): still active this season.
  for (const st of results?.playerStats ?? []) {
    const photo = st.avatarUrl ?? null;
    if (avatarByProviderId.has(st.playerProviderId)) {
      // Roster row without a photo but the stats row has one: keep the photo.
      if (photo && !avatarByProviderId.get(st.playerProviderId)) avatarByProviderId.set(st.playerProviderId, photo);
      continue;
    }
    const id = st.playerId ?? linkLiveName(st.name)?.entry.id;
    avatarByProviderId.set(st.playerProviderId, photo);
    if (id) activeByArchiveId.set(id, st.playerProviderId);
    else if (!unlinked.some((u) => u.providerId === st.playerProviderId)) {
      unlinked.push({ id: st.playerProviderId, slug: st.playerProviderId, name: st.name, aliases: [], fy: 2026, ly: 2026, franchiseSlugs: st.franchiseSlug ? [st.franchiseSlug] : [], g: st.g, pts: st.pts, isMvp: false, mvpYears: [], isActive: true, providerId: st.playerProviderId, avatarUrl: photo });
    }
  }
  const archive: UnifiedIndexEntry[] = getPlayerIndex().map((p) => {
    const providerId = activeByArchiveId.get(p.id) ?? null;
    return { ...p, isActive: providerId !== null, providerId, ly: providerId ? 2026 : p.ly, avatarUrl: providerId ? (avatarByProviderId.get(providerId) ?? null) : null };
  });
  return Response.json([...archive, ...unlinked], { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } });
}
