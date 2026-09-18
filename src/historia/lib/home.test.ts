import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  pickFacts,
  anniversaryYears,
  casualName,
  championLine,
  dayOfYear,
  franchiseList,
  joinNames,
  legendPool,
  legendReason,
  numberFacts,
  pickFact,
  pickLegend,
  ptsRank,
  teamNickname,
  titlesByFranchise,
  todayLabel,
} from './home.ts';

const entry = (id: string, pts: number | null, ly: number, isMvp = false, mvpYears: number[] = []) => ({
  id,
  slug: `p-${id}`,
  name: `Jugador ${id}`,
  fy: 1970,
  ly,
  franchiseSlugs: ['vaqueros'],
  pts,
  isMvp,
  mvpYears,
});

describe('dayOfYear', () => {
  it('counts civil days in Puerto Rico, not UTC', () => {
    // 02:30 UTC on Jan 2 is still Jan 1 in Puerto Rico (UTC-4).
    assert.equal(dayOfYear(new Date('2026-01-02T02:30:00Z')), 1);
    assert.equal(dayOfYear(new Date('2026-01-02T12:00:00Z')), 2);
    assert.equal(dayOfYear(new Date('2026-12-31T20:00:00Z')), 365);
  });
  it('formats today in Spanish', () => {
    assert.equal(todayLabel(new Date('2026-09-18T15:00:00Z')), '18 de septiembre');
  });
});

describe('legendPool and pickLegend', () => {
  const index = [entry('a', 100, 1990, true), entry('b', 9000, 2001), entry('c', 7000, 2025), entry('d', 6000, 1980), entry('e', null, 1975)];
  it('keeps retired MVPs and 6,000-point scorers, best scorer first', () => {
    assert.deepEqual(
      legendPool(index).map((p) => p.id),
      ['b', 'd', 'a'],
    );
  });
  it('rotates by civil day and wraps around', () => {
    const pool = legendPool(index);
    assert.equal(pickLegend(pool, new Date('2026-01-01T12:00:00Z'))?.id, 'd'); // day 1 % 3
    assert.equal(pickLegend(pool, new Date('2026-01-03T12:00:00Z'))?.id, 'b'); // day 3 % 3
    assert.equal(pickLegend([], new Date()), null);
  });
  it('ranks by points across the whole index', () => {
    assert.equal(ptsRank(index, 'b'), 1);
    assert.equal(ptsRank(index, 'd'), 3);
    assert.equal(ptsRank(index, 'e'), null);
    assert.equal(ptsRank(index, 'zz'), null);
  });
});

describe('legendReason', () => {
  const base = { ptsRank: null, mvpYears: [], seasons: 12, fy: 1975, ly: 1987 };
  it('scoring rank wins over MVPs', () => {
    assert.equal(legendReason({ ...base, ptsRank: 1, mvpYears: [1984] }), 'Máximo anotador en la historia del BSN');
    assert.equal(legendReason({ ...base, ptsRank: 7, mvpYears: [1984] }), 'Top 10 histórico en puntos · #7');
  });
  it('MVP counts, with years in order', () => {
    assert.equal(legendReason({ ...base, ptsRank: 40, mvpYears: [1983, 1980, 1982] }), '3 veces jugador más valioso (1980, 1982, 1983)');
    assert.equal(legendReason({ ...base, ptsRank: 11, mvpYears: [2001] }), 'Jugador más valioso de 2001');
  });
  it('falls back to longevity', () => {
    assert.equal(legendReason(base), '12 temporadas · 1975 a 1987');
    assert.equal(legendReason({ ...base, seasons: 1, fy: 1990, ly: 1990 }), '1 temporada · 1990');
  });
});

describe('names', () => {
  it('lists franchises with a remainder', () => {
    assert.equal(franchiseList(['Cariduros', 'Mets', 'Vaqueros', 'Gallitos', 'Cangrejeros', 'Gigantes']), 'Cariduros, Mets, Vaqueros y 3 más');
    assert.equal(franchiseList(['Cangrejeros', 'Mets']), 'Cangrejeros y Mets');
    assert.equal(franchiseList(['Piratas']), 'Piratas');
    assert.equal(franchiseList([]), '');
  });
  it('joins with y', () => {
    assert.equal(joinNames(['a', 'b', 'c']), 'a, b y c');
  });
  it('casual names prefer the nickname, then the alias', () => {
    assert.equal(casualName("Juan 'Pachín' Vicens Sastre", ['Juan Pachín Vicéns']), 'Pachín Vicéns');
    assert.equal(casualName("Mario 'Quijote' Morales Micheo", ['Mario Quijote Morales']), 'Quijote Morales');
    assert.equal(casualName("Teofilo 'Teo' Cruz Downs", ['Teófilo Cruz']), 'Teófilo Cruz');
    assert.equal(casualName('George Torres Dougherty', ['Georgie Torres']), 'Georgie Torres');
    assert.equal(casualName("Jose Rafael 'Piculín' Ortiz Rijos"), 'Piculín Ortiz');
    assert.equal(casualName('Raymond Dalmau Perez'), 'Raymond Dalmau');
    assert.equal(casualName('Cher'), 'Cher');
  });
});

