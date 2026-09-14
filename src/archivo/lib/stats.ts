import type { CareerTotals, PlayerFile, StatLine } from './types';

/** The stat set the comparison and chart features work with. Null = not recorded. */
export interface ComparableStats {
  g: number | null;
  seasons: number | null;
  pts: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
}

export type ComparableKey = keyof ComparableStats;

export const COMPARABLE_ROWS: Array<{ key: ComparableKey; label: string; short: string; kind: 'int' | 'avg' | 'pct'; lowerIsBetter?: boolean }> = [
  { key: 'g', label: 'Juegos', short: 'J', kind: 'int' },
  { key: 'seasons', label: 'Temporadas', short: 'Temp.', kind: 'int' },
  { key: 'pts', label: 'Puntos totales', short: 'PTS', kind: 'int' },
  { key: 'ppg', label: 'Puntos por juego', short: 'PPJ', kind: 'avg' },
  { key: 'rpg', label: 'Rebotes por juego', short: 'RPJ', kind: 'avg' },
  { key: 'apg', label: 'Asistencias por juego', short: 'APJ', kind: 'avg' },
  { key: 'spg', label: 'Robos por juego', short: 'ROB', kind: 'avg' },
  { key: 'bpg', label: 'Bloqueos por juego', short: 'BLQ', kind: 'avg' },
  { key: 'topg', label: 'Pérdidas por juego', short: 'PÉR', kind: 'avg', lowerIsBetter: true },
  { key: 'fgPct', label: 'Tiros de campo', short: 'TC%', kind: 'pct' },
  { key: 'fg3Pct', label: 'Triples', short: '3P%', kind: 'pct' },
  { key: 'ftPct', label: 'Tiros libres', short: 'TL%', kind: 'pct' },
];

const round1 = (v: number): number => Math.round(v * 10) / 10;

/**
 * Games-weighted averages and sums over a set of lines. A value is only reported when every line has it,
 * matching the ETL's null rule so old careers are never understated.
 */
export function statsFromLines(lines: StatLine[]): ComparableStats {
  const g = lines.reduce((a, l) => a + l.g, 0);
  const avg = (key: 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'topg'): number | null =>
    !lines.length || g === 0 || lines.some((l) => l[key] === null) ? null : round1(lines.reduce((a, l) => a + l[key]! * l.g, 0) / g);
  const sum = (key: 'pts'): number | null => (!lines.length || lines.some((l) => l[key] === null) ? null : lines.reduce((a, l) => a + l[key]!, 0));
  const pct = (m: 'fgm' | 'fg3m' | 'ftm', a: 'fga' | 'fg3a' | 'fta'): number | null => {
    if (!lines.length || lines.some((l) => l[m] === null || l[a] === null)) return null;
    const att = lines.reduce((s, l) => s + l[a]!, 0);
    return att === 0 ? null : round1((lines.reduce((s, l) => s + l[m]!, 0) / att) * 100);
  };
  return {
    g: lines.length ? g : null,
    seasons: lines.length ? new Set(lines.map((l) => l.year)).size : null,
    pts: sum('pts'),
    ppg: avg('ppg'),
    rpg: avg('rpg'),
    apg: avg('apg'),
    spg: avg('spg'),
    bpg: avg('bpg'),
    topg: avg('topg'),
    fgPct: pct('fgm', 'fga'),
    fg3Pct: pct('fg3m', 'fg3a'),
    ftPct: pct('ftm', 'fta'),
  };
}

/** Published career totals (CAREER_DATA) merged with line-derived stats for the fields the league does not publish. */
export function careerStats(p: PlayerFile): ComparableStats {
  const regular = statsFromLines(p.lines.regular.filter((l) => l.franchiseSlug !== null));
  const c: CareerTotals | null = p.career;
  if (!c) return regular;
  return {
    g: c.g ?? regular.g,
    seasons: p.seasons,
    pts: c.pts ?? regular.pts,
    ppg: c.ppg ?? regular.ppg,
    rpg: c.rpg ?? regular.rpg,
    apg: c.apg ?? regular.apg,
    spg: regular.spg,
    bpg: regular.bpg,
    topg: regular.topg,
    // Published percentages inherit the fga = fgm problem of old seasons; the gated line-derived values are safer.
    fgPct: regular.fgPct ?? c.fgPct,
    fg3Pct: regular.fg3Pct ?? c.fg3Pct,
    ftPct: regular.ftPct ?? c.ftPct,
  };
}

export function regularStats(p: PlayerFile): ComparableStats {
  return statsFromLines(p.lines.regular.filter((l) => l.franchiseSlug !== null));
}

export function playoffStats(p: PlayerFile): ComparableStats {
  return statsFromLines(p.lines.playoffs.filter((l) => l.franchiseSlug !== null));
}
