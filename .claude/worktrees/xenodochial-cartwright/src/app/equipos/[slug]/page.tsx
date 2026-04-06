import Link from 'next/link';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { getClient } from '@/apollo-client';
import {
  TEAM_DETAIL,
  TEAM_RECENT_CALENDAR,
  TEAM_UPCOMING_CALENDAR,
} from '@/graphql/team';
import TeamWscStoriesWidget from '@/team/client/widgets/TeamWscStoriesWidget';
import ScheduledMatchCardInline from '@/match/components/calendar/ScheduledMatchCardInline';
import CompletedMatchCardBasic from '@/match/components/card/CompletedMatchCardBasic';
import { MatchType } from '@/match/types';
import WSCBlazeSDK from '@/shared/client/components/wsc/WSCBlazeSDK';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import TeamCalendarWidget from '@/team/client/widgets/TeamCalendarWidget';
import TeamLeadersWidget from '@/team/client/widgets/TeamLeadersWidget';
import TeamPlayersStatsWidget from '@/team/client/widgets/TeamPlayersStatsWidget';
import TeamPlayersWidget from '@/team/client/widgets/TeamPlayersWidget';
import TeamSeasonStatsWidget from '@/team/client/widgets/TeamSeasonStatsWidget';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import TeamExternalLinksCard from '@/team/components/card/TeamExternalLinksCard';
import TeamLeadersCard from '@/team/components/card/TeamLeadersCard';
import { TeamType } from '@/team/types';
import { ordinalNumber } from '@/utils/number-formater';
import { getFirstWord } from '@/utils/text';
import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import { SeasonType } from '@/season/types';
import { CURRENT_SEASON, LAST_SEASON } from '@/graphql/season';

type TeamPageResponse = {
  team: TeamType;
  teamUpcomingCalendar: MatchType[];
  teamRecentCalendar: MatchType[];
};

type TeamRecentCalendarResponse = {
  teamRecentCalendarConnection: {
    edges: {
      node: MatchType;
    }[];
  };
};

type TeamUpcomingCalendarResponse = {
  teamUpcomingCalendarConnection: {
    edges: {
      node: MatchType;
    }[];
  };
};

