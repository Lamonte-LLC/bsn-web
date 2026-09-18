/**
 * Pure helpers of the players listing (/jugadores): surname heuristics for order and the A–Z filter, the
 * position groups of the active view and the franchise / era / honor filters of the historical view. No data
 * access and no runtime imports, so `node --test` runs it as is.
 */
import type { UnifiedIndexEntry } from '../../../types/historia';

export const ACTIVE_PAGE = 25;
export const HISTORIC_PAGE = 40;
export const SCORING_CLUB = 5000;

export type PositionGroup = 'G' | 'F' | 'C';
export type HistoricOnly = 'all' | 'mvp' | 'club';

/** Debut decades offered by the Época filter, newest first, down to the decade of the archive's first season. */
export function decadesSince(firstYear: number, latest = 2020): number[] {
  const out: number[] = [];
  for (let d = latest; d >= decadeOf(firstYear); d -= 10) out.push(d);
  return out;
}

/**
 * Main surname of a name, Spanish style: "First Last1 Last2" → Last1, "First Last" → Last. When the second
 * word is an initial ("Jose R. Ortiz") the first name is used, as the roster order always did. Nicknames in
 * quotes and disambiguators in parentheses ("Carlos (1) Bonilla") are ignored.
 */
export function surnameOf(name: string): string {
  const parts = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]|\([^)]*\)/g, ' ').trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ?? '';
  if (parts.length === 2) return parts[1];
  const second = parts[1].replace('.', '');
  return second.length <= 2 ? parts[0] : parts[1];
}

/** First letter of the main surname, accents folded and upper case; "#" when it is not A–Z. */
export function surnameInitial(name: string): string {
  const first = surnameOf(name).normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

export function sortBySurname<T extends { name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => surnameOf(a.name).localeCompare(surnameOf(b.name), 'es') || a.name.localeCompare(b.name, 'es'));
}

export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Position codes and words of the live roster collapsed to guard / forward / center. Two-letter codes read
 * their last letter (PG, SG → G; SF, PF, GF → F; FC → C); "G/F" style combos take the first side.
 */
export function normalizePosition(raw: string | null | undefined): PositionGroup | null {
  const token = (raw ?? '').trim().toUpperCase().split(/[\s/\-,]+/)[0] ?? '';
  if (!token) return null;
  if (/^[A-Z]{1,2}$/.test(token)) {
    const last = token[token.length - 1];
    return last === 'G' || last === 'F' || last === 'C' ? last : null;
  }
  const word = token.normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/^(GUARD|BASE|ESCOLTA|GUARDIA|ARMADOR|POINT|SHOOTING)/.test(word)) return 'G';
  if (/^(FORWARD|ALERO|DELANTERO|SMALL|POWER|ALA)/.test(word)) return 'F';
  if (/^(CENTER|CENTRE|CENTRO|PIVOT)/.test(word)) return 'C';
  return null;
}

export interface ActiveFilters {
  team: string;
  position: PositionGroup | '';
}

/** Team and position filters of the active view; the text search runs in the component with the shared normalizer. */
export function filterActive<T extends { teamCode: string; playingPosition: string }>(players: T[], f: ActiveFilters): T[] {
  return players.filter((p) => (!f.team || p.teamCode === f.team) && (!f.position || normalizePosition(p.playingPosition) === f.position));
}

export interface HistoricFilters {
  franchise: string;
  /** Debut decade (1930…2020) or 0 for every era. */
  decade: number;
  only: HistoricOnly;
  /** A–Z of the main surname, or "" for every letter. */
  letter: string;
}

export type HistoricEntry = Pick<UnifiedIndexEntry, 'name' | 'fy' | 'franchiseSlugs' | 'isMvp' | 'pts'>;

export function filterHistoric<T extends HistoricEntry>(entries: T[], f: HistoricFilters): T[] {
  return entries.filter(
    (p) =>
      (!f.franchise || p.franchiseSlugs.includes(f.franchise)) &&
      (!f.decade || decadeOf(p.fy) === f.decade) &&
      (f.only === 'all' || (f.only === 'mvp' ? p.isMvp : (p.pts ?? 0) >= SCORING_CLUB)) &&
      (!f.letter || surnameInitial(p.name) === f.letter),
  );
}

/** Letters that still have players under the other filters, so empty chips can be disabled. */
export function lettersWith<T extends { name: string }>(entries: T[]): Set<string> {
  return new Set(entries.map((p) => surnameInitial(p.name)));
}

/** "Cargar 25 más · 3,398 restantes"; the first number shrinks on the last page. */
export function loadMoreLabel(page: number, remaining: number): string {
  const n = new Intl.NumberFormat('es-PR');
  return `Cargar ${n.format(Math.min(page, remaining))} más · ${n.format(remaining)} restantes`;
}
