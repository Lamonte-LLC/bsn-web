/**
 * Pure builders of the "Historia BSN" section of the home page. No data access: the server component passes
 * archive rows in and gets serializable views out, so every rule here is testable with node:test.
 */
import type { Champion, PlayerIndexEntry } from '@/archivo/lib/types';

/* ---------- Dates ---------- */

const PR_TZ = 'America/Puerto_Rico';

/** Civil day (1..366) in Puerto Rico, so the daily rotation flips at midnight local time, not UTC. */
export function dayOfYear(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: PR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const y = get('year');
  const m = get('month');
  const d = get('day');
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000) + 1;
}

/** "18 de septiembre" */
export function todayLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-PR', { day: 'numeric', month: 'long', timeZone: PR_TZ }).format(date);
}

/* ---------- Legend of the day ---------- */

export type LegendCandidate = Pick<PlayerIndexEntry, 'id' | 'slug' | 'name' | 'fy' | 'ly' | 'franchiseSlugs' | 'pts' | 'isMvp' | 'mvpYears'>;

/** Retired MVPs and 6,000-point scorers, best scorer first; the order is what makes the rotation stable. */
export function legendPool<T extends LegendCandidate>(index: readonly T[], lastEligibleYear = 2023): T[] {
  return index
    .filter((p) => p.ly <= lastEligibleYear && (p.isMvp || (p.pts ?? 0) >= 6000))
    .sort((a, b) => (b.pts ?? 0) - (a.pts ?? 0) || a.name.localeCompare(b.name, 'es'));
}

/** One entry per civil day, cycling through the pool in order. */
export function pickLegend<T>(pool: readonly T[], date: Date): T | null {
  if (!pool.length) return null;
  return pool[dayOfYear(date) % pool.length] ?? null;
}

/** 1-based position by career points in the whole index; null for players without points. */
export function ptsRank(index: readonly Pick<PlayerIndexEntry, 'id' | 'pts'>[], id: string): number | null {
  const me = index.find((p) => p.id === id);
  if (!me || me.pts === null) return null;
  let ahead = 0;
  for (const p of index) if ((p.pts ?? 0) > me.pts) ahead += 1;
  return ahead + 1;
}

export interface LegendReasonInput {
  ptsRank: number | null;
  mvpYears: readonly number[];
  seasons: number;
  fy: number;
  ly: number;
}

/** The one line that says why this player is a legend: scoring rank first, then MVPs, then longevity. */
export function legendReason({ ptsRank: rank, mvpYears, seasons, fy, ly }: LegendReasonInput): string {
  if (rank === 1) return 'Máximo anotador en la historia del BSN';
  if (rank !== null && rank <= 10) return `Top 10 histórico en puntos · #${rank}`;
  if (mvpYears.length >= 2) return `${mvpYears.length} veces jugador más valioso (${[...mvpYears].sort((a, b) => a - b).join(', ')})`;
  if (mvpYears.length === 1) return `Jugador más valioso de ${mvpYears[0]}`;
  return `${seasons} ${seasons === 1 ? 'temporada' : 'temporadas'} · ${fy === ly ? fy : `${fy} a ${ly}`}`;
}

/** "Cariduros, Mets, Vaqueros y 3 más" — at most `max` names, the rest counted. */
export function franchiseList(nicknames: readonly string[], max = 3): string {
  if (nicknames.length <= max) return joinNames(nicknames);
  const rest = nicknames.length - max;
  return `${nicknames.slice(0, max).join(', ')} y ${rest} más`;
}

/** "a", "a y b", "a, b y c" */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/**
 * Everyday name for a strip of copy: the nickname plus first surname when the player has one ("Pachín Vicéns",
 * "Quijote Morales"), otherwise the league alias ("Georgie Torres") or first name plus first surname.
 */
export function casualName(name: string, aliases: readonly string[] = []): string {
  const quoted = /["'‘’“”]([^"'‘’“”]+)["'‘’“”]/;
  const nick = name.match(quoted)?.[1]?.trim() ?? null;
  const alias = aliases[0]?.trim();
  if (alias) {
    const words = alias.split(/\s+/);
    const at = nick ? words.indexOf(nick) : -1;
    if (at > 0 && words.length - at >= 2) return words.slice(at).join(' ');
    if (words.length <= 2) return alias;
  }
  const words = name.replace(quoted, ' ').replace(/\s+/g, ' ').trim().split(' ');
  if (words.length < 2) return name;
  const surname = words[words.length >= 3 ? words.length - 2 : 1];
  return `${nick ?? words[0]} ${surname}`;
}

/* ---------- Anniversaries ---------- */

export interface AnniversaryYear {
  /** 50 or 25 */
  ago: number;
  /** Season actually shown (the nearest one with a champion when the exact year has none). */
  year: number;
  /** True when `year` is not exactly `currentSeason - ago`. */
  approximate: boolean;
}

