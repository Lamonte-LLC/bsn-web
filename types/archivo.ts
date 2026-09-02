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
  /** 'bsn-web' = official color from the site; 'prototype' = placeholder color from the league prototype, not official. */
  colorSource: 'bsn-web' | 'prototype' | null;
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
  /** Nickname as it appears in the league data (e.g. "Vaqueros", "Fénix"). */
  name: string;
  /** Full club name (e.g. "Vaqueros de Bayamón", "Fénix de Vega Baja"). */
  fullName: string;
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
  /** Playing position from the league prototype (e.g. "Base", "Delantero"). */
  position: string | null;
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

// ---- Season results (standings, games, playoffs). Real from the BSN GraphQL backend where it exists,
// ---- otherwise FPO placeholder data flagged with `fpo: true` so the UI can badge it.

export type ResultsSource = 'bsn-graphql' | 'fpo';

export interface SeasonStanding {
  franchiseSlug: string | null;
  code: string;
  name: string;
  group: string | null;
  position: number | null;
  positionInGroup: number | null;
  won: number;
  lost: number;
  pointsAverage: number | null;
}

export interface GameTeam {
  franchiseSlug: string | null;
  code: string;
  name: string;
  score: number | null;
}

export interface SeasonGame {
  id: string;
  /** ISO 8601 with offset, as delivered by the backend. */
  date: string;
  phase: 'regular' | 'playoffs' | 'other';
  status: string;
  home: GameTeam;
  visitor: GameTeam;
  venue: string | null;
  seriesId: string | null;
  gameNumber: number | null;
  isFinals: boolean;
}

export interface SeriesCompetitor {
  franchiseSlug: string | null;
  code: string;
  won: number;
  lost: number;
  seed: number | null;
}

export interface SeasonSeries {
  id: string;
  name: string;
  round: number;
  group: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  competitors: SeriesCompetitor[];
  winnerSlug: string | null;
}

export interface LiveRosterEntry {
  franchiseSlug: string | null;
  code: string;
  playerProviderId: string;
  /** bsn_data player id when the name matched exactly one archive player, else null. */
  playerId: string | null;
  slug: string | null;
  name: string;
  position: string | null;
  jerseyNumber: string | null;
  nationality: string | null;
  dob: string | null;
  height: number | null;
  avatarUrl: string | null;
}

export interface LivePlayerStats {
  franchiseSlug: string | null;
  code: string;
  playerProviderId: string;
  playerId: string | null;
  slug: string | null;
  name: string;
  g: number;
  minutesAvg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
}

export interface ResultsFpoFlags {
  standings: boolean;
  games: boolean;
  series: boolean;
  rosters: boolean;
  playerStats: boolean;
}

export interface SeasonResults {
  source: ResultsSource;
  /** True on any block that is placeholder data, never real. */
  fpo: ResultsFpoFlags;
  seasonProviderId: string | null;
  fetchedAt: string | null;
  standings: SeasonStanding[];
  games: SeasonGame[];
  series: SeasonSeries[];
  rosters: LiveRosterEntry[];
  playerStats: LivePlayerStats[];
  playerStatsPlayoffs: LivePlayerStats[];
}

export interface SeasonFile {
  year: number;
  champion: Champion | null;
  mvp: Mvp | null;
  hasStats: boolean;
  phaseLabels: string[];
  leaders: Record<LeaderCategory, LeaderEntry[]> | null;
  rosters: SeasonRoster[];
  /** Filled by etl-results.ts; null before it runs and for seasons with neither real nor FPO results. */
  results: SeasonResults | null;
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

// ---- Insights (data/archivo/insights/**), built by scripts/archivo/build-insights.ts ----

export interface CoachChampionship {
  year: number;
  franchiseSlug: string | null;
  franchiseName: string;
  series: string | null;
  coCoach: string | null;
}

export interface CoachInsight {
  name: string;
  titles: number;
  championships: CoachChampionship[];
}

export interface MvpChampionYear {
  year: number;
  mvp: { playerId: string | null; slug: string | null; name: string; franchiseSlugs: string[] };
  champion: { franchiseSlug: string | null; name: string };
  overlap: boolean;
}

export interface MvpChampionOverlapFile {
  totalYears: number;
  overlapYears: number;
  overlapPct: number;
  longestOverlapStreak: { length: number; from: number; to: number } | null;
  longestNoOverlapStreak: { length: number; from: number; to: number } | null;
  years: MvpChampionYear[];
}

export interface MultiMvpEntry {
  playerId: string | null;
  slug: string | null;
  name: string;
  count: number;
  mvps: Array<{ year: number; franchiseSlug: string | null }>;
  distinctFranchises: number;
  wonWithMultipleTeams: boolean;
}

export interface LongevityEntry {
  playerId: string;
  slug: string;
  name: string;
  seasons: number;
  g: number;
  fy: number;
  ly: number;
  span: number;
  franchiseSlugs: string[];
}

export interface LongevityFile {
  bySeasons: LongevityEntry[];
  byGames: LongevityEntry[];
}

export interface LoyaltyEntry {
  playerId: string;
  slug: string;
  name: string;
  seasons: number;
  franchiseSlugs: string[];
}

export interface LoyaltyFile {
  minSeasons: number;
  oneClub: LoyaltyEntry[];
  journeymen: LoyaltyEntry[];
}

export interface ScoringSeason {
  playerId: string;
  slug: string;
  name: string;
  year: number;
  franchiseSlug: string | null;
  ppg: number;
  g: number;
}

export interface ScoringClubFile {
  minGames: number;
  thresholds: number[];
  byThreshold: Record<string, ScoringSeason[]>;
  byDecade: Array<{ decade: number; counts: Record<string, number> }>;
}

export interface DecadeRecord {
  playerId: string | null;
  slug: string | null;
  name: string | null;
  year: number | null;
  franchiseSlug: string | null;
  value: number | null;
  reason: 'no data' | null;
}

export interface RecordsByDecadeFile {
  minGames: number;
  categories: SeasonRecordKey[];
  decades: Array<{ decade: number; records: Record<SeasonRecordKey, DecadeRecord> }>;
}

export interface CareerArcPoint {
  seasonNumber: number;
  year: number;
  franchiseSlug: string | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  g: number;
}

export interface CareerArc {
  playerId: string;
  slug: string;
  name: string;
  peakSeason: number | null;
  arc: CareerArcPoint[];
}

export interface CareerArcIndexEntry {
  playerId: string;
  slug: string;
  name: string;
  seasons: number;
  peakSeason: number | null;
  file: string;
}

export interface SimilarPlayer {
  playerId: string;
  slug: string;
  name: string;
  score: number;
  sharedDimensions: number;
}

export type SimilarityFile = Record<string, SimilarPlayer[]>;

export interface FranchiseSeasonRecord {
  year: number;
  won: number;
  lost: number;
  position: number | null;
  group: string | null;
  fpo: boolean;
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
  /** Filled by etl-results.ts (2015 onward). */
  seasonRecords: FranchiseSeasonRecord[];
}
