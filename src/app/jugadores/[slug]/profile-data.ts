/**
 * Pure shaping of the profile page's data: the live profile query plus the per-season lines of the comparison
 * query become one serializable object the hero and the tabs render. No data access here.
 */
import { positionLabel } from '@/historia/lib/copy';
import { EXTINCT_CODE_COLORS } from '@/archivo/lib/tokens';

/** One season's (or the whole career's) numbers. Null = not recorded in that era. */
export type LineStats = {
  games: number | null;
  minutes: number | null;
  minutesAvg: number | null;
  points: number | null;
  pointsAvg: number | null;
  fieldGoalsMade: number | null;
  fieldGoalsAttempted: number | null;
  fieldGoalsMadeAvg: number | null;
  fieldGoalsAttemptedAvg: number | null;
  fieldGoalsPercentage: number | null;
  threePointersMade: number | null;
  threePointersAttempted: number | null;
  threePointersMadeAvg: number | null;
  threePointersAttemptedAvg: number | null;
  threePointersPercentage: number | null;
  freeThrowsMade: number | null;
  freeThrowsAttempted: number | null;
  freeThrowsMadeAvg: number | null;
  freeThrowsAttemptedAvg: number | null;
  freeThrowsPercentage: number | null;
  offensiveRebounds: number | null;
  offensiveReboundsAvg: number | null;
  defensiveRebounds: number | null;
  defensiveReboundsAvg: number | null;
  reboundsTotal: number | null;
  reboundsTotalAvg: number | null;
  assists: number | null;
  assistsAvg: number | null;
  turnovers: number | null;
  turnoversAvg: number | null;
  steals: number | null;
  stealsAvg: number | null;
  blocks: number | null;
  blocksAvg: number | null;
  foulsPersonal: number | null;
  foulsPersonalAvg: number | null;
  plusMinusPointsAvg: number | null;
  efficiency: number | null;
};

export type ProfileClub = { code: string; name: string; nickname: string; color: string };

export type SeasonLine = {
  providerId: string;
  name: string;
  year: number;
  current: boolean;
  playoffs: boolean;
  teams: ProfileClub[];
  stats: LineStats;
};

export type PlayerProfileData = {
  providerId: string;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  /** On a roster this season. */
  active: boolean;
  /** English position label ("Guard"); null when the API has none (most retired players). */
  position: string | null;
  jersey: string | null;
  /** This season's club (active players). */
  club: ProfileClub | null;
  /** Every club of the career, in the order they were first played for. */
  clubs: ProfileClub[];
  /** The club the player is identified with: most seasons, the most recent on a tie. */
  mainClub: ProfileClub | null;
  heightCm: number | null;
  weightKg: number | null;
  dob: string | null;
  nationality: string | null;
  debut: { year: number; club: string } | null;
  seasonsCount: number;
  firstYear: number | null;
  lastYear: number | null;
  /** The regular season shown by default for an active player. */
  season: SeasonLine | null;
  /** Its playoffs, when the player has played them. */
  playoffs: SeasonLine | null;
  /** Regular-season lines, most recent first. */
  lines: SeasonLine[];
  career: LineStats | null;
};

/** Raw shapes of the two queries the page runs (only the fields the profile reads). */
export type ProfileQueryPlayer = {
  providerId: string;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  playingPosition: string | null;
  height: number | null;
  weight: number | null;
  dob: string | null;
  nationality: string | null;
  team: { code: string; name: string; nickname: string; colorPrimary: string | null } | null;
  seasonRoster: { jerseyNumber: string | number | null; playingPosition: string | null; team: { code: string; name: string; nickname: string; colorPrimary: string | null } | null } | null;
};

export type ComparisonQueryPlayer = {
  statsBySeasonConnection: {
    edges: {
      node: {
        season: { providerId: string; name: string; year: number; current: boolean; isPlayoffs: boolean };
        teams: { code: string; name: string; nickname: string; colorPrimary: string | null }[];
        stats: LineStats;
      };
    }[];
  };
  careerStats: LineStats | null;
} | null;

const FALLBACK_COLOR = '#4A5560';

function toClub(t: { code: string; name: string; nickname: string; colorPrimary: string | null }): ProfileClub {
  return { code: t.code, name: t.name, nickname: t.nickname, color: t.colorPrimary || EXTINCT_CODE_COLORS[t.code] || FALLBACK_COLOR };
}

