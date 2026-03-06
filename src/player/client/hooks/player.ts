import { PLAYER_MATCHES, PLAYER_SEASON_STATS } from '@/graphql/player';
import { PlayerMatchesConnectionType, PlayerMatchType, PlayerType } from '@/player/types';
import { useQuery } from '@apollo/client/react';

type PlayerPageResponse = {
  player: PlayerType;
};

export const usePlayerStats = (playerProviderId: string, seasonProviderId: string) => {
  const { data, loading, error } = useQuery<PlayerPageResponse>(
    PLAYER_SEASON_STATS,
    {
      variables: { geniusId: 0, providerId: playerProviderId, seasonProviderId },
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

export const usePlayerMatches = (playerProviderId: string, first: number = 10) => {
  const { data, loading, error, fetchMore } = useQuery<PlayerMatchesConnectionType>(
    PLAYER_MATCHES,
    {
      variables: { playerProviderId, first },
      fetchPolicy: 'network-only',
    },
  );

  if (error) {
    console.error(error);
  }

  const playerMatches: PlayerMatchType[] = data?.playerMatchesConnection?.edges?.map(e => e.node) ?? [];
  const hasNextPage = data?.playerMatchesConnection?.pageInfo?.hasNextPage ?? false;
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
