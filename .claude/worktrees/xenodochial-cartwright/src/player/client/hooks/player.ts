import {
  PLAYER_ALL_SEASONS_AVG_STATS,
  PLAYER_ALL_SEASONS_TOTAL_STATS,
  PLAYER_MATCHES,
  PLAYER_SEASON_AVG_STATS,
  PLAYER_SEASON_TOTAL_STATS,
} from '@/graphql/player';
import {
  PlayerMatchesConnectionType,
  PlayerMatchType,
  PlayerStatsType,
  PlayerType,
  TeamType,
} from '@/player/types';
import { SeasonType } from '@/season/types';
import { useQuery } from '@apollo/client/react';

type PlayerPageResponse = {
  player: PlayerType;
};

export const usePlayerAvgStats = (
  playerProviderId: string,
  seasonProviderId: string,
) => {
  const { data, loading, error } = useQuery<PlayerPageResponse>(
    PLAYER_SEASON_AVG_STATS,
    {
      variables: {
        geniusId: 0,
        providerId: playerProviderId,
        seasonProviderId,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data ?? { player: {} as PlayerType },
    loading,
    error,
  };
};

export const usePlayerTotalStats = (
  playerProviderId: string,
  seasonProviderId: string,
) => {
  const { data, loading, error } = useQuery<PlayerPageResponse>(
    PLAYER_SEASON_TOTAL_STATS,
    {
      variables: {
        geniusId: 0,
        providerId: playerProviderId,
        seasonProviderId,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data ?? { player: {} as PlayerType },
    loading,
    error,
  };
};

export const usePlayerMatches = (
  playerProviderId: string,
  first: number = 10,
) => {
  const { data, loading, error, fetchMore } =
    useQuery<PlayerMatchesConnectionType>(PLAYER_MATCHES, {
      variables: { playerProviderId, first },
      fetchPolicy: 'network-only',
    });

  if (error) {
    console.error(error);
  }

  const playerMatches: PlayerMatchType[] =
    data?.playerMatchesConnection?.edges?.map((e) => e.node) ?? [];
  const hasNextPage =
    data?.playerMatchesConnection?.pageInfo?.hasNextPage ?? false;
  const endCursor = data?.playerMatchesConnection?.pageInfo?.endCursor ?? null;

  const loadMore = () => {
    if (!hasNextPage || !endCursor) return;
    fetchMore({
      variables: { after: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          playerMatchesConnection: {
            ...fetchMoreResult.playerMatchesConnection,
            edges: [
              ...prev.playerMatchesConnection.edges,
              ...fetchMoreResult.playerMatchesConnection.edges,
            ],
          },
        };
      },
    });
  };

  return {
    playerMatches,
    loading,
    error,
    hasNextPage,
    loadMore,
  };
};

type PlayerSeasonStatsResponse = {
  playerStatsConnection: {
    edges: {
      node: {
        player: PlayerType;
        team: TeamType;
        season: SeasonType;
        stats: PlayerStatsType;
      };
    }[];
  };
};

export const usePlayerAllSeasonsAvgStats = (playerProviderId: string) => {
  const { data, loading, error } = useQuery<PlayerSeasonStatsResponse>(
    PLAYER_ALL_SEASONS_AVG_STATS,
    {
      variables: { playerProviderId },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data:
      data?.playerStatsConnection?.edges?.map((e) => ({
        player: e.node.player,
        team: e.node.team,
        season: e.node.season,
        stats: e.node.stats,
      })) ?? [],
    loading,
    error,
  };
};

export const usePlayerAllSeasonsTotalStats = (playerProviderId: string) => {
  const { data, loading, error } = useQuery<PlayerSeasonStatsResponse>(
    PLAYER_ALL_SEASONS_TOTAL_STATS,
    {
      variables: { playerProviderId },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  return {
    data: data?.playerStatsConnection?.edges?.map((e) => ({
      player: e.node.player,
      team: e.node.team,
      season: e.node.season,
      stats: e.node.stats,
    })) ?? [],
    loading,
    error,
  };
};