export function buildProfile(p: ProfileQueryPlayer, c: ComparisonQueryPlayer): PlayerProfileData {
  const all: SeasonLine[] = (c?.statsBySeasonConnection.edges ?? []).map(({ node }) => ({
    providerId: node.season.providerId,
    name: node.season.name,
    year: node.season.year,
    current: node.season.current,
    playoffs: node.season.isPlayoffs,
    teams: node.teams.map(toClub),
    stats: node.stats,
  }));
  const lines = all.filter((l) => !l.playoffs).sort((a, b) => b.year - a.year);
  const years = [...new Set(lines.map((l) => l.year))].sort((a, b) => a - b);
  const firstYear = years[0] ?? null;
  const lastYear = years[years.length - 1] ?? null;

  // Clubs in the order they were first played for; the earliest line names the debut club.
  const clubs: ProfileClub[] = [];
  for (const line of [...lines].reverse()) {
    for (const t of line.teams) if (!clubs.some((k) => k.code === t.code)) clubs.push(t);
  }
  const tally = new Map<string, { club: ProfileClub; seasons: number; latest: number }>();
  for (const line of lines) {
    for (const t of line.teams) {
      const cur = tally.get(t.code);
      if (cur) {
        cur.seasons += 1;
        cur.latest = Math.max(cur.latest, line.year);
      } else tally.set(t.code, { club: t, seasons: 1, latest: line.year });
    }
  }
  const mainClub = [...tally.values()].sort((a, b) => b.seasons - a.seasons || b.latest - a.latest)[0]?.club ?? null;
  const earliest = lines[lines.length - 1] ?? null;
  const debut = earliest && firstYear !== null ? { year: firstYear, club: earliest.teams[0]?.nickname ?? '' } : null;

  const roster = p.seasonRoster;
  const active = roster !== null;
  const season = active ? (lines.find((l) => l.current) ?? lines[0] ?? null) : null;
  const playoffs = season ? (all.find((l) => l.playoffs && l.year === season.year) ?? null) : null;
  const club = roster?.team ? toClub(roster.team) : active && p.team ? toClub(p.team) : null;

  return {
    providerId: p.providerId,
    name: p.name,
    nickname: p.nickname ?? null,
    avatarUrl: p.avatarUrl ? `${p.avatarUrl}?size=400` : null,
    active,
    position: positionLabel(roster?.playingPosition ?? p.playingPosition),
    jersey: roster?.jerseyNumber !== null && roster?.jerseyNumber !== undefined ? String(roster.jerseyNumber) : null,
    club,
    clubs,
    mainClub,
    heightCm: p.height && p.height > 0 ? p.height : null,
    weightKg: p.weight && p.weight > 0 ? p.weight : null,
    dob: p.dob ?? null,
    nationality: p.nationality ?? null,
    debut,
    seasonsCount: years.length,
    firstYear,
    lastYear,
    season,
    playoffs,
    lines,
    career: c?.careerStats ?? null,
  };
}

/* ---------- Formatting ---------- */

export const DASH = '–';

/** One decimal; null and NaN read as a dash, never as zero. */
export function f1(v: number | null | undefined): string {
  return v === null || v === undefined || !Number.isFinite(v) ? DASH : v.toFixed(1);
}

/** Whole number with thousands separators (5,031). */
export function f0(v: number | null | undefined): string {
  return v === null || v === undefined || !Number.isFinite(v) ? DASH : new Intl.NumberFormat('es-PR').format(Math.round(v));
}

/** "48.9%"; the API sends shares as 0–1 fractions. */
export function pct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  return `${(v <= 1 ? v * 100 : v).toFixed(1)}%`;
}

/** "+94" / "-3" for the plus-minus. */
export function signed(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return DASH;
  const n = Math.round(v);
  return n > 0 ? `+${n}` : String(n);
}

export function ageFrom(iso: string | null | undefined, today = new Date()): number | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age -= 1;
  return age;
}

/** "12 temporadas · 2013–2026"; a single season reads "1 temporada · 2015". */
export function tenureLine(count: number, fy: number | null, ly: number | null): string | null {
  if (!count || fy === null || ly === null) return null;
  const noun = count === 1 ? 'temporada' : 'temporadas';
  return fy === ly ? `${count} ${noun} · ${fy}` : `${count} ${noun} · ${fy}–${ly}`;
}
