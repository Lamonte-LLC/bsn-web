'use client';

import { useEffect, useMemo, useState } from 'react';
import { normalizeSearch } from '@/archivo/lib/format';
import type { UnifiedIndexEntry } from '../../../types/historia';

interface Indexed {
  entry: UnifiedIndexEntry;
  tokens: string[];
  full: string;
}

let indexPromise: Promise<Indexed[]> | null = null;

function loadIndex(): Promise<Indexed[]> {
  if (!indexPromise) {
    indexPromise = fetch('/api/historia/players')
      .then((r) => r.json() as Promise<UnifiedIndexEntry[]>)
      .then((list) =>
        list.map((entry) => {
          const full = normalizeSearch(entry.name);
          const tokens = [...new Set([full, ...entry.aliases.map(normalizeSearch)].flatMap((s) => s.split(' ')))];
          return { entry, tokens, full };
        }),
      );
  }
  return indexPromise;
}

/**
 * Prefix search over the unified index (archive + 2026 roster), accents ignored, nicknames included. Active
 * players come first, then by career games, so today's players and the legends both surface.
 */
export function useUnifiedSearch(query: string, limit = 8) {
  const [index, setIndex] = useState<Indexed[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadIndex().then((i) => {
      if (alive) setIndex(i);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Every player, A to Z by name, for the browsable list of the picker. */
  const all = useMemo(() => (index ? [...index].sort((a, b) => a.full.localeCompare(b.full)).map((i) => i.entry) : []), [index]);

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    if (!index || !q) return [];
    const qTokens = q.split(' ');
    const hits: Array<{ entry: UnifiedIndexEntry; rank: number }> = [];
    for (const p of index) {
      if (!qTokens.every((t) => p.tokens.some((pt) => pt.startsWith(t)))) continue;
      const rank = (p.entry.isActive ? 0 : 1) * 1_000_000 + (p.full.startsWith(q) ? 0 : 1) * 100_000 - (p.entry.g ?? 0);
      hits.push({ entry: p.entry, rank });
      if (hits.length > 400) break;
    }
    return hits
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit)
      .map((h) => h.entry);
  }, [index, query, limit]);

  return { results, all, ready: index !== null };
}
