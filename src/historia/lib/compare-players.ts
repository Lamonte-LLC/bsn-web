/**
 * Pure helpers of the player comparison (/jugadores/comparar), built to mirror the team comparison
 * (src/team/components/compare/compareStats.ts): the same section/stat catalog shape, the same winner rule and
 * the same value formatting, so both pages read identically. No data access here; everything is testable.
 */

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

/** A season's providerId — lo que PLAYER_COMPARISON necesita para traer las estadísticas de esa temporada. */
export type CompareScope = string;

/** A player as the comparison renders it. Serializable: it crosses the server/client boundary. */
export interface ComparePlayerData {
  key: string;
  name: string;
  providerId: string;
  avatarUrl: string | null;
  teamCode: string | null;
  color: string;
  line: string;
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

/** Cada jugador cae en la temporada actual (por providerId) salvo que haya elegido otra explícitamente. */
export function defaultScope(currentSeasonProviderId: string): CompareScope {
  return currentSeasonProviderId;
}

export function scopeFor(p: ComparePlayerData, chosen: Record<string, CompareScope | undefined>, currentSeasonProviderId: string): CompareScope {
  return chosen[p.key] ?? defaultScope(currentSeasonProviderId);
}

/** Recibe el name ya resuelto (no el scope/providerId) — quien llama hace el lookup en useSeasons(). */
export function scopeLabel(seasonName: string): string {
  return seasonName;
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
export function visibleStats(section: PlayerCompareSection, players: ComparePlayerData[], valuesOf: (p: ComparePlayerData) => CompareValues): PlayerCompareStat[] {
  return section.stats.filter((s) => players.some((p) => valuesOf(p)[s.key] !== null));
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
