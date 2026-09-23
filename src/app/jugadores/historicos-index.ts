'use client';

import { useEffect, useState } from 'react';

/** One player of public/data/jugadores-historicos.json (built by scripts/jugadores/build-historicos-index.mjs). */
export type HistoricoEntry = {
  id: string;
  /** Name. */
  n: string;
  /** Nickname. */
  k?: string;
  /** Avatar URL. */
  a?: string;
  /** First and last regular season played. */
  fy: number | null;
  ly: number | null;
  /** Seasons played. */
  s: number;
  /** Games played in the career. */
  g: number;
  /** Club codes, in the order they were first played for. */
  t: string[];
  /** Decades with at least one season (1950, 1960…). */
  d: number[];
};

export type HistoricoClub = { name: string; nickname: string; color: string | null };

export type HistoricosIndex = { generatedAt: string; teams: Record<string, HistoricoClub>; players: HistoricoEntry[] };

let cache: HistoricosIndex | null = null;
let pending: Promise<HistoricosIndex> | null = null;

/** The whole historical index, fetched once per session the first time the Históricos tab opens. */
export function useHistoricosIndex() {
  const [index, setIndex] = useState<HistoricosIndex | null>(cache);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (cache) {
      setIndex(cache);
      return;
    }
    pending ??= fetch('/data/jugadores-historicos.json').then((r) => {
      if (!r.ok) throw new Error(`index ${r.status}`);
      return r.json() as Promise<HistoricosIndex>;
    });
    pending
      .then((d) => {
        cache = d;
        setIndex(d);
      })
      .catch((e) => {
        console.error(e);
        pending = null;
        setError(true);
      });
  }, []);
  return { index, loading: !index && !error, error };
}

/** "1973–1996"; a single season reads "1979". */
export function yearsSpan(fy: number | null, ly: number | null): string {
  if (fy === null || ly === null) return '–';
  return fy === ly ? String(fy) : `${fy}–${ly}`;
}
