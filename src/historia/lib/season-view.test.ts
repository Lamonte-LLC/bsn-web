import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SeasonFile } from '@/archivo/lib/types';
import { leadersView, ordinalEs, roundLabel, seriesView, standingsView, teamsView } from './season-view.ts';

const franchises = {
  vaqueros: { slug: 'vaqueros', nickname: 'Vaqueros', fullName: 'Vaqueros de Bayamón', logo: null, colors: { primary: '#468AD9', secondary: null }, status: 'active' as const, code: 'BAY' },
  indios: { slug: 'indios', nickname: 'Indios', fullName: 'Indios de Mayagüez', logo: null, colors: { primary: '#B00', secondary: null }, status: 'active' as const, code: 'MAY' },
};

const live: SeasonFile = {
  year: 2025,
  champion: { year: 2025, franchiseSlug: 'vaqueros', name: 'Vaqueros', fullName: 'Vaqueros de Bayamón', coach: 'Christian Dalmau', series: '4-2', seriesRaw: '4-2', coachTitleNumber: null },
  mvp: null,
  hasStats: true,
  phaseLabels: [],
  leaders: null,
  rosters: [],
  results: {
    source: 'bsn-graphql',
    fpo: { standings: false, games: false, series: false, rosters: false, playerStats: false },
    seasonProviderId: 'x',
    fetchedAt: null,
    standings: [
      { franchiseSlug: 'indios', code: 'MAY', name: 'Indios de Mayagüez', group: 'B', position: 2, positionInGroup: 1, won: 21, lost: 13, pointsAverage: 86.89 },
      { franchiseSlug: 'vaqueros', code: 'BAY', name: 'Vaqueros de Bayamón', group: 'A', position: 1, positionInGroup: 1, won: 25, lost: 10, pointsAverage: 89.98 },
      { franchiseSlug: null, code: 'SCE', name: 'Cangrejeros de Santurce', group: 'A', position: 3, positionInGroup: 2, won: 22, lost: 12, pointsAverage: null },
    ],
    games: [],
    series: [
      { id: 'f', name: 'Final BSN 2025', round: 3, group: null, status: 'COMPLETE', startDate: null, endDate: null, competitors: [{ franchiseSlug: 'indios', code: 'MAY', won: 2, lost: 4, seed: 1 }, { franchiseSlug: 'vaqueros', code: 'BAY', won: 4, lost: 2, seed: 1 }], winnerSlug: 'vaqueros' },
      { id: 'q', name: 'Cuartos 1', round: 1, group: 'Grupo A', status: 'COMPLETE', startDate: null, endDate: null, competitors: [{ franchiseSlug: 'vaqueros', code: 'BAY', won: 4, lost: 0, seed: 1 }, { franchiseSlug: null, code: 'CAR', won: 0, lost: 4, seed: 4 }], winnerSlug: 'vaqueros' },
      { id: 'u', name: 'Pendiente', round: 2, group: null, status: 'UPCOMING', startDate: null, endDate: null, competitors: [{ franchiseSlug: 'vaqueros', code: 'BAY', won: 0, lost: 0, seed: 1 }], winnerSlug: null },
    ],
    rosters: [
      { franchiseSlug: 'vaqueros', code: 'BAY', playerProviderId: 'p1', playerId: null, slug: null, name: 'Danilo Gallinari', position: 'F', jerseyNumber: '8', nationality: 'ITA', dob: null, height: null, avatarUrl: null },
      { franchiseSlug: 'vaqueros', code: 'BAY', playerProviderId: 'p2', playerId: '1', slug: 'gary-browne', name: 'Gary Browne', position: 'G', jerseyNumber: '14', nationality: 'PUR', dob: null, height: null, avatarUrl: null },
      { franchiseSlug: 'indios', code: 'MAY', playerProviderId: 'p3', playerId: null, slug: null, name: 'Un Indio', position: null, jerseyNumber: null, nationality: null, dob: null, height: null, avatarUrl: null },
    ],
    playerStats: [
      { franchiseSlug: 'vaqueros', code: 'BAY', playerProviderId: 'p1', playerId: null, slug: null, name: 'Danilo Gallinari', g: 43, minutesAvg: 31.73, ppg: 19.35, rpg: 5.88, apg: 2.67, spg: 0.7, bpg: 0.3, topg: 1.1, fgPct: 0.4527, fg3Pct: 0.3825, ftPct: 0.86, pts: 832, reb: 253, ast: 115 },
      { franchiseSlug: 'vaqueros', code: 'BAY', playerProviderId: 'p2', playerId: '1', slug: 'gary-browne', name: 'Gary Browne', g: 33, minutesAvg: 23.6, ppg: 9.7, rpg: 3.4, apg: 5.0, spg: 1.5, bpg: 0, topg: 2, fgPct: 0.418, fg3Pct: 0.353, ftPct: 0.8, pts: 320, reb: 112, ast: 165 },
      { franchiseSlug: 'indios', code: 'MAY', playerProviderId: 'p3', playerId: null, slug: null, name: 'Un Indio', g: 5, minutesAvg: 10, ppg: 30, rpg: 1, apg: 1, spg: 0, bpg: 0, topg: 0, fgPct: 0.9, fg3Pct: 0.9, ftPct: 1, pts: 150, reb: 5, ast: 5 },
    ],
    playerStatsPlayoffs: [],
  },
};

