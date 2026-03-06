'use client';

import Link from 'next/link';
import numeral from 'numeral';
import { useRef, useState } from 'react';
import { usePlayerMatches } from '../hooks/player';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { PLAYER_MATCH_DATE_FORMAT } from '@/constants';
import { getFirstWord } from '@/utils/text';

type Props = {
  playerProviderId: string;
};

export default function PlayerMatchesWidget({ playerProviderId }: Props) {
  const { playerMatches, loading, hasNextPage, loadMore } =
    usePlayerMatches(playerProviderId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolledToEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);
  };

  return (
    <div>
      <div className="relative">
        <div
          className="overflow-x-auto"
          ref={scrollRef}
          onScroll={handleScroll}
        >
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
              {playerMatches.map((playerMatch, index) => {
                const { homeTeam, visitorTeam } = playerMatch.match;
                const opponentTeamWon =
                  playerMatch.opponentTeam.code === homeTeam.code
                    ? parseInt(homeTeam.score) > parseInt(visitorTeam.score)
                    : parseInt(visitorTeam.score) > parseInt(homeTeam.score);
                return (
                  <tr
                    key={playerMatch.match.providerId}
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
                        <span className="text-[15px] text-black">
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
                        {numeral(playerMatch.stats.threePointersMade).format(
                          '0',
                        )}
                        /
                        {numeral(
                          playerMatch.stats.threePointersAttempted,
                        ).format('0')}
                      </span>
                    </td>
                    <td className="px-3 py-4.5 text-center whitespace-nowrap">
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
        </div>
        {!isScrolledToEnd && (
          <div className="absolute top-0 right-0 w-[58px] h-full bg-[linear-gradient(270deg,rgba(255,255,255,0.8)_8.47%,rgba(255,255,255,0.4)_133.73%)] md:hidden"></div>
        )}
      </div>
      {hasNextPage && (
        <div className="flex justify-center mt-4 md:w-8/12 md:mx-auto">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-[#FCFCFC] border border-[#D9D3D3] cursor-pointer px-4 py-2.5 rounded-[12px] disabled:opacity-50 w-full"
          >
            <span className="text-base text-black tracking-[2%]">
              {loading ? 'Cargando...' : 'Cargar más'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
