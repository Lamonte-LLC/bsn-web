'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@/shared/client/components/ui';
import MatchCompetitor from '../competitor/MatchCompetitor';
import { getFirstWord } from '@/utils/text';
import { MATCH_DATE_FORMAT, MATCH_TIME_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  matchProviderId?: string;
  startAt: string;
  homeTeam: {
    code: string;
    nickname: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
    city: string;
  };
  visitorTeam: {
    code: string;
    nickname: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
    city: string;
  };
  ticketUrl?: string;
  mediaProvider: string;
  isFinals?: boolean;
  finalsDescription?: string;
};

export default function ScheduledMatchCard({
  matchProviderId,
  startAt,
  homeTeam,
  visitorTeam,
  ticketUrl = '',
  mediaProvider,
  isFinals = false,
  finalsDescription = '',
}: Props) {
  const homeTeamStandings = useMemo(() => {
    if (homeTeam.competitionStandings != null) {
      return `${homeTeam.competitionStandings.won ?? 0}-${homeTeam.competitionStandings.lost ?? 0}`;
    }
    return '';
  }, [homeTeam.competitionStandings]);

  const visitorTeamStandings = useMemo(() => {
    if (visitorTeam.competitionStandings != null) {
      return `${visitorTeam.competitionStandings.won ?? 0}-${visitorTeam.competitionStandings.lost ?? 0}`;
    }
    return '';
  }, [visitorTeam.competitionStandings]);

  const matchHref =
    matchProviderId != null ? `/partidos/${matchProviderId}` : '#';

  const lowerMedia = (mediaProvider || '').toLowerCase();
  const hasPunto2 =
    lowerMedia.includes('punto 2') || lowerMedia.includes('punto2');
  const hasYouTube = lowerMedia.includes('youtube');
  const hasTelemundo = lowerMedia.includes('telemundo');

  return (
    <Link href={matchHref} className="block">
      <Card className="w-[220px] md:w-[308px]">
      <CardHeader className="border-b border-b-[rgba(255,255,255,0.05)] mx-[15px] py-[8px] md:mx-[20px]">
        <div className="flex flex-row justify-between items-center">
          <p className="font-barlow font-medium text-[rgba(255,255,255,0.8)] text-[13px] leading-[22px] md:text-sm md:leading-[24px]">
            {formatDate(startAt, MATCH_DATE_FORMAT)}
          </p>
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            {hasPunto2 && (
              <span className="inline-flex shrink-0 items-center" style={{ height: 14 }}>
                <img
                  src="/assets/images/icons/channels/punto2.svg"
                  alt="Punto 2"
                  className="max-h-[14px] w-auto object-contain object-center"
                  style={{ height: 14 }}
                />
              </span>
            )}
            {hasYouTube && (
              <span className="inline-flex shrink-0 items-center" style={{ height: 14 }}>
                <img
                  src="/assets/images/icons/channels/youtube.svg"
                  alt="YouTube"
                  className="max-h-[14px] w-auto object-contain object-center"
                  style={{ height: 14 }}
                />
              </span>
            )}
            <span className="inline-flex shrink-0 items-center" style={{ height: 14 }}>
              <img
                src="/assets/images/icons/channels/bsnapp.svg"
                alt="BSN App"
                className="max-h-[14px] w-auto object-contain object-center"
                style={{ height: 14 }}
              />
            </span>
            {hasTelemundo && (
              <span className="inline-flex shrink-0 items-center" style={{ height: 14 }}>
                <img
                  src="/assets/images/icons/channels/telemundo.svg"
                  alt="Telemundo"
                  className="max-h-[14px] w-auto object-contain object-center"
                  style={{ height: 14 }}
                />
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-[3px]">
        <div className="flex flex-row justify-between items-center mb-[7px]">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-row justify-between items-center gap-3">
              <div className="flex-1">
                <MatchCompetitor
                  code={visitorTeam.code}
                  name={getFirstWord(visitorTeam.nickname)}
                  city={visitorTeam.city}
                  ranking={visitorTeamStandings}
                  avatarSize={33}
                />
              </div>
              <p className="font-special-gothic-condensed-one text-[24px] leading-[36px] text-white md:text-[32px] md:leading-[48px]">
                {formatDate(startAt, MATCH_TIME_FORMAT)}
              </p>
            </div>
            <div className="flex flex-row justify-between items-center gap-3">
              <div className="flex-1">
                <MatchCompetitor
                  code={homeTeam.code}
                  name={getFirstWord(homeTeam.nickname)}
                  city={homeTeam.city}
                  ranking={homeTeamStandings}
                  avatarSize={33}
                />
              </div>
              <div className="flex h-[36px] items-center md:h-[48px]"></div>
            </div>
          </div>
        </div>
        <div className="pb-[12px] md:pb-[17px]">
          <div className="glass-match-card-pill border border-[rgba(255,255,255,0.21)] block text-center rounded-[18px] p-[2px] md:p-[5px]">
            <span className="text-sm text-white md:text-[15px]">
              Ver previa
            </span>
          </div>
        </div>
      </CardBody>
      {isFinals && (
        <CardFooter>
          <div className="flex flex-row justify-center items-center">
            <p className="font-barlow text-sm text-neutral-90">
              {finalsDescription}
            </p>
          </div>
        </CardFooter>
      )}
      </Card>
    </Link>
  );
}
