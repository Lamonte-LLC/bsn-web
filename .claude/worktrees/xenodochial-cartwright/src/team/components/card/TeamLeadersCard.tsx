import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { getClient } from '@/apollo-client';
import { TEAM_LEADERS_BASIC_STATS_CONNECTION } from '@/graphql/team';
import MatchPlayerLeadersCard from '@/stats/components/season/leader/player/MatchPlayerLeadersCard';
import { TopPlayerLeaderStatsType } from '@/stats/types';
import { CURRENT_SEASON } from '@/graphql/season';
import { SeasonType } from '@/season/types';

type Props = {
  teamCode: string;
};

const ITEMS_PER_PAGE = 3;

type PlayerLeadersResponse = {
  pointsLeaders: {
    edges: { node: TopPlayerLeaderStatsType }[];
  };
  reboundsLeaders: {
    edges: { node: TopPlayerLeaderStatsType }[];
  };
  assistsLeaders: {
    edges: { node: TopPlayerLeaderStatsType }[];
  };
};

const fetchTeamLeaders = async (
  teamCode: string,
): Promise<{
  pointsLeaders: TopPlayerLeaderStatsType[];
  reboundsLeaders: TopPlayerLeaderStatsType[];
  assistsLeaders: TopPlayerLeaderStatsType[];
}> => {
  const { data, error } = await getClient().query<PlayerLeadersResponse>({
    query: TEAM_LEADERS_BASIC_STATS_CONNECTION,
    variables: { teamCode, first: ITEMS_PER_PAGE },
  });

  if (error) {
    console.error('Error fetching data:', error);
    return {
      pointsLeaders: [],
      reboundsLeaders: [],
      assistsLeaders: [],
    };
  }

  return {
    pointsLeaders:
      data?.pointsLeaders.edges.map(
        (edge: { node: TopPlayerLeaderStatsType }) => edge.node,
      ) ?? [],
    reboundsLeaders:
      data?.reboundsLeaders.edges.map(
        (edge: { node: TopPlayerLeaderStatsType }) => edge.node,
      ) ?? [],
    assistsLeaders:
      data?.assistsLeaders.edges.map(
        (edge: { node: TopPlayerLeaderStatsType }) => edge.node,
      ) ?? [],
  };
};

type CurrentSeasonResponse = {
  currentSeason?: SeasonType;
};

const fetchCurrentSeason = async (): Promise<SeasonType | null> => {
  const { data, error } = await getClient().query<CurrentSeasonResponse>({
    query: CURRENT_SEASON,
  });

  if (error) {
    console.error('Error fetching current season:', error);
    return null;
  }
  return data?.currentSeason ?? null;
};

export default async function TeamLeadersCard({ teamCode }: Props) {
  const { pointsLeaders, reboundsLeaders, assistsLeaders } =
    await fetchTeamLeaders(teamCode);
  const currentSeason = await fetchCurrentSeason();

  return (
    <div className="flex-1 rounded-[12px] md:border md:border-[#EAEAEA] md:bg-white md:shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="mb-[18px] pt-[24px] flex flex-row justify-between items-center md:px-[30px] md:mb-0">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Líderes del equipo
          </h3>
        </div>
        <div>
          <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">
            Temporada {currentSeason ? `- ${currentSeason.name}` : ''}
          </p>
        </div>
      </div>
      <div className="md:pb-[30px] md:pt-[20px] md:px-[30px]">
        <TabGroup>
          <TabList className="space-x-[8px] mb-[24px]">
            <Tab className="border border-[#D5D5D5] cursor-pointer rounded-[100px] px-[20px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:bg-[#0F171F] data-selected:text-white data-selected:border-[#0F171F]">
              Puntos
            </Tab>
            <Tab className="border border-[#D5D5D5] cursor-pointer rounded-[100px] px-[20px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:bg-[#0F171F] data-selected:text-white data-selected:border-[#0F171F]">
              Rebotes
            </Tab>
            <Tab className="border border-[#D5D5D5] cursor-pointer rounded-[100px] px-[20px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] data-selected:bg-[#0F171F] data-selected:text-white data-selected:border-[#0F171F]">
              Asistencias
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <MatchPlayerLeadersCard
                title="Puntos por juego"
                data={pointsLeaders.map((leader, index) => ({
                  position: index + 1,
                  player: {
                    id: leader.player.providerId,
                    avatarUrl: leader.player.avatarUrl ?? '',
                    name: leader.player.name,
                  },
                  statValue: leader.value,
                }))}
              />
            </TabPanel>
            <TabPanel>
              <MatchPlayerLeadersCard
                title="Rebotes por juego"
                data={reboundsLeaders.map((leader, index) => ({
                  position: index + 1,
                  player: {
                    id: leader.player.providerId,
                    avatarUrl: leader.player.avatarUrl ?? '',
                    name: leader.player.name,
                  },
                  statValue: leader.value,
                }))}
              />
            </TabPanel>
            <TabPanel>
              <MatchPlayerLeadersCard
                title="Asistencias por juego"
                data={assistsLeaders.map((leader, index) => ({
                  position: index + 1,
                  player: {
                    id: leader.player.providerId,
                    avatarUrl: leader.player.avatarUrl ?? '',
                    name: leader.player.name,
                  },
                  statValue: leader.value,
                }))}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
