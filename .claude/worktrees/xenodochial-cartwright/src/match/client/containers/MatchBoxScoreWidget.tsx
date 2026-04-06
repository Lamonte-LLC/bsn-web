'use client';

import { MatchType } from '@/match/types';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import MatchQuarterScoreBoard from '@/match/components/scoreboard/MatchQuarterScoreBoard';
import { useMatchTabbedBoxscorePanel } from '../hooks/matches';
import MatchTeamBoxScoreWidget from './MatchTeamBoxScoreWidget';

type Props = {
  match: MatchType;
  /** Refresh player box score periodically (e.g. live games). */
  usePolling?: boolean;
};

export default function MatchBoxScoreWidget({ match, usePolling = false }: Props) {
  const {
    matchTeamsBoxscore,
    visitorPlayers,
    homePlayers,
    loading: batchedPlayersLoading,
  } = useMatchTabbedBoxscorePanel(
    match.providerId,
    match.visitorTeam.providerId,
    match.homeTeam.providerId,
    usePolling,
  );

  const periodQuarters =
    match.periods?.map((period) => ({
      periodNumber: period.periodNumber,
      periodType: period.periodType,
      homeTeam: { score: period.homeTeam.score },
      visitorTeam: { score: period.visitorTeam.score },
    })) ?? [];

  return (
    <div className="py-[20px] md:py-[30px] lg:py-[50px]">
      <div className="hidden px-[10px] flex-row justify-between items-center md:flex">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Box Score
          </h3>
        </div>
      </div>
      {periodQuarters.length > 0 && (
        <div className="mb-8 px-[10px] md:mb-10 lg:mb-12">
          <div className="mb-[12px] md:mb-[16px]">
            <h4 className="text-[18px] text-black md:text-[20px]">
              Resultado por periodo
            </h4>
          </div>
          <MatchQuarterScoreBoard
            homeTeam={{
              code: match.homeTeam.code,
              nickname: match.homeTeam.nickname,
              competitionStandings: {
                won: match.homeTeam.competitionStandings?.won ?? 0,
                lost: match.homeTeam.competitionStandings?.lost ?? 0,
              },
            }}
            visitorTeam={{
              code: match.visitorTeam.code,
              nickname: match.visitorTeam.nickname,
              competitionStandings: {
                won: match.visitorTeam.competitionStandings?.won ?? 0,
                lost: match.visitorTeam.competitionStandings?.lost ?? 0,
              },
            }}
            quarters={periodQuarters}
          />
        </div>
      )}
      <TabGroup defaultIndex={0} className="md:-mt-[38px]">
        <TabList className="text-center space-x-[8px] mb-[36px]">
          <Tab className="border border-[#D5D5D5] cursor-pointer text-[15px] data-[selected]:border-[#0F171F] px-[8px] py-[6px] rounded-[100px] min-w-[150px] data-[selected]:bg-[#0F171F] data-[selected]:text-white">
            {match.visitorTeam.nickname}
          </Tab>
          <Tab className="border border-[#D5D5D5] cursor-pointer text-[15px] data-[selected]:border-[#0F171F] px-[8px] py-[6px] rounded-[100px] min-w-[150px] data-[selected]:bg-[#0F171F] data-[selected]:text-white">
            {match.homeTeam.nickname}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MatchTeamBoxScoreWidget
              matchProviderId={match.providerId}
              teamProviderId={match.visitorTeam.providerId}
              usePolling={usePolling}
              batchedPlayers={visitorPlayers}
              batchedPlayersLoading={batchedPlayersLoading}
              importSharedAggregate
              sharedTeamAggregate={
                matchTeamsBoxscore?.visitorTeamBoxscore ?? null
              }
            />
          </TabPanel>
          <TabPanel>
            <MatchTeamBoxScoreWidget
              matchProviderId={match.providerId}
              teamProviderId={match.homeTeam.providerId}
              usePolling={usePolling}
              batchedPlayers={homePlayers}
              batchedPlayersLoading={batchedPlayersLoading}
              importSharedAggregate
              sharedTeamAggregate={matchTeamsBoxscore?.homeTeamBoxscore ?? null}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
