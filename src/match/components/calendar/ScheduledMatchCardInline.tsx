import Link from 'next/link';

import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { MATCH_DATE_FULL_FORMAT, MATCH_TIME_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  providerId: string;
  startAt: string;
  homeTeam: {
    nickname: string;
    code: string;
    ticketUrl: string;
  };
  visitorTeam: {
    nickname: string;
    code: string;
    ticketUrl: string;
  };
  contextTeam: {
    code: string;
  };
};

export default function ScheduledMatchCardInline({
  providerId,
  startAt,
  homeTeam,
  visitorTeam,
  contextTeam,
}: Props) {
  return (
    <div>
      <div className="mb-[20px]">
        <p className="font-barlow font-medium text-[15px] text-[rgba(0,0,0,0.7)]">
          {formatDate(startAt, MATCH_DATE_FULL_FORMAT)}
        </p>
      </div>
      <div className="border border-[rgba(125,125,125,0.15)] rounded-[12px] p-[10px]">
        <div className="flex flex-row items-center justify-between">
          <div className="px-[28px]">
            <p className="text-[18px] text-black">
              {formatDate(startAt, MATCH_TIME_FORMAT)}
            </p>
          </div>
          <div className="border-l border-l-[rgba(125,125,125,0.15)] flex-1 flex flex-row gap-[20px] pl-[28px]">
            <h4 className="text-[20px] text-[#0F171F]">{homeTeam.nickname}</h4>
            <TeamLogoAvatar teamCode={homeTeam.code} size={30} />
            <div className="border border-[#E1E1E1] flex items-center justify-center rounded-full h-[30px] w-[30px]">
              <span className="font-barlow-condensed text-base text-[rgba(15,23,31,0.8)] leading-[30px]">
                {contextTeam.code === homeTeam.code ? 'vs' : 'en'}
              </span>
            </div>
            <TeamLogoAvatar teamCode={visitorTeam.code} size={30} />
            <h4 className="text-[20px] text-[#0F171F]">
              {visitorTeam.nickname}
            </h4>
          </div>
          <div className="space-x-[8px]">
            <a
              href={
                contextTeam.code === homeTeam.code
                  ? homeTeam.ticketUrl
                  : visitorTeam.ticketUrl
              }
              className="border border-[#D5D5D5] inline-block text-center text-[15px] p-[8px] rounded-[100px] min-w-[110px]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-[15px] text-black">Boletos</span>
            </a>
            <Link
              href={`/partidos/${providerId}`}
              className="border border-[#D5D5D5] inline-block text-center text-[15px] p-[8px] rounded-[100px] min-w-[110px]"
            >
              <span className="text-[15px] text-black">Ver previa</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
