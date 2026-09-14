/**
 * Pure builders of the season page: they turn a SeasonFile (archive years and live years alike) into small
 * serializable views the panels render. No data access, so 1968 and 2026 go through the same code.
 */
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import type { LeaderCategory, SeasonFile } from '@/archivo/lib/types';

export interface TeamRef {
  code: string | null;
  slug: string | null;
  name: string;
  nickname: string;
}

export interface StandingRow extends TeamRef {
  position: number;
  won: number;
  lost: number;
  /** ".735" */
  pct: string;
  ppg: number | null;
  /** Games behind the group leader; 0 for the leader. */
  behind: number;
}

export interface StandingsGroup {
  group: string | null;
  rows: StandingRow[];
}

export interface SeriesRow {
  id: string;
  round: number;
  /** "Final", "Semifinal", "Cuartos de final" */
  label: string;
  /** "A", "B", "A1"… or null */
  group: string | null;
  winner: TeamRef;
  loser: TeamRef;
  wins: number;
  losses: number;
  final: boolean;
}

export interface LeaderRow extends TeamRef {
  category: LeaderCategory;
  label: string;
  playerKey: string;
  playerName: string;
  /** Already formatted: "22.7" or "54.6%". */
  value: string;
}

export interface TeamPlayerRow {
  key: string;
  name: string;
  position: string | null;
  number: string | null;
  g: number;
  min: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
}

export interface TeamCard extends TeamRef {
  /** "25-10 · 1ro Grupo A" or "16 jugadores" when there are no standings. */
  meta: string;
  champion: boolean;
  coach: string | null;
  players: TeamPlayerRow[];
}

export const LEADER_LABEL: Record<LeaderCategory, string> = { ppg: 'Puntos', rpg: 'Rebotes', apg: 'Asistencias', spg: 'Robos', bpg: 'Bloqueos', fgPct: 'Tiros de campo', fg3Pct: 'Triples', ftPct: 'Tiros libres' };
const LEADER_ORDER: LeaderCategory[] = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgPct', 'fg3Pct', 'ftPct'];
const PCT: LeaderCategory[] = ['fgPct', 'fg3Pct', 'ftPct'];
/** Minimum games to lead a category, same rule as the archive's leaders. */
export const LEADER_MIN_GAMES = 10;

export function ordinalEs(n: number): string {
  const suffix: Record<number, string> = { 1: 'ro', 2: 'do', 3: 'ro' };
  return `${n}${suffix[n] ?? 'to'}`;
}

export function roundLabel(round: number): string {
  if (round >= 3) return 'Final';
  if (round === 2) return 'Semifinal';
  return 'Cuartos de final';
}

const shortGroup = (g: string | null): string | null => (g ? g.replace(/^grupo\s+/i, '') : null);

type Franchises = Record<string, FranchiseView>;

function ref(franchises: Franchises, slug: string | null, code: string | null, name: string): TeamRef {
  const f = slug ? franchises[slug] : undefined;
  return { code: f?.code ?? code, slug, name: f?.fullName ?? name, nickname: f?.nickname ?? name.split(' de ')[0] };
}

export function standingsView(season: SeasonFile, franchises: Franchises): StandingsGroup[] {
  const r = season.results;
  if (!r || r.source !== 'bsn-graphql' || r.fpo.standings || !r.standings.length) return [];
  const groups = [...new Set(r.standings.map((s) => s.group ?? ''))];
  return groups.map((g) => {
    const rows = r.standings
      .filter((s) => (s.group ?? '') === g)
      .sort((a, b) => (a.positionInGroup ?? a.position ?? 99) - (b.positionInGroup ?? b.position ?? 99) || b.won - a.won);
    const top = rows[0]?.won ?? 0;
    return {
      group: g || null,
      rows: rows.map((s, i) => ({
        ...ref(franchises, s.franchiseSlug, s.code, s.name),
        position: s.positionInGroup ?? s.position ?? i + 1,
        won: s.won,
        lost: s.lost,
        pct: s.won + s.lost ? (s.won / (s.won + s.lost)).toFixed(3).replace(/^0/, '') : '–',
        ppg: s.pointsAverage === null ? null : Math.round(s.pointsAverage * 10) / 10,
        behind: top - s.won,
      })),
    };
  });
}

export function seriesView(season: SeasonFile, franchises: Franchises): SeriesRow[] {
  const r = season.results;
  if (!r || r.source !== 'bsn-graphql' || r.fpo.series) return [];
  const out: SeriesRow[] = [];
  for (const s of r.series) {
    if (s.competitors.length < 2) continue;
    const [a, b] = [...s.competitors].sort((x, y) => y.won - x.won);
    if (a.won === b.won) continue;
    out.push({
      id: s.id,
      round: s.round,
      label: roundLabel(s.round),
      group: s.round >= 3 ? null : shortGroup(s.group),
      winner: ref(franchises, a.franchiseSlug, a.code, a.code),
      loser: ref(franchises, b.franchiseSlug, b.code, b.code),
      wins: a.won,
      losses: b.won,
      final: s.round >= 3,
    });
  }
  return out.sort((x, y) => y.round - x.round || (x.group ?? '').localeCompare(y.group ?? ''));
}

