import 'server-only';
import { getChampions, getFranchiseFile, getFranchiseMap, getFranchises, getMvps, getPlayer, getPlayerIndex, getSeason, getSeasonYears } from '@/archivo/lib/data';
import type { CareerTotals, Franchise, FranchiseFile, PlayerFile, PlayerIndexEntry, StatLine } from '@/archivo/lib/types';
import type { FranchiseContext } from '../../../types/historia';

export const CURRENT_SEASON = 2026;

/* ---------- Franchises ---------- */

const EXTRA_CODES: Record<string, string> = { HUM: 'grises', FAJ: 'cariduros', GMA: 'brujos', COA: 'maratonistas', ISA: 'gallitos' };

/** Live team code (BAY, PON) → archive franchise. */
export function franchiseByCode(code: string | null | undefined): Franchise | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  const extra = EXTRA_CODES[upper];
  if (extra) return getFranchiseMap().get(extra) ?? null;
  return getFranchises().find((f) => f.code === upper) ?? null;
}

export function franchiseContextByCode(code: string | null | undefined): FranchiseContext | null {
  const f = franchiseByCode(code);
  if (!f) return null;
  const file = getFranchiseFile(f.slug);
  if (!file) return null;
  return { franchise: { slug: f.slug, nickname: f.nickname, fullName: f.fullName, firstYear: f.firstYear, status: f.status }, titles: file.titles };
}

export function franchiseContextBySlug(slug: string): FranchiseContext | null {
  const f = getFranchiseMap().get(slug);
  const file = f ? getFranchiseFile(slug) : null;
  if (!f || !file) return null;
  return { franchise: { slug: f.slug, nickname: f.nickname, fullName: f.fullName, firstYear: f.firstYear, status: f.status }, titles: file.titles };
}

/** Franchise file with the archive's provisional colors applied (the per-franchise JSON keeps the raw ones). */
export function franchiseFileWithColors(slug: string): FranchiseFile | null {
  const raw = getFranchiseFile(slug);
  const listed = getFranchiseMap().get(slug);
  return raw ? { ...raw, colors: listed?.colors ?? raw.colors } : null;
}

export function extinctFranchises(): Franchise[] {
  return getFranchises().filter((f) => f.status === 'extinct');
}

/** Pre-1946 champions whose club has no modern franchise record. */
export function preFranchiseChampions() {
  return getChampions().filter((c) => !c.franchiseSlug);
}

/* ---------- All-time leaders (component 4) ---------- */

export type CareerLeaderKey = 'pts' | 'reb' | 'ast' | 'g' | 'seasons';

export interface CareerLeader {
  playerId: string;
  slug: string;
  name: string;
  value: number;
  fy: number;
  ly: number;
  franchiseSlugs: string[];
}

const LEADER_LIMIT = 50;
let leadersCache: Record<CareerLeaderKey, CareerLeader[]> | null = null;

/**
 * Top 50 of every career category, computed once from the player files (records.json only keeps a top 10).
 * Career totals are the league's published numbers; a category is skipped for a player when it is null.
 */
export function careerLeaders(): Record<CareerLeaderKey, CareerLeader[]> {
  if (leadersCache) return leadersCache;
  const rows: Array<{ entry: PlayerIndexEntry; career: CareerTotals | null; seasons: number }> = [];
  for (const entry of getPlayerIndex()) {
    if (entry.pts === null && entry.g === null) continue;
    const file = getPlayer(entry.id);
    if (!file) continue;
    rows.push({ entry, career: file.career ?? file.computed.regular, seasons: file.seasons });
  }
  const pick = (key: CareerLeaderKey): CareerLeader[] =>
    rows
      .map((r) => ({ r, v: key === 'seasons' ? r.seasons : (r.career?.[key] ?? null) }))
      .filter((x): x is { r: (typeof rows)[number]; v: number } => typeof x.v === 'number' && x.v > 0)
      .sort((a, b) => b.v - a.v || a.r.entry.name.localeCompare(b.r.entry.name, 'es'))
      .slice(0, LEADER_LIMIT)
      .map(({ r, v }) => ({ playerId: r.entry.id, slug: r.entry.slug, name: r.entry.name, value: v, fy: r.entry.fy, ly: r.entry.ly, franchiseSlugs: r.entry.franchiseSlugs }));
  leadersCache = { pts: pick('pts'), reb: pick('reb'), ast: pick('ast'), g: pick('g'), seasons: pick('seasons') };
  return leadersCache;
}

/* ---------- Players ---------- */

/** Best regular season by ppg with 10+ games; falls back to the season with most games. */
export function bestSeason(p: PlayerFile): { line: StatLine; fallback: boolean } | null {
  const regular = p.lines.regular.filter((l) => l.franchiseSlug !== null && l.ppg !== null);
  if (!regular.length) return null;
  const eligible = regular.filter((l) => l.g >= 10);
  if (eligible.length) return { line: eligible.reduce((a, b) => ((b.ppg ?? 0) > (a.ppg ?? 0) ? b : a)), fallback: false };
  return { line: regular.reduce((a, b) => (b.g > a.g ? b : a)), fallback: true };
}

/** Championship years of a player, from the archive. */
export function titleYears(p: PlayerFile): number[] {
  return p.championships.map((c) => c.year);
}

/* ---------- Seasons ---------- */

export function seasonYears(): number[] {
  return getSeasonYears();
}

export function seasonSummary(year: number) {
  const s = getSeason(year);
  if (!s) return null;
  return { year, champion: s.champion, mvp: s.mvp, hasStats: s.hasStats };
}

export function mvpsByPlayerId(): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const m of getMvps()) if (m.playerId) out.set(m.playerId, [...(out.get(m.playerId) ?? []), m.year]);
  return out;
}
