'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { MATCH_DATE_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';

type TeamSlice = {
  code: string;
  nickname: string;
  score: string;
  city: string;
  competitionStandings?: {
    won: number;
    lost: number;
  };
};

type Props = {
  providerId: string;
  startAt: string;
  homeTeam: TeamSlice;
  visitorTeam: TeamSlice;
  overtimePeriods?: number;
};

function recordLabel(team: TeamSlice): string {
  const w = team.competitionStandings?.won ?? 0;
  const l = team.competitionStandings?.lost ?? 0;
  return `${w}-${l}`;
}

export default function CalendarFinishedMatchRow({
  providerId,
  startAt,
  homeTeam,
  visitorTeam,
  overtimePeriods = 0,
}: Props) {
  const href = `/partidos/${providerId}`;

  const { winner, loser } = useMemo(() => {
    const vs = parseInt(visitorTeam.score, 10) || 0;
    const hs = parseInt(homeTeam.score, 10) || 0;
    if (vs === hs) {
      return { winner: visitorTeam, loser: homeTeam };
    }
    if (vs > hs) {
      return { winner: visitorTeam, loser: homeTeam };
    }
    return { winner: homeTeam, loser: visitorTeam };
  }, [homeTeam, visitorTeam]);

  const finalLabel = useMemo(() => {
    if (overtimePeriods > 1) return `Final ${overtimePeriods}OT`;
    if (overtimePeriods === 1) return 'Final OT';
    return 'Final';
  }, [overtimePeriods]);

  const winScore =
    winner.code === visitorTeam.code ? visitorTeam.score : homeTeam.score;
  const loseScore =
    loser.code === visitorTeam.code ? visitorTeam.score : homeTeam.score;

  return (
    <Link
      href={href}
      className="block rounded-[12px] border border-[rgba(125,125,125,0.15)] bg-white transition hover:bg-[#fafafa]"
    >
      {/* Mobile — Figma 553:35717 / 553:35720 */}
      <div className="sm:hidden">
        <div className="flex flex-row items-center justify-between border-b border-b-[rgba(125,125,125,0.1)] mx-[20px] py-[8px]">
          <p className="font-special-gothic-condensed-one text-[18px] font-normal leading-normal tracking-[0.18px] text-black">
            {finalLabel}
          </p>
          <span className="font-barlow font-medium text-[13px] text-[rgba(0,0,0,0.9)]">
            {formatDate(startAt, MATCH_DATE_FORMAT)}
          </span>
        </div>
        <div className="flex flex-col gap-[10px] px-[20px] pb-[16px] pt-[12px]">
          <MobileTeamRowFinished
            team={winner}
            score={winScore ?? '0'}
            isWinner
          />
          <MobileTeamRowFinished
            team={loser}
            score={loseScore ?? '0'}
            isWinner={false}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:h-[77px] sm:min-h-[77px] sm:flex-row sm:items-center sm:gap-0 sm:px-5 sm:py-0">
        <div className="flex shrink-0 items-center justify-center sm:w-[72px] sm:pr-2">
          <p className="text-center font-special-gothic-condensed-one text-[18px] font-normal leading-normal tracking-[0.18px] text-black">
            {finalLabel}
          </p>
        </div>

        <div
          className="hidden h-[57px] w-px shrink-0 bg-[rgba(125,125,125,0.25)] sm:mx-2 sm:block"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="max-w-[120px] truncate font-special-gothic-condensed-one text-[20px] leading-none text-[#0f171f]">
              {getFirstWord(winner.nickname)}
            </span>
            <TeamLogoAvatar teamCode={winner.code} size={30} />
            <span className="font-special-gothic-condensed-one text-[30px] leading-none tracking-[0.3px] text-[#0f171f] tabular-nums">
              {winScore ?? '0'}
            </span>
          </div>

          <span className="font-special-gothic-condensed-one text-[30px] leading-none tracking-[0.3px] text-black">
            -
          </span>

          <div className="flex min-w-0 items-center gap-2 text-[rgba(15,23,31,0.5)]">
            <span className="font-special-gothic-condensed-one text-[30px] leading-none tracking-[0.3px] tabular-nums">
              {loseScore ?? '0'}
            </span>
            <span className="opacity-[0.55]">
              <TeamLogoAvatar teamCode={loser.code} size={30} />
            </span>
            <span className="max-w-[120px] truncate font-special-gothic-condensed-one text-[20px] leading-none">
              {getFirstWord(loser.nickname)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 justify-end sm:pl-3">
          <span className="bg-[#FAFAFA] border border-[rgba(168,168,168,0.5)] inline-block text-center text-[15px] px-[6px] py-[5px] rounded-[100px] min-w-[110px] text-black pointer-events-none">
            Ver resultado
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobileTeamRowFinished({
  team,
  score,
  isWinner,
}: {
  team: TeamSlice;
  score: string;
  isWinner: boolean;
}) {
  const nameColor = isWinner ? 'text-black' : 'text-[rgba(0,0,0,0.5)]';
  const scoreColor = isWinner ? 'text-black' : 'text-[rgba(0,0,0,0.5)]';

  return (
    <div className="flex flex-row items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-[12px]">
        <TeamLogoAvatar teamCode={team.code} size={30} />
        <div className="min-w-0 flex-1">
          <p className="text-base/6 tracking-[2%]">
            <span className={nameColor}>{getFirstWord(team.nickname)}</span>
            &nbsp;&nbsp;
            <span className="font-barlow text-xs text-[#717171]">
              {recordLabel(team)}
            </span>
          </p>
          <p className="font-barlow text-xs text-[#717171]">{team.city}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <span className={`w-[56px] text-right text-[27px] leading-[36px] ${scoreColor}`}>
          {score}
        </span>
        <div className="w-[11px] ml-[4px] flex items-center">
          {isWinner && (
            <img
              src="/assets/images/icons/icon-caret-winner.png"
              alt=""
              width={7}
              height={9}
              className="mt-[2px] shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