const fetchTeam = async (code: string): Promise<TeamPageResponse> => {
  const { data, error } = await getClient().query<TeamPageResponse>({
    query: TEAM_DETAIL,
    variables: { code: code.toUpperCase() },
  });

  if (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch match data');
  }

  const team = data?.team;

  if (team == null) {
    console.error('No team data found for code:', code);
    throw new Error('Team not found');
  }

  const teamPageResponse: TeamPageResponse = {
    team,
    teamUpcomingCalendar: [],
    teamRecentCalendar: [],
  };

  const { data: teamRecentCalendarData } =
    await getClient().query<TeamRecentCalendarResponse>({
      query: TEAM_RECENT_CALENDAR,
      variables: {
        code: team.code,
        first: 5,
      },
    });

  teamPageResponse.teamRecentCalendar =
    teamRecentCalendarData?.teamRecentCalendarConnection.edges.map(
      (edge) => edge.node,
    ) || [];

  const { data: teamUpcomingCalendarData } =
    await getClient().query<TeamUpcomingCalendarResponse>({
      query: TEAM_UPCOMING_CALENDAR,
      variables: {
        code: team.code,
        first: 3,
      },
    });

  teamPageResponse.teamUpcomingCalendar =
    teamUpcomingCalendarData?.teamUpcomingCalendarConnection.edges.map(
      (edge) => edge.node,
    ) || [];

  return teamPageResponse;
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

type LastSeasonResponse = {
  lastSeason?: SeasonType;
};

const fetchLastSeason = async (): Promise<SeasonType | null> => {
  const { data, error } = await getClient().query<LastSeasonResponse>({
    query: LAST_SEASON,
  });

  if (error) {
    console.error('Error fetching last season:', error);
    return null;
  }
  return data?.lastSeason ?? null;
}

export default async function DetalleEquipoPage({
  params,
}: PageProps<'/equipos/[slug]'>) {
  const { slug } = await params;
  const data: TeamPageResponse = await fetchTeam(slug);
  const currentSeason: SeasonType | null = await fetchCurrentSeason();
  const lastSeason: SeasonType | null = await fetchLastSeason();

  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container">
          <div className="mx-auto pb-[20px] pt-[25px] md:py-[42px] xl:py-[38px] lg:w-9/12 xl:w-8/12">
            <div className="flex items-center justify-center mb-[18px]">
              <div
                className="border border-2 w-[90px] h-[90px] rounded-full flex items-center justify-center md:w-[120px] md:h-[120px]"
                style={{ borderColor: data.team.colorPrimary || 'rgba(255, 255, 255, 0.5)' }}
              >
                <figure className="hidden md:block">
                  <TeamLogoAvatar teamCode={data.team.code} size={68} />
                </figure>
                <figure className="md:hidden">
                  <TeamLogoAvatar teamCode={data.team.code} size={50} />
                </figure>
              </div>
            </div>
            <div>
              <div className="mb-[3px]">
                <h2 className="text-center text-white text-[24px]/8 lg:text-[42px]/14">
                  {data.team.name}
                </h2>
              </div>
              <p className="font-barlow text-center text-[13px] text-[rgba(255,255,255,0.7)] md:text-base">
                {data.team.competitionStandings?.won}-
                {data.team.competitionStandings?.lost}&nbsp;&nbsp;•&nbsp;&nbsp;
                {ordinalNumber(
                  data.team.competitionStandings?.positionInGroup || 0,
                )}{' '}
                lugar en Grupo {data.team.group}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      <TabGroup>
        <TabList className="bg-bsn pb-[28px]">
          <div className="container text-center space-x-[20px] md:space-x-[30px]">
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base tracking-[1%] md:text-[22px] data-selected:text-white data-selected:border-b data-selected:border-b-white">
              Resumen
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base tracking-[1%] md:text-[22px] data-selected:text-white data-selected:border-b data-selected:border-b-white">
              Calendario
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base tracking-[1%] md:text-[22px] data-selected:text-white data-selected:border-b data-selected:border-b-white">
              Jugadores
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base tracking-[1%] md:text-[22px] data-selected:text-white data-selected:border-b data-selected:border-b-white">
              Estadísticas
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base tracking-[1%] md:text-[22px] data-selected:text-white data-selected:border-b data-selected:border-b-white">
              Líderes
            </Tab>
          </div>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 md:mt-[30px] lg:mt-[60px]">
                <div className="lg:col-span-8 lg:pr-13">
                  <div className="mb-6 md:mb-10 lg:mb-15">
                    <div className="flex flex-row justify-between items-center mb-[30px]">
                      <div>
                        <h3 className="text-[22px] text-black md:text-[24px]">
                          Próximo juego
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-[20px] md:space-y-[30px] lg:space-y-[50px]">
                      {data.teamUpcomingCalendar.slice(0, 1).map((match) => (
                        <ScheduledMatchCardInline
                          key={`upcoming-calendar-${match.providerId}`}
                          startAt={match.startAt}
                          homeTeam={{
                            code: match.homeTeam.code,
                            nickname: getFirstWord(match.homeTeam.nickname),
                            ticketUrl: match.homeTeam.ticketUrl || '#',
                            city: match.homeTeam.city,
                            competitionStandings: {
                              won:
                                match.homeTeam.competitionStandings?.won ?? 0,
                              lost:
                                match.homeTeam.competitionStandings?.lost ?? 0,
                            },
                          }}
                          visitorTeam={{
                            code: match.visitorTeam.code,
                            nickname: getFirstWord(match.visitorTeam.nickname),
                            ticketUrl: match.visitorTeam.ticketUrl || '#',
                            city: match.visitorTeam.city,
                            competitionStandings: {
                              won:
                                match.visitorTeam.competitionStandings?.won ??
                                0,
                              lost:
                                match.visitorTeam.competitionStandings?.lost ??
                                0,
                            },
                          }}
                          contextTeam={{
                            code: data.team.code,
                          }}
                          providerId={match.providerId}
                          mediaProvider={
                            match.channel || DEFAULT_MEDIA_PROVIDER
                          }
                        />
                      ))}
                      {data.teamUpcomingCalendar.length === 0 && (
                        <p className="text-[rgba(15,23,31,0.7)] text-[15px]">
                          No hay próximos juegos programados para este equipo.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-6 md:mb-10 lg:mb-15">
                    <div className="flex flex-row justify-between items-center mb-[20px]">
                      <div>
                        <h3 className="text-[22px] text-black md:text-[24px]">
                          Últimos resultados
                        </h3>
                      </div>
                    </div>
                    <div
                      className="flex flex-row flex-nowrap gap-[13px] overflow-x-auto"
                      style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                      }}
                    >
                      {data.teamRecentCalendar.map((match) => (
                        <Link
                          key={`recent-calendar-${match.providerId}`}
                          href={`/partidos/${match.providerId}`}
                          className="max-w-[150px]"
                        >
                          <CompletedMatchCardBasic
                            startAt={match.startAt}
                            homeTeam={{
                              code: match.homeTeam.code,
                              score: match.homeTeam.score,
                            }}
                            visitorTeam={{
                              code: match.visitorTeam.code,
                              score: match.visitorTeam.score,
                            }}
                            overtimePeriods={match.overtimePeriods}
                          />
                        </Link>
                      ))}
                    </div>
                    {data.teamRecentCalendar.length === 0 && (
                      <p className="text-[rgba(15,23,31,0.7)] text-[15px]">
                        No hay resultados recientes para este equipo.
                      </p>
                    )}
                  </div>
                  <div className="mb-6 md:mb-10 lg:mb-15">
                    <div className="flex flex-row justify-between items-center mb-[30px]">
                      <div>
                        <h3 className="text-[22px] text-black md:text-[24px]">
                          Highlights
                        </h3>
                      </div>
                    </div>
                    <div>
                      <TeamWscStoriesWidget teamProviderId={data.team.providerId} />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="mb-5">
                    <TeamLeadersCard teamCode={data.team.code} />
                  </div>
                  <div className="mb-5">
                    <TeamExternalLinksCard
                      instagramLink={data.team.socialInstagramUrl}
                      facebookLink={data.team.socialFacebookUrl}
                      youtubeLink={data.team.socialYoutubeUrl}
                      tiktokLink={data.team.socialTiktokUrl}
                      xLink={data.team.socialXUrl}
                      websiteLink={data.team.socialWebsiteUrl}
                      ticketsLink={data.team.ticketUrl}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
              <div className="container">
                <TeamCalendarWidget teamCode={data.team.code} />
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
              <div className="container">
                <div className="flex flex-row justify-between items-center mb-[30px]">
                  <div>
                    <h3 className="text-[22px] text-black md:text-[24px]">
                      Jugadores
                    </h3>
                  </div>
                  <div>
                    <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">
                      {lastSeason?.name ?? ''}
                    </p>
                  </div>
                </div>
                <TeamPlayersWidget teamCode={data.team.code} seasonProviderId={lastSeason?.providerId} />
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
              <div className="container">
                <TabGroup defaultIndex={0}>
                  <TabList
                    className="flex flex-wrap justify-center gap-[10px] mb-6 md:mb-8"
                    aria-label="Estadísticas por vista"
                  >
                    <Tab className="flex h-[35px] min-w-[170px] items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-colors data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white">
                      Equipo
                    </Tab>
                    <Tab className="flex h-[35px] min-w-[170px] items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-colors data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white">
                      Jugadores
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <TeamSeasonStatsWidget teamCode={data.team.code} />
                    </TabPanel>
                    <TabPanel>
                      <div className="flex flex-row justify-between items-center mb-[30px]">
                        <div>
                          <h3 className="text-[22px] text-black md:text-[24px]">
                            Jugadores {currentSeason ? `- ${currentSeason.name}` : ''}
                          </h3>
                        </div>
                      </div>
                      <div className="mb-6 md:mb-10 lg:mb-15">
                        <TeamPlayersStatsWidget teamCode={data.team.code} />
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6 mb-6 md:mt-[30px] md:mb-10 lg:mb-15 lg:mt-[60px]">
              <div className="container">
                <div className="flex flex-row justify-between items-center mb-[30px]">
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
                <div>
                  <TeamLeadersWidget teamCode={data.team.code} />
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </FullWidthLayout>
  );
}
