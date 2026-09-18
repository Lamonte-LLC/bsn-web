import type { PlayerIndexEntry } from '@/archivo/lib/types';

/**
 * "Récords a la vista": where an active player sits in the all-time regular-season lists of the archive index
 * (players.json), who is immediately above him and how far the top 50 is. Pure functions over the index so the
 * card never mixes live totals with the archive; the 2026 season joins when it closes.
 */

export type RankStat = 'pts' | 'g';

export const TOP_N = 50;

export interface Ranked {
  id: string;
  slug: string;
  name: string;
  value: number;
  /** 1-based position in the sorted list. */
  rank: number;
}

export interface Above {
  id: string;
  slug: string;
  name: string;
  value: number;
  rank: number;
  /** Units (points, games) between the two. Always > 0. */
  diff: number;
}

export interface StatWatch {
  stat: RankStat;
  value: number;
  rank: number;
  /** Nearest player with a strictly higher value; null when the player is #1. */
  above: Above | null;
  /** Units missing to reach the value of #50; null when already inside the top 50. */
  toTopN: number | null;
}

/** Every entry with a positive value for the stat, best first. Ties break by name so the order is stable. */
export function rankedBy(index: PlayerIndexEntry[], stat: RankStat): Ranked[] {
  return index
    .filter((p): p is PlayerIndexEntry & Record<RankStat, number> => typeof p[stat] === 'number' && (p[stat] as number) > 0)
    .sort((a, b) => b[stat] - a[stat] || a.name.localeCompare(b.name, 'es'))
    .map((p, i) => ({ id: p.id, slug: p.slug, name: p.name, value: p[stat], rank: i + 1 }));
}

function aboveIn(list: Ranked[], me: Ranked): Above | null {
  for (let i = me.rank - 2; i >= 0; i -= 1) {
    const r = list[i];
    if (r.value > me.value) return { ...r, diff: r.value - me.value };
  }
  return null;
}

function toTopNIn(list: Ranked[], me: Ranked, n: number): number | null {
  if (me.rank <= n) return null;
  const gate = list[n - 1];
  return gate ? Math.max(0, gate.value - me.value) : null;
}

/** Position of a player in the stat list, or null when the index has no value for him. */
export function rankOf(index: PlayerIndexEntry[], id: string, stat: RankStat): Ranked | null {
  return rankedBy(index, stat).find((r) => r.id === id) ?? null;
}

/** The player right above (strictly higher value) and the distance to him; null at the top. */
export function nextAbove(index: PlayerIndexEntry[], id: string, stat: RankStat): Above | null {
  const list = rankedBy(index, stat);
  const me = list.find((r) => r.id === id);
  return me ? aboveIn(list, me) : null;
}

/** Units missing to match the value of #n; null when the player is already inside the top n. */
export function toTopN(index: PlayerIndexEntry[], id: string, stat: RankStat, n = TOP_N): number | null {
  const list = rankedBy(index, stat);
  const me = list.find((r) => r.id === id);
  return me ? toTopNIn(list, me, n) : null;
}

/** One sort per stat: rank, the player above and the distance to the top n. */
export function statWatch(index: PlayerIndexEntry[], id: string, stat: RankStat, n = TOP_N): StatWatch | null {
  const list = rankedBy(index, stat);
  const me = list.find((r) => r.id === id);
  if (!me) return null;
  return { stat, value: me.value, rank: me.rank, above: aboveIn(list, me), toTopN: toTopNIn(list, me, n) };
}

/** Points (required) and games (when the index has them) for one player. Null when there are no points. */
export function recordsWatch(index: PlayerIndexEntry[], id: string): { pts: StatWatch; g: StatWatch | null } | null {
  const pts = statWatch(index, id, 'pts');
  if (!pts) return null;
  return { pts, g: statWatch(index, id, 'g') };
}
