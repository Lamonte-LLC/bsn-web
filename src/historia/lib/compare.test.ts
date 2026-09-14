import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bestOf, totalCell, totalsFromLines } from './compare.ts';

const line = (o: Partial<Record<string, number | null>>) =>
  ({ year: 2000, phase: 'regular', phaseLabel: 'Serie Regular', teamIndex: 1, teamName: 'X', franchiseSlug: 'x', g: 10, ppg: 10, rpg: 5, apg: 2, spg: 1.2, bpg: 0.5, topg: 2.1, fgPct: 45, fg3Pct: null, ftPct: 80, fgm: 40, fga: 90, fg3m: null, fg3a: null, ftm: 20, fta: 25, pts: 100, reb: 50, ast: 20, ...o }) as never;

describe('bestOf', () => {
  it('max wins, min wins for turnovers, ties and nulls mark nobody', () => {
    assert.equal(bestOf([679, 675]), 679);
    assert.equal(bestOf([2.1, 2.8], true), 2.1);
    assert.equal(bestOf([3, 3]), null);
    assert.equal(bestOf([null, 1.9]), null);
    assert.equal(bestOf([10, 12, 11]), 12);
  });
});

describe('totalsFromLines', () => {
  it('sums, derives steals from averages, and nulls a total when any line lacks it', () => {
    const t = totalsFromLines([line({}), line({ g: 20, spg: 1.5, pts: 300 })]);
    assert.equal(t.pts, 400);
    assert.equal(t.stl, 12 + 30);
    assert.equal(t.fg3m, null);
    assert.deepEqual(totalCell(t, 'fg'), { value: 80, text: '80/180' });
    assert.deepEqual(totalCell(t, 'fg3'), { value: null, text: null });
  });
  it('empty lines give nulls', () => {
    assert.equal(totalsFromLines([]).pts, null);
  });
});
