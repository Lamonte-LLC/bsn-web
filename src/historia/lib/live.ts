import 'server-only';
import { getFranchiseMap, getSeason } from '@/archivo/lib/data';
import type { LivePlayerStats, StatLine } from '@/archivo/lib/types';
import { linkLiveName } from './identity';

/** Seasons whose player stats come from the live backend snapshot, not from the historical archive. */
const LIVE_SEASONS = [2025, 2026] as const;

const pct = (v: number | null): number | null => (v === null ? null : Math.round(v * 1000) / 10);
const r1 = (v: number | null): number | null => (v === null ? null : Math.round(v * 10) / 10);

function toLine(s: LivePlayerStats, year: number): StatLine {
  const f = s.franchiseSlug ? getFranchiseMap().get(s.franchiseSlug) : null;
  return {
    year,
    phase: 'regular',
    phaseLabel: 'Serie Regular',
    teamIndex: -1,
    teamName: f?.fullName ?? s.code,
    franchiseSlug: s.franchiseSlug,
    g: s.g,
    ppg: r1(s.ppg),
    rpg: r1(s.rpg),
    apg: r1(s.apg),
    spg: r1(s.spg),
    bpg: r1(s.bpg),
    topg: r1(s.topg),
    fgPct: pct(s.fgPct),
    fg3Pct: pct(s.fg3Pct),
    ftPct: pct(s.ftPct),
    fgm: null,
    fga: null,
    fg3m: null,
    fg3a: null,
    ftm: null,
    fta: null,
    pts: s.pts,
    reb: s.reb,
    ast: s.ast,
  };
}

/**
 * Regular-season lines of the live seasons for one player, matched by providerId first and by archive id or
 * name otherwise. These complete a career the archive stops at 2023. The current season is flagged so the
 * table can label it "en curso".
 */
export function liveSeasonLines(opts: { providerId: string | null; archiveId: string | null }): Array<StatLine & { live: true; current: boolean }> {
  const out: Array<StatLine & { live: true; current: boolean }> = [];
  for (const year of LIVE_SEASONS) {
    const results = getSeason(year)?.results;
    if (!results || results.fpo.playerStats) continue;
    const hit = results.playerStats.find((s) => (opts.providerId && s.playerProviderId === opts.providerId) || (opts.archiveId && (s.playerId === opts.archiveId || linkLiveName(s.name)?.entry.id === opts.archiveId)));
    if (hit && hit.g > 0) out.push({ ...toLine(hit, year), live: true, current: year === LIVE_SEASONS[LIVE_SEASONS.length - 1] });
  }
  return out;
}
