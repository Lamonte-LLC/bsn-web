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

type PlayerComparisonResponse = {
  player: {
    providerId: string;
    name: string;
    avatarUrl: string | null;
    seasonStats: SeasonStats | null;
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

/** Skips the request entirely while either id is missing (empty slot, or season not resolved yet). */
export function usePlayerComparison(providerId: string | null, seasonProviderId: string | null) {
  const { data, loading, error } = useQuery<PlayerComparisonResponse>(PLAYER_COMPARISON, {
    variables: { providerId, seasonProviderId },
    skip: !providerId || !seasonProviderId,
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error(error);
  }

  const stats = data?.player?.seasonStats;
  return { values: stats ? toCompareValues(stats) : EMPTY_VALUES, loading, error };
}
