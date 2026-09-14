/**
 * Pure helpers of the player comparison (/jugadores/comparar), built to mirror the team comparison
 * (src/team/components/compare/compareStats.ts): the same section/stat catalog shape, the same winner rule and
 * the same value formatting, so both pages read identically. No data access here; everything is testable.
 */
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import type { ComparableStats } from '@/archivo/lib/stats';
import type { TotalStats } from './compare';

/** Every number the comparison can show for one player in one scope. Null = not recorded in that era. */
export interface CompareValues {
  g: number | null;
  min: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
}

export type CompareValueKey = keyof CompareValues;

/** 'career' or a season year. */
export type CompareScope = 'career' | number;

/** A player as the comparison renders it. Serializable: it crosses the server/client boundary. */
export interface ComparePlayerData {
  /** Slug or providerId, as used in the URL. */
  key: string;
  name: string;
  slug: string | null;
  providerId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  /** Live team code (BAY) when active; drives TeamLogoAvatar and the team color of /comparar-equipos. */
  teamCode: string | null;
  /** Main franchise (current for actives, last for retired) for logos and colors of the archive. */
  franchise: FranchiseView | null;
  /** Ring/underline color: the live team color when active, the franchise primary otherwise. */
  color: string;
  /** "Criollos · Ala-pívot · #14" or "1968 a 1985 · Vaqueros, Leones". */
  line: string;
  fy: number;
  ly: number;
  /** Regular-season values by year (string keys so JSON round-trips keep them). */
  seasons: Record<string, CompareValues>;
  /** Regular-season career values. */
  career: CompareValues;
}

export type CompareFormat = 'avg' | 'int' | 'pct';

export interface PlayerCompareStat {
  code: string;
  label: string;
  key: CompareValueKey;
  format: CompareFormat;
  higherIsBetter: boolean;
}

export interface PlayerCompareSection {
  id: string;
  title: string;
  shortTitle: string;
  stats: PlayerCompareStat[];
}

export const PLAYER_COMPARE_SECTIONS: PlayerCompareSection[] = [
  {
    id: 'promedio',
    title: 'Promedio',
    shortTitle: 'Promedio',
    stats: [
      { code: 'PPJ', label: 'Puntos por juego', key: 'ppg', format: 'avg', higherIsBetter: true },
      { code: 'RPJ', label: 'Rebotes por juego', key: 'rpg', format: 'avg', higherIsBetter: true },
      { code: 'APJ', label: 'Asistencias por juego', key: 'apg', format: 'avg', higherIsBetter: true },
      { code: 'ROB', label: 'Robos por juego', key: 'spg', format: 'avg', higherIsBetter: true },
      { code: 'BPJ', label: 'Bloqueos por juego', key: 'bpg', format: 'avg', higherIsBetter: true },
      { code: 'PER', label: 'Pérdidas por juego', key: 'topg', format: 'avg', higherIsBetter: false },
      { code: 'MIN', label: 'Minutos por juego', key: 'min', format: 'avg', higherIsBetter: true },
    ],
  },
  {
    id: 'tiros',
    title: 'Estadísticas de tiros',
    shortTitle: 'Tiros',
    stats: [
      { code: 'TC%', label: 'Tiros de campo porcentaje', key: 'fgPct', format: 'pct', higherIsBetter: true },
      { code: 'TCC', label: 'Tiros de campo convertidos', key: 'fgm', format: 'int', higherIsBetter: true },
      { code: 'TCI', label: 'Tiros de campo intentados', key: 'fga', format: 'int', higherIsBetter: true },
      { code: '3P%', label: 'Tres puntos porcentaje', key: 'fg3Pct', format: 'pct', higherIsBetter: true },
      { code: '3PC', label: 'Tres puntos convertidos', key: 'fg3m', format: 'int', higherIsBetter: true },
      { code: '3PI', label: 'Tres puntos intentados', key: 'fg3a', format: 'int', higherIsBetter: true },
      { code: 'TL%', label: 'Tiro libre porcentaje', key: 'ftPct', format: 'pct', higherIsBetter: true },
      { code: 'TLC', label: 'Tiros libres convertidos', key: 'ftm', format: 'int', higherIsBetter: true },
      { code: 'TLI', label: 'Tiros libres intentados', key: 'fta', format: 'int', higherIsBetter: true },
    ],
  },
  {
    id: 'totales',
    title: 'Totales',
    shortTitle: 'Totales',
    stats: [
      { code: 'J', label: 'Juegos', key: 'g', format: 'int', higherIsBetter: true },
      { code: 'PTS', label: 'Puntos', key: 'pts', format: 'int', higherIsBetter: true },
      { code: 'REB', label: 'Rebotes', key: 'reb', format: 'int', higherIsBetter: true },
      { code: 'AST', label: 'Asistencias', key: 'ast', format: 'int', higherIsBetter: true },
      { code: 'REC', label: 'Robadas', key: 'stl', format: 'int', higherIsBetter: true },
      { code: 'BLQ', label: 'Bloqueos', key: 'blk', format: 'int', higherIsBetter: true },
    ],
  },
];

