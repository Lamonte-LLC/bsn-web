import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CareerRecordEntry,
  CareerRecordKey,
  CareerTotals,
  Champion,
  EventTeam,
  Franchise,
  FranchiseEntry,
  FranchiseFile,
  FranchiseLeaderEntry,
  FranchiseMvp,
  FranchisePlayer,
  LeaderCategory,
  LeaderEntry,
  Mvp,
  Phase,
  PlayerChampionship,
  PlayerFile,
  PlayerIndexEntry,
  RecordsFile,
  RosterEntry,
  RosterLine,
  SeasonFile,
  SeasonRecordEntry,
  SeasonRecordKey,
  SeasonRoster,
  StatLine,
} from '../../types/archivo';

// ---------- paths ----------

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(SCRIPT_DIR, 'raw');
const SEED_DIR = join(SCRIPT_DIR, 'data');
const OUT_DIR = join(SCRIPT_DIR, '..', '..', 'data', 'archivo');

// ---------- raw shapes ----------

type RawRow = [
  string, number, number, number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number, number, number,
  number, number, number, number, string, string,
];

interface RawEnc {
  teams: string[];
  data: RawRow[];
}

interface RawCareerBlock {
  g?: number;
  pts?: number;
  reb?: number | null;
  ast?: number | null;
  fgm?: number;
  fga?: number;
  c3m?: number;
  c3a?: number;
  ftm?: number;
  fta?: number;
  pp?: number;
  rp?: number | null;
  ap?: number | null;
  fg?: number | null;
  f3?: number | null;
  ft?: number | null;
}

interface RawCareer extends RawCareerBlock {
  n: string;
  s: number;
  tm: string[];
  fy: number;
  ly: number;
  reg: RawCareerBlock;
  po: RawCareerBlock;
}

interface RawChampion {
  year: number;
  champion: string;
  series: string | null;
  seriesRaw: string | null;
  coach: string | null;
  coachTitleNumber: number | null;
}

interface RawMvp {
  year: number;
  player: string;
  mvpNumber: number | null;
  team: string;
}

interface SeedFranchise {
  slug: string;
  teamIndex: number | null;
  nickname: string;
  city: string | null;
  code: string | null;
  primaryColor: string | null;
  colorSource: 'bsn-web' | 'prototype' | null;
  aliases: string[];
  fullNameOverride?: string;
  notes?: string;
}

interface SeedFile {
  franchises: SeedFranchise[];
}

interface MvpOverride {
  year: number;
  player: string;
  playerId: string | null;
  reason: string;
}

interface MvpOverridesFile {
  overrides: MvpOverride[];
}

// Inline constants lifted from the league prototype page (see scripts/archivo/data/prototype-inline.json).
interface PrototypeInline {
  CHAMP_DATA: Array<{ y: number; tm: string; series: string; short: string }>;
  MVP_DATA: Array<{ y: number; n: string; pos: string | null; tm: string }>;
}

