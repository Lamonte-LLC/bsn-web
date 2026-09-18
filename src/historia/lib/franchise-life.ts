/** Year-by-year life of a franchise between its debut and its last season, with the pauses made explicit. */
export interface LifeYear {
  year: number;
  active: boolean;
}

export function lifeYears(activeYears: readonly number[], first: number, last: number): LifeYear[] {
  const set = new Set(activeYears);
  const out: LifeYear[] = [];
  for (let y = first; y <= last; y++) out.push({ year: y, active: set.has(y) });
  return out;
}

/** Gaps in the life as ranges: [[1996, 1998], [2008, 2010]]. */
export function pauses(life: readonly LifeYear[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start: number | null = null;
  for (const y of life) {
    if (!y.active && start === null) start = y.year;
    if (y.active && start !== null) {
      out.push([start, y.year - 1]);
      start = null;
    }
  }
  if (start !== null) out.push([start, life[life.length - 1].year]);
  return out;
}

/** "1996–98, 2008–10, 2013" */
export function pausesLabel(ranges: ReadonlyArray<[number, number]>): string {
  return ranges.map(([a, b]) => (a === b ? String(a) : `${a}–${Math.floor(a / 100) === Math.floor(b / 100) ? String(b).slice(2) : b}`)).join(', ');
}

/** Axis ticks every `step` years from the first year, always ending on the last. */
export function lifeTicks(first: number, last: number, step = 5): number[] {
  const ticks: number[] = [];
  for (let y = first; y < last; y += step) ticks.push(y);
  ticks.push(last);
  return ticks;
}
