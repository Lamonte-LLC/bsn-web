import React, { useMemo } from 'react';
import Link from 'next/link';
import { MATCH_DATE_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';

type Props = {
  startAt: string;
  homeTeam: {
    code: string;
    nickname: string;
    score: string;
    color: string;
    city: string;
  };
  visitorTeam: {
    code: string;
    nickname: string;
    score: string;
    color: string;
    city: string;
  };
  venue: {
    name: string;
  };
  overtimePeriods?: number;
};

export default function CompletedMatchScoreBoard({
  startAt,
  homeTeam,
  visitorTeam,
  venue,
  overtimePeriods = 0,
}: Props) {
  const isHomeTeamWinner = useMemo(() => {
    return parseInt(homeTeam.score, 10) > parseInt(visitorTeam.score, 10);
  }, [homeTeam.score, visitorTeam.score]);

  const isVisitorTeamWinner = useMemo(() => {
    return parseInt(visitorTeam.score, 10) > parseInt(homeTeam.score, 10);
  }, [homeTeam.score, visitorTeam.score]);

  const overtimePeriodLabel = useMemo(() => {
    if (overtimePeriods > 1) {
      return `OT${overtimePeriods}`;
    }
    if (overtimePeriods === 1) {
      return 'OT';
    }
    return '';
  }, [overtimePeriods]);

  return (
    <div>
      <div className="flex flex-row justify-between items-start gap-3 md:gap-4">
        <div className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row">
          <Link href={`/equipos/${visitorTeam.code}`} className="hidden text-right md:block">
            <h4 className="text-white lg:text-[26px]/8">{getFirstWord(visitorTeam.nickname)}</h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {visitorTeam.city}
            </p>
          </Link>
          <Link href={`/equipos/${visitorTeam.code}`}>
            <div
              className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
              style={{
                borderColor: visitorTeam.color || 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="scale-[0.6] md:scale-[1]">
                <TeamLogoAvatar teamCode={visitorTeam.code} size={60} />
              </div>
            </div>
          </Link>
          <Link href={`/equipos/${visitorTeam.code}`} className="md:hidden">
            <p className="text-[21px] text-white">{visitorTeam.code}</p>
          </Link>
        </div>
        <div className="grow">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center justify-start gap-2 w-[54px] md:w-[100px]">
              <h4
                className="text-[42px] md:text-[64px]"
                style={{
                  color: isVisitorTeamWinner
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {visitorTeam.score}
              </h4>
              <img
                src="/assets/images/icons/icon-caret-winner.png"
                alt=""
                width="10"
                style={{ opacity: isVisitorTeamWinner ? 1 : 0 }}
              />
            </div>
            <p className="barlow-condensed font-semibold text-base text-white text-center md:text-[25px]">
              Final {overtimePeriodLabel}
            </p>
            <div className="flex flex-row items-center justify-end gap-2 w-[54px] md:w-[100px]">
              <img
                src="/assets/images/icons/icon-caret-winner.png"
                alt=""
                width="10"
                className="rotate-180"
                style={{ opacity: isHomeTeamWinner ? 1 : 0 }}
              />
              <h4
                className="text-[42px] md:text-[64px]"
                style={{
                  color: isHomeTeamWinner
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {homeTeam.score}
              </h4>
            </div>
          </div>
          <div className="md:-mt-6">
            <p className="font-barlow text-[13px] text-white text-center md:mb-2 md:text-[15px]">
              {formatDate(startAt, MATCH_DATE_FORMAT)}
            </p>
            <p className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.5)] text-center">
              {venue.name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row">
          <Link href={`/equipos/${homeTeam.code}`}
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor: homeTeam.color || 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar teamCode={homeTeam.code} size={60} />
            </div>
          </Link>
          <Link href={`/equipos/${homeTeam.code}`} className="hidden text-left md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {getFirstWord(homeTeam.nickname)}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {homeTeam.city}
            </p>
          </Link>
          <Link href={`/equipos/${homeTeam.code}`} className="md:hidden">
            <p className="text-[21px] text-white">{homeTeam.code}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
