/**
 * Every data-dependent sentence of the history layer comes from here, so the copy is exact and testable.
 * Spanish of Puerto Rico. "juegos", never "partidos"; "dirigente", never "entrenador". No em dashes.
 */
import type { EraNoteKey, FranchiseContext } from '../../../types/historia';

/* ---------- Era notes (see docs/HISTORIA-NOTAS.md, B.2) ---------- */

export const ERA_NOTES: Record<EraNoteKey, string> = {
  assists: 'Las asistencias no se registraban de forma consistente antes de 1970.',
  threes: 'Los triples no existían o no se registraban antes de 1981.',
  stealsBlocks: 'Los robos y bloqueos no se registraban de forma consistente antes de 2010.',
  rebounds2000s: 'Los rebotes no se registraron en parte de la década de 2000.',
};

export const ERA_THRESHOLDS = { assists: 1970, threes: 1981, stealsBlocks: 2010 } as const;

interface EraInput {
  /** Debut year of each player involved. The earliest one decides. */
  debutYears: number[];
  /** True when a player whose career sits mainly in the 2000s has null rebounds. */
  reboundsGapIn2000s?: boolean;
}

/** Which notes apply, in display order. Only the ones that apply; never all of them by default. */
export function eraNoteKeys({ debutYears, reboundsGapIn2000s = false }: EraInput): EraNoteKey[] {
  const years = debutYears.filter((y) => Number.isFinite(y));
  const earliest = years.length ? Math.min(...years) : Number.POSITIVE_INFINITY;
  const keys: EraNoteKey[] = [];
  if (earliest < ERA_THRESHOLDS.assists) keys.push('assists');
  if (earliest < ERA_THRESHOLDS.threes) keys.push('threes');
  if (earliest < ERA_THRESHOLDS.stealsBlocks) keys.push('stealsBlocks');
  if (reboundsGapIn2000s) keys.push('rebounds2000s');
  return keys;
}

export function eraNotes(input: EraInput): string[] {
  return eraNoteKeys(input).map((k) => ERA_NOTES[k]);
}

/**
 * Detects the 2000s rebound gap for one career: most regular-season lines fall in 2000-2009 and none of
 * those lines records rebounds.
 */
export function hasReboundsGapIn2000s(lines: Array<{ year: number; rpg: number | null }>): boolean {
  // "Mainly" = strictly more than half of the regular-season lines fall in the decade.
  const inDecade = lines.filter((l) => l.year >= 2000 && l.year <= 2009);
  if (!lines.length || inDecade.length * 2 <= lines.length) return false;
  return inDecade.every((l) => l.rpg === null);
}

/* ---------- Franchise context ribbon (component 3) ---------- */

const ORDINAL_LOOKUP: Record<number, string> = { 1: 'primero', 2: 'segundo', 3: 'tercero' };

function nextTitleLabel(n: number): string {
  return ORDINAL_LOOKUP[n] ?? `el ${n}`;
}

/**
 * One line of historical context for a franchise, given the season being viewed. Rules in priority order:
 * 1. Has titles: "18 títulos · último en 2025 · buscan el 19"; reigning champion: "Campeones vigentes · 18 títulos";
 *    drought of 20+ years: "18 títulos · sin campeonato desde 1996".
 * 2. No titles: "Sin campeonatos · fundados en 2011" or "Sin campeonatos en su historia".
 * Returns null when there is nothing trustworthy to say, and the caller renders nothing.
 */
export function franchiseContextLine(ctx: FranchiseContext | null, season: number): string | null {
  if (!ctx) return null;
  const { franchise, titles } = ctx;
  const count = titles.length;
  if (count === 0) {
    return franchise.firstYear ? `Sin campeonatos · fundados en ${franchise.firstYear}` : 'Sin campeonatos en su historia';
  }
  const last = Math.max(...titles.map((t) => t.year));
  const noun = count === 1 ? 'título' : 'títulos';
  if (last === season - 1 || last === season) return `Campeones vigentes · ${count} ${noun}`;
  if (season - last > 20) return `${count} ${noun} · sin campeonato desde ${last}`;
  const next = count + 1;
  const goal = next === 1 ? 'buscan el primero' : `buscan el ${next}`;
  return `${count} ${noun} · último en ${last} · ${goal}`;
}

/** Shorter variant for 375px: drops the middle segment, never truncates with an ellipsis. */
export function franchiseContextLineShort(ctx: FranchiseContext | null, season: number): string | null {
  const full = franchiseContextLine(ctx, season);
  if (!full) return null;
  const parts = full.split(' · ');
  return parts.length === 3 ? `${parts[0]} · ${parts[2]}` : full;
}

/* ---------- Small shared strings ---------- */

export const UNLINKED_CAREER = 'Carrera histórica en proceso de vinculación.';
export const NO_SEASON_DATA = 'Data estadística no disponible para esta temporada.';
export const PRE_FRANCHISE_NOTE = 'Estos clubes compitieron antes del sistema de franquicias actual.';

export function yearsActive(fy: number, ly: number): string {
  return fy === ly ? String(fy) : `${fy} a ${ly}`;
}

export function countBadge(label: string, n: number): string {
  return n > 1 ? `${label} ×${n}` : label;
}

/** Dynasties: runs of three or more consecutive titles. Returns [from, to] pairs. */
export function dynasties(years: number[]): Array<[number, number]> {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  let start = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] !== sorted[i - 1] + 1) {
      if (sorted[i - 1] - start >= 2) out.push([start, sorted[i - 1]]);
      start = sorted[i];
    }
  }
  return out;
}

export { nextTitleLabel as _nextTitleLabel };
