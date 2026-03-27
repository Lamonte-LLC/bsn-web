'use client';

import { useMemo } from 'react';
import Lottie from 'lottie-react';
import Link from 'next/link';
import { MATCH_DATE_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import animationLiveStreamData from '../../../../lottie/live-stream.json';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { formatGameClockDisplay } from '@/utils/game-clock';
import { MatchType } from '@/match/types';

type Props = {
  match?: MatchType;
  loading?: boolean;
};

export default function LiveMatchScoreBoardWidget({
  match,
  loading = true,
}: Props) {
  const periodLabel = useMemo(() => {
    if (!match) {
      return '';
    }

    let label =
      (match?.overtimePeriods ?? 0) > 0
        ? 'OT'
        : `Q${match?.currentPeriod ?? 1}`;
    if ((match?.overtimePeriods ?? 0) > 1) {
      label += `${match?.overtimePeriods ?? 0}`;
    }
    return label;
  }, [match]);

  if (loading) {
    return (
      <div className="flex flex-row justify-between items-center gap-3 md:gap-4">
        <div className="scale-[0.6] md:scale-[1]">
          <TeamLogoAvatar teamCode="ZZZ" size={100} />
        </div>
        <div className="grow flex flex-col gap-2">
          <div className="mx-auto w-[70px]">
            <div className="hidden md:block">
              <ShimmerLine height="18px" />
            </div>
            <div className="block md:hidden">
              <ShimmerLine height="12px" />
            </div>
          </div>
          <div className="mx-auto w-[116px]">
            <div className="hidden md:block">
              <ShimmerLine height="42px" />
            </div>
            <div className="block md:hidden">
              <ShimmerLine height="28px" />
            </div>
          </div>
          <div className="mx-auto w-[146px]">
            <div className="hidden md:block">
              <ShimmerLine height="16px" />
            </div>
            <div className="block md:hidden">
              <ShimmerLine height="14px" />
            </div>
          </div>
        </div>
        <div className="scale-[0.6] md:scale-[1]">
          <TeamLogoAvatar teamCode="ZZZ" size={100} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-start gap-3 md:gap-4">
        <Link
          href={`/equipos/${match?.visitorTeam.code ?? ''}`}
          className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row"
        >
          <div className="hidden text-right md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {getFirstWord(match?.visitorTeam.nickname ?? '')}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {match?.visitorTeam.city ?? ''}
            </p>
          </div>
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                match?.visitorTeam.color != null
                  ? match.visitorTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar
                teamCode={match?.visitorTeam.code ?? ''}
                size={60}
              />
            </div>
          </div>
          <div className="md:hidden">
            <p className="text-[21px] text-white">
              {match?.visitorTeam.code ?? ''}
            </p>
          </div>
        </Link>
        <div className="grow">
          <div className="hidden flex-row gap-1 items-center justify-center -mb-[25px] md:flex">
            <Lottie
              animationData={animationLiveStreamData}
              loop
              autoplay
              style={{ width: '16px', height: '16px' }}
            />
            <p className="font-barlow-condensed font-semibold text-center text-lg text-[#FF4747]">
              EN VIVO
            </p>
          </div>
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center justify-start gap-2 w-[54px] md:w-[100px]">
              <h4 className="text-[42px] text-white md:text-[64px]">
                {match?.visitorTeam.score ?? 0}
              </h4>
            </div>
            <div className="flex flex-row items-center justify-center gap-1">
              <div className="md:hidden">
                <Lottie
                  animationData={animationLiveStreamData}
                  loop
                  autoplay
                  style={{ width: '16px', height: '16px' }}
                />
              </div>
              <p className="barlow-condensed font-semibold text-base text-white text-center md:text-[25px]">
                {periodLabel} - {formatGameClockDisplay(match?.currentTime)}
              </p>
            </div>
            <div className="flex flex-row items-center justify-end gap-2 w-[54px] md:w-[100px]">
              <h4 className="text-[42px] text-white md:text-[64px]">
                {match?.homeTeam.score ?? 0}
              </h4>
            </div>
          </div>
          <div className="md:-mt-6">
            <p className="font-barlow text-[13px] text-white text-center md:mb-2 md:text-[15px]">
              {formatDate(match?.startAt, MATCH_DATE_FORMAT)}
            </p>
            <p className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.5)] text-center">
              {match?.venue?.name ?? ''}
            </p>
          </div>
        </div>
        <Link
          href={`/equipos/${match?.homeTeam.code ?? ''}`}
          className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row"
        >
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                match?.homeTeam.color != null
                  ? match.homeTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar teamCode={match?.homeTeam.code ?? ''} size={60} />
            </div>
          </div>
          <div className="hidden text-left md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {getFirstWord(match?.homeTeam.nickname ?? '')}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {match?.homeTeam.city ?? ''}
            </p>
          </div>
          <div className="md:hidden">
            <p className="text-[21px] text-white">
              {match?.homeTeam.code ?? ''}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
