'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';

type TeamSlice = {
  code: string;
  nickname: string;
  score: string;
};

type Props = {
  providerId: string;
  homeTeam: TeamSlice;
  visitorTeam: TeamSlice;
  overtimePeriods?: number;
};

export default function CalendarFinishedMatchRow({
  providerId,
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
      className="block rounded-[12px] border border-[rgba(125,125,125,0.15)] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] transition hover:bg-[#fafafa]"
    >
      <div className="flex flex-col gap-4 p-4 sm:h-[77px] sm:min-h-[77px] sm:flex-row sm:items-center sm:gap-0 sm:px-5 sm:py-0">
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

        <div className="flex shrink-0 justify-center sm:justify-end sm:pl-3">
          <span className="inline-flex min-w-[110px] items-center justify-center rounded-[100px] border border-[rgba(168,168,168,0.5)] bg-[#fdfdfd] px-5 py-2 font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-black">
            Ver resultado
          </span>
        </div>
      </div>
    </Link>
  );
}
