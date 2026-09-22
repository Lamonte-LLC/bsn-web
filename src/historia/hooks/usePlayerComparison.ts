import { PLAYER_COMPARISON } from '@/graphql/player';
import { useQuery } from '@apollo/client/react';
import { CAREER_SCOPE, EMPTY_VALUES, dominantTeam, editionLabel, type CompareValues } from '@/historia/lib/compare-players';
import { EXTINCT_CODE_COLORS } from '@/archivo/lib/tokens';

type SeasonStats = {
  games: number | null;
  minutesAvg: number | null;
  points: number | null;
  pointsAvg: number | null;
  fieldGoalsMade: number | null;
  fieldGoalsAttempted: number | null;
  fieldGoalsPercentage: number | null;
  threePointersMade: number | null;
  threePointersAttempted: number | null;
  threePointersPercentage: number | null;
  freeThrowsMade: number | null;
  freeThrowsAttempted: number | null;
  freeThrowsPercentage: number | null;
  reboundsTotal: number | null;
  reboundsTotalAvg: number | null;
  assists: number | null;
  assistsAvg: number | null;
  turnoversAvg: number | null;
  steals: number | null;
  stealsAvg: number | null;
  blocks: number | null;
  blocksAvg: number | null;
};

export type SeasonPlayed = { providerId: string; name: string; year: number; current: boolean };

export type SeasonTeam = { providerId: string; code: string; name: string; nickname: string; colorPrimary: string };

type StatsBySeasonNode = {
  season: SeasonPlayed & { isActive: boolean; isPlayoffs: boolean };
  teams: SeasonTeam[];
  stats: SeasonStats;
};

type PlayerComparisonResponse = {
  player: {
    providerId: string;
    name: string;
    avatarUrl: string | null;
    statsBySeasonConnection: { edges: { node: StatsBySeasonNode }[] };
    careerStats: SeasonStats;
  } | null;
};

function toCompareValues(stats: SeasonStats): CompareValues {
  return {
    g: stats.games,
    min: stats.minutesAvg,
    ppg: stats.pointsAvg,
    rpg: stats.reboundsTotalAvg,
    apg: stats.assistsAvg,
    spg: stats.stealsAvg,
    bpg: stats.blocksAvg,
    topg: stats.turnoversAvg,
    fgPct: stats.fieldGoalsPercentage,
    fg3Pct: stats.threePointersPercentage,
    ftPct: stats.freeThrowsPercentage,
    pts: stats.points,
    reb: stats.reboundsTotal,
    ast: stats.assists,
    stl: stats.steals,
    blk: stats.blocks,
    fgm: stats.fieldGoalsMade,
    fga: stats.fieldGoalsAttempted,
    fg3m: stats.threePointersMade,
    fg3a: stats.threePointersAttempted,
    ftm: stats.freeThrowsMade,
    fta: stats.freeThrowsAttempted,
  };
}

/**
 * One player's stats across every regular-season edition they played (playoff editions are excluded — the
 * comparison only shows "serie regular"). Fetched once per player (no season filter); the caller picks the
 * edition for the currently selected scope client-side.
 */
export function usePlayerComparison(providerId: string | null) {
  const { data, loading, error } = useQuery<PlayerComparisonResponse>(PLAYER_COMPARISON, {
    variables: { providerId },
    skip: !providerId,
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error(error);
  }

  const editions = (data?.player?.statsBySeasonConnection.edges ?? [])
    .map((edge) => edge.node)
    .filter((node) => !node.season.isPlayoffs)
    .sort((a, b) => b.season.year - a.season.year);

  const seasons: SeasonPlayed[] = editions.map((e) => e.season);
  const currentSeasonProviderId = seasons.find((s) => s.current)?.providerId ?? seasons[0]?.providerId ?? null;

  const editionFor = (seasonProviderId: string | null) => editions.find((e) => e.season.providerId === seasonProviderId) ?? null;

  const valuesFor = (seasonProviderId: string | null): CompareValues => {
    if (seasonProviderId === CAREER_SCOPE) return data?.player ? toCompareValues(data.player.careerStats) : EMPTY_VALUES;
    const edition = editionFor(seasonProviderId);
    return edition ? toCompareValues(edition.stats) : EMPTY_VALUES;
  };

  // La carrera no tiene un equipo fijo (el jugador pudo pasar por varios) — sin equipos, el color cae al
  // fallback del jugador en quien consume teamsFor.
  const teamsFor = (seasonProviderId: string | null): SeasonTeam[] => (seasonProviderId === CAREER_SCOPE ? [] : (editionFor(seasonProviderId)?.teams ?? []));

  const seasonFor = (seasonProviderId: string | null): SeasonPlayed | null => (seasonProviderId === CAREER_SCOPE ? null : (editionFor(seasonProviderId)?.season ?? null));

  // "2006 - ARE": the year and the club's code, the way the season menu and the tabs name an edition.
  const nameFor = (seasonProviderId: string | null): string => {
    if (seasonProviderId === CAREER_SCOPE) return 'Carrera';
    const edition = editionFor(seasonProviderId);
    return edition ? editionLabel(edition.season.year, edition.teams.map((t) => t.code)) : '';
  };
  const labelFor = (seasonProviderId: string): string => nameFor(seasonProviderId);

  // The club the player is identified with across the comparison: most seasons, most recent on a tie.
  const main = dominantTeam(editions.map((e) => ({ year: e.season.year, teams: e.teams })));
  const mainColor: string | null = main ? (main.colorPrimary || EXTINCT_CODE_COLORS[main.code] || null) : null;

  return { seasons, currentSeasonProviderId, valuesFor, teamsFor, seasonFor, nameFor, labelFor, mainTeam: main, mainColor, loading, error };
}
