import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { aggregateFranchiseLines, rankFranchiseRows } from './franchise-stats.ts';

const line = (year: number, franchiseSlug: string, o: Partial<{ g: number; pts: number; reb: number | null; ast: number | null; fgm: number | null; fga: number | null; phase: string }> = {}) =>
  ({ year, phase: o.phase ?? 'regular', franchiseSlug, g: o.g ?? 10, pts: o.pts ?? 100, reb: o.reb === undefined ? 50 : o.reb, ast: o.ast === undefined ? 20 : o.ast, fgm: o.fgm === undefined ? 40 : o.fgm, fga: o.fga === undefined ? 100 : o.fga, fg3m: null, fg3a: null, ftm: null, fta: null }) as never;
const me = { id: '1', slug: 'x', name: 'X' };

describe('aggregateFranchiseLines', () => {
  it('sums only regular-season lines of that franchise and derives averages and percentages', () => {
    const r = aggregateFranchiseLines(me, [line(1990, 'vaqueros'), line(1991, 'vaqueros', { g: 20, pts: 300 }), line(1992, 'leones'), line(1993, 'vaqueros', { phase: 'playoffs' })], 'vaqueros');
    assert.ok(r);
    assert.equal(r.g, 30);
    assert.equal(r.pts, 400);
    assert.equal(r.seasons, 2);
    assert.deepEqual([r.fy, r.ly], [1990, 1991]);
    assert.equal(r.ppg, 13.3);
    assert.equal(r.rpg, 3.3);
    assert.equal(r.fgPct, 40);
    assert.equal(r.fg3Pct, null);
  });
  it('keeps a stat null when no season recorded it, and returns null with no lines', () => {
    const r = aggregateFranchiseLines(me, [line(1960, 'vaqueros', { reb: null, ast: null, fgm: null, fga: null })], 'vaqueros');
    assert.equal(r?.reb, null);
    assert.equal(r?.rpg, null);
    assert.equal(aggregateFranchiseLines(me, [line(1960, 'leones')], 'vaqueros'), null);
  });
});

describe('rankFranchiseRows', () => {
  it('orders by the stat, drops nulls and applies the games floor to rates', () => {
    const a = aggregateFranchiseLines({ id: 'a', slug: 'a', name: 'A' }, [line(1990, 'v', { g: 5, pts: 100 })], 'v')!;
    const b = aggregateFranchiseLines({ id: 'b', slug: 'b', name: 'B' }, [line(1990, 'v', { g: 50, pts: 500, reb: null })], 'v')!;
    assert.deepEqual(rankFranchiseRows([a, b], 'ppg', 10).map((r) => r.name), ['B']);
    assert.deepEqual(rankFranchiseRows([a, b], 'pts').map((r) => r.name), ['B', 'A']);
    assert.deepEqual(rankFranchiseRows([a, b], 'reb').map((r) => r.name), ['A']);
  });
});
