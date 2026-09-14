/**
 * Pure helpers of the player comparison: totals per phase, winner per row, row catalogs. No data access, so
 * everything here is unit-testable and shared by the two-player rows and the three-player matrix.
 */
import type { ComparableKey, ComparableStats } from '@/archivo/lib/stats';
import type { StatLine } from '@/archivo/lib/types';

export interface TotalStats {
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  to: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
}

export type TotalKey = keyof TotalStats;

/** Sums over lines; a total is null when any line lacks the value, so old careers are never understated. */
export function totalsFromLines(lines: StatLine[]): TotalStats {
  const sum = (pick: (l: StatLine) => number | null): number | null => {
    if (!lines.length) return null;
    let acc = 0;
    for (const l of lines) {
      const v = pick(l);
      if (v === null) return null;
      acc += v;
    }
    return acc;
  };
  const fromAvg = (key: 'spg' | 'bpg' | 'topg') => sum((l) => (l[key] === null ? null : Math.round(l[key]! * l.g)));
  return {
    pts: sum((l) => l.pts),
    reb: sum((l) => l.reb),
    ast: sum((l) => l.ast),
    stl: fromAvg('spg'),
    blk: fromAvg('bpg'),
    to: fromAvg('topg'),
    fgm: sum((l) => l.fgm),
    fga: sum((l) => l.fga),
    fg3m: sum((l) => l.fg3m),
    fg3a: sum((l) => l.fg3a),
    ftm: sum((l) => l.ftm),
    fta: sum((l) => l.fta),
  };
}

/** Best value of a row: max, or min when lower is better. Null on ties or when any side is missing. */
export function bestOf(values: Array<number | null>, lowerIsBetter = false): number | null {
  if (values.length < 2 || values.some((v) => v === null)) return null;
  const nums = values as number[];
  const best = lowerIsBetter ? Math.min(...nums) : Math.max(...nums);
  return nums.filter((v) => v === best).length > 1 ? null : best;
}

export interface CompareRow<K extends string> {
  key: K;
  label: string;
  short: string;
  kind: 'int' | 'avg' | 'pct' | 'ratio';
  lowerIsBetter?: boolean;
}

/** Context rows shown above the comparison; they never mark a winner. */
export const CONTEXT_ROWS: Array<CompareRow<Extract<ComparableKey, 'g' | 'seasons'>>> = [
  { key: 'g', label: 'Juegos', short: 'J', kind: 'int' },
  { key: 'seasons', label: 'Temporadas', short: 'Temp.', kind: 'int' },
];

export const AVG_ROWS: Array<CompareRow<Exclude<ComparableKey, 'g' | 'seasons' | 'pts'>>> = [
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

/** Totals view. Ratios (FGM/FGA) compare by the made count. */
export const TOTAL_ROWS: Array<CompareRow<'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'to' | 'fg' | 'fg3' | 'ft'>> = [
  { key: 'pts', label: 'Puntos', short: 'PTS', kind: 'int' },
  { key: 'reb', label: 'Rebotes', short: 'REB', kind: 'int' },
  { key: 'ast', label: 'Asistencias', short: 'AST', kind: 'int' },
  { key: 'stl', label: 'Robos', short: 'ROB', kind: 'int' },
  { key: 'blk', label: 'Bloqueos', short: 'BLQ', kind: 'int' },
  { key: 'to', label: 'Pérdidas', short: 'PÉR', kind: 'int', lowerIsBetter: true },
  { key: 'fg', label: 'Tiros de campo', short: 'TC', kind: 'ratio' },
  { key: 'fg3', label: 'Triples', short: '3P', kind: 'ratio' },
  { key: 'ft', label: 'Tiros libres', short: 'TL', kind: 'ratio' },
];

/** Value of a totals row: the number to compare and the text to show. */
export function totalCell(t: TotalStats, key: (typeof TOTAL_ROWS)[number]['key']): { value: number | null; text: string | null } {
  const fmtInt = (v: number) => new Intl.NumberFormat('es-PR').format(v);
  if (key === 'fg' || key === 'fg3' || key === 'ft') {
    const m = key === 'fg' ? t.fgm : key === 'fg3' ? t.fg3m : t.ftm;
    const a = key === 'fg' ? t.fga : key === 'fg3' ? t.fg3a : t.fta;
    return m === null || a === null ? { value: null, text: null } : { value: m, text: `${fmtInt(m)}/${fmtInt(a)}` };
  }
  const v = t[key];
  return v === null ? { value: null, text: null } : { value: v, text: fmtInt(v) };
}

export function avgValue(s: ComparableStats, key: ComparableKey): number | null {
  return s[key];
}
