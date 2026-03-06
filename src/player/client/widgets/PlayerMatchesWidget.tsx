'use client';

import Link from 'next/link';
import numeral from 'numeral';
import { usePlayerMatches } from '../hooks/player';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { PLAYER_MATCH_DATE_FORMAT } from '@/constants';

type Props = {
  playerProviderId: string;
};

export default function PlayerMatchesWidget({ playerProviderId }: Props) {
  const { playerMatches, loading, hasNextPage, loadMore } =
    usePlayerMatches(playerProviderId);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase whitespace-nowrap w-[1%]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Fecha
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Oponente
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Resultado
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Min
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Pts
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Reb
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Ast
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Stl
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Blk
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                Fg
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase text-center">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                3pt
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-3 py-2 uppercase whitespace-nowrap w-[1%]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                &nbsp;
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {playerMatches.map((playerMatch) => {
            const { homeTeam, visitorTeam } = playerMatch.match;
            const opponentTeamWon =
              playerMatch.oponentTeam.code === homeTeam.code
                ? parseInt(homeTeam.score) > parseInt(visitorTeam.score)
                : parseInt(visitorTeam.score) > parseInt(homeTeam.score);
            return (
              <tr key={playerMatch.match.providerId} className="bg-[#F9F9F9]">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {formatDate(
                      playerMatch.match.startAt,
                      PLAYER_MATCH_DATE_FORMAT,
                    )}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="hidden md:block">
                      <TeamLogoAvatar
                        teamCode={playerMatch.oponentTeam.code}
                        size={24}
                      />
                    </div>
                    <span className="text-[15px] text-black">
                      {playerMatch.oponentTeam.nickname}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {opponentTeamWon ? (
                    <span className="bg-[#FFEDED] border border-[rgba(208,53,53,0.15)] rounded-[100px] px-[10px] py-[2px] text-sm text-[#D03535] tracking-[2%] md:text-base md:py-[4px]">
                      P&nbsp;&nbsp;{playerMatch.match.homeTeam.score}-{playerMatch.match.visitorTeam.score}
                    </span>
                  ) : (
                    <span className="bg-[#EBF5ED] border border-[rgba(22,161,74,0.15)] rounded-[100px] px-[10px] py-[2px] text-sm text-[#16A14A] tracking-[2%] md:text-base md:py-[4px]">
                      G {playerMatch.match.homeTeam.score}-{playerMatch.match.visitorTeam.score}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.minutes).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.points).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.reboundsTotal).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.assists).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.steals).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.blocks).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.fieldGoalsMade).format('0')}/
                    {numeral(playerMatch.stats.fieldGoalsAttempted).format('0')}
                  </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)] md:text-sm">
                    {numeral(playerMatch.stats.threePointersMade).format('0')}/
                    {numeral(playerMatch.stats.threePointersAttempted).format(
                      '0',
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <Link
                    href={`/partidos/${playerMatch.match.providerId}`}
                    className="flex flex-row items-center gap-1"
                  >
                    <span className="text-[15px] text-black">
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
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-barlow border border-[rgba(0,0,0,0.15)] rounded hover:bg-[rgba(0,0,0,0.05)] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}
