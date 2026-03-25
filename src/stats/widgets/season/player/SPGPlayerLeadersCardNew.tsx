import numeral from 'numeral';
import SeasonPlayerLeadersCard from '@/stats/components/season/leader/player/SeasonPlayerLeadersCard';
import { getClient } from '@/apollo-client';
import { SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY } from '@/graphql/stats';
import { TopPlayerLeaderStatsType } from '@/stats/types';

const ITEMS_PER_PAGE = 5;

type PlayerLeadersResponse = {
  seasonPlayerStatsConnection: {
    edges: { node: TopPlayerLeaderStatsType }[];
  };
};

const fetchTopPlayerLeaders = async (): Promise<TopPlayerLeaderStatsType[]> => {
  const { data, error } = await getClient().query<PlayerLeadersResponse>({
    query: SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY,
    variables: { statsCode: 'STEALS_AVG', first: ITEMS_PER_PAGE },
    fetchPolicy: 'network-only',
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return (
    data?.seasonPlayerStatsConnection.edges.map(
      (edge: { node: TopPlayerLeaderStatsType }) => edge.node,
    ) ?? []
  );
};

export default async function SPGPlayerLeadersCardNew() {
  const data: TopPlayerLeaderStatsType[] = await fetchTopPlayerLeaders();

  return (
    <SeasonPlayerLeadersCard
      title="Robos por juego"
      subtitle="SPG"
      data={data.map((item, index) => ({
        position: index + 1,
        player: {
          id: item.player.providerId,
          avatarUrl: item.player.avatarUrl,
          name: item.player.name,
          team: {
            code: item.player.teamCode,
            name: item.player.teamCode,
          },
        },
        statValue: numeral(item.value).format('0.0'),
      }))}
    />
  );
}
