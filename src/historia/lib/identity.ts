import 'server-only';
import { getPlayer, getPlayerIndex, getPlayerIndexById, getSeason } from '@/archivo/lib/data';
import { normalizeSearch } from '@/archivo/lib/format';
import type { LivePlayerStats, LiveRosterEntry, PlayerIndexEntry } from '@/archivo/lib/types';
import type { UnifiedPlayer } from '../../../types/historia';

/**
 * Bridge between the live API identity (providerId, one surname, no accents) and the archive identity
 * (numeric id, slug, two surnames, aliases). Three passes, strictest first:
 *   1. exact normalized full name, unique in the index;
 *   2. an alias of the index entry, unique;
 *   3. first name + first surname, unique among players active in 2015 or later (keeps "D J Wilson" from
 *      matching a 1990s "D.J. Strawberry");
 *   4. first name + any later word, unique among recent players, so "Carlos Yao Lopez" meets
 *      "Carlos 'Yao' López Sosa" and "Christian Pizarro Rios" meets "Christian Jomar Pizarro Ríos".
 * Anything else is the explicit "sin enlazar" state, never an error.
 */

const CURRENT_YEAR = 2026;
const RECENT_FROM = 2015;

interface NameIndex {
  exact: Map<string, string | null>;
  alias: Map<string, string | null>;
  short: Map<string, string | null>;
  loose: Map<string, string | null>;
}

let cache: NameIndex | null = null;

function put(map: Map<string, string | null>, key: string, id: string) {
  if (!key) return;
  map.set(key, map.has(key) && map.get(key) !== id ? null : id);
}

/** "juan 'pachin' vicens sastre" → "juan vicens" (nicknames in quotes dropped, first name + first surname). */
export function shortKey(name: string): string {
  const clean = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ');
  const words = normalizeSearch(clean).split(' ').filter((w) => w.length > 1 && !/^(jr|sr|ii|iii|iv)$/.test(w));
  return words.length >= 2 ? `${words[0]} ${words[1]}` : words.join(' ');
}

/** Words of a name without nicknames, suffixes or one-letter initials, accents removed. */
function nameWords(name: string): string[] {
  const clean = name.replace(/["'‘’“”][^"'‘’“”]*["'‘’“”]/g, ' ');
  return normalizeSearch(clean)
    .split(' ')
    .filter((w) => w.length > 1 && !/^(jr|sr|ii|iii|iv)$/.test(w));
}

/** "carlos yao lopez" → ["carlos yao", "carlos lopez"]: first name paired with every later word. */
export function looseKeys(name: string): string[] {
  const words = nameWords(name);
  return words.slice(1).map((w) => `${words[0]} ${w}`);
}

function index(): NameIndex {
  if (cache) return cache;
  const exact = new Map<string, string | null>();
  const alias = new Map<string, string | null>();
  const short = new Map<string, string | null>();
  const loose = new Map<string, string | null>();
  for (const p of getPlayerIndex()) {
    put(exact, normalizeSearch(p.name), p.id);
    for (const a of p.aliases) put(alias, normalizeSearch(a), p.id);
    if (p.ly >= RECENT_FROM) {
      put(short, shortKey(p.name), p.id);
      for (const k of looseKeys(p.name)) put(loose, k, p.id);
    }
  }
  cache = { exact, alias, short, loose };
  return cache;
}

export type LinkKind = Exclude<UnifiedPlayer['link'], 'archive-only' | 'none'>;

/** Archive index entry for a live name, with how it was matched. */
export function linkLiveName(name: string): { entry: PlayerIndexEntry; link: LinkKind } | null {
  const ix = index();
  const key = normalizeSearch(name);
  const tries: Array<[LinkKind, string | null | undefined]> = [
    ['exact', ix.exact.get(key)],
    ['alias', ix.alias.get(key)],
    ['surname', ix.short.get(shortKey(name))],
    ['loose', looseKeys(name).map((k) => ix.loose.get(k)).find((id) => id)],
  ];
  for (const [link, id] of tries) {
    if (!id) continue;
    const entry = getPlayerIndexById(id);
    if (entry) return { entry, link };
  }
  return null;
}

/** Live 2026 roster entry for a providerId, from the season file (real data, no API call). */
export function liveRoster(providerId: string): LiveRosterEntry | null {
  const results = getSeason(CURRENT_YEAR)?.results;
  return results?.rosters.find((r) => r.playerProviderId === providerId) ?? null;
}

export function liveStats(providerId: string): LivePlayerStats | null {
  const results = getSeason(CURRENT_YEAR)?.results;
  return results?.playerStats.find((r) => r.playerProviderId === providerId) ?? null;
}

/**
 * Resolves whatever identifier the profile route receives: a live providerId (UUID) or an archive slug.
 * Returns the unified identity, or null when neither world knows the player.
 */
export function resolveUnifiedPlayer(idOrSlug: string): UnifiedPlayer | null {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(idOrSlug);
  if (isUuid) {
    const live = liveRoster(idOrSlug);
    if (!live) return null;
    const linked = live.playerId ? { entry: getPlayerIndexById(live.playerId), link: 'exact' as LinkKind } : linkLiveName(live.name);
    if (!linked?.entry) return { providerId: idOrSlug, archive: null, index: null, name: live.name, link: 'none' };
    return { providerId: idOrSlug, archive: getPlayer(linked.entry.id), index: linked.entry, name: linked.entry.name, link: linked.link };
  }
  const entry = getPlayerIndex().find((p) => p.slug === idOrSlug);
  if (!entry) return null;
  const results = getSeason(CURRENT_YEAR)?.results;
  const live = results?.rosters.find((r) => r.playerId === entry.id) ?? results?.rosters.find((r) => linkLiveName(r.name)?.entry.id === entry.id) ?? null;
  return { providerId: live?.playerProviderId ?? null, archive: getPlayer(entry.id), index: entry, name: entry.name, link: live ? 'exact' : 'archive-only' };
}

/** Every 2026 roster player with its archive link, for leaderboards that highlight active players. */
export function activePlayerIds(): Map<string, string> {
  const results = getSeason(CURRENT_YEAR)?.results;
  const out = new Map<string, string>();
  for (const r of results?.rosters ?? []) {
    const id = r.playerId ?? linkLiveName(r.name)?.entry.id;
    if (id) out.set(id, r.playerProviderId);
  }
  return out;
}

/** Summary printed by the validation step: how many of the live roster link, and by which pass. */
export function linkReport(): { total: number; linked: number; byPass: Record<string, number>; unlinked: string[] } {
  const results = getSeason(CURRENT_YEAR)?.results;
  const byPass: Record<string, number> = { exact: 0, alias: 0, surname: 0, loose: 0 };
  const unlinked: string[] = [];
  let linked = 0;
  for (const r of results?.rosters ?? []) {
    const hit = r.playerId ? { link: 'exact' as LinkKind } : linkLiveName(r.name);
    if (hit) {
      linked++;
      byPass[hit.link]++;
    } else unlinked.push(r.name);
  }
  return { total: results?.rosters.length ?? 0, linked, byPass, unlinked };
}
