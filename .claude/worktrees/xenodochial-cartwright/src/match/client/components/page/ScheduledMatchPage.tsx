'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import CompletedMatchCardBasic from '@/match/components/card/CompletedMatchCardBasic';
import MatchInfoCard from '@/match/components/MatchInfoCard';
import ScheduledMatchScoreBoard from '@/match/components/scoreboard/ScheduledMatchScoreBoard';
import MatchTeamStatsComparison, {
  MATCH_TEAM_COMPARISON_SEASON_PER_GAME_ROWS,
} from '@/match/components/stats/MatchTeamStatsComparison';
import { MatchType } from '@/match/types';
import MatchFeaturedPlayers from '../MatchFeaturedPlayers';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import AdSlot from '@/shared/client/components/gtm/AdSlot';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';

type LeadersCategoryStatsType = {
  player: {
    providerId: string;
    avatarUrl?: string | null;
    name: string;
  };
  value: number;
};

type ScheduledMatchTeamBoxProps = {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
};

type Props = {
  match: MatchType;
  homeTeamBoxScore: ScheduledMatchTeamBoxProps;
  visitorTeamBoxScore: ScheduledMatchTeamBoxProps;
  headToHeadMatches: MatchType[];
  homeTeamPointsLeaders: LeadersCategoryStatsType[];
  homeTeamAssistsLeaders: LeadersCategoryStatsType[];
  homeTeamReboundsLeaders: LeadersCategoryStatsType[];
  visitorTeamPointsLeaders: LeadersCategoryStatsType[];
  visitorTeamAssistsLeaders: LeadersCategoryStatsType[];
  visitorTeamReboundsLeaders: LeadersCategoryStatsType[];
};

