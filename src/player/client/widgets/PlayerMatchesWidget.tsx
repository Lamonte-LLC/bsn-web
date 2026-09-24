'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import numeral from 'numeral';
import { usePlayerMatches } from '../hooks/player';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { PLAYER_MATCH_DATE_FORMAT } from '@/constants';
import { getFirstWord } from '@/utils/text';

type Props = {
  playerProviderId: string;
  /** Games per page; the profile shows five and loads five more at a time. */
  pageSize?: number;
};

export default function PlayerMatchesWidget({ playerProviderId, pageSize = 10 }: Props) {
  const { playerMatches, loading, hasNextPage, loadMore } =
    usePlayerMatches(playerProviderId, pageSize);
  const router = useRouter();

  // Empty: one quiet line inside the panel's card, never a headerless table that a phone would clip.
  if (!loading && playerMatches.length === 0) {
    return (
      <p className="py-[16px] text-center font-barlow text-[14px] text-[rgba(15,23,31,0.55)]">
        No se han encontrado juegos para este jugador.
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 sm:-mx-3 player-stats-table">
        <table className="w-full text-left lg:table-fixed">
          <thead>
            <tr>
              <th className="lg:w-[128px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase whitespace-nowrap w-[1%]">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Fecha
                </span>
              </th>
              <th className="lg:w-[180px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Oponente
                </span>
              </th>
              <th className="lg:w-[140px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Resultado
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Min
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Pts
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Reb
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Ast
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Stl
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Blk
                </span>
              </th>
              <th className="min-w-[56px] border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  Fg
                </span>
              </th>
              <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  3pt
                </span>
              </th>
              <th className="lg:w-[150px] border-b border-b-[rgba(0,0,0,0.07)] py-2 pl-6 pr-4 uppercase whitespace-nowrap w-[1%]">
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  &nbsp;
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {playerMatches.map((playerMatch, index) => {
              const { homeTeam, visitorTeam } = playerMatch.match;
              const opponentTeamWon =
                playerMatch.opponentTeam.code === homeTeam.code
                  ? parseInt(homeTeam.score) > parseInt(visitorTeam.score)
                  : parseInt(visitorTeam.score) > parseInt(homeTeam.score);
              return (
                <tr
                  key={playerMatch.match.providerId}
                  onClick={() => router.push(`/partidos/${playerMatch.match.providerId}`)}
                  className="group cursor-pointer transition-colors duration-150 hover:[&>td]:!bg-[#F3F4F6]"
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? 'transparent' : '#F9F9F9',
                  }}
                >
                  <td className="px-3 py-4.5 whitespace-nowrap">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {formatDate(
                        playerMatch.match.startAt,
                        PLAYER_MATCH_DATE_FORMAT,
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-4.5">
                    <div className="flex flex-row gap-2 items-center">
                      <div className="hidden shrink-0 md:block">
                        <TeamLogoAvatar
                          teamCode={playerMatch.opponentTeam.code}
                          size={24}
                        />
                      </div>
                      <span className="text-[16px] text-black">
                        {getFirstWord(playerMatch.opponentTeam.nickname)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4.5 whitespace-nowrap">
                    {opponentTeamWon ? (
                      <span className="bg-[#FFEDED] border border-[rgba(208,53,53,0.15)] rounded-[100px] px-[10px] py-[2px] text-sm text-[#D03535] tracking-[2%] md:text-base md:py-[2px]">
                        P&nbsp;&nbsp;{playerMatch.match.homeTeam.score}-
                        {playerMatch.match.visitorTeam.score}
                      </span>
                    ) : (
                      <span className="bg-[#EBF5ED] border border-[rgba(22,161,74,0.15)] rounded-[100px] px-[10px] py-[2px] text-sm text-[#16A14A] tracking-[2%] md:text-base md:py-[2px]">
                        G {playerMatch.match.homeTeam.score}-
                        {playerMatch.match.visitorTeam.score}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.minutes).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.points).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.reboundsTotal).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.assists).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.steals).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.blocks).format('0')}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center whitespace-nowrap">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.fieldGoalsMade).format('0')}/
                      {numeral(playerMatch.stats.fieldGoalsAttempted).format(
                        '0',
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-4.5 text-center whitespace-nowrap">
                    <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                      {numeral(playerMatch.stats.threePointersMade).format('0')}
                      /
                      {numeral(playerMatch.stats.threePointersAttempted).format(
                        '0',
                      )}
                    </span>
                  </td>
                  <td className="py-4.5 pl-6 pr-4 text-center whitespace-nowrap">
                    <Link
                      href={`/partidos/${playerMatch.match.providerId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-row items-center gap-1"
                    >
                      <span className="text-[15px] text-black underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-150 group-hover:decoration-[rgba(15,23,31,0.3)] md:text-[16px]">
                        Ver resultado
                      </span>
                      <img
                        src="/assets/images/icons/icon-arrow-right.svg"
                        alt=""
                        width="8"
                        className="shrink-0"
                      />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {playerMatches.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="px-3 py-4 text-center text-[15px] text-[rgba(0,0,0,0.6)]"
                >
                  No se han encontrado partidos para este jugador.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasNextPage && (
        <div className="flex justify-center py-[14px]">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex h-[44px] w-full max-w-[360px] cursor-pointer items-center justify-center rounded-[12px] border border-[rgba(15,23,31,0.16)] px-[28px] font-barlow text-[15px] font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] disabled:cursor-default disabled:opacity-60"
          >
            {loading ? 'Cargando…' : 'Cargar más juegos'}
          </button>
        </div>
      )}
    </div>
  );
}
