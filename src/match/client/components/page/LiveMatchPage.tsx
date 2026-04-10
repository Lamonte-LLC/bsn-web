'use client';

/**
 * Partido en vivo: se añadieron props de líderes del juego (misma fuente que partido finalizado)
 * y el bloque UI en `MatchGameLeadersSection`.
 */
import { MatchType } from '@/match/types';
import LiveMatchScoreBoardWidget from '../../containers/LiveMatchScoreBoardWidget';
// Widget de box score básico en vivo desactivado (sustituido en parte por comparación de equipos + líderes).
// import LiveMatchBasicBoxScoreBasicWidget from '../../containers/LiveMatchBoxScoreBasicWidget';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import MatchInfoCard from '@/match/components/MatchInfoCard';
import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import AdSlot from '@/shared/client/components/gtm/AdSlot';
import WSCBlazeSDK from '@/shared/client/components/wsc/WSCBlazeSDK';
import { LiveMatchStream } from '../media/LiveMatchStream';
import MatchWscStoriesWidget from '../MatchWscStoriesWidget';
import MatchBoxScoreWidget from '../../containers/MatchBoxScoreWidget';
import MatchTeamStatsComparison from '@/match/components/stats/MatchTeamStatsComparison';
import MatchGameLeadersSection, {
  type MatchGameLeaderPlayerBoxScore,
} from '@/match/components/stats/MatchGameLeadersSection';
import LiveMatchSectionErrorBoundary from '../LiveMatchSectionErrorBoundary';

type Props = {
  match: MatchType;
  homeTeamBoxScore?: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
  };
  visitorTeamBoxScore?: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
  };
  /** Líderes del encuentro en curso (`matchLeadersConnection`); vacíos hasta que haya box por jugador. */
  pointsLeaders?: MatchGameLeaderPlayerBoxScore[];
  reboundsLeaders?: MatchGameLeaderPlayerBoxScore[];
  assistsLeaders?: MatchGameLeaderPlayerBoxScore[];
  stealsLeaders?: MatchGameLeaderPlayerBoxScore[];
  blocksLeaders?: MatchGameLeaderPlayerBoxScore[];
  threePointersMadeLeaders?: MatchGameLeaderPlayerBoxScore[];
};

export default function LiveMatchPage({
  match,
  homeTeamBoxScore,
  visitorTeamBoxScore,
  pointsLeaders = [],
  reboundsLeaders = [],
  assistsLeaders = [],
  stealsLeaders = [],
  blocksLeaders = [],
  threePointersMadeLeaders = [],
}: Props) {
  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pb-[170px] md:pb-[310px]">
          <div className="container">
            <div className="mx-auto py-[32px] md:py-[42px] xl:py-[52px] lg:w-9/12 xl:w-8/12">
              <LiveMatchSectionErrorBoundary
                resetKey={match.providerId}
                tone="dark"
                fallbackTitle="No se pudo mostrar el marcador. Actualiza en unos segundos."
              >
                <LiveMatchScoreBoardWidget matchProviderId={match.providerId} />
              </LiveMatchSectionErrorBoundary>
            </div>
          </div>
        </section>
      }
    >
      <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      <div className="-mt-[170px] md:-mt-[316px]">
        <div className="container">
          <div className="mb-[26px] mx-auto md:mb-[40px] md:w-[688px]">
            <LiveMatchStream
              streamUrl={
                match.streamUrl ??
                match.homeTeam.streamUrl ??
                match.visitorTeam.streamUrl
              }
            />
          </div>
        </div>
      </div>
      <TabGroup defaultIndex={1}>
        <TabList>
          <div className="container text-center space-x-[30px]">
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(0,0,0,0.5)] text-base md:text-[22px] data-selected:text-black data-selected:border-b-2 data-selected:border-b-black">
              En vivo
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(0,0,0,0.5)] text-base md:text-[22px] data-selected:text-black data-selected:border-b-2 data-selected:border-b-black">
              Box Score
            </Tab>
          </div>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 md:mt-[30px] lg:mt-[40px]">
                <div className="lg:col-span-8 lg:pr-16">
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
                  {/* Bloque antiguo de box score básico comentado (ver import arriba). */}
                  {/* <div className="mb-6 md:mb-10 lg:mb-15">
                    <LiveMatchBasicBoxScoreBasicWidget />
                  </div> */}
                </div>
                <div className="lg:col-span-4">
                  <div className="flex flex-col">
                    <div className="mb-[30px] order-last md:order-none md:mb-[40px]">
                      <MatchInfoCard
                        startAt={match.startAt}
                        venue={{ name: match.venue?.name ?? '' }}
                        channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                        ticketUrl={match.homeTeam.ticketUrl}
                      />
                    </div>
                    <div className="mb-6 md:mb-10 lg:mb-15">
                      <MatchTeamStatsComparison
                        homeTeam={{ code: match.homeTeam.code }}
                        visitorTeam={{ code: match.visitorTeam.code }}
                        homeTeamBoxScore={{
                          points: homeTeamBoxScore?.points ?? 0,
                          rebounds: homeTeamBoxScore?.rebounds ?? 0,
                          assists: homeTeamBoxScore?.assists ?? 0,
                          steals: homeTeamBoxScore?.steals ?? 0,
                          blocks: homeTeamBoxScore?.blocks ?? 0,
                          turnovers: homeTeamBoxScore?.turnovers ?? 0,
                        }}
                        visitorTeamBoxScore={{
                          points: visitorTeamBoxScore?.points ?? 0,
                          rebounds: visitorTeamBoxScore?.rebounds ?? 0,
                          assists: visitorTeamBoxScore?.assists ?? 0,
                          steals: visitorTeamBoxScore?.steals ?? 0,
                          blocks: visitorTeamBoxScore?.blocks ?? 0,
                          turnovers: visitorTeamBoxScore?.turnovers ?? 0,
                        }}
                      />
                    </div>
                    {/* Misma sección que en partido finalizado: estadísticas acumuladas en este juego. */}
                    <MatchGameLeadersSection
                      pointsLeaders={pointsLeaders}
                      reboundsLeaders={reboundsLeaders}
                      assistsLeaders={assistsLeaders}
                      stealsLeaders={stealsLeaders}
                      blocksLeaders={blocksLeaders}
                      threePointersMadeLeaders={threePointersMadeLeaders}
                    />
                    <div className="mb-[30px] md:mb-[40px]">
                      <div className="hidden justify-center xl:flex">
                        <AdSlot
                          adUnit="/23296921845/300-250"
                          size={[300, 250]}
                          elementId={`match-gpt-ad-300-250-${match.providerId}`}
                        />
                      </div>
                      <div className="bg-[#F8F8F8] flex justify-center py-[15px] -mx-[1rem] md:mx-0 md:py-0 md:bg-transparent xl:hidden">
                        <AdSlot
                          adUnit="/23296921845/320-50"
                          size={[320, 50]}
                          elementId={`match-gpt-ad-320-50-${match.providerId}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="container">
              <LiveMatchSectionErrorBoundary
                resetKey={match.providerId}
                fallbackTitle="No se pudo cargar el box score. Intenta de nuevo en unos segundos."
              >
                <MatchBoxScoreWidget match={match} usePolling />
              </LiveMatchSectionErrorBoundary>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </FullWidthLayout>
  );
}
