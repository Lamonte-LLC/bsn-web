// Fills `results` (standings, games, playoff series, rosters, player stats) into data/archivo/seasons/{year}.json
// and `seasonRecords` into data/archivo/franchises/{slug}.json.
//
// Real data comes from the BSN GraphQL backend, which only knows seasons 2025 and 2026. Every other season
// from 2015 on gets deterministic FPO placeholder data, flagged per block with `fpo`, so the UI can be built
// and the placeholders swapped when real history arrives.
//
// Run AFTER etl-stats.ts:  node --experimental-strip-types scripts/archivo/etl-results.ts [--from-cache]

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Franchise,
  FranchiseEntry,
  FranchiseFile,
  FranchiseSeasonRecord,
  GameTeam,
  LivePlayerStats,
  LiveRosterEntry,
  PlayerIndexEntry,
  ResultsFpoFlags,
  SeasonFile,
  SeasonGame,
  SeasonResults,
  SeasonSeries,
  SeasonStanding,
  SeriesCompetitor,
} from '../../types/archivo';

// ---------- paths / flags ----------

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(SCRIPT_DIR, '..', '..');
const CACHE_DIR = join(SCRIPT_DIR, 'raw', 'graphql');
const OUT_DIR = join(ROOT_DIR, 'data', 'archivo');
const FROM_CACHE = process.argv.includes('--from-cache');
const FIRST_RESULTS_YEAR = 2015;

// ---------- helpers ----------

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function writeJson(path: string, value: unknown, pretty = false): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, pretty ? JSON.stringify(value, null, 2) + '\n' : JSON.stringify(value));
}

