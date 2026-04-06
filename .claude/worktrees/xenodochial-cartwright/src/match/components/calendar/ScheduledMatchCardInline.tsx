import Link from 'next/link';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import {
  MATCH_DATE_FORMAT,
  MATCH_DATE_FULL_FORMAT,
  MATCH_TIME_FORMAT,
} from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';

type Props = {
  providerId: string;
  startAt: string;
  homeTeam: {
    nickname: string;
    code: string;
    city: string;
    ticketUrl: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  visitorTeam: {
    nickname: string;
    code: string;
    city: string;
    ticketUrl: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  contextTeam: {
    code: string;
  };
  mediaProvider: string;
  showDesktopDateHeader?: boolean;
};

export default function ScheduledMatchCardInline({
  providerId,
  startAt,
  homeTeam,
  visitorTeam,
  contextTeam,
  mediaProvider,
  showDesktopDateHeader = true,
}: Props) {
  // Tickets are sold by the home team (venue), including away games ("en").
  const ticketsLink = homeTeam.ticketUrl;

  return (
    <div>
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="relative border border-[rgba(125,125,125,0.15)] rounded-[12px] bg-white">
          <Link href={`/partidos/${providerId}`} className="absolute inset-0 z-0" aria-label="Ver partido" />
          <div className="border-b border-b-[rgba(125,125,125,0.1)] flex flex-row items-center justify-between mx-[20px] py-[12px]">
            <p className="font-barlow font-medium text-[13px] text-[rgba(0,0,0,0.9)]">
              {formatDate(startAt, MATCH_DATE_FORMAT)}
            </p>
            <div className="flex flex-row items-center gap-2">
              <img src="/assets/images/icons/icon-tv2.svg" alt="" />
              <p className="font-barlow text-xs text-[#717171]">
                {mediaProvider}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-[10px] px-[20px] pb-[16px] pt-[12px]">
            <div className="flex flex-row justify-between items-center gap-3">
              <div className="flex-1">
                <div className="flex flex-row items-center justify-center gap-[12px]">
                  <div>
                    <TeamLogoAvatar teamCode={visitorTeam.code} size={30} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base/6 tracking-[2%]">
                      {getFirstWord(visitorTeam.nickname)}&nbsp;&nbsp;
                      <span className="font-barlow text-xs text-[#717171]">
                        {`${visitorTeam.competitionStandings?.won ?? 0}-${visitorTeam.competitionStandings?.lost ?? 0}`}
                      </span>
                    </p>
                    <p className="font-barlow text-xs text-[#717171]">
                      {visitorTeam.city}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[27px] leading-[36px] text-black">
                {formatDate(startAt, MATCH_TIME_FORMAT)}
              </p>
            </div>
            <div className="flex flex-row justify-between items-center gap-3">
              <div className="flex-1">
                <div className="flex flex-row items-center justify-center gap-[12px]">
                  <div>
                    <TeamLogoAvatar teamCode={homeTeam.code} size={30} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base/6 tracking-[2%]">
                      {getFirstWord(homeTeam.nickname)}&nbsp;&nbsp;
                      <span className="font-barlow text-xs text-[#717171]">
                        {`${homeTeam.competitionStandings?.won ?? 0}-${homeTeam.competitionStandings?.lost ?? 0}`}
                      </span>
                    </p>
                    <p className="font-barlow text-xs text-[#717171]">
                      {homeTeam.city}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex h-[36px] items-center">
                <a
                  href={ticketsLink}
                  className="bg-[#FAFAFA] border border-[rgba(168,168,168,0.5)] inline-block text-center text-[15px] px-[6px] py-[5px] rounded-[100px] min-w-[110px]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-[15px] text-black">Boletos</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        {showDesktopDateHeader && (
          <div className="mb-[20px]">
            <p className="text-[20px] leading-normal text-black">
              {formatDate(startAt, MATCH_DATE_FULL_FORMAT).toLowerCase()}
            </p>
          </div>
        )}
        <div className="border border-[rgba(125,125,125,0.15)] rounded-[12px] bg-white py-[10px] px-[25px]">
          <div className="flex flex-row items-center justify-between">
            <div className="pl-[10px] pr-[35px]">
              <p className="text-[18px] text-black">
                {formatDate(startAt, MATCH_TIME_FORMAT)}
              </p>
            </div>
            <div className="border-l border-l-[rgba(125,125,125,0.15)] flex-1 flex flex-row gap-[20px] pl-[28px] py-[12px]">
              <h4 className="text-[20px] text-[#0F171F] hidden xl:block">
                {getFirstWord(visitorTeam.nickname)}
              </h4>
              <TeamLogoAvatar teamCode={visitorTeam.code} size={30} />
              <div className="border border-[#E1E1E1] flex items-center justify-center rounded-full h-[30px] w-[30px]">
                <span className="font-barlow-condensed text-base text-[rgba(15,23,31,0.8)] -mt-[3px]">
                  {contextTeam.code === homeTeam.code ? 'vs' : 'en'}
                </span>
              </div>
              <TeamLogoAvatar teamCode={homeTeam.code} size={30} />
              <h4 className="text-[20px] text-[#0F171F] hidden xl:block">
                {getFirstWord(homeTeam.nickname)}
              </h4>
            </div>
            <div className="space-x-[8px]">
              <a
                href={ticketsLink}
                className="bg-[#FAFAFA] border border-[rgba(168,168,168,0.5)] inline-block text-center text-[15px] px-[6px] py-[5px] rounded-[100px] min-w-[110px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-[15px] text-black">Boletos</span>
              </a>
              <Link
                href={`/partidos/${providerId}`}
                className="bg-[#FAFAFA] border border-[rgba(168,168,168,0.5)] inline-block text-center text-[15px] px-[6px] py-[5px] rounded-[100px] min-w-[110px]"
              >
                <span className="text-[15px] text-black">Ver previa</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
