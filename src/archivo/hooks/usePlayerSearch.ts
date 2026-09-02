'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PlayerIndexEntry } from '../../../types/archivo';
import { normalizeSearch } from '../lib/format';

interface IndexedPlayer {
  entry: PlayerIndexEntry;
  tokens: string[];
  full: string;
}

let indexPromise: Promise<IndexedPlayer[]> | null = null;

function loadIndex(): Promise<IndexedPlayer[]> {
  if (!indexPromise) {
    indexPromise = fetch('/archivo/api/players')
      .then((r) => r.json() as Promise<PlayerIndexEntry[]>)
      .then((list) =>
        list.map((entry) => {
          const full = normalizeSearch(entry.name);
          return { entry, tokens: full.split(' '), full };
        }),
      );
  }
  return indexPromise;
}

/**
 * Client-side player search over players.json: every query token must be a prefix of some name token
 * (accents ignored). Shared by the players index and the compare page.
 */
export function usePlayerSearch(query: string, limit = 12) {
  const [index, setIndex] = useState<IndexedPlayer[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadIndex().then((i) => {
      if (alive) setIndex(i);
    });
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    if (!index || !q) return [];
    const qTokens = q.split(' ');
    const hits: Array<{ entry: PlayerIndexEntry; rank: number }> = [];
    for (const p of index) {
      if (!qTokens.every((t) => p.tokens.some((pt) => pt.startsWith(t)))) continue;
      // Exact-start matches first, then by career games so legends surface above one-season players.
      const rank = (p.full.startsWith(q) ? 0 : 1) * 100000 - (p.entry.g ?? 0);
      hits.push({ entry: p.entry, rank });
      if (hits.length > 400) break;
    }
    return hits
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit)
      .map((h) => h.entry);
  }, [index, query, limit]);

  return { results, ready: index !== null };
}

export function usePlayerIndex() {
  const [index, setIndex] = useState<PlayerIndexEntry[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadIndex().then((i) => {
      if (alive) setIndex(i.map((p) => p.entry));
    });
    return () => {
      alive = false;
    };
  }, []);
  return index;
}