describe('anniversaryYears', () => {
  it('uses the exact years when they have a champion', () => {
    assert.deepEqual(anniversaryYears(2026, [1975, 1976, 1977, 2000, 2001, 2002]), [
      { ago: 50, year: 1976, approximate: false },
      { ago: 25, year: 2001, approximate: false },
    ]);
  });
  it('snaps to the nearest year with a champion, older on ties', () => {
    assert.deepEqual(anniversaryYears(2026, [1974, 1978, 2001]), [
      { ago: 50, year: 1974, approximate: true },
      { ago: 25, year: 2001, approximate: false },
    ]);
    assert.deepEqual(anniversaryYears(2026, [1975, 1977, 2001]), [
      { ago: 50, year: 1975, approximate: true },
      { ago: 25, year: 2001, approximate: false },
    ]);
  });
  it('returns nothing without champions', () => {
    assert.deepEqual(anniversaryYears(2026, []), []);
  });
});

describe('champion and MVP lines', () => {
  it('builds the champion line from what the archive has', () => {
    assert.equal(championLine({ coach: 'Julio Toro', series: null, coachTitleNumber: 10 }), 'Campeones · Julio Toro, su 10º título');
    assert.equal(championLine({ coach: 'Bernie Bickerstaff', series: '4-3', coachTitleNumber: null }), 'Campeones · Bernie Bickerstaff · Final 4-3');
    assert.equal(championLine({ coach: null, series: '4-1', coachTitleNumber: null }), 'Campeones · Final 4-1');
    assert.equal(championLine({ coach: null, series: null, coachTitleNumber: null }), 'Campeones');
  });
  it('strips the city from a team name', () => {
    assert.equal(teamNickname('Polluelos de Aibonito'), 'Polluelos');
    assert.equal(teamNickname('Gallitos de la UPR'), 'Gallitos');
    assert.equal(teamNickname('Taínos'), 'Taínos');
  });
});

describe('numberFacts', () => {
  const input = {
    topCoach: { name: 'Julio Toro', titles: 12 },
    topScorer: { name: 'Georgie Torres', pts: 15863 },
    topMvps: { names: ['Pachín Vicéns', 'Teófilo Cruz', 'Quijote Morales'], count: 4 },
    topFranchise: { name: 'Vaqueros de Bayamón', titles: 15 },
  };
  it('produces the four facts in rotation order', () => {
    const facts = numberFacts(input);
    assert.deepEqual(
      facts.map((f) => [f.key, f.value, `${f.lead} ${f.subject}${f.tail}`, f.href]),
      [
        ['coach', 12, 'Títulos de Julio Toro, el dirigente más ganador de la liga', '/estadisticas/records'],
        ['scorer', 15863, 'Puntos de Georgie Torres, el máximo anotador histórico', '/estadisticas/records'],
        ['mvps', 4, 'MVPs de Pachín Vicéns, Teófilo Cruz y Quijote Morales, empatados en la cima', '/estadisticas/mvps'],
        ['titles', 15, 'Campeonatos de Vaqueros de Bayamón, la franquicia con más títulos', '/estadisticas/campeones'],
      ],
    );
  });
  it('drops facts without data and still rotates', () => {
    const facts = numberFacts({ ...input, topCoach: null, topMvps: { names: ['Solo Uno'], count: 5 } });
    assert.deepEqual(facts.map((f) => f.key), ['scorer', 'mvps', 'titles']);
    assert.equal(facts[1].tail, ', el que más tiene');
    assert.equal(pickFact(facts, new Date('2026-01-04T12:00:00Z'))?.key, 'mvps'); // day 4 % 3
    assert.equal(pickFact([], new Date()), null);
  });
  it('counts titles per franchise', () => {
    assert.deepEqual(titlesByFranchise([{ franchiseSlug: 'leones' }, { franchiseSlug: 'vaqueros' }, { franchiseSlug: null }, { franchiseSlug: 'vaqueros' }]), [
      { slug: 'vaqueros', titles: 2 },
      { slug: 'leones', titles: 1 },
    ]);
  });
});

describe('pickFacts', () => {
  it('returns the next facts from the day pick, wrapping around', () => {
    const facts = [1, 2, 3, 4].map((n) => ({ value: n, lead: '', subject: '', tail: '', href: '', linkLabel: '' }));
    const out = pickFacts(facts, new Date('2026-01-03T12:00:00-04:00'), 3).map((f) => f.value);
    assert.equal(out.length, 3);
    assert.deepEqual(out, [4, 1, 2]);
  });
});
