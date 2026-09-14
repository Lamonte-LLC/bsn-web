import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dynasties, eraNoteKeys, eraNotes, franchiseContextLine, franchiseContextLineShort, hasReboundsGapIn2000s } from './copy.ts';

const ctx = (titleYears: number[], firstYear: number | null = 1967) => ({
  franchise: { slug: 'x', nickname: 'X', fullName: 'X de Y', firstYear, status: 'active' as const },
  titles: titleYears.map((year) => ({ year, coach: null, series: null })),
});

describe('franchiseContextLine', () => {
  it('reigning champion with 18 titles', () => {
    assert.equal(franchiseContextLine(ctx([...Array(17).fill(0).map((_, i) => 1967 + i), 2025]), 2026), 'Campeones vigentes · 18 títulos');
  });
  it('no titles, founded 2011', () => {
    assert.equal(franchiseContextLine(ctx([], 2011), 2026), 'Sin campeonatos · fundados en 2011');
  });
  it('no titles, unknown founding', () => {
    assert.equal(franchiseContextLine(ctx([], null), 2026), 'Sin campeonatos en su historia');
  });
  it('last title 25 years ago', () => {
    assert.equal(franchiseContextLine(ctx([1990, 1996, 2001]), 2026), '3 títulos · sin campeonato desde 2001');
  });
  it('recent but not reigning', () => {
    assert.equal(franchiseContextLine(ctx([2009, 2020, 2022]), 2026), '3 títulos · último en 2022 · buscan el 4');
  });
  it('single title uses singular', () => {
    assert.equal(franchiseContextLine(ctx([2015]), 2026), '1 título · último en 2015 · buscan el 2');
  });
  it('short variant drops the middle segment', () => {
    assert.equal(franchiseContextLineShort(ctx([2009, 2020, 2022]), 2026), '3 títulos · buscan el 4');
    assert.equal(franchiseContextLineShort(ctx([2025]), 2026), 'Campeones vigentes · 1 título');
  });
  it('null context renders nothing', () => {
    assert.equal(franchiseContextLine(null, 2026), null);
  });
});

describe('era notes', () => {
  it('debut 1965 gets assists, threes, steals', () => {
    assert.deepEqual(eraNoteKeys({ debutYears: [1965] }), ['assists', 'threes', 'stealsBlocks']);
  });
  it('debut 2015 gets nothing', () => {
    assert.deepEqual(eraNoteKeys({ debutYears: [2015] }), []);
  });
  it('1974 vs 2026 comparison follows the earliest debut', () => {
    assert.deepEqual(eraNotes({ debutYears: [2026, 1974] }), [
      'Los triples no existían o no se registraban antes de 1981.',
      'Los robos y bloqueos no se registraban de forma consistente antes de 2010.',
    ]);
  });
  it('rebounds gap in the 2000s is detected only when the career sits there', () => {
    assert.equal(hasReboundsGapIn2000s([{ year: 2001, rpg: null }, { year: 2003, rpg: null }, { year: 2011, rpg: 4 }]), true);
    assert.equal(hasReboundsGapIn2000s([{ year: 1995, rpg: 5 }, { year: 2001, rpg: null }]), false);
    assert.deepEqual(eraNoteKeys({ debutYears: [2001], reboundsGapIn2000s: true }), ['stealsBlocks', 'rebounds2000s']);
  });
});

describe('dynasties', () => {
  it('groups three or more consecutive titles', () => {
    assert.deepEqual(dynasties([1967, 1969, 1971, 1972, 1973, 1974, 1975, 1981, 1995, 1996, 2009]), [[1971, 1975]]);
  });
});

describe('profile facts', () => {
  it('formats birth, height and position', async () => {
    const { birthLine, heightLine, positionLabel, nationalityLabel } = await import('./copy.ts');
    assert.equal(birthLine('1997-07-26', new Date('2026-09-14')), '26 jul 1997 · 29 años');
    assert.equal(birthLine('1997-09-20', new Date('2026-09-14')), '20 sep 1997 · 28 años');
    assert.equal(birthLine(null), null);
    assert.equal(heightLine(208), '2.08 m');
    assert.equal(heightLine(0), null);
    assert.equal(positionLabel('PF'), 'Ala-pívot');
    assert.equal(nationalityLabel('PUR'), 'Puerto Rico');
    assert.equal(nationalityLabel('XYZ'), 'XYZ');
  });
});
