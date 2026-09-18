import type { FranchiseFile, SeasonFile } from '@/archivo/lib/types';

/** Historical facts of one franchise, as the team comparison shows them side by side. */
export interface TeamHistoryFacts {
  code: string;
  nickname: string;
  slug: string;
  titles: number;
  lastTitle: number | null;
  mvps: number;
  seasons: number;
  debut: number | null;
}

/** A real playoff series between two of the compared teams. */
export interface SeriesBetween {
  year: number;
  name: string;
  round: number;
  a: { code: string; won: number };
  b: { code: string; won: number };
  winnerCode: string | null;
}

export function teamHistoryFacts(code: string, f: FranchiseFile): TeamHistoryFacts {
  const years = f.titles.map((t) => t.year);
  return {
    code,
    nickname: f.nickname,
    slug: f.slug,
    titles: f.titles.length,
    lastTitle: years.length ? Math.max(...years) : null,
    mvps: f.mvps.length,
    seasons: f.activeYears.length,
    debut: f.firstYear ?? (f.activeYears.length ? Math.min(...f.activeYears) : null),
  };
}

/** Real (non-placeholder) playoff series where both competitors belong to `codes`, newest first. */
export function seriesBetween(seasons: SeasonFile[], codes: string[]): SeriesBetween[] {
  const set = new Set(codes);
  const out: SeriesBetween[] = [];
  for (const s of seasons) {
    const results = s.results;
    if (!results || results.fpo?.series) continue;
    for (const series of results.series) {
      if (series.competitors.length !== 2) continue;
      const [x, y] = series.competitors;
      if (!set.has(x.code) || !set.has(y.code)) continue;
      const finished = /final|closed|complete|finished/i.test(series.status) || x.won >= 4 || y.won >= 4 || x.won >= 3 && series.round === 1 || y.won >= 3 && series.round === 1;
      const winnerCode = finished ? (x.won > y.won ? x.code : y.won > x.won ? y.code : null) : null;
      out.push({ year: s.year, name: series.name, round: series.round, a: { code: x.code, won: x.won }, b: { code: y.code, won: y.won }, winnerCode });
    }
  }
  return out.sort((p, q) => q.year - p.year || q.round - p.round);
}

/** Index of the best value per fact (ties share it); `higherIsBetter` false for the debut year. */
export function bestIndexes(values: Array<number | null>, higherIsBetter = true): number[] {
  const nums = values.filter((v): v is number => v !== null);
  if (!nums.length) return [];
  const best = higherIsBetter ? Math.max(...nums) : Math.min(...nums);
  return values.map((v, i) => (v === best ? i : -1)).filter((i) => i >= 0);
}
