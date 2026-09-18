import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decadeOf, decadesSince, filterActive, filterHistoric, lettersWith, loadMoreLabel, normalizePosition, sortBySurname, surnameInitial, surnameOf, type HistoricEntry } from './players-list.ts';

describe('surnameOf', () => {
  it('takes the first surname of a Spanish name', () => {
    assert.equal(surnameOf('Jose Rafael Ortiz Rijos'), 'Rafael');
    assert.equal(surnameOf('Mario Morales Micheo'), 'Morales');
  });
  it('takes the last word of a two-word name', () => {
    assert.equal(surnameOf('Gary Browne'), 'Browne');
  });
  it('falls back to the first name when the second word is an initial', () => {
    assert.equal(surnameOf('Jose R. Ortiz'), 'Jose');
    assert.equal(surnameOf('Ángel'), 'Ángel');
  });
  it('ignores nicknames in quotes and disambiguators in parentheses', () => {
    assert.equal(surnameOf("Mario 'Quijote' Morales"), 'Morales');
    assert.equal(surnameOf('Carlos (1) Bonilla'), 'Bonilla');
    assert.equal(surnameInitial('Carlos (2) Bonilla'), 'B');
  });
});

describe('surnameInitial', () => {
  it('folds accents and upper-cases', () => {
    assert.equal(surnameInitial('Luis Ángel Álvarez'), 'A');
    assert.equal(surnameInitial('Juan Ñeco'), 'N');
  });
  it('returns # for a non-letter start', () => {
    assert.equal(surnameInitial('John 2Pac'), '#');
    assert.equal(surnameInitial(''), '#');
  });
});

describe('sortBySurname', () => {
  it('orders by surname with es collation and does not mutate', () => {
    const list = [{ name: 'Zoe Álvarez' }, { name: 'Ana Zapata' }, { name: 'Bob Browne' }];
    const out = sortBySurname(list);
    assert.deepEqual(
      out.map((p) => p.name),
      ['Zoe Álvarez', 'Bob Browne', 'Ana Zapata'],
    );
    assert.equal(list[0].name, 'Zoe Álvarez');
  });
});

describe('decades', () => {
  it('lists 2020s down to the decade of the first season', () => {
    assert.deepEqual(decadesSince(1956), [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950]);
    assert.equal(decadesSince(1930).length, 10);
    assert.deepEqual(decadesSince(2026), [2020]);
  });
  it('maps a year to its decade', () => {
    assert.equal(decadeOf(1987), 1980);
    assert.equal(decadeOf(2026), 2020);
  });
});

describe('normalizePosition', () => {
  it('collapses codes to G, F and C', () => {
    assert.equal(normalizePosition('PG'), 'G');
    assert.equal(normalizePosition('SG'), 'G');
    assert.equal(normalizePosition('SF'), 'F');
    assert.equal(normalizePosition('PF'), 'F');
    assert.equal(normalizePosition('GF'), 'F');
    assert.equal(normalizePosition('FC'), 'C');
    assert.equal(normalizePosition('c'), 'C');
  });
  it('reads Spanish and English words', () => {
    assert.equal(normalizePosition('Base'), 'G');
    assert.equal(normalizePosition('Escolta'), 'G');
    assert.equal(normalizePosition('Guard'), 'G');
    assert.equal(normalizePosition('Alero'), 'F');
    assert.equal(normalizePosition('Delantero'), 'F');
    assert.equal(normalizePosition('Forward'), 'F');
    assert.equal(normalizePosition('Pívot'), 'C');
    assert.equal(normalizePosition('Centro'), 'C');
    assert.equal(normalizePosition('Center'), 'C');
  });
  it('takes the first side of a combo and nulls the unknown', () => {
    assert.equal(normalizePosition('G/F'), 'G');
    assert.equal(normalizePosition('F-C'), 'F');
    assert.equal(normalizePosition(''), null);
    assert.equal(normalizePosition(null), null);
    assert.equal(normalizePosition('XX'), null);
  });
});

describe('filterActive', () => {
  const players = [
    { name: 'A', teamCode: 'BAY', playingPosition: 'PG' },
    { name: 'B', teamCode: 'BAY', playingPosition: 'C' },
    { name: 'C', teamCode: 'PON', playingPosition: 'SF' },
  ];
  it('filters by team and position independently', () => {
    assert.deepEqual(filterActive(players, { team: '', position: '' }).length, 3);
    assert.deepEqual(filterActive(players, { team: 'BAY', position: '' }).map((p) => p.name), ['A', 'B']);
    assert.deepEqual(filterActive(players, { team: '', position: 'F' }).map((p) => p.name), ['C']);
    assert.deepEqual(filterActive(players, { team: 'BAY', position: 'C' }).map((p) => p.name), ['B']);
  });
});

describe('filterHistoric', () => {
  const entries: HistoricEntry[] = [
    { name: 'Georgie Torres', fy: 1978, franchiseSlugs: ['piratas', 'vaqueros'], isMvp: true, pts: 12000 },
    { name: 'Ana Zapata', fy: 2021, franchiseSlugs: ['indios'], isMvp: false, pts: 300 },
    { name: 'Luis Álvarez', fy: 1985, franchiseSlugs: ['indios'], isMvp: false, pts: 5000 },
  ];
  const none = { franchise: '', decade: 0, only: 'all' as const, letter: '' };
  it('passes everything with no filters', () => {
    assert.equal(filterHistoric(entries, none).length, 3);
  });
  it('filters by franchise membership', () => {
    assert.deepEqual(filterHistoric(entries, { ...none, franchise: 'indios' }).map((p) => p.name), ['Ana Zapata', 'Luis Álvarez']);
  });
  it('filters by debut decade', () => {
    assert.deepEqual(filterHistoric(entries, { ...none, decade: 1980 }).map((p) => p.name), ['Luis Álvarez']);
  });
  it('filters MVPs and the 5,000-point club (inclusive)', () => {
    assert.deepEqual(filterHistoric(entries, { ...none, only: 'mvp' }).map((p) => p.name), ['Georgie Torres']);
    assert.deepEqual(filterHistoric(entries, { ...none, only: 'club' }).map((p) => p.name), ['Georgie Torres', 'Luis Álvarez']);
  });
  it('filters by surname initial, accents folded', () => {
    assert.deepEqual(filterHistoric(entries, { ...none, letter: 'A' }).map((p) => p.name), ['Luis Álvarez']);
    assert.deepEqual(filterHistoric(entries, { ...none, letter: 'Z' }).map((p) => p.name), ['Ana Zapata']);
  });
  it('combines filters', () => {
    assert.equal(filterHistoric(entries, { ...none, franchise: 'indios', only: 'club' }).length, 1);
  });
  it('lists the letters present', () => {
    assert.deepEqual([...lettersWith(entries)].sort(), ['A', 'T', 'Z']);
  });
});

describe('loadMoreLabel', () => {
  it('shrinks the page on the last step', () => {
    assert.equal(loadMoreLabel(25, 180), 'Cargar 25 más · 180 restantes');
    assert.equal(loadMoreLabel(40, 7), 'Cargar 7 más · 7 restantes');
    assert.equal(loadMoreLabel(40, 3398), 'Cargar 40 más · 3,398 restantes');
  });
});