describe('standingsView', () => {
  it('groups, orders by position and computes pct and games behind', () => {
    const groups = standingsView(live, franchises);
    assert.deepEqual(groups.map((g) => g.group), ['B', 'A']);
    const a = groups[1].rows;
    assert.equal(a[0].nickname, 'Vaqueros');
    assert.equal(a[0].pct, '.714');
    assert.equal(a[0].ppg, 90);
    assert.equal(a[1].nickname, 'Cangrejeros');
    assert.equal(a[1].behind, 3);
  });
  it('is empty for archive years and FPO snapshots', () => {
    assert.deepEqual(standingsView({ ...live, results: null }, franchises), []);
    assert.deepEqual(standingsView({ ...live, results: { ...live.results!, fpo: { ...live.results!.fpo, standings: true } } }, franchises), []);
  });
});

describe('seriesView', () => {
  it('puts the winner first, labels rounds, skips undecided series, final first', () => {
    const rows = seriesView(live, franchises);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].label, 'Final');
    assert.equal(rows[0].winner.nickname, 'Vaqueros');
    assert.equal(rows[0].loser.nickname, 'Indios');
    assert.equal(`${rows[0].wins}-${rows[0].losses}`, '4-2');
    assert.equal(rows[1].label, 'Cuartos de final');
    assert.equal(rows[1].group, 'A');
    assert.equal(rows[1].loser.nickname, 'CAR');
  });
});

describe('leadersView', () => {
  it('computes live leaders with the 10-game floor and percent scaling', () => {
    const rows = leadersView(live, franchises);
    const pts = rows.find((r) => r.category === 'ppg')!;
    assert.equal(pts.playerName, 'Danilo Gallinari');
    assert.equal(pts.value, '19.4');
    assert.equal(pts.playerKey, 'p1');
    assert.equal(rows.find((r) => r.category === 'fgPct')!.value, '45.3%');
    assert.equal(rows.find((r) => r.category === 'apg')!.playerKey, 'gary-browne');
  });
  it('uses the archive list when present, values already in percent', () => {
    const archive: SeasonFile = { ...live, results: null, leaders: { ppg: [{ playerId: '1', slug: 'georgie-torres', name: 'Georgie Torres', franchiseSlug: null, teamName: 'Cariduros', g: 30, value: 28.8 }], rpg: [], apg: [], spg: [], bpg: [], fgPct: [{ playerId: '2', slug: 'x', name: 'X', franchiseSlug: 'vaqueros', teamName: 'Vaqueros', g: 20, value: 61.2 }], fg3Pct: [], ftPct: [] } };
    const rows = leadersView(archive, franchises);
    assert.deepEqual(rows.map((r) => [r.label, r.value, r.nickname]), [['Puntos', '28.8', 'Cariduros'], ['Tiros de campo', '61.2%', 'Vaqueros']]);
  });
});

describe('teamsView', () => {
  it('builds live cards ordered champion first, with record meta and players by ppg', () => {
    const cards = teamsView(live, franchises);
    assert.equal(cards[0].nickname, 'Vaqueros');
    assert.equal(cards[0].champion, true);
    assert.equal(cards[0].coach, 'Christian Dalmau');
    assert.equal(cards[0].meta, '25-10 · 1ro Grupo A');
    assert.deepEqual(cards[0].players.map((p) => p.name), ['Danilo Gallinari', 'Gary Browne']);
    assert.equal(cards[0].players[0].fgPct, 45.3);
    assert.equal(cards[0].players[0].key, 'p1');
    assert.equal(cards[1].meta, '21-13 · 1ro Grupo B');
  });
  it('builds archive cards from rosters with a player count', () => {
    const archive: SeasonFile = { ...live, results: null, rosters: [{ franchiseSlug: 'indios', teamName: 'Indios', players: [{ playerId: '1', slug: 'a', name: 'A', regular: { g: 20, ppg: 12.5, rpg: 3, apg: 1 }, playoffs: null }] }] };
    const cards = teamsView(archive, franchises);
    assert.equal(cards[0].meta, '1 jugador');
    assert.equal(cards[0].players[0].ppg, 12.5);
    assert.equal(cards[0].players[0].min, null);
  });
});

describe('labels', () => {
  it('ordinals and rounds in Spanish', () => {
    assert.deepEqual([1, 2, 3, 4, 6].map(ordinalEs), ['1ro', '2do', '3ro', '4to', '6to']);
    assert.deepEqual([1, 2, 3].map(roundLabel), ['Cuartos de final', 'Semifinal', 'Final']);
  });
});
