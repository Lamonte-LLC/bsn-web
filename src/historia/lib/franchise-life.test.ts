import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lifeTicks, lifeYears, pauses, pausesLabel } from './franchise-life.ts';

describe('franchise life', () => {
  const life = lifeYears([1985, 1986, 1987, 1990, 1991, 1994], 1985, 1994);
  it('marks every year between debut and last season', () => {
    assert.equal(life.length, 10);
    assert.deepEqual(life.filter((y) => !y.active).map((y) => y.year), [1988, 1989, 1992, 1993]);
  });
  it('turns the gaps into ranges and a short label', () => {
    const p = pauses(life);
    assert.deepEqual(p, [[1988, 1989], [1992, 1993]]);
    assert.equal(pausesLabel(p), '1988–89, 1992–93');
    assert.equal(pausesLabel([[1999, 2001], [2005, 2005]]), '1999–2001, 2005');
  });
  it('ticks every five years and always ends on the last year', () => {
    assert.deepEqual(lifeTicks(1985, 2015), [1985, 1990, 1995, 2000, 2005, 2010, 2015]);
    assert.deepEqual(lifeTicks(1940, 1953), [1940, 1945, 1950, 1953]);
  });
});
