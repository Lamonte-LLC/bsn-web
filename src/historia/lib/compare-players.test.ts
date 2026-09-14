import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { commonSeasons, compareHref, defaultScope, EMPTY_VALUES, formatCompareValue, parseCompareKeys, PLAYER_COMPARE_SECTIONS, valuesFor, visibleStats, winningIndexes, type ComparePlayerData } from './compare-players.ts';

const player = (key: string, years: number[], patch: Partial<ComparePlayerData> = {}): ComparePlayerData => ({
  key,
  name: key,
  slug: key,
  providerId: null,
  isActive: false,
  avatarUrl: null,
  teamCode: null,
  franchise: null,
  color: '#0F171F',
  line: '',
  fy: Math.min(...years),
  ly: Math.max(...years),
  seasons: Object.fromEntries(years.map((y) => [String(y), { ...EMPTY_VALUES, g: 30, ppg: y % 100 }])),
  career: { ...EMPTY_VALUES, g: 30 * years.length, ppg: 10 },
  ...patch,
});

describe('commonSeasons / defaultScope', () => {
  it('keeps only the seasons every player has, newest first', () => {
    const a = player('a', [2022, 2025, 2026]);
    const b = player('b', [2025, 2026]);
    assert.deepEqual(commonSeasons([a, b]), [2026, 2025]);
    assert.equal(defaultScope([a, b]), 2026);
  });
  it('falls back to the career when they never coincided', () => {
    const a = player('a', [1975, 1976]);
    const b = player('b', [2025]);
    assert.deepEqual(commonSeasons([a, b]), []);
    assert.equal(defaultScope([a, b]), 'career');
    assert.equal(valuesFor(b, 1975).g, null);
  });
});

describe('winningIndexes', () => {
  it('marks the best, several on a tie, none when equal or missing', () => {
    assert.deepEqual(winningIndexes([10, 12], true), [1]);
    assert.deepEqual(winningIndexes([2.1, 1.4], false), [1]);
    assert.deepEqual(winningIndexes([12, 12, 9], true), [0, 1]);
    assert.deepEqual(winningIndexes([5, 5], true), []);
    assert.deepEqual(winningIndexes([5, null], true), []);
  });
});

describe('formatCompareValue', () => {
  it('formats like the team comparison, with a dash for missing', () => {
    assert.equal(formatCompareValue(null, 'avg'), '—');
    assert.equal(formatCompareValue(12.19, 'avg'), '12.2');
    assert.equal(formatCompareValue(54.63, 'pct'), '54.6%');
    assert.equal(formatCompareValue(439.4, 'int'), '439');
  });
});

describe('visibleStats', () => {
  it('hides rows nobody has, e.g. blocks before 2010', () => {
    const a = player('a', [1975]);
    const b = player('b', [1975]);
    const promedio = PLAYER_COMPARE_SECTIONS[0];
    assert.deepEqual(
      visibleStats(promedio, [a, b], 1975).map((s) => s.code),
      ['PPJ'],
    );
  });
});

describe('parseCompareKeys / compareHref', () => {
  it('dedupes, trims and caps at four', () => {
    assert.deepEqual(parseCompareKeys('a, b,a,c,d,e'), ['a', 'b', 'c', 'd']);
    assert.deepEqual(parseCompareKeys(undefined), []);
    assert.equal(compareHref(['a', 'b']), '/jugadores/comparar?p=a,b');
    assert.equal(compareHref([]), '/jugadores/comparar');
  });
});
