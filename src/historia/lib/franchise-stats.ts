import type { StatLine } from '@/archivo/lib/types';

/** One player's regular-season career with a franchise, aggregated from their season lines. */
export interface FranchiseCareerRow {
  playerId: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  seasons: number;
  g: number;
  pts: number;
  reb: number | null;
  ast: number | null;
  ppg: number;
  rpg: number | null;
  apg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
}

type Totals = { g: number; pts: number; reb: number | null; ast: number | null; fgm: number | null; fga: number | null; fg3m: number | null; fg3a: number | null; ftm: number | null; fta: number | null };

const add = (a: number | null, b: number | null | undefined): number | null => (b === null || b === undefined ? a : (a ?? 0) + b);
const pct = (m: number | null, a: number | null): number | null => (m === null || a === null || a === 0 ? null : Math.round((m / a) * 1000) / 10);
const per = (v: number | null, g: number): number | null => (v === null || g === 0 ? null : Math.round((v / g) * 10) / 10);

/**
 * Regular-season totals of one player with one franchise. Seasons where a stat was not recorded stay null
 * instead of counting as zero, so old-era rows read as "not recorded" rather than "none".
 */
export function aggregateFranchiseLines(player: { id: string; slug: string; name: string }, lines: readonly StatLine[], franchiseSlug: string): FranchiseCareerRow | null {
  const mine = lines.filter((l) => l.phase === 'regular' && l.franchiseSlug === franchiseSlug && l.g > 0);
  if (!mine.length) return null;
  const t: Totals = { g: 0, pts: 0, reb: null, ast: null, fgm: null, fga: null, fg3m: null, fg3a: null, ftm: null, fta: null };
  for (const l of mine) {
    t.g += l.g;
    t.pts += l.pts ?? 0;
    t.reb = add(t.reb, l.reb);
    t.ast = add(t.ast, l.ast);
    t.fgm = add(t.fgm, l.fgm);
    t.fga = add(t.fga, l.fga);
    t.fg3m = add(t.fg3m, l.fg3m);
    t.fg3a = add(t.fg3a, l.fg3a);
    t.ftm = add(t.ftm, l.ftm);
    t.fta = add(t.fta, l.fta);
  }
  const years = mine.map((l) => l.year);
  return {
    playerId: player.id,
    slug: player.slug,
    name: player.name,
    fy: Math.min(...years),
    ly: Math.max(...years),
    seasons: new Set(years).size,
    g: t.g,
    pts: t.pts,
    reb: t.reb,
    ast: t.ast,
    ppg: per(t.pts, t.g) ?? 0,
    rpg: per(t.reb, t.g),
    apg: per(t.ast, t.g),
    fgPct: pct(t.fgm, t.fga),
    fg3Pct: pct(t.fg3m, t.fg3a),
    ftPct: pct(t.ftm, t.fta),
  };
}

export type FranchiseStatKey = 'pts' | 'reb' | 'ast' | 'g' | 'ppg' | 'rpg' | 'apg' | 'fgPct' | 'fg3Pct' | 'ftPct' | 'seasons';

/** Rows sorted by one stat, descending, nulls last; `minGames` keeps per-game and percentage boards honest. */
export function rankFranchiseRows(rows: readonly FranchiseCareerRow[], key: FranchiseStatKey, minGames = 0): FranchiseCareerRow[] {
  const perGame = key === 'ppg' || key === 'rpg' || key === 'apg' || key === 'fgPct' || key === 'fg3Pct' || key === 'ftPct';
  return rows
    .filter((r) => r[key] !== null && (!perGame || r.g >= minGames))
    .sort((a, b) => (b[key] as number) - (a[key] as number) || b.g - a.g || a.name.localeCompare(b.name, 'es'));
}
