import { useCallback } from 'react';
import { PLAYER_SUGGESTIONS } from '@/graphql/player';
import { useQuery } from '@apollo/client/react';

type Node = { providerId: string; avatarUrl: string | null; name: string; nickname: string | null; playingPosition: string };
type Response = { playersConnection: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; edges: { node: Node }[] } };

const PAGE = 50;

/**
 * Every player of the API from A to Z, one page at a time: the picker shows them under the featured list and
 * asks for the next page as the fan scrolls. `skip` keeps the query idle until the list is actually visible.
 */
export function useAllPlayers(skip: boolean) {
  const { data, loading, error, fetchMore } = useQuery<Response>(PLAYER_SUGGESTIONS, {
    variables: { first: PAGE },
    skip,
    notifyOnNetworkStatusChange: true,
  });
  if (error) console.error(error);

  // Apollo Client 4 dropped `updateQuery` from fetchMore: pages are merged by the cache's field policy for
  // `playersConnection` (src/apollo/createInMemoryCache.ts), which also keeps the newest pageInfo, so the
  // cursor read here always points at the end of what is loaded.
  const pageInfo = data?.playersConnection.pageInfo;
  const players: Node[] = data?.playersConnection.edges.map((e) => e.node) ?? [];
  const hasMore = Boolean(pageInfo?.hasNextPage);

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor || loading) return;
    void fetchMore({ variables: { first: PAGE, after: pageInfo.endCursor } });
  }, [fetchMore, loading, pageInfo]);

  return { players, loading, hasMore, loadMore };
}
