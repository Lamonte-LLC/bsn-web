'use client';

import { useMemo } from 'react';
import Lottie from 'lottie-react';
import Link from 'next/link';
import { MATCH_DATE_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import animationLiveStreamData from './live-stream.json';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';
import { useMatch } from '../hooks/matches';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';

type Props = {
  matchProviderId: string;
};

export default function LiveMatchScoreBoardWidget({ matchProviderId }: Props) {
  const { data, loading } = useMatch(matchProviderId, true);

  const periodLabel = useMemo(() => {
    if (!data) {
      return '';
    }

    let label =
      (data?.overtimePeriods ?? 0) > 0 ? 'OT' : `Q${data?.currentPeriod ?? 1}`;
    if ((data?.overtimePeriods ?? 0) > 1) {
      label += `${data?.overtimePeriods ?? 0}`;
    }
    return label;
  }, [data]);

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
          href={`/equipos/${data?.visitorTeam.code ?? ''}`}
          className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row"
        >
          <div className="hidden text-right md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {getFirstWord(data?.visitorTeam.nickname ?? '')}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {data?.visitorTeam.city ?? ''}
            </p>
          </div>
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                data?.visitorTeam.color != null
                  ? data.visitorTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar
                teamCode={data?.visitorTeam.code ?? ''}
                size={60}
              />
            </div>
          </div>
          <div className="md:hidden">
            <p className="text-[21px] text-white">
              {data?.visitorTeam.code ?? ''}
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
                {data?.visitorTeam.score ?? 0}
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
                {periodLabel} - {data?.currentTime ?? '00:00:00'}
              </p>
            </div>
            <div className="flex flex-row items-center justify-end gap-2 w-[54px] md:w-[100px]">
              <h4 className="text-[42px] text-white md:text-[64px]">
                {data?.homeTeam.score ?? 0}
              </h4>
            </div>
          </div>
          <div className="md:-mt-6">
            <p className="font-barlow text-[13px] text-white text-center md:mb-2 md:text-[15px]">
              {formatDate(data?.startAt, MATCH_DATE_FORMAT)}
            </p>
            <p className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.5)] text-center">
              {data?.venue?.name ?? ''}
            </p>
          </div>
        </div>
        <Link
          href={`/equipos/${data?.homeTeam.code ?? ''}`}
          className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row"
        >
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                data?.homeTeam.color != null
                  ? data.homeTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar teamCode={data?.homeTeam.code ?? ''} size={60} />
            </div>
          </div>
          <div className="hidden text-left md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {getFirstWord(data?.homeTeam.nickname ?? '')}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {data?.homeTeam.city ?? ''}
            </p>
          </div>
          <div className="md:hidden">
            <p className="text-[21px] text-white">
              {data?.homeTeam.code ?? ''}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