// ---------- helpers ----------

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function writeJson(relPath: string, value: unknown, pretty = false): void {
  const full = join(OUT_DIR, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pretty ? JSON.stringify(value, null, 2) + '\n' : JSON.stringify(value));
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeKey(s: string): string {
  return stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function slugify(s: string): string {
  return normalizeKey(s).replace(/ /g, '-');
}

function nameTokens(s: string): string[] {
  return normalizeKey(s.replace(/['"]/g, ' ')).split(' ').filter(Boolean);
}

function nul(v: number): number | null {
  return v === -1 ? null : v;
}

function opt(v: number | null | undefined): number | null {
  return v === undefined || v === null || v === -1 ? null : v;
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function uniqueSorted(values: Iterable<number>): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

function byValueDesc<T extends { value: number; g: number; name: string }>(a: T, b: T): number {
  return b.value - a.value || b.g - a.g || a.name.localeCompare(b.name);
}

const PLAYOFF_LABELS = new Set(['Cuartos de Final', 'Semi Final', 'Serie Final']);

function phaseOf(code: number, label: string): Phase {
  if (label === 'Serie Regular') return 'regular';
  if (code === 1 || PLAYOFF_LABELS.has(label)) return 'playoffs';
  if (label === 'All-Star') return 'allstar';
  return 'other';
}

const LOGO_FILE_BY_CODE: Record<string, string> = {
  AGU: 'Aguada',
  ARE: 'Arecibo',
  BAY: 'Bayamon',
  CAG: 'Caguas',
  CAR: 'Carolina',
  GBO: 'Guaynabo',
  MAN: 'Manati',
  MAY: 'Mayaguez',
  PON: 'Ponce',
  QUE: 'Quebradillas',
  SGE: 'San-German',
  SCE: 'Santurce',
};

const MIN_GAMES = 10;

// ---------- load ----------

const enc = readJson<RawEnc>(join(RAW_DIR, 'enc.json'));
const careers = readJson<Record<string, RawCareer>>(join(RAW_DIR, 'careers.json'));
const rawChampions = readJson<RawChampion[]>(join(SEED_DIR, 'champions.json'));
const rawMvps = readJson<RawMvp[]>(join(SEED_DIR, 'mvps.json'));
const seed = readJson<SeedFile>(join(SEED_DIR, 'franchises.seed.json'));
const mvpOverrides = readJson<MvpOverridesFile>(join(SEED_DIR, 'mvp-overrides.json'));
const prototype = readJson<PrototypeInline>(join(SEED_DIR, 'prototype-inline.json'));
const protoChampionName = new Map(prototype.CHAMP_DATA.map((c) => [c.y, c.tm]));
const protoMvpPosition = new Map(prototype.MVP_DATA.map((m) => [m.y, m.pos || null]));

// ---------- franchises ----------

const slugByTeamIndex = new Map<number, string>();
for (const f of seed.franchises) if (f.teamIndex !== null) slugByTeamIndex.set(f.teamIndex, f.slug);

interface ParsedRow {
  playerId: string;
  name: string;
  teamIndex: number;
  teamName: string;
  franchiseSlug: string | null;
  line: StatLine;
}

// Old seasons encode "not recorded" as 0 (assists, steals, blocks) or as attempts equal to makes
// (fga === fgm gives 100% shooting). A stat counts as tracked in a season only when a meaningful
// share of regular-season rows carries a real value; a stray non-zero row is not enough.
type TrackedKey = 'rpg' | 'apg' | 'spg' | 'bpg' | 'topg' | 'reb' | 'ast' | 'fga' | 'fg3a' | 'fta';
type TrackedFlags = Record<TrackedKey, boolean>;
const TRACKED_KEYS: TrackedKey[] = ['rpg', 'apg', 'spg', 'bpg', 'topg', 'reb', 'ast', 'fga', 'fg3a', 'fta'];
const TRACKED_SHARE = 0.2;

const trackedByYear = new Map<number, TrackedFlags>();
{
  const tallies = new Map<number, { rows: number; real: Record<TrackedKey, number> }>();
  for (const r of enc.data) {
    if (r[25] !== 'Serie Regular' || r[4] < 5) continue;
    let t = tallies.get(r[2]);
    if (!t) tallies.set(r[2], (t = { rows: 0, real: { rpg: 0, apg: 0, spg: 0, bpg: 0, topg: 0, reb: 0, ast: 0, fga: 0, fg3a: 0, fta: 0 } }));
    t.rows++;
    if (r[6] > 0) t.real.rpg++;
    if (r[7] > 0) t.real.apg++;
    if (r[8] > 0) t.real.bpg++;
    if (r[9] > 0) t.real.spg++;
    if (r[10] > 0) t.real.topg++;
    if (r[22] > 0) t.real.reb++;
    if (r[23] > 0) t.real.ast++;
    if (r[15] >= 0 && r[16] > r[15]) t.real.fga++;
    if (r[17] >= 0 && r[18] > r[17]) t.real.fg3a++;
    if (r[19] >= 0 && r[20] > r[19]) t.real.fta++;
  }
  for (const r of enc.data) {
    if (trackedByYear.has(r[2])) continue;
    const t = tallies.get(r[2]);
    const flags = { rpg: false, apg: false, spg: false, bpg: false, topg: false, reb: false, ast: false, fga: false, fg3a: false, fta: false };
    if (t) for (const key of TRACKED_KEYS) flags[key] = t.real[key] / t.rows >= TRACKED_SHARE;
    trackedByYear.set(r[2], flags);
  }
}

const rows: ParsedRow[] = enc.data.map((r) => {
  const teamIndex = r[1];
  const franchiseSlug = slugByTeamIndex.get(teamIndex) ?? null;
  const teamName = enc.teams[teamIndex];
  const tr = trackedByYear.get(r[2])!;
  const gate = (v: number, tracked: boolean): number | null => (tracked ? nul(v) : null);
  const line: StatLine = {
    year: r[2],
    phase: phaseOf(r[3], r[25]),
    phaseLabel: r[25],
    teamIndex,
    teamName,
    franchiseSlug,
    g: r[4],
    ppg: nul(r[5]),
    rpg: gate(r[6], tr.rpg),
    apg: gate(r[7], tr.apg),
    bpg: gate(r[8], tr.bpg),
    spg: gate(r[9], tr.spg),
    topg: gate(r[10], tr.topg),
    fgPct: gate(r[12], tr.fga),
    fg3Pct: gate(r[13], tr.fg3a),
    ftPct: gate(r[14], tr.fta),
    fgm: nul(r[15]),
    fga: gate(r[16], tr.fga),
    fg3m: gate(r[17], tr.fg3a),
    fg3a: gate(r[18], tr.fg3a),
    ftm: nul(r[19]),
    fta: gate(r[20], tr.fta),
    pts: nul(r[21]),
    reb: gate(r[22], tr.reb),
    ast: gate(r[23], tr.ast),
  };
  return { playerId: r[0], name: r[24], teamIndex, teamName, franchiseSlug, line };
});

const isCompetitive = (p: Phase): boolean => p === 'regular' || p === 'playoffs';

const encYearsBySlug = new Map<string, Set<number>>();
for (const r of rows) {
  if (r.franchiseSlug === null || !isCompetitive(r.line.phase)) continue;
  let set = encYearsBySlug.get(r.franchiseSlug);
  if (!set) encYearsBySlug.set(r.franchiseSlug, (set = new Set()));
  set.add(r.line.year);
}

const franchises: Franchise[] = seed.franchises.map((f) => {
  const fullName = f.fullNameOverride ?? (f.city ? `${f.nickname} de ${f.city}` : f.nickname);
  const encName = f.teamIndex !== null ? enc.teams[f.teamIndex] : null;
  const aliasSet = new Set<string>([
    f.nickname,
    stripAccents(f.nickname),
    fullName,
    stripAccents(fullName),
    ...(encName ? [encName] : []),
    ...f.aliases,
  ]);
  return {
    type: 'franchise',
    slug: f.slug,
    teamIndex: f.teamIndex,
    nickname: f.nickname,
    city: f.city,
    fullName,
    code: f.code,
    colors: { primary: f.primaryColor, secondary: null },
    colorSource: f.primaryColor ? f.colorSource : null,
    logo: f.code && LOGO_FILE_BY_CODE[f.code] ? `/assets/images/teams/${LOGO_FILE_BY_CODE[f.code]}.png` : null,
    status: f.code ? 'active' : 'extinct',
    activeYears: [],
    firstYear: null,
    lastYear: null,
    aliases: [...aliasSet],
    notes: f.notes ?? null,
  };
});

const franchiseBySlug = new Map<string, Franchise>(franchises.map((f) => [f.slug, f]));

const events: EventTeam[] = enc.teams
  .map((name, teamIndex): EventTeam => ({ type: 'event', teamIndex, name }))
  .filter((e) => !slugByTeamIndex.has(e.teamIndex));

const aliasIndex = new Map<string, string[]>();
for (const f of franchises) {
  for (const alias of f.aliases) {
    const key = normalizeKey(alias);
    const list = aliasIndex.get(key) ?? [];
    if (!list.includes(f.slug)) list.push(f.slug);
    aliasIndex.set(key, list);
  }
}

function resolveTeam(name: string, year: number): string | null {
  const slugs = aliasIndex.get(normalizeKey(name));
  if (!slugs) return null;
  if (slugs.length === 1) return slugs[0];
  const withData = slugs.filter((s) => encYearsBySlug.get(s)?.has(year));
  if (withData.length === 1) return withData[0];
  const dataYears = slugs.flatMap((s) => [...(encYearsBySlug.get(s) ?? [])]);
  const noData = slugs.filter((s) => (encYearsBySlug.get(s)?.size ?? 0) === 0);
  if (noData.length === 1 && dataYears.length > 0 && year < Math.min(...dataYears)) return noData[0];
  return null;
}

function resolveTeams(name: string, year: number): string[] {
  const one = resolveTeam(name, year);
  if (one) return [one];
  const key = ` ${normalizeKey(name)} `;
  const found: string[] = [];
  for (const f of franchises) {
    const hit = f.aliases.some((a) => {
      const k = normalizeKey(a);
      return k.includes(' ') && key.includes(` ${k} `);
    });
    if (hit && !found.includes(f.slug)) found.push(f.slug);
  }
  return found;
}

// ---------- champions ----------

const champions: Champion[] = rawChampions
  .map((c): Champion => {
    const franchiseSlug = resolveTeam(c.champion, c.year);
    return {
      year: c.year,
      franchiseSlug,
      name: c.champion,
      fullName: franchiseSlug ? franchiseBySlug.get(franchiseSlug)!.fullName : protoChampionName.get(c.year) ?? c.champion,
      coach: c.coach,
      series: c.series,
      seriesRaw: c.seriesRaw,
      coachTitleNumber: c.coachTitleNumber,
    };
  })
  .sort((a, b) => b.year - a.year);

const championByYear = new Map<number, Champion>(champions.map((c) => [c.year, c]));

// ---------- players: ids, names, slugs ----------

const rowsByPlayer = new Map<string, ParsedRow[]>();
for (const r of rows) {
  const list = rowsByPlayer.get(r.playerId);
  if (list) list.push(r);
  else rowsByPlayer.set(r.playerId, [r]);
}

const allPlayerIds = [...new Set<string>([...Object.keys(careers), ...rowsByPlayer.keys()])];
const orphanIds = allPlayerIds.filter((id) => !careers[id]);

function playerName(id: string): string {
  return careers[id]?.n ?? rowsByPlayer.get(id)![0].name;
}

function playerFirstYear(id: string): number {
  return careers[id]?.fy ?? Math.min(...rowsByPlayer.get(id)!.map((r) => r.line.year));
}

function playerLastYear(id: string): number {
  return careers[id]?.ly ?? Math.max(...rowsByPlayer.get(id)!.map((r) => r.line.year));
}

const slugById = new Map<string, string>();
{
  const groups = new Map<string, string[]>();
  for (const id of allPlayerIds) {
    const base = slugify(playerName(id));
    const list = groups.get(base) ?? [];
    list.push(id);
    groups.set(base, list);
  }
  for (const [base, ids] of groups) {
    if (ids.length === 1) {
      slugById.set(ids[0], base);
      continue;
    }
    const withYear = new Map<string, string[]>();
    for (const id of ids) {
      const key = `${base}-${playerFirstYear(id)}`;
      const list = withYear.get(key) ?? [];
      list.push(id);
      withYear.set(key, list);
    }
    for (const [key, ids2] of withYear) {
      if (ids2.length === 1) slugById.set(ids2[0], key);
      else for (const id of ids2) slugById.set(id, `${key}-${id}`);
    }
  }
}
const slugCollisions = allPlayerIds.filter((id) => slugById.get(id) !== slugify(playerName(id))).length;

// ---------- MVPs ----------

const careerTokens = new Map<string, Set<string>>();
for (const [id, c] of Object.entries(careers)) careerTokens.set(id, new Set(nameTokens(c.n)));

const overrideByYear = new Map<number, MvpOverride>(mvpOverrides.overrides.map((o) => [o.year, o]));

interface MvpResolution {
  playerId: string | null;
  source: 'override' | 'auto' | 'unresolved' | 'ambiguous';
  candidates: string[];
}

function resolveMvpPlayer(m: RawMvp): MvpResolution {
  const override = overrideByYear.get(m.year);
  if (override) return { playerId: override.playerId, source: 'override', candidates: [] };
  const key = normalizeKey(m.player.replace(/['"]/g, ' '));
  const toks = nameTokens(m.player);
  let candidates: string[] = [];
  for (const [id, c] of Object.entries(careers)) {
    if (m.year < c.fy - 1 || m.year > c.ly + 2) continue;
    const ct = careerTokens.get(id)!;
    const exact = normalizeKey(c.n.replace(/['"]/g, ' ')) === key;
    if (exact || toks.every((t) => ct.has(t))) candidates.push(id);
  }
  if (candidates.length > 1) {
    const teamNames = resolveTeams(m.team, m.year)
      .map((slug) => franchiseBySlug.get(slug)?.teamIndex)
      .filter((i): i is number => i !== null && i !== undefined)
      .map((i) => enc.teams[i]);
    const onTeam = candidates.filter((id) => careers[id].tm.some((t) => teamNames.includes(t)));
    if (onTeam.length === 1) candidates = onTeam;
  }
  if (candidates.length === 1) return { playerId: candidates[0], source: 'auto', candidates };
  return { playerId: null, source: candidates.length ? 'ambiguous' : 'unresolved', candidates };
}

const mvpResolutions = new Map<number, MvpResolution>();
const mvps: Mvp[] = rawMvps
  .map((m): Mvp => {
    const res = resolveMvpPlayer(m);
    mvpResolutions.set(m.year, res);
    return {
      year: m.year,
      playerId: res.playerId,
      slug: res.playerId ? slugById.get(res.playerId) ?? null : null,
      name: m.player,
      mvpNumber: m.mvpNumber,
      position: protoMvpPosition.get(m.year) ?? null,
      teamName: m.team,
      franchiseSlugs: resolveTeams(m.team, m.year),
    };
  })
  .sort((a, b) => b.year - a.year);

const mvpByYear = new Map<number, Mvp>(mvps.map((m) => [m.year, m]));
const mvpYearsByPlayer = new Map<string, number[]>();
for (const m of mvps) {
  if (!m.playerId) continue;
  const list = mvpYearsByPlayer.get(m.playerId) ?? [];
  list.push(m.year);
  mvpYearsByPlayer.set(m.playerId, list.sort((a, b) => a - b));
}

// ---------- franchise active years (needs champions + mvps) ----------

for (const f of franchises) {
  const years = new Set<number>(encYearsBySlug.get(f.slug) ?? []);
  for (const c of champions) if (c.franchiseSlug === f.slug) years.add(c.year);
  for (const m of mvps) if (m.franchiseSlugs.includes(f.slug)) years.add(m.year);
  f.activeYears = uniqueSorted(years);
  f.firstYear = f.activeYears[0] ?? null;
  f.lastYear = f.activeYears[f.activeYears.length - 1] ?? null;
}

// ---------- career totals ----------

function totalsFromBlock(b: RawCareerBlock | undefined): CareerTotals | null {
  if (!b || !b.g) return null;
  return {
    g: opt(b.g),
    pts: opt(b.pts),
    reb: opt(b.reb),
    ast: opt(b.ast),
    fgm: opt(b.fgm),
    fga: opt(b.fga),
    fg3m: opt(b.c3m),
    fg3a: opt(b.c3a),
    ftm: opt(b.ftm),
    fta: opt(b.fta),
    ppg: opt(b.pp),
    rpg: opt(b.rp),
    apg: opt(b.ap),
    fgPct: opt(b.fg),
    fg3Pct: opt(b.f3),
    ftPct: opt(b.ft),
  };
}

type SummableKey = 'pts' | 'reb' | 'ast' | 'fgm' | 'fga' | 'fg3m' | 'fg3a' | 'ftm' | 'fta';
const SUMMABLE: SummableKey[] = ['pts', 'reb', 'ast', 'fgm', 'fga', 'fg3m', 'fg3a', 'ftm', 'fta'];

// A total is only reported when every line has the value; a partial sum would understate old careers.
function sumLines(lines: StatLine[]): CareerTotals {
  const g = lines.reduce((a, l) => a + l.g, 0);
  const sums: Record<SummableKey, number | null> = { pts: 0, reb: 0, ast: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0 };
  for (const key of SUMMABLE) {
    let total = 0;
    let complete = lines.length > 0;
    for (const l of lines) {
      const v = l[key];
      if (v === null) {
        complete = false;
        break;
      }
      total += v;
    }
    sums[key] = complete ? total : null;
  }
  const avg = (v: number | null): number | null => (v === null || g === 0 ? null : round1(v / g));
  const pct = (m: number | null, a: number | null): number | null => (m === null || a === null || a === 0 ? null : round1((m / a) * 100));
  return {
    g: lines.length ? g : null,
    ...sums,
    ppg: avg(sums.pts),
    rpg: avg(sums.reb),
    apg: avg(sums.ast),
    fgPct: pct(sums.fgm, sums.fga),
    fg3Pct: pct(sums.fg3m, sums.fg3a),
    ftPct: pct(sums.ftm, sums.fta),
  };
}

// ---------- player files ----------

const playerIndex: PlayerIndexEntry[] = [];
const playersWithLines = new Map<string, PlayerFile>();

rmSync(join(OUT_DIR, 'players'), { recursive: true, force: true });
rmSync(join(OUT_DIR, 'seasons'), { recursive: true, force: true });
rmSync(join(OUT_DIR, 'franchises'), { recursive: true, force: true });

for (const id of allPlayerIds) {
  const c = careers[id];
  const prows = rowsByPlayer.get(id) ?? [];
  const lines: Record<Phase, StatLine[]> = { regular: [], playoffs: [], allstar: [], other: [] };
  for (const r of prows) lines[r.line.phase].push(r.line);
  for (const phase of Object.keys(lines) as Phase[]) lines[phase].sort((a, b) => a.year - b.year || a.phaseLabel.localeCompare(b.phaseLabel));

  const competitive = prows.filter((r) => r.franchiseSlug !== null && isCompetitive(r.line.phase));
  const franchiseSlugs = [...new Set(competitive.map((r) => r.franchiseSlug!))];
  const name = playerName(id);
  const slug = slugById.get(id)!;
  const fy = playerFirstYear(id);
  const ly = playerLastYear(id);
  const mvpYears = mvpYearsByPlayer.get(id) ?? [];

  const championships: PlayerChampionship[] = [];
  for (const year of uniqueSorted(competitive.map((r) => r.line.year))) {
    const champ = championByYear.get(year);
    if (!champ?.franchiseSlug) continue;
    if (competitive.some((r) => r.line.year === year && r.franchiseSlug === champ.franchiseSlug)) {
      championships.push({ year, franchiseSlug: champ.franchiseSlug });
    }
  }

  const career = totalsFromBlock(c);
  const file: PlayerFile = {
    id,
    slug,
    name,
    fy,
    ly,
    seasons: c?.s ?? uniqueSorted(competitive.map((r) => r.line.year)).length,
    franchiseSlugs,
    teams: c?.tm ?? [...new Set(prows.map((r) => r.teamName))],
    career,
    careerRegular: totalsFromBlock(c?.reg),
    careerPlayoffs: totalsFromBlock(c?.po),
    computed: {
      regular: sumLines(lines.regular.filter((l) => l.franchiseSlug !== null)),
      playoffs: sumLines(lines.playoffs.filter((l) => l.franchiseSlug !== null)),
    },
    mvpYears,
    championships,
    lines,
  };
  playersWithLines.set(id, file);
  writeJson(`players/${id}.json`, file);

  const aliases = [...new Set(mvps.filter((m) => m.playerId === id).map((m) => m.name.replace(/"/g, '')))].filter((a) => normalizeKey(a) !== normalizeKey(name));
  playerIndex.push({
    id,
    slug,
    name,
    aliases,
    fy,
    ly,
    franchiseSlugs,
    g: career?.g ?? file.computed.regular.g,
    pts: career?.pts ?? file.computed.regular.pts,
    isMvp: mvpYears.length > 0,
    mvpYears,
  });
}

playerIndex.sort((a, b) => a.name.localeCompare(b.name, 'es'));
writeJson('players.json', playerIndex);

// ---------- seasons ----------

const LEADER_CATEGORIES: LeaderCategory[] = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgPct', 'fg3Pct', 'ftPct'];

const rowsByYear = new Map<number, ParsedRow[]>();
for (const r of rows) {
  const list = rowsByYear.get(r.line.year);
  if (list) list.push(r);
  else rowsByYear.set(r.line.year, [r]);
}

const seasonYears = uniqueSorted([...rowsByYear.keys(), ...champions.map((c) => c.year), ...mvps.map((m) => m.year)]);

function rosterLine(lines: StatLine[]): RosterLine | null {
  if (!lines.length) return null;
  if (lines.length === 1) {
    const l = lines[0];
    return { g: l.g, ppg: l.ppg, rpg: l.rpg, apg: l.apg };
  }
  const t = sumLines(lines);
  return { g: t.g ?? 0, ppg: t.ppg, rpg: t.rpg, apg: t.apg };
}

let duplicateRegularLines = 0;

for (const year of seasonYears) {
  const yrows = rowsByYear.get(year) ?? [];
  const regularFranchise = yrows.filter((r) => r.line.phase === 'regular' && r.franchiseSlug !== null);

  let leaders: Record<LeaderCategory, LeaderEntry[]> | null = null;
  if (regularFranchise.length) {
    leaders = { ppg: [], rpg: [], apg: [], spg: [], bpg: [], fgPct: [], fg3Pct: [], ftPct: [] };
    for (const cat of LEADER_CATEGORIES) {
      leaders[cat] = regularFranchise
        .filter((r) => r.line.g >= MIN_GAMES && r.line[cat] !== null)
        .map((r): LeaderEntry => ({
          playerId: r.playerId,
          slug: slugById.get(r.playerId)!,
          name: r.name,
          franchiseSlug: r.franchiseSlug,
          teamName: r.teamName,
          g: r.line.g,
          value: r.line[cat]!,
        }))
        .sort(byValueDesc)
        .slice(0, 10);
    }
  }

  const rosterMap = new Map<string, Map<string, { name: string; regular: StatLine[]; playoffs: StatLine[] }>>();
  for (const r of yrows) {
    if (r.franchiseSlug === null || !isCompetitive(r.line.phase)) continue;
    let team = rosterMap.get(r.franchiseSlug);
    if (!team) rosterMap.set(r.franchiseSlug, (team = new Map()));
    let entry = team.get(r.playerId);
    if (!entry) team.set(r.playerId, (entry = { name: r.name, regular: [], playoffs: [] }));
    entry[r.line.phase === 'regular' ? 'regular' : 'playoffs'].push(r.line);
  }

  const rosters: SeasonRoster[] = [...rosterMap.entries()]
    .map(([franchiseSlug, team]): SeasonRoster => ({
      franchiseSlug,
      teamName: franchiseBySlug.get(franchiseSlug)!.fullName,
      players: [...team.entries()]
        .map(([playerId, e]): RosterEntry => {
          if (e.regular.length > 1) {
            duplicateRegularLines += e.regular.length - 1;
            e.regular.sort((a, b) => b.g - a.g);
            e.regular = [e.regular[0]];
          }
          return {
            playerId,
            slug: slugById.get(playerId)!,
            name: e.name,
            regular: rosterLine(e.regular),
            playoffs: rosterLine(e.playoffs),
          };
        })
        .sort((a, b) => (b.regular?.ppg ?? -1) - (a.regular?.ppg ?? -1) || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  const season: SeasonFile = {
    year,
    champion: championByYear.get(year) ?? null,
    mvp: mvpByYear.get(year) ?? null,
    hasStats: yrows.length > 0,
    phaseLabels: [...new Set(yrows.map((r) => r.line.phaseLabel))],
    leaders,
    rosters,
    results: null,
  };
  writeJson(`seasons/${year}.json`, season);
}

// ---------- records ----------

const SEASON_RECORD_KEYS: SeasonRecordKey[] = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'pts'];
const eligibleSeasonRows = rows.filter((r) => r.line.phase === 'regular' && r.franchiseSlug !== null && r.line.g >= MIN_GAMES);

const seasonRecords = {} as Record<SeasonRecordKey, SeasonRecordEntry[]>;
for (const key of SEASON_RECORD_KEYS) {
  seasonRecords[key] = eligibleSeasonRows
    .filter((r) => r.line[key] !== null)
    .map((r): SeasonRecordEntry => ({
      playerId: r.playerId,
      slug: slugById.get(r.playerId)!,
      name: r.name,
      year: r.line.year,
      franchiseSlug: r.franchiseSlug,
      teamName: r.teamName,
      g: r.line.g,
      value: r.line[key]!,
    }))
    .sort(byValueDesc)
    .slice(0, 10);
}

const CAREER_RECORD_KEYS: CareerRecordKey[] = ['pts', 'reb', 'ast', 'g', 'seasons', 'mvps'];
const careerRecords = {} as Record<CareerRecordKey, CareerRecordEntry[]>;
for (const key of CAREER_RECORD_KEYS) {
  const entries: CareerRecordEntry[] = [];
  for (const [id, c] of Object.entries(careers)) {
    let value: number | null;
    if (key === 'seasons') value = c.s;
    else if (key === 'mvps') value = mvpYearsByPlayer.get(id)?.length ?? 0;
    else value = opt(c[key]);
    if (value === null || value === 0) continue;
    const file = playersWithLines.get(id)!;
    entries.push({ playerId: id, slug: file.slug, name: c.n, fy: c.fy, ly: c.ly, franchiseSlugs: file.franchiseSlugs, value });
  }
  careerRecords[key] = entries.sort((a, b) => b.value - a.value || a.fy - b.fy || a.name.localeCompare(b.name)).slice(0, 10);
}

const records: RecordsFile = { minGames: MIN_GAMES, season: seasonRecords, career: careerRecords };
writeJson('records.json', records, true);

// ---------- franchise files ----------

for (const f of franchises) {
  const frows = rows.filter((r) => r.franchiseSlug === f.slug && isCompetitive(r.line.phase));
  const byPlayer = new Map<string, ParsedRow[]>();
  for (const r of frows) {
    const list = byPlayer.get(r.playerId);
    if (list) list.push(r);
    else byPlayer.set(r.playerId, [r]);
  }

  const players: FranchisePlayer[] = [...byPlayer.entries()]
    .map(([id, prs]): FranchisePlayer => {
      const years = uniqueSorted(prs.map((r) => r.line.year));
      return { id, slug: slugById.get(id)!, name: playerName(id), fy: years[0], ly: years[years.length - 1], seasons: years.length };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const leaderFor = (key: 'pts' | 'reb' | 'ast'): FranchiseLeaderEntry[] =>
    [...byPlayer.entries()]
      .map(([id, prs]): FranchiseLeaderEntry | null => {
        const regular = prs.filter((r) => r.line.phase === 'regular').map((r) => r.line);
        const t = sumLines(regular);
        if (t[key] === null || t.g === null) return null;
        return { playerId: id, slug: slugById.get(id)!, name: playerName(id), seasons: uniqueSorted(regular.map((l) => l.year)).length, g: t.g, value: t[key]! };
      })
      .filter((e): e is FranchiseLeaderEntry => e !== null)
      .sort(byValueDesc)
      .slice(0, 10);

  const file: FranchiseFile = {
    ...f,
    titles: champions
      .filter((c) => c.franchiseSlug === f.slug)
      .map((c) => ({ year: c.year, coach: c.coach, series: c.series }))
      .sort((a, b) => b.year - a.year),
    mvps: mvps
      .filter((m) => m.franchiseSlugs.includes(f.slug))
      .map((m): FranchiseMvp => ({ year: m.year, playerId: m.playerId, slug: m.slug, name: m.name }))
      .sort((a, b) => b.year - a.year),
    leaders: { pts: leaderFor('pts'), reb: leaderFor('reb'), ast: leaderFor('ast') },
    players,
    seasonRecords: [],
  };
  writeJson(`franchises/${f.slug}.json`, file);
}

const franchiseEntries: FranchiseEntry[] = [...franchises, ...events];
writeJson('franchises.json', franchiseEntries, true);
writeJson('champions.json', champions, true);
writeJson('mvps.json', mvps, true);

// ---------- validation ----------

const check = (label: string, actual: number, expected: number): void => {
  console.log(`${actual === expected ? 'OK ' : 'XX '} ${label}: ${actual} (esperado ${expected})`);
};

console.log('\n=== VALIDACION ===');
check('jugadores con CAREER_DATA', Object.keys(careers).length, 3253);
check('filas jugador-temporada', rows.length, 17835);
check('campeones', champions.length, 95);
check('MVPs', mvps.length, 75);
console.log(`   jugadores adicionales solo con filas de evento/postemporada (sin CAREER_DATA): ${orphanIds.length} -> total players/*.json: ${allPlayerIds.length}`);
console.log(`   rango de años con stats: ${Math.min(...rowsByYear.keys())} a ${Math.max(...rowsByYear.keys())} | seasons/*.json generados: ${seasonYears.length} (${seasonYears[0]} a ${seasonYears[seasonYears.length - 1]})`);
console.log(`   slugs de jugador con sufijo por colisión: ${slugCollisions}`);
console.log(`   filas Serie Regular duplicadas (mismo jugador, año y equipo) colapsadas en rosters: ${duplicateRegularLines}`);

const phaseCounts: Record<Phase, number> = { regular: 0, playoffs: 0, allstar: 0, other: 0 };
for (const r of rows) phaseCounts[r.line.phase]++;
console.log(`   filas por fase: ${JSON.stringify(phaseCounts)}`);

console.log('\n   stats no registradas por temporada (convertidas a null):');
const statYears = uniqueSorted(trackedByYear.keys());
for (const key of TRACKED_KEYS) {
  const untracked = statYears.filter((y) => !trackedByYear.get(y)![key]);
  if (!untracked.length) continue;
  const ranges: string[] = [];
  let start = untracked[0];
  let prev = untracked[0];
  for (const y of untracked.slice(1).concat(Number.NaN)) {
    if (y !== prev + 1) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = y;
    }
    prev = y;
  }
  console.log(`     ${key.padEnd(5)} ${ranges.join(', ')}`);
}

const arroyo2019 = rows.find((r) => r.playerId === '273' && r.line.year === 2019 && r.line.phase === 'regular');
const arroyoOk = arroyo2019 && arroyo2019.line.g === 19 && arroyo2019.line.ppg === 9.6 && arroyo2019.line.apg === 10.6;
console.log(`${arroyoOk ? 'OK ' : 'XX '} Carlos Arroyo Bermúdez 2019 Serie Regular: g=${arroyo2019?.line.g} ppg=${arroyo2019?.line.ppg} apg=${arroyo2019?.line.apg} (esperado 19 / 9.6 / 10.6)`);

const unresolvedChampions = champions.filter((c) => c.franchiseSlug === null);
console.log(`\n   campeones sin franchiseSlug: ${unresolvedChampions.length} de ${champions.length}`);
for (const c of unresolvedChampions) console.log(`     ${c.year}  ${c.name}`);

const unresolvedMvpTeams = mvps.filter((m) => m.franchiseSlugs.length === 0);
console.log(`\n   equipos de MVP sin franchiseSlug: ${unresolvedMvpTeams.length} de ${mvps.length}`);
for (const m of unresolvedMvpTeams) console.log(`     ${m.year}  ${m.teamName}`);

const sources = { override: 0, auto: 0, unresolved: 0, ambiguous: 0 };
for (const res of mvpResolutions.values()) sources[res.source]++;
console.log(`\n   MVPs -> playerId: ${JSON.stringify(sources)}`);
for (const m of mvps) {
  const res = mvpResolutions.get(m.year)!;
  if (res.source === 'unresolved' || res.source === 'ambiguous' || (res.source === 'override' && res.playerId === null)) {
    console.log(`     ${m.year}  ${m.name}  [${res.source}] ${res.candidates.map((id) => `${id}:${careers[id].n}`).join(' | ')}`);
  }
}

console.log(`\n   franquicias: ${franchises.length} (${franchises.filter((f) => f.status === 'active').length} activas) | eventos: ${events.length}`);
for (const f of franchises) {
  const flags = [f.city === null ? 'ciudad?' : null, f.logo === null ? 'sin logo' : null].filter(Boolean).join(', ');
  console.log(`     ${f.slug.padEnd(14)} ${String(f.firstYear).padStart(4)}-${String(f.lastYear).padEnd(4)} títulos=${champions.filter((c) => c.franchiseSlug === f.slug).length}  mvps=${mvps.filter((m) => m.franchiseSlugs.includes(f.slug)).length}  ${flags}`);
}