export const MAX_COMPARE_PLAYERS = 4;
export const MIN_COMPARE_PLAYERS = 2;

export const EMPTY_VALUES: CompareValues = {
  g: null, min: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, topg: null,
  fgPct: null, fg3Pct: null, ftPct: null, pts: null, reb: null, ast: null, stl: null, blk: null,
  fgm: null, fga: null, fg3m: null, fg3a: null, ftm: null, fta: null,
};

/** Joins the archive's comparable stats and totals into one value set. */
export function valuesFrom(stats: ComparableStats, totals: TotalStats, min: number | null): CompareValues {
  return {
    g: stats.g,
    min,
    ppg: stats.ppg,
    rpg: stats.rpg,
    apg: stats.apg,
    spg: stats.spg,
    bpg: stats.bpg,
    topg: stats.topg,
    fgPct: stats.fgPct,
    fg3Pct: stats.fg3Pct,
    ftPct: stats.ftPct,
    pts: stats.pts ?? totals.pts,
    reb: totals.reb,
    ast: totals.ast,
    stl: totals.stl,
    blk: totals.blk,
    fgm: totals.fgm,
    fga: totals.fga,
    fg3m: totals.fg3m,
    fg3a: totals.fg3a,
    ftm: totals.ftm,
    fta: totals.fta,
  };
}

/** Seasons every selected player played, newest first. Empty when they never coincided. */
export function commonSeasons(players: ComparePlayerData[]): number[] {
  if (!players.length) return [];
  const [first, ...rest] = players;
  return Object.keys(first.seasons)
    .map(Number)
    .filter((y) => rest.every((p) => y in p.seasons))
    .sort((a, b) => b - a);
}

/** The newest season they share, or the career when they never coincided. */
export function defaultScope(players: ComparePlayerData[]): CompareScope {
  const common = commonSeasons(players);
  return common.length ? common[0] : 'career';
}

export function valuesFor(p: ComparePlayerData, scope: CompareScope): CompareValues {
  return scope === 'career' ? p.career : (p.seasons[String(scope)] ?? EMPTY_VALUES);
}

export function scopeLabel(scope: CompareScope): string {
  return scope === 'career' ? 'Carrera' : `Temporada ${scope}`;
}

/** Same display rules as the team comparison; percentages already come as 0–100 from the archive. */
export function formatCompareValue(value: number | null, format: CompareFormat): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (format === 'pct') return `${value.toFixed(1)}%`;
  if (format === 'int') return String(Math.round(value));
  return value.toFixed(1);
}

/** Indexes that win the row; several on a tie, none when all are equal or fewer than two have data. */
export function winningIndexes(values: Array<number | null>, higherIsBetter: boolean): number[] {
  const present = values.filter((v): v is number => v !== null);
  if (present.length < 2) return [];
  const best = higherIsBetter ? Math.max(...present) : Math.min(...present);
  if (present.every((v) => v === best)) return [];
  return values.reduce<number[]>((acc, v, i) => {
    if (v === best) acc.push(i);
    return acc;
  }, []);
}

/** Rows where nobody has data are hidden, so a 1970s pair never shows an empty "Bloqueos" line. */
export function visibleStats(section: PlayerCompareSection, players: ComparePlayerData[], scope: CompareScope): PlayerCompareStat[] {
  return section.stats.filter((s) => players.some((p) => valuesFor(p, scope)[s.key] !== null));
}

/** Parses `?p=a,b,c` into at most four distinct keys. */
export function parseCompareKeys(raw: string | string[] | undefined): string[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const keys = list.flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean);
  return [...new Set(keys)].slice(0, MAX_COMPARE_PLAYERS);
}

export function compareHref(keys: string[]): string {
  return keys.length ? `/jugadores/comparar?p=${keys.map(encodeURIComponent).join(',')}` : '/jugadores/comparar';
}
