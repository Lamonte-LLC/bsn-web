// Generated data shapes for Archivo BSN (data/archivo/**). Numbers are null when the source had no value.

export type Phase = 'regular' | 'playoffs' | 'allstar' | 'other';
export type FranchiseStatus = 'active' | 'extinct';

export interface FranchiseColors {
  primary: string | null;
  secondary: string | null;
}

export interface Franchise {
  type: 'franchise';
  slug: string;
  teamIndex: number | null;
  nickname: string;
  city: string | null;
  fullName: string;
  code: string | null;
  colors: FranchiseColors;
  logo: string | null;
  status: FranchiseStatus;
  activeYears: number[];
  firstYear: number | null;
  lastYear: number | null;
  aliases: string[];
  notes: string | null;
}

export interface EventTeam {
  type: 'event';
  teamIndex: number;
  name: string;
}

export type FranchiseEntry = Franchise | EventTeam;

export interface Champion {
  year: number;
  franchiseSlug: string | null;
  name: string;
  coach: string | null;
  series: string | null;
  seriesRaw: string | null;
  coachTitleNumber: number | null;
}

export interface Mvp {
  year: number;
  playerId: string | null;
  slug: string | null;
  name: string;
  mvpNumber: number | null;
  teamName: string;
  franchiseSlugs: string[];
}

export interface StatLine {
  year: number;
  phase: Phase;
  phaseLabel: string;
  teamIndex: number;
  teamName: string;
  franchiseSlug: string | null;
  g: number;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
}

export interface CareerTotals {
  g: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
}

export interface PlayerChampionship {
  year: number;
  franchiseSlug: string;
}

export interface PlayerFile {
  id: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  seasons: number;
  franchiseSlugs: string[];
  teams: string[];
  /** Published totals from the league data (CAREER_DATA). Null for players that only appear in event/playoff rows. */
  career: CareerTotals | null;
  careerRegular: CareerTotals | null;
  careerPlayoffs: CareerTotals | null;
  /** Totals summed from the season lines below (franchise teams only). */
  computed: {
    regular: CareerTotals;
    playoffs: CareerTotals;
  };
  mvpYears: number[];
  championships: PlayerChampionship[];
  lines: Record<Phase, StatLine[]>;
}

export interface PlayerIndexEntry {
  id: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  franchiseSlugs: string[];
  g: number | null;
  pts: number | null;
  isMvp: boolean;
  mvpYears: number[];
}

export type LeaderCategory = 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fgPct' | 'fg3Pct' | 'ftPct';

export interface LeaderEntry {
  playerId: string;
  slug: string;
  name: string;
  franchiseSlug: string | null;
  teamName: string;
  g: number;
  value: number;
}

export interface RosterLine {
  g: number;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
}

export interface RosterEntry {
  playerId: string;
  slug: string;
  name: string;
  regular: RosterLine | null;
  playoffs: RosterLine | null;
}

export interface SeasonRoster {
  franchiseSlug: string;
  teamName: string;
  players: RosterEntry[];
}

export interface SeasonFile {
  year: number;
  champion: Champion | null;
  mvp: Mvp | null;
  hasStats: boolean;
  phaseLabels: string[];
  leaders: Record<LeaderCategory, LeaderEntry[]> | null;
  rosters: SeasonRoster[];
}

export type SeasonRecordKey = 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'pts';
export type CareerRecordKey = 'pts' | 'reb' | 'ast' | 'g' | 'seasons' | 'mvps';

export interface SeasonRecordEntry {
  playerId: string;
  slug: string;
  name: string;
  year: number;
  franchiseSlug: string | null;
  teamName: string;
  g: number;
  value: number;
}

export interface CareerRecordEntry {
  playerId: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  franchiseSlugs: string[];
  value: number;
}

export interface RecordsFile {
  minGames: number;
  season: Record<SeasonRecordKey, SeasonRecordEntry[]>;
  career: Record<CareerRecordKey, CareerRecordEntry[]>;
}

export interface FranchiseTitle {
  year: number;
  coach: string | null;
  series: string | null;
}

export interface FranchiseMvp {
  year: number;
  playerId: string | null;
  slug: string | null;
  name: string;
}

export interface FranchiseLeaderEntry {
  playerId: string;
  slug: string;
  name: string;
  seasons: number;
  g: number;
  value: number;
}

export interface FranchisePlayer {
  id: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  seasons: number;
}

export interface FranchiseFile extends Franchise {
  titles: FranchiseTitle[];
  mvps: FranchiseMvp[];
  leaders: {
    pts: FranchiseLeaderEntry[];
    reb: FranchiseLeaderEntry[];
    ast: FranchiseLeaderEntry[];
  };
  players: FranchisePlayer[];
}
