import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { nextAbove, rankOf, rankedBy, recordsWatch, statWatch, toTopN } from './records-watch.ts';

const entry = (id: string, pts: number | null, g: number | null = null) =>
  ({ id, slug: `p-${id}`, name: `Jugador ${id}`, aliases: [], fy: 2000, ly: 2001, franchiseSlugs: [], g, pts, isMvp: false, mvpYears: [] }) as never;

/** 60 players: #1 has 6000 points, #60 has 100; every one has games except the last. */
const index = Array.from({ length: 60 }, (_, i) => entry(String(i + 1), (60 - i) * 100, i === 59 ? null : 60 - i));

describe('rankedBy', () => {
  it('orders by value, skips nulls and zeros, ranks 1-based', () => {
    const list = rankedBy([entry('a', 10), entry('b', null), entry('c', 30), entry('d', 0)], 'pts');
    assert.deepEqual(list.map((r) => [r.id, r.rank]), [['c', 1], ['a', 2]]);
  });
  it('breaks ties by name so the order is stable', () => {
    const list = rankedBy([{ ...entry('z', 10), name: 'Zed' }, { ...entry('a', 10), name: 'Ana' }] as never, 'pts');
    assert.deepEqual(list.map((r) => r.id), ['a', 'z']);
  });
});

describe('rankOf / nextAbove', () => {
  it('finds the position and the player right above with the distance', () => {
    assert.equal(rankOf(index, '52', 'pts')?.rank, 52);
    assert.deepEqual(nextAbove(index, '52', 'pts'), { id: '51', slug: 'p-51', name: 'Jugador 51', value: 1000, rank: 51, diff: 100 });
  });
  it('the leader has nobody above; a missing stat gives null', () => {
    assert.equal(nextAbove(index, '1', 'pts'), null);
    assert.equal(rankOf(index, '60', 'g'), null);
    assert.equal(rankOf(index, 'nope', 'pts'), null);
  });
  it('skips ties and points to the nearest strictly higher value', () => {
    const tied = [entry('a', 300), entry('b', 200), entry('c', 200), entry('d', 200)];
    const above = nextAbove(tied, 'd', 'pts');
    assert.equal(above?.id, 'a');
    assert.equal(above?.diff, 100);
  });
});

describe('toTopN', () => {
  it('measures the gap to the value of #50 and is null inside the top 50', () => {
    assert.equal(toTopN(index, '52', 'pts'), 200);
    assert.equal(toTopN(index, '50', 'pts'), null);
    assert.equal(toTopN(index, '1', 'pts'), null);
  });
  it('is null when the list is shorter than n', () => {
    assert.equal(toTopN(index.slice(0, 10), '5', 'pts'), null);
  });
});

describe('statWatch / recordsWatch', () => {
  it('bundles rank, above and gap; games only when present', () => {
    const w = recordsWatch(index, '55');
    assert.equal(w?.pts.rank, 55);
    assert.equal(w?.pts.value, 600);
    assert.equal(w?.pts.toTopN, 500);
    assert.equal(w?.g?.rank, 55);
    assert.equal(recordsWatch(index, '60')?.g, null);
  });
  it('is null without points even if games exist', () => {
    assert.equal(recordsWatch([entry('x', null, 20)], 'x'), null);
    assert.equal(statWatch([entry('x', null, 20)], 'x', 'g')?.rank, 1);
  });
});
