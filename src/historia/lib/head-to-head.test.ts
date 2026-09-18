import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bestIndexes, seriesBetween, teamHistoryFacts } from './head-to-head.ts';

const file = { nickname: 'Vaqueros', slug: 'vaqueros', firstYear: 1956, activeYears: [1956, 1957, 2025], titles: [{ year: 1971 }, { year: 2025 }], mvps: [{ year: 2011 }] } as never;

describe('teamHistoryFacts', () => {
  it('counts titles, mvps and seasons and finds the last title', () => {
    const f = teamHistoryFacts('BAY', file);
    assert.equal(f.titles, 2);
    assert.equal(f.lastTitle, 2025);
    assert.equal(f.mvps, 1);
    assert.equal(f.seasons, 3);
    assert.equal(f.debut, 1956);
  });
});

describe('seriesBetween', () => {
  const season = (year: number, fpo: boolean, series: unknown[]) => ({ year, results: { fpo: { series: fpo }, series } }) as never;
  const s = (name: string, round: number, a: [string, number], b: [string, number], status = 'CONFIRMED') => ({ name, round, status, competitors: [{ code: a[0], won: a[1] }, { code: b[0], won: b[1] }] });
  it('keeps only real series between the compared teams, newest first', () => {
    const out = seriesBetween([season(2025, false, [s('Final', 3, ['BAY', 4], ['QUE', 2]), s('Semifinal', 2, ['BAY', 4], ['PON', 1])]), season(2026, false, [s('Cuartos', 1, ['QUE', 3], ['BAY', 1])]), season(2024, true, [s('Final', 3, ['BAY', 4], ['QUE', 0])])], ['BAY', 'QUE']);
    assert.deepEqual(out.map((x) => `${x.year} ${x.name} ${x.winnerCode}`), ['2026 Cuartos QUE', '2025 Final BAY']);
  });
  it('leaves the winner open while a series is in progress', () => {
    const out = seriesBetween([season(2026, false, [s('Final', 3, ['BAY', 2], ['QUE', 2], 'IN_PROGRESS')])], ['BAY', 'QUE']);
    assert.equal(out[0].winnerCode, null);
  });
});

describe('bestIndexes', () => {
  it('shares ties and ignores nulls; lower wins for debut', () => {
    assert.deepEqual(bestIndexes([15, 15, 3]), [0, 1]);
    assert.deepEqual(bestIndexes([null, 2]), [1]);
    assert.deepEqual(bestIndexes([1956, 1960], false), [0]);
  });
});
