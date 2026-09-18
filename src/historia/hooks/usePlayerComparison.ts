import { PLAYER_COMPARISON } from '@/graphql/player';
import { useQuery } from '@apollo/client/react';
import { EMPTY_VALUES, type CompareValues } from '@/historia/lib/compare-players';

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
    const edition = editionFor(seasonProviderId);
    return edition ? toCompareValues(edition.stats) : EMPTY_VALUES;
  };

  const teamsFor = (seasonProviderId: string | null): SeasonTeam[] => editionFor(seasonProviderId)?.teams ?? [];

  const seasonFor = (seasonProviderId: string | null): SeasonPlayed | null => editionFor(seasonProviderId)?.season ?? null;

  const nameFor = (seasonProviderId: string | null): string => seasonFor(seasonProviderId)?.name ?? '';

  return { seasons, currentSeasonProviderId, valuesFor, teamsFor, seasonFor, nameFor, loading, error };
}