/** The seasons 50 and 25 years back, snapped to the nearest year that has a champion on record. */
export function anniversaryYears(currentSeason: number, yearsWithChampion: readonly number[], spans: readonly number[] = [50, 25]): AnniversaryYear[] {
  if (!yearsWithChampion.length) return [];
  return spans.map((ago) => {
    const target = currentSeason - ago;
    let best = yearsWithChampion[0];
    for (const y of yearsWithChampion) {
      const d = Math.abs(y - target);
      const bd = Math.abs(best - target);
      if (d < bd || (d === bd && y < best)) best = y;
    }
    return { ago, year: best, approximate: best !== target };
  });
}

/** "10º" — Spanish ordinal suffix for titles. */
export function ordinal(n: number): string {
  return `${n}º`;
}

/** "Campeones · Julio Toro, su 10º título · Final 4-3" — segments only when the archive has them. */
export function championLine(c: Pick<Champion, 'coach' | 'series' | 'coachTitleNumber'>): string {
  const parts = ['Campeones'];
  if (c.coach) parts.push(c.coachTitleNumber ? `${c.coach}, su ${ordinal(c.coachTitleNumber)} título` : c.coach);
  if (c.series) parts.push(`Final ${c.series}`);
  return parts.join(' · ');
}

/** "Polluelos de Aibonito" → "Polluelos"; names without a city stay as they are. */
export function teamNickname(teamName: string): string {
  return teamName.split(/\s+de\s+/i)[0].trim() || teamName;
}

/* ---------- Number strip ---------- */

export interface NumberFact {
  key: 'coach' | 'scorer' | 'mvps' | 'titles';
  value: number;
  /** Copy before the subject: "Títulos de" */
  lead: string;
  /** Rendered in ink: the person or club the number belongs to. */
  subject: string;
  /** Copy after the subject: ", el dirigente más ganador de la liga" */
  tail: string;
  linkLabel: string;
  href: string;
}

export interface NumberFactsInput {
  topCoach: { name: string; titles: number } | null;
  topScorer: { name: string; pts: number } | null;
  /** Everyone tied at the highest MVP count. */
  topMvps: { names: string[]; count: number } | null;
  topFranchise: { name: string; titles: number } | null;
}

/** The four facts of the strip, in rotation order; a fact with no data is left out instead of rendered empty. */
export function numberFacts({ topCoach, topScorer, topMvps, topFranchise }: NumberFactsInput): NumberFact[] {
  const facts: NumberFact[] = [];
  if (topCoach && topCoach.titles > 0) {
    facts.push({ key: 'coach', value: topCoach.titles, lead: 'Títulos de', subject: topCoach.name, tail: ', el dirigente más ganador de la liga', linkLabel: 'Récords', href: '/estadisticas/records' });
  }
  if (topScorer && topScorer.pts > 0) {
    facts.push({ key: 'scorer', value: topScorer.pts, lead: 'Puntos de', subject: topScorer.name, tail: ', el máximo anotador histórico', linkLabel: 'Récords', href: '/estadisticas/records' });
  }
  if (topMvps && topMvps.count > 0 && topMvps.names.length) {
    const tied = topMvps.names.length > 1;
    facts.push({ key: 'mvps', value: topMvps.count, lead: 'MVPs de', subject: joinNames(topMvps.names), tail: tied ? ', empatados en la cima' : ', el que más tiene', linkLabel: 'MVPs', href: '/estadisticas/mvps' });
  }
  if (topFranchise && topFranchise.titles > 0) {
    facts.push({ key: 'titles', value: topFranchise.titles, lead: 'Campeonatos de', subject: topFranchise.name, tail: ', la franquicia con más títulos', linkLabel: 'Campeones', href: '/estadisticas/campeones' });
  }
  return facts;
}

/** One fact per civil day. */
export function pickFact(facts: readonly NumberFact[], date: Date): NumberFact | null {
  if (!facts.length) return null;
  return facts[dayOfYear(date) % facts.length] ?? null;
}

/** `count` facts starting at the day's pick, wrapping around, so the row changes every day. */
export function pickFacts(facts: readonly NumberFact[], date: Date, count: number): NumberFact[] {
  if (!facts.length) return [];
  const start = dayOfYear(date) % facts.length;
  return Array.from({ length: Math.min(count, facts.length) }, (_, i) => facts[(start + i) % facts.length]);
}

/** Titles per franchise from the champions list, most first. Pre-franchise clubs (null slug) are skipped. */
export function titlesByFranchise(champions: readonly Pick<Champion, 'franchiseSlug'>[]): Array<{ slug: string; titles: number }> {
  const counts = new Map<string, number>();
  for (const c of champions) if (c.franchiseSlug) counts.set(c.franchiseSlug, (counts.get(c.franchiseSlug) ?? 0) + 1);
  return [...counts].map(([slug, titles]) => ({ slug, titles })).sort((a, b) => b.titles - a.titles || a.slug.localeCompare(b.slug));
}