export default function ScheduledMatchPage({
  match,
  homeTeamBoxScore,
  visitorTeamBoxScore,
  headToHeadMatches,
  homeTeamPointsLeaders,
  homeTeamAssistsLeaders,
  homeTeamReboundsLeaders,
  visitorTeamPointsLeaders,
  visitorTeamAssistsLeaders,
  visitorTeamReboundsLeaders,
}: Props) {
  const homeTeamWon = useMemo(() => {
    let won = 0;
    headToHeadMatches.forEach((item) => {
      if (
        item.homeTeam.code === match.homeTeam.code &&
        parseInt(item.homeTeam.score, 10) > parseInt(item.visitorTeam.score, 10)
      ) {
        won += 1;
      } else if (
        item.visitorTeam.code === match.homeTeam.code &&
        parseInt(item.visitorTeam.score, 10) > parseInt(item.homeTeam.score, 10)
      ) {
        won += 1;
      }
    });
    return won;
  }, [headToHeadMatches, match.homeTeam.code]);

  const visitorTeamWon = useMemo(() => {
    let won = 0;
    headToHeadMatches.forEach((item) => {
      if (
        item.homeTeam.code === match.visitorTeam.code &&
        parseInt(item.homeTeam.score, 10) > parseInt(item.visitorTeam.score, 10)
      ) {
        won += 1;
      } else if (
        item.visitorTeam.code === match.visitorTeam.code &&
        parseInt(item.visitorTeam.score, 10) > parseInt(item.homeTeam.score, 10)
      ) {
        won += 1;
      }
    });
    return won;
  }, [headToHeadMatches, match.visitorTeam.code]);

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="mb-6 md:mb-10 lg:mb-15">
          <div className="container">
            <div className="mx-auto py-[32px] md:py-[42px] xl:py-[52px] lg:w-9/12 xl:w-8/12">
              <ScheduledMatchScoreBoard
                startAt={match.startAt}
                homeTeam={{
                  code: match.homeTeam.code,
                  nickname: match.homeTeam.nickname,
                  color: match.homeTeam.color,
                  city: match.homeTeam.city,
                  competitionStandings: {
                    won: match.homeTeam.competitionStandings?.won ?? 0,
                    lost: match.homeTeam.competitionStandings?.lost ?? 0,
                  },
                }}
                visitorTeam={{
                  code: match.visitorTeam.code,
                  nickname: match.visitorTeam.nickname,
                  color: match.visitorTeam.color,
                  city: match.visitorTeam.city,
                  competitionStandings: {
                    won: match.visitorTeam.competitionStandings?.won ?? 0,
                    lost: match.visitorTeam.competitionStandings?.lost ?? 0,
                  },
                }}
                venue={{ name: match.venue?.name ?? '' }}
              />
            </div>
          </div>
        </section>
      }
    >
      <section>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* On mobile, show match info above featured players; on desktop, keep info on the right */}
            <div className="lg:col-span-8 lg:pr-16">
              <div className="mb-[30px] lg:hidden">
                <MatchInfoCard
                  startAt={match.startAt}
                  venue={{ name: match.venue?.name ?? '' }}
                  channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                  ticketUrl={match.homeTeam.ticketUrl}
                />
              </div>
              <div className="mb-6 md:mb-10 lg:mb-15">
                <MatchFeaturedPlayers
                  homeTeam={{ code: match.homeTeam.code }}
                  visitorTeam={{ code: match.visitorTeam.code }}
                  homeTeamPointsLeaders={homeTeamPointsLeaders}
                  homeTeamAssistsLeaders={homeTeamAssistsLeaders}
                  homeTeamReboundsLeaders={homeTeamReboundsLeaders}
                  visitorTeamPointsLeaders={visitorTeamPointsLeaders}
                  visitorTeamAssistsLeaders={visitorTeamAssistsLeaders}
                  visitorTeamReboundsLeaders={visitorTeamReboundsLeaders}
                />
              </div>
              <div className="mb-6 md:mb-10 lg:mb-15">
                <div className="flex flex-row justify-between items-center mb-[30px]">
                  <div>
                    <h3 className="text-[22px] text-black md:text-[24px]">
                      Últimos encuentros
                    </h3>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <TeamLogoAvatar
                      teamCode={match.visitorTeam.code}
                      size={24}
                    />
                    <span className="text-[23px]">{visitorTeamWon}</span>
                    <span className="text-[23px] text-[rgba(124,124,124,0.8)]">
                      -
                    </span>
                    <span className="text-[23px]">{homeTeamWon}</span>
                    <TeamLogoAvatar teamCode={match.homeTeam.code} size={24} />
                  </div>
                </div>
                <div
                  className="flex flex-row flex-nowrap gap-3 overflow-x-auto"
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                  {headToHeadMatches.map((item) => (
                    <Link
                      key={`head-to-head-${item.providerId}`}
                      href={`/partidos/${item.providerId}`}
                      className="max-w-[150px]"
                    >
                      <CompletedMatchCardBasic
                        startAt={item.startAt}
                        homeTeam={{
                          code: item.homeTeam.code,
                          score: item.homeTeam.score,
                        }}
                        visitorTeam={{
                          code: item.visitorTeam.code,
                          score: item.visitorTeam.score,
                        }}
                        overtimePeriods={item.overtimePeriods}
                      />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mb-2 md:mb-10 lg:mb-15">
                <div className="hidden justify-center xl:flex">
                  <AdSlot
                    adUnit="/23296921845/728-90"
                    size={[728, 90]}
                    elementId={`match-gpt-ad-728-90-${match.providerId}`}
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
            <div className="lg:col-span-4">
              <div className="hidden mb-5 lg:block">
                <MatchInfoCard
                  startAt={match.startAt}
                  venue={{ name: match.venue?.name ?? '' }}
                  channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                  ticketUrl={match.homeTeam.ticketUrl}
                />
              </div>
              <div className="mb-6 md:mb-10 lg:mb-15">
                <MatchTeamStatsComparison
                  subtitle="Promedios por juego (temporada)"
                  rows={MATCH_TEAM_COMPARISON_SEASON_PER_GAME_ROWS}
                  homeTeam={{ code: match.homeTeam.code }}
                  visitorTeam={{ code: match.visitorTeam.code }}
                  homeTeamBoxScore={{ ...homeTeamBoxScore }}
                  visitorTeamBoxScore={{ ...visitorTeamBoxScore }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </FullWidthLayout>
  );
}
