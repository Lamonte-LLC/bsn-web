import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import MatchInfoCard from '@/match/components/MatchInfoCard';
import CompletedMatchScoreBoard from '@/match/components/scoreboard/CompletedMatchScoreBoard';
import MatchQuarterScoreBoard from '@/match/components/scoreboard/MatchQuarterScoreBoard';
import MatchBoxScoreWidget from '../../containers/MatchBoxScoreWidget';
import MatchGameLeadersSection, {
  type MatchGameLeaderPlayerBoxScore,
} from '@/match/components/stats/MatchGameLeadersSection';
import AdSlot from '@/shared/client/components/gtm/AdSlot';

import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import { MatchType } from '@/match/types';
import MatchYoutubeVideoCard from '../card/MatchYoutubeVideoCard';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import WSCBlazeSDK from '@/shared/client/components/wsc/WSCBlazeSDK';
import MatchWscStoriesWidget from '../MatchWscStoriesWidget';

/**
 * Partido finalizado: parciales Q1–Q4 / OT desde `match.periods` (cargados en el servidor
 * con `MATCH_PERIODS_BOXSCORE` en `/partidos/[id]`).
 */
type Props = {
  match: MatchType;
  /** Todas las listas: líderes de este partido (`matchLeadersConnection`), no de liga ni un solo equipo. */
  pointsLeaders?: MatchGameLeaderPlayerBoxScore[];
  reboundsLeaders?: MatchGameLeaderPlayerBoxScore[];
  assistsLeaders?: MatchGameLeaderPlayerBoxScore[];
  stealsLeaders?: MatchGameLeaderPlayerBoxScore[];
  blocksLeaders?: MatchGameLeaderPlayerBoxScore[];
  threePointersMadeLeaders?: MatchGameLeaderPlayerBoxScore[];
};

export default function CompletedMatchPage({
  match,
  pointsLeaders = [],
  reboundsLeaders = [],
  assistsLeaders = [],
  stealsLeaders = [],
  blocksLeaders = [],
  threePointersMadeLeaders = [],
}: Props) {
  const periodQuarters =
    match.periods?.map((period) => ({
      periodNumber: period.periodNumber,
      periodType: period.periodType,
      homeTeam: { score: period.homeTeam.score },
      visitorTeam: { score: period.visitorTeam.score },
    })) ?? [];

  return (
    <FullWidthLayout
      divider
      subheader={
        <section>
          <div className="container">
            <div className="mx-auto py-[32px] md:py-[42px] xl:py-[52px] lg:w-9/12 xl:w-8/12">
              <CompletedMatchScoreBoard
                startAt={match.startAt}
                homeTeam={{
                  code: match.homeTeam.code,
                  nickname: match.homeTeam.nickname,
                  score: match.homeTeam.score,
                  city: match.homeTeam.city,
                  color: match.homeTeam.color,
                }}
                visitorTeam={{
                  code: match.visitorTeam.code,
                  nickname: match.visitorTeam.nickname,
                  score: match.visitorTeam.score,
                  city: match.visitorTeam.city,
                  color: match.visitorTeam.color,
                }}
                venue={{ name: match.venue?.name ?? '' }}
                overtimePeriods={match.overtimePeriods}
              />
            </div>
          </div>
        </section>
      }
    >
      <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      <TabGroup>
        <TabList className="bg-bsn pb-[20px] md:pb-[28px]">
          <div className="container text-center space-x-[30px]">
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base data-selected:text-white data-selected:border-b data-selected:border-b-white md:text-[22px]">
              Resumen
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(255,255,255,0.5)] text-base data-selected:text-white data-selected:border-b data-selected:border-b-white md:text-[22px]">
              Box Score
            </Tab>
          </div>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 md:mt-[30px] lg:mt-[60px]">
                <div className="lg:col-span-8 lg:pr-16">
                  <div className="mb-[30px] lg:hidden">
                    <MatchInfoCard
                      startAt={match.startAt}
                      venue={{ name: match.venue?.name ?? '' }}
                      channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                      ticketUrl={match.homeTeam.ticketUrl}
                    />
                  </div>
                  {periodQuarters.length > 0 && (
                    <div className="mb-6 md:mb-10 lg:mb-15">
                      <div className="flex flex-row justify-between items-center mb-[12px] md:mb-[16px]">
                        <div>
                          <h3 className="text-[22px] text-black md:text-[24px]">
                            Resultado por periodo
                          </h3>
                        </div>
                      </div>
                      <MatchQuarterScoreBoard
                        homeTeam={{
                          code: match.homeTeam.code,
                          nickname: match.homeTeam.nickname,
                          competitionStandings: {
                            won: match.homeTeam.competitionStandings?.won ?? 0,
                            lost:
                              match.homeTeam.competitionStandings?.lost ?? 0,
                          },
                        }}
                        visitorTeam={{
                          code: match.visitorTeam.code,
                          nickname: match.visitorTeam.nickname,
                          competitionStandings: {
                            won:
                              match.visitorTeam.competitionStandings?.won ?? 0,
                            lost:
                              match.visitorTeam.competitionStandings?.lost ??
                              0,
                          },
                        }}
                        quarters={periodQuarters}
                      />
                    </div>
                  )}
                  <div className="mb-6 md:mb-10 lg:mb-15">
                    <div className="flex flex-row justify-between items-center mb-[30px]">
                      <div>
                        <h3 className="text-[22px] text-black md:text-[24px]">
                          Mejores jugadas
                        </h3>
                      </div>
                    </div>
                    <div>
                      <MatchWscStoriesWidget matchProviderId={match.providerId} />
                    </div>
                  </div>
                  {/* Datos de `MATCH_LEADERS_STATS` en el servidor (por `matchProviderId`). */}
                  <MatchGameLeadersSection
                    pointsLeaders={pointsLeaders}
                    reboundsLeaders={reboundsLeaders}
                    assistsLeaders={assistsLeaders}
                    stealsLeaders={stealsLeaders}
                    blocksLeaders={blocksLeaders}
                    threePointersMadeLeaders={threePointersMadeLeaders}
                  />
                </div>
                <div className="lg:col-span-4">
                  {match.youtube && (
                    <div className="mb-5">
                      <MatchYoutubeVideoCard youtubeVideoId={match.youtube} />
                    </div>
                  )}
                  <div className="hidden mb-5 lg:block">
                    <MatchInfoCard
                      startAt={match.startAt}
                      venue={{ name: match.venue?.name ?? '' }}
                      channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                      ticketUrl={match.homeTeam.ticketUrl}
                    />
                  </div>
                  <div className="mb-10 md:mb-4">
                    <div className="flex justify-center">
                      <AdSlot
                        adUnit="/23296921845/300-250"
                        size={[300, 250]}
                        elementId={`match-gpt-ad-300-250-${match.providerId}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="container">
              <MatchBoxScoreWidget match={match} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </FullWidthLayout>
  );
}
