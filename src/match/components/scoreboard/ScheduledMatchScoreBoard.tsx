import { MATCH_DATE_FORMAT, MATCH_TIME_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';

type Props = {
  startAt: string;
  homeTeam: {
    code: string;
    nickname: string;
    color: string;
    city: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  visitorTeam: {
    code: string;
    nickname: string;
    color: string;
    city: string;
    competitionStandings?: {
      won: number;
      lost: number;
    };
  };
  venue: {
    name: string;
  };
};

export default function ScheduledMatchScoreBoard({
  startAt,
  homeTeam,
  visitorTeam,
  venue,
}: Props) {
  return (
    <div>
      <div className="flex flex-row justify-between items-start gap-3 md:gap-4 md:items-center">
        <div className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row md:items-end">
          <div className="hidden text-right md:block">
            <h4 className="text-white lg:text-[26px]/8">{homeTeam.nickname}</h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {homeTeam.city}
            </p>
            <p className="font-barlow text-xs text-[rgba(255,255,255,0.5)]">
              {homeTeam.competitionStandings?.won}-
              {homeTeam.competitionStandings?.lost}
            </p>
          </div>
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                homeTeam.color != null
                  ? homeTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar teamCode={homeTeam.code} size={60} />
            </div>
          </div>
          <div className="md:hidden">
            <p className="font-barlow text-xs text-[rgba(255,255,255,0.5)]">
              {homeTeam.competitionStandings?.won}-
              {homeTeam.competitionStandings?.lost}
            </p>
          </div>
        </div>
        <div className="grow">
          <div className="flex flex-row items-center justify-between gap-2 md:justify-center">
            <div className="md:hidden">
              <h4 className="text-[40px] text-white">{homeTeam.code}</h4>
            </div>
            <p className="text-[19px] text-white text-center md:text-[37px]">
              {formatDate(startAt, MATCH_TIME_FORMAT)}
            </p>
            <div className="md:hidden">
              <h4 className="text-[40px] text-white">{visitorTeam.code}</h4>
            </div>
          </div>
          <div>
            <p className="font-barlow text-[13px] text-white text-center md:mb-2 md:text-[15px]">
              {formatDate(startAt, MATCH_DATE_FORMAT)}
            </p>
            <p className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.5)] text-center">
              {venue.name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[7px] md:gap-[24px] md:flex-row md:items-end">
          <div
            className="flex flex-row items-center justify-center border-2 rounded-full  h-[60px] w-[60px] md:h-[100px] md:w-[100px]"
            style={{
              borderColor:
                visitorTeam.color != null
                  ? visitorTeam.color
                  : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <div className="scale-[0.6] md:scale-[1]">
              <TeamLogoAvatar teamCode={visitorTeam.code} size={60} />
            </div>
          </div>
          <div className="hidden text-left md:block">
            <h4 className="text-white lg:text-[26px]/8">
              {visitorTeam.nickname}
            </h4>
            <p className="font-barlow text-[15px] text-[rgba(255,255,255,0.7)]">
              {visitorTeam.city}
            </p>
            <p className="font-barlow text-xs text-[rgba(255,255,255,0.5)]">
              {visitorTeam.competitionStandings?.won}-
              {visitorTeam.competitionStandings?.lost}
            </p>
          </div>
          <div className="md:hidden">
            <p className="font-barlow text-xs text-[rgba(255,255,255,0.5)]">
              {visitorTeam.competitionStandings?.won}-
              {visitorTeam.competitionStandings?.lost}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