function normalizeKey(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Deterministic PRNG so FPO output is stable across runs (mulberry32).
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- env / graphql ----------

function readEnvVar(name: string): string | null {
  if (process.env[name]) return process.env[name] ?? null;
  for (const file of ['.env.local', '.env']) {
    const path = join(ROOT_DIR, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
      if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return null;
}

interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const uri = readEnvVar('BSN_GRAPHQL_URI') ?? readEnvVar('NEXT_PUBLIC_BSN_GRAPHQL_URI');
  if (!uri) throw new Error('BSN_GRAPHQL_URI not set');
  const res = await fetch(uri, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join(' | ')}`);
  if (!json.data) throw new Error('GraphQL: empty response');
  return json.data;
}

interface Edge<T> {
  node: T;
}
interface Connection<T> {
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  edges: Edge<T>[];
}

async function paginate<T>(field: string, query: string, variables: Record<string, unknown>): Promise<T[]> {
  const out: T[] = [];
  let after: string | null = null;
  for (;;) {
    const data: Record<string, Connection<T>> = await gql<Record<string, Connection<T>>>(query, { ...variables, first: 1000, after });
    const conn: Connection<T> = data[field];
    out.push(...conn.edges.map((e: Edge<T>) => e.node));
    if (!conn.pageInfo?.hasNextPage || !conn.pageInfo.endCursor) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

async function cached<T>(name: string, fetcher: () => Promise<T>): Promise<T> {
  const path = join(CACHE_DIR, `${name}.json`);
  if (FROM_CACHE) {
    if (!existsSync(path)) throw new Error(`cache miss: ${path}`);
    return readJson<T>(path);
  }
  const value = await fetcher();
  writeJson(path, value, true);
  return value;
}

// ---------- raw graphql shapes ----------

interface GqlSeason {
  providerId: string;
  name: string;
  year: number;
  startDate: string | null;
  endDate: string | null;
  isPlayoffs: boolean;
}
interface GqlTeamRef {
  code: string;
  name: string | null;
  group: string | null;
}
interface GqlTeamStats {
  team: GqlTeamRef;
  stats: { won: number | null; lost: number | null; position: number | null; positionInGroup: number | null; pointsAverage: number | null };
}
interface GqlMatchTeam {
  code: string;
  name: string | null;
  score: string | null;
}
interface GqlMatch {
  providerId: string;
  startAt: string;
  status: string;
  phaseName: string | null;
  gameNumber: number | null;
  isFinals: boolean | null;
  homeTeam: GqlMatchTeam;
  visitorTeam: GqlMatchTeam;
  venue: { name: string | null } | null;
  series: { providerId: string } | null;
}
interface GqlSeries {
  providerId: string;
  name: string;
  group: string | null;
  round: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  winner: { code: string } | null;
  competitors: Array<{ team: { code: string }; won: number | null; lost: number | null; position: number | null }>;
}
interface GqlRoster {
  team: { code: string };
  player: { providerId: string; name: string; nickname: string | null; avatarUrl: string | null; dob: string | null; nationality: string | null; height: number | null };
  playingPosition: string | null;
  jerseyNumber: string | null;
}
interface GqlPlayerStats {
  team: { code: string };
  player: { providerId: string; name: string; avatarUrl: string | null };
  stats: {
    games: number | null;
    minutesAvg: number | null;
    points: number | null;
    pointsAvg: number | null;
    reboundsTotal: number | null;
    reboundsTotalAvg: number | null;
    assists: number | null;
    assistsAvg: number | null;
    stealsAvg: number | null;
    blocksAvg: number | null;
    turnoversAvg: number | null;
    fieldGoalsPercentage: number | null;
    threePointersPercentage: number | null;
    freeThrowsPercentage: number | null;
  };
}

const MATCH_FIELDS = 'providerId startAt status phaseName gameNumber isFinals homeTeam{ code name score } visitorTeam{ code name score } venue{ name } series{ providerId }';

// ---------- load archive ----------

const franchiseEntries = readJson<FranchiseEntry[]>(join(OUT_DIR, 'franchises.json'));
const franchises = franchiseEntries.filter((f): f is Franchise => f.type === 'franchise');
const franchiseBySlug = new Map(franchises.map((f) => [f.slug, f]));
const players = readJson<PlayerIndexEntry[]>(join(OUT_DIR, 'players.json'));

// GraphQL codes for franchises that bsn-web does not carry a code for.
const EXTRA_CODES: Record<string, string> = { HUM: 'grises', FAJ: 'cariduros', GMA: 'brujos', COA: 'maratonistas', ISA: 'gallitos' };
const slugByCode = new Map<string, string>(Object.entries(EXTRA_CODES));
for (const f of franchises) if (f.code) slugByCode.set(f.code, f.slug);
const unknownCodes = new Set<string>();

function slugFor(code: string): string | null {
  const slug = slugByCode.get(code) ?? null;
  if (!slug) unknownCodes.add(code);
  return slug;
}

function teamName(code: string, fallback: string | null): string {
  const slug = slugByCode.get(code);
  return slug ? franchiseBySlug.get(slug)!.fullName : fallback ?? code;
}

const playerIdByName = new Map<string, string | null>();
for (const p of players) {
  const key = normalizeKey(p.name);
  playerIdByName.set(key, playerIdByName.has(key) ? null : p.id);
}
const playerById = new Map(players.map((p) => [p.id, p]));

function matchPlayer(name: string): { playerId: string | null; slug: string | null } {
  const id = playerIdByName.get(normalizeKey(name)) ?? null;
  return { playerId: id, slug: id ? playerById.get(id)!.slug : null };
}

function seasonPath(year: number): string {
  return join(OUT_DIR, 'seasons', `${year}.json`);
}

function loadSeason(year: number): SeasonFile {
  if (existsSync(seasonPath(year))) return readJson<SeasonFile>(seasonPath(year));
  return { year, champion: null, mvp: null, hasStats: false, phaseLabels: [], leaders: null, rosters: [], results: null };
}

// ---------- real data ----------

function toStanding(t: GqlTeamStats): SeasonStanding {
  return {
    franchiseSlug: slugFor(t.team.code),
    code: t.team.code,
    name: teamName(t.team.code, t.team.name),
    group: t.team.group || null,
    position: num(t.stats.position),
    positionInGroup: num(t.stats.positionInGroup),
    won: num(t.stats.won) ?? 0,
    lost: num(t.stats.lost) ?? 0,
    pointsAverage: num(t.stats.pointsAverage),
  };
}

function toGameTeam(t: GqlMatchTeam): GameTeam {
  return { franchiseSlug: slugFor(t.code), code: t.code, name: teamName(t.code, t.name), score: num(t.score) };
}

function toGame(m: GqlMatch): SeasonGame {
  const home = toGameTeam(m.homeTeam);
  const visitor = toGameTeam(m.visitorTeam);
  const phase: SeasonGame['phase'] = m.series ? 'playoffs' : home.franchiseSlug && visitor.franchiseSlug ? 'regular' : 'other';
  return {
    id: m.providerId,
    date: m.startAt,
    phase,
    status: m.status,
    home,
    visitor,
    venue: m.venue?.name ?? null,
    seriesId: m.series?.providerId ?? null,
    gameNumber: num(m.gameNumber),
    isFinals: Boolean(m.isFinals),
  };
}

function toSeries(s: GqlSeries): SeasonSeries {
  const competitors: SeriesCompetitor[] = s.competitors.map((c) => ({
    franchiseSlug: slugFor(c.team.code),
    code: c.team.code,
    won: num(c.won) ?? 0,
    lost: num(c.lost) ?? 0,
    seed: num(c.position) || null,
  }));
  let winnerSlug = s.winner ? slugFor(s.winner.code) : null;
  if (!winnerSlug && s.status === 'COMPLETE') {
    const top = [...competitors].sort((a, b) => b.won - a.won)[0];
    if (top && top.won >= 4) winnerSlug = top.franchiseSlug;
  }
  return { id: s.providerId, name: s.name, round: s.round, group: s.group || null, status: s.status, startDate: s.startDate, endDate: s.endDate, competitors, winnerSlug };
}

function toRoster(r: GqlRoster): LiveRosterEntry {
  return {
    franchiseSlug: slugFor(r.team.code),
    code: r.team.code,
    playerProviderId: r.player.providerId,
    ...matchPlayer(r.player.name),
    name: r.player.name,
    position: r.playingPosition || null,
    jerseyNumber: r.jerseyNumber || null,
    nationality: r.player.nationality || null,
    dob: r.player.dob || null,
    height: num(r.player.height),
    avatarUrl: r.player.avatarUrl || null,
  };
}

function toPlayerStats(p: GqlPlayerStats): LivePlayerStats {
  const s = p.stats;
  return {
    franchiseSlug: slugFor(p.team.code),
    code: p.team.code,
    playerProviderId: p.player.providerId,
    ...matchPlayer(p.player.name),
    name: p.player.name,
    avatarUrl: p.player.avatarUrl || null,
    g: num(s.games) ?? 0,
    minutesAvg: num(s.minutesAvg),
    ppg: num(s.pointsAvg),
    rpg: num(s.reboundsTotalAvg),
    apg: num(s.assistsAvg),
    spg: num(s.stealsAvg),
    bpg: num(s.blocksAvg),
    topg: num(s.turnoversAvg),
    fgPct: num(s.fieldGoalsPercentage),
    fg3Pct: num(s.threePointersPercentage),
    ftPct: num(s.freeThrowsPercentage),
    pts: num(s.points),
    reb: num(s.reboundsTotal),
    ast: num(s.assists),
  };
}

interface RealSeason {
  year: number;
  regular: GqlSeason;
  playoffs: GqlSeason | null;
  standings: SeasonStanding[];
  games: SeasonGame[];
  series: SeasonSeries[];
  rosters: LiveRosterEntry[];
  playerStats: LivePlayerStats[];
  playerStatsPlayoffs: LivePlayerStats[];
}

async function fetchRealSeason(regular: GqlSeason, playoffs: GqlSeason | null): Promise<RealSeason> {
  const year = regular.year;
  const teamStats = await cached(`${year}-team-stats`, () =>
    paginate<GqlTeamStats>(
      'seasonTeamStatsExtendedConnection',
      `query($seasonProviderId:String,$first:Int,$after:String){ seasonTeamStatsExtendedConnection(seasonProviderId:$seasonProviderId,first:$first,after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ team{ code name group } stats{ won lost position positionInGroup pointsAverage } } } } }`,
      { seasonProviderId: regular.providerId },
    ),
  );
  const matches = await cached(`${year}-matches`, () =>
    gql<{ matches: GqlMatch[] }>(`query($fromDate:String,$toDate:String){ matches(fromDate:$fromDate,toDate:$toDate){ ${MATCH_FIELDS} } }`, {
      fromDate: `${year}-01-01`,
      toDate: `${year}-12-31`,
    }).then((d) => d.matches),
  );
  const seriesRaw = await cached(`${year}-series`, async () => {
    const ids = [playoffs?.providerId, regular.providerId].filter((v): v is string => Boolean(v));
    for (const id of ids) {
      const list = await paginate<GqlSeries>(
        'seriesConnection',
        `query($seasonProviderId:String,$first:Int,$after:String){ seriesConnection(seasonProviderId:$seasonProviderId,first:$first,after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ providerId name group round status startDate endDate winner{ code } competitors{ team{ code } won lost position } } } } }`,
        { seasonProviderId: id },
      );
      if (list.length) return list;
    }
    return [] as GqlSeries[];
  });
  const rosters = await cached(`${year}-rosters`, () =>
    paginate<GqlRoster>(
      'seasonRostersConnection',
      `query($seasonProviderId:String,$first:Int,$after:String){ seasonRostersConnection(seasonProviderId:$seasonProviderId,first:$first,after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ team{ code } player{ providerId name nickname avatarUrl dob nationality height } playingPosition jerseyNumber } } } }`,
      { seasonProviderId: regular.providerId },
    ),
  );
  const statsQuery = `query($seasonProviderId:String,$playoffs:Boolean,$first:Int,$after:String){ seasonPlayerStatsExtendedConnection(seasonProviderId:$seasonProviderId,playoffs:$playoffs,first:$first,after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ team{ code } player{ providerId name avatarUrl } stats{ games minutesAvg points pointsAvg reboundsTotal reboundsTotalAvg assists assistsAvg stealsAvg blocksAvg turnoversAvg fieldGoalsPercentage threePointersPercentage freeThrowsPercentage } } } } }`;
  const statsRegular = await cached(`${year}-player-stats`, () => paginate<GqlPlayerStats>('seasonPlayerStatsExtendedConnection', statsQuery, { seasonProviderId: regular.providerId, playoffs: false }));
  const statsPlayoffsRaw = await cached(`${year}-player-stats-playoffs`, () => paginate<GqlPlayerStats>('seasonPlayerStatsExtendedConnection', statsQuery, { seasonProviderId: regular.providerId, playoffs: true }));
  // The backend ignores `playoffs` for some seasons and returns the regular-season rows again; drop those.
  const statsPlayoffs = JSON.stringify(statsPlayoffsRaw) === JSON.stringify(statsRegular) ? [] : statsPlayoffsRaw;

  return {
    year,
    regular,
    playoffs,
    standings: teamStats.map(toStanding).sort((a, b) => (a.position ?? 99) - (b.position ?? 99) || b.won - a.won),
    games: matches.map(toGame).sort((a, b) => a.date.localeCompare(b.date)),
    series: seriesRaw.map(toSeries).sort((a, b) => a.round - b.round || a.name.localeCompare(b.name)),
    rosters: rosters.map(toRoster),
    playerStats: statsRegular.map(toPlayerStats).sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0)),
    playerStatsPlayoffs: statsPlayoffs.map(toPlayerStats).sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0)),
  };
}

// ---------- FPO placeholders ----------

interface FpoTeam {
  slug: string;
  code: string;
  name: string;
  strength: number;
}

function fpoTeamsFor(year: number, season: SeasonFile): FpoTeam[] {
  let slugs = season.rosters.map((r) => r.franchiseSlug);
  if (!slugs.length) slugs = franchises.filter((f) => f.status === 'active').map((f) => f.slug);
  const rand = seeded(year * 7919);
  return slugs.map((slug) => {
    const f = franchiseBySlug.get(slug)!;
    return { slug, code: f.code ?? slug.slice(0, 3).toUpperCase(), name: f.fullName, strength: 0.35 + rand() * 0.3 };
  });
}

interface FpoBlocks {
  standings: SeasonStanding[];
  games: SeasonGame[];
  series: SeasonSeries[];
}

// When the season has real standings, FPO games are steered so each team's record lands on its real
// won/lost and playoff seeds follow the real positions; only the individual scores and dates are invented.
function buildFpo(year: number, season: SeasonFile, teamsIn: FpoTeam[], finalSeries: string | null, realStandings: SeasonStanding[] | null): FpoBlocks {
  const rand = seeded(year * 104729 + 17);
  const teams = teamsIn.map((t) => ({ ...t }));
  const championSlug = season.champion?.franchiseSlug ?? null;
  const champion = teams.find((t) => t.slug === championSlug) ?? null;
  if (champion && !realStandings) champion.strength = 0.72;
  const target = new Map<string, SeasonStanding>((realStandings ?? []).map((s) => [s.franchiseSlug!, s]));

  const games: SeasonGame[] = [];
  const wins = new Map<string, number>(teams.map((t) => [t.slug, 0]));
  const losses = new Map<string, number>(teams.map((t) => [t.slug, 0]));
  const totalGames = 3 * (teams.length - 1);
  let gameNo = 0;
  const startDate = new Date(Date.UTC(year, 2, 15));

  const steer = (home: FpoTeam, visitor: FpoTeam): boolean => {
    const need = (t: FpoTeam): number => {
      const s = target.get(t.slug);
      if (!s) return 0.5;
      const played = wins.get(t.slug)! + losses.get(t.slug)!;
      const remaining = Math.max(1, totalGames - played);
      return (s.won - wins.get(t.slug)!) / remaining;
    };
    const h = need(home);
    const v = need(visitor);
    if (h === v) return rand() < 0.53;
    return h > v;
  };

  const pushGame = (home: FpoTeam, visitor: FpoTeam, dayOffset: number, phase: SeasonGame['phase'], seriesId: string | null, gameNumber: number | null, forceWinner: FpoTeam | null): FpoTeam => {
    const pHome = 0.5 + (home.strength - visitor.strength) + 0.06;
    let homeWins = target.size ? steer(home, visitor) : rand() < pHome;
    if (forceWinner) homeWins = forceWinner === home;
    const winScore = 78 + Math.floor(rand() * 28);
    const loseScore = winScore - 1 - Math.floor(rand() * 18);
    const date = new Date(startDate.getTime() + dayOffset * 86400000);
    gameNo++;
    games.push({
      id: `fpo-${year}-${gameNo}`,
      date: `${isoDate(date)} 00:00:00+00:00`,
      phase,
      status: 'COMPLETE',
      home: { franchiseSlug: home.slug, code: home.code, name: home.name, score: homeWins ? winScore : loseScore },
      visitor: { franchiseSlug: visitor.slug, code: visitor.code, name: visitor.name, score: homeWins ? loseScore : winScore },
      venue: null,
      seriesId,
      gameNumber,
      isFinals: phase === 'playoffs' && seriesId !== null && seriesId.endsWith('-final'),
    });
    return homeWins ? home : visitor;
  };

  // Regular season: every pair meets three times, dates spread over ~14 weeks.
  const pairs: Array<[FpoTeam, FpoTeam]> = [];
  for (let i = 0; i < teams.length; i++) for (let j = i + 1; j < teams.length; j++) for (let k = 0; k < 3; k++) pairs.push(k % 2 === 0 ? [teams[i], teams[j]] : [teams[j], teams[i]]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  const perDay = Math.max(1, Math.floor(teams.length / 2));
  pairs.forEach(([home, visitor], idx) => {
    const winner = pushGame(home, visitor, Math.floor(idx / perDay) * 2, 'regular', null, null, null);
    wins.set(winner.slug, wins.get(winner.slug)! + 1);
    const loser = winner === home ? visitor : home;
    losses.set(loser.slug, losses.get(loser.slug)! + 1);
  });

  const ranked = [...teams].sort((a, b) =>
    target.size
      ? (target.get(a.slug)?.position ?? 99) - (target.get(b.slug)?.position ?? 99)
      : wins.get(b.slug)! - wins.get(a.slug)! || a.name.localeCompare(b.name),
  );
  const standings: SeasonStanding[] = ranked.map((t, i) => ({
    franchiseSlug: t.slug,
    code: t.code,
    name: t.name,
    group: i % 2 === 0 ? 'A' : 'B',
    position: i + 1,
    positionInGroup: Math.floor(i / 2) + 1,
    won: wins.get(t.slug)!,
    lost: losses.get(t.slug)!,
    pointsAverage: round1(80 + rand() * 15),
  }));

  // Playoffs: top 8; the real champion is always in and always wins.
  let field = ranked.slice(0, Math.min(8, ranked.length));
  if (champion && !field.includes(champion)) field = [...field.slice(0, -1), champion];
  const seedOf = new Map(field.map((t, i) => [t.slug, i + 1]));
  const series: SeasonSeries[] = [];
  let playoffDay = Math.ceil(pairs.length / perDay) * 2 + 7;

  const playSeries = (a: FpoTeam, b: FpoTeam, id: string, name: string, round: number, targetScore: string | null): FpoTeam => {
    const winner = a === champion || b === champion ? champion! : seedOf.get(a.slug)! <= seedOf.get(b.slug)! ? (rand() < 0.75 ? a : b) : rand() < 0.75 ? b : a;
    const loser = winner === a ? b : a;
    const loserWins = targetScore ? Number(targetScore.split('-')[1]) || 0 : Math.floor(rand() * 4);
    const order: FpoTeam[] = [];
    for (let i = 0; i < loserWins; i++) order.push(loser);
    for (let i = 0; i < 4; i++) order.push(winner);
    for (let i = order.length - 2; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const start = playoffDay;
    order.forEach((gameWinner, i) => {
      const home = i % 2 === 0 ? a : b;
      pushGame(home, home === a ? b : a, playoffDay, 'playoffs', id, i + 1, gameWinner);
      playoffDay += 2;
    });
    series.push({
      id,
      name,
      round,
      group: null,
      status: 'COMPLETE',
      startDate: isoDate(new Date(startDate.getTime() + start * 86400000)),
      endDate: isoDate(new Date(startDate.getTime() + (playoffDay - 2) * 86400000)),
      competitors: [
        { franchiseSlug: a.slug, code: a.code, won: a === winner ? 4 : loserWins, lost: a === winner ? loserWins : 4, seed: seedOf.get(a.slug)! },
        { franchiseSlug: b.slug, code: b.code, won: b === winner ? 4 : loserWins, lost: b === winner ? loserWins : 4, seed: seedOf.get(b.slug)! },
      ],
      winnerSlug: winner.slug,
    });
    return winner;
  };

  if (field.length >= 8) {
    const q = [
      playSeries(field[0], field[7], `fpo-${year}-r1-1`, 'Cuartos de Final 1', 1, null),
      playSeries(field[3], field[4], `fpo-${year}-r1-2`, 'Cuartos de Final 2', 1, null),
      playSeries(field[1], field[6], `fpo-${year}-r1-3`, 'Cuartos de Final 3', 1, null),
      playSeries(field[2], field[5], `fpo-${year}-r1-4`, 'Cuartos de Final 4', 1, null),
    ];
    playoffDay += 3;
    const s1 = playSeries(q[0], q[1], `fpo-${year}-r2-1`, 'Semifinal 1', 2, null);
    const s2 = playSeries(q[2], q[3], `fpo-${year}-r2-2`, 'Semifinal 2', 2, null);
    playoffDay += 3;
    playSeries(s1, s2, `fpo-${year}-final`, `Final BSN ${year}`, 3, finalSeries);
  } else if (field.length >= 2) {
    playSeries(field[0], field[1], `fpo-${year}-final`, `Final BSN ${year}`, 1, finalSeries);
  }

  return { standings, games: games.sort((a, b) => a.date.localeCompare(b.date)), series };
}

// ---------- main ----------

async function main(): Promise<void> {
  mkdirSync(CACHE_DIR, { recursive: true });

  const seasons = await cached('seasons', () =>
    paginate<GqlSeason>('seasonConnection', 'query($first:Int,$after:String){ seasonConnection(first:$first,after:$after){ pageInfo{ hasNextPage endCursor } edges{ node{ providerId name year startDate endDate isPlayoffs } } } }', {}),
  );
  const regularByYear = new Map<number, GqlSeason>();
  const playoffsByYear = new Map<number, GqlSeason>();
  for (const s of seasons) (s.isPlayoffs ? playoffsByYear : regularByYear).set(s.year, s);

  const realYears = [...regularByYear.keys()].filter((y) => y >= FIRST_RESULTS_YEAR).sort();
  const real = new Map<number, RealSeason>();
  for (const year of realYears) real.set(year, await fetchRealSeason(regularByYear.get(year)!, playoffsByYear.get(year) ?? null));

  const lastYear = Math.max(...realYears, ...readdirSync(join(OUT_DIR, 'seasons')).map((f) => Number(f.replace('.json', ''))));
  const recordsBySlug = new Map<string, FranchiseSeasonRecord[]>();
  const summary: string[] = [];

  for (let year = FIRST_RESULTS_YEAR; year <= lastYear; year++) {
    const season = loadSeason(year);
    const r = real.get(year) ?? null;
    const realStandings = r && r.standings.length ? r.standings : null;
    const needFpo = {
      standings: !realStandings,
      games: !r || !r.games.some((g) => g.phase === 'regular'),
      series: !r || r.series.length === 0,
    };
    const fpoTeams = realStandings
      ? realStandings.filter((s) => s.franchiseSlug).map((s): FpoTeam => ({ slug: s.franchiseSlug!, code: s.code, name: s.name, strength: s.won / Math.max(1, s.won + s.lost) }))
      : fpoTeamsFor(year, season);
    const fpo = needFpo.standings || needFpo.games || needFpo.series ? buildFpo(year, season, fpoTeams, season.champion?.series ?? null, realStandings) : null;

    const flags: ResultsFpoFlags = {
      standings: needFpo.standings,
      games: needFpo.games,
      series: needFpo.series,
      rosters: !r || r.rosters.length === 0,
      playerStats: !r || r.playerStats.length === 0,
    };
    const standings = realStandings ?? fpo!.standings;
    const results: SeasonResults = {
      source: r ? 'bsn-graphql' : 'fpo',
      fpo: flags,
      seasonProviderId: r?.regular.providerId ?? null,
      fetchedAt: r ? new Date().toISOString() : null,
      standings,
      games: needFpo.games ? [...(r?.games ?? []), ...fpo!.games].sort((a, b) => a.date.localeCompare(b.date)) : r!.games,
      series: needFpo.series ? fpo!.series : r!.series,
      rosters: r?.rosters ?? [],
      playerStats: r?.playerStats ?? [],
      playerStatsPlayoffs: r?.playerStatsPlayoffs ?? [],
    };
    season.results = results;
    writeJson(seasonPath(year), season);

    for (const s of standings) {
      if (!s.franchiseSlug) continue;
      const list = recordsBySlug.get(s.franchiseSlug) ?? [];
      list.push({ year, won: s.won, lost: s.lost, position: s.position, group: s.group, fpo: flags.standings });
      recordsBySlug.set(s.franchiseSlug, list);
    }

    const fpoBlocks = Object.entries(flags).filter(([, v]) => v).map(([k]) => k);
    summary.push(
      `   ${year}  ${results.source.padEnd(11)} standings=${standings.length} games=${results.games.length} series=${results.series.length} rosters=${results.rosters.length} playerStats=${results.playerStats.length}/${results.playerStatsPlayoffs.length}  FPO: ${fpoBlocks.length ? fpoBlocks.join(',') : 'ninguno'}`,
    );
  }

  for (const f of franchises) {
    const path = join(OUT_DIR, 'franchises', `${f.slug}.json`);
    const file = readJson<FranchiseFile>(path);
    file.seasonRecords = (recordsBySlug.get(f.slug) ?? []).sort((a, b) => b.year - a.year);
    writeJson(path, file);
  }

  console.log('\n=== VALIDACION RESULTADOS ===');
  console.log(`   temporadas en GraphQL: ${seasons.map((s) => `${s.name} (${s.providerId.slice(0, 8)})`).join(', ')}`);
  console.log(`   temporadas con data real: ${realYears.join(', ') || 'ninguna'}`);
  for (const line of summary) console.log(line);
  const totalGames = [...real.values()].reduce((a, r) => a + r.games.length, 0);
  console.log(`   juegos reales totales: ${totalGames} | temporadas con playoffs reales: ${[...real.values()].filter((r) => r.series.length).map((r) => r.year).join(', ') || 'ninguna'}`);
  console.log(`   códigos de equipo sin franquicia (eventos): ${[...unknownCodes].sort().join(', ') || 'ninguno'}`);
  const matched = [...real.values()].flatMap((r) => r.rosters);
  console.log(`   jugadores de rosters GraphQL enlazados a perfil del archivo por nombre: ${matched.filter((m) => m.playerId).length} de ${matched.length}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