function fmtLeader(cat: LeaderCategory, v: number, live: boolean): string {
  if (PCT.includes(cat)) return `${(live ? v * 100 : v).toFixed(1)}%`;
  return v.toFixed(1);
}

/** One leader per category: the archive's list for old years, computed from the live stats for 2025+. */
export function leadersView(season: SeasonFile, franchises: Franchises): LeaderRow[] {
  const out: LeaderRow[] = [];
  if (season.leaders) {
    for (const cat of LEADER_ORDER) {
      const top = season.leaders[cat]?.[0];
      if (!top) continue;
      out.push({ ...ref(franchises, top.franchiseSlug, null, top.teamName), category: cat, label: LEADER_LABEL[cat], playerKey: top.slug, playerName: top.name, value: fmtLeader(cat, top.value, false) });
    }
    return out;
  }
  const r = season.results;
  if (!r || r.source !== 'bsn-graphql' || r.fpo.playerStats) return out;
  const eligible = r.playerStats.filter((p) => p.g >= LEADER_MIN_GAMES);
  for (const cat of LEADER_ORDER) {
    const top = [...eligible].filter((p) => p[cat] !== null).sort((a, b) => (b[cat] ?? 0) - (a[cat] ?? 0))[0];
    if (!top) continue;
    out.push({ ...ref(franchises, top.franchiseSlug, top.code, top.code), category: cat, label: LEADER_LABEL[cat], playerKey: top.slug ?? top.playerProviderId, playerName: top.name, value: fmtLeader(cat, top[cat] as number, true) });
  }
  return out;
}

const r1 = (v: number | null): number | null => (v === null ? null : Math.round(v * 10) / 10);

/** Team cards with their rosters, ordered by the standings when there are any. */
export function teamsView(season: SeasonFile, franchises: Franchises): TeamCard[] {
  const standings = standingsView(season, franchises).flatMap((g) => g.rows.map((row) => ({ ...row, group: g.group })));
  const recordOf = (slug: string | null, code: string | null) => standings.find((s) => (slug && s.slug === slug) || (code && s.code === code));
  const meta = (slug: string | null, code: string | null, count: number) => {
    const s = recordOf(slug, code);
    if (!s) return `${count} jugador${count === 1 ? '' : 'es'}`;
    return `${s.won}-${s.lost} · ${ordinalEs(s.position)}${s.group ? ` Grupo ${s.group}` : ''}`;
  };
  const champion = season.champion?.franchiseSlug ?? null;
  const r = season.results;
  let cards: TeamCard[];
  if (r && r.source === 'bsn-graphql' && !r.fpo.rosters && r.rosters.length) {
    const codes = [...new Set(r.rosters.map((p) => p.code))];
    cards = codes.map((code) => {
      const roster = r.rosters.filter((p) => p.code === code);
      const slug = roster[0]?.franchiseSlug ?? null;
      const players: TeamPlayerRow[] = roster
        .map((p) => {
          const st = r.playerStats.find((s) => s.playerProviderId === p.playerProviderId);
          return { key: p.slug ?? p.playerProviderId, name: p.name, position: p.position, number: p.jerseyNumber, g: st?.g ?? 0, min: r1(st?.minutesAvg ?? null), ppg: r1(st?.ppg ?? null), rpg: r1(st?.rpg ?? null), apg: r1(st?.apg ?? null), spg: r1(st?.spg ?? null), bpg: r1(st?.bpg ?? null), fgPct: st?.fgPct === null || st?.fgPct === undefined ? null : r1(st.fgPct * 100), fg3Pct: st?.fg3Pct === null || st?.fg3Pct === undefined ? null : r1(st.fg3Pct * 100) };
        })
        .sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1));
      const t = ref(franchises, slug, code, roster[0]?.name ?? code);
      return { ...t, meta: meta(slug, code, players.length), champion: slug !== null && slug === champion, coach: slug === champion ? (season.champion?.coach ?? null) : null, players };
    });
  } else {
    cards = season.rosters.map((team) => {
      const t = ref(franchises, team.franchiseSlug, null, team.teamName);
      const players: TeamPlayerRow[] = team.players
        .map((p) => ({ key: p.slug, name: p.name, position: null, number: null, g: p.regular?.g ?? 0, min: null, ppg: p.regular?.ppg ?? null, rpg: p.regular?.rpg ?? null, apg: p.regular?.apg ?? null, spg: null, bpg: null, fgPct: null, fg3Pct: null }))
        .sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1));
      return { ...t, meta: meta(team.franchiseSlug, null, players.length), champion: team.franchiseSlug === champion, coach: team.franchiseSlug === champion ? (season.champion?.coach ?? null) : null, players };
    });
  }
  const rank = (c: TeamCard) => {
    const s = recordOf(c.slug, c.code);
    return s ? (s.group ?? '').charCodeAt(0) * 100 + s.position : 10_000;
  };
  return cards.sort((a, b) => Number(b.champion) - Number(a.champion) || rank(a) - rank(b) || a.nickname.localeCompare(b.nickname));
}
