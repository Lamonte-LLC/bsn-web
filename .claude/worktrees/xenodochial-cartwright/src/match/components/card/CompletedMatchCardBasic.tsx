import { MATCH_DATE_FORMAT } from '@/constants';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatDate } from '@/utils/date-formatter';
import { useMemo } from 'react';

type Props = {
  startAt: string;
  homeTeam: {
    code: string;
    score: string;
  };
  visitorTeam: {
    code: string;
    score: string;
  };
  overtimePeriods?: number;
};

export default function CompletedMatchCardBasic({
  startAt,
  homeTeam,
  visitorTeam,
  overtimePeriods = 0,
}: Props) {
  const isHomeTeamWinner = useMemo(
    () => parseInt(homeTeam.score) > parseInt(visitorTeam.score),
    [homeTeam, visitorTeam],
  );

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
    <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A] min-w-[142px]">
      <div className="border-b border-b-[rgba(125,125,125,0.15)] flex flex-row justify-between items-center mx-[12px] py-[8px]">
        <p className="font-barlow font-medium text-xs text-[rgba(0,0,0,0.7)]">
          {formatDate(startAt, MATCH_DATE_FORMAT)}
        </p>
        <p className="font-barlow-condensed font-semibold text-[13px] text-black">
          Final {overtimePeriodLabel}
        </p>
      </div>
      <div className="px-[12px] py-[10px] space-y-[1px]">
        <div className="flex flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={visitorTeam.code} size={26} />
          <p className="grow text-[21px]/7 text-black">{visitorTeam.code}</p>
          <figure>
            <img
              src="/assets/images/icons/icon-caret-winner.png"
              alt=""
              width="6"
              className="rotate-180"
              style={{ opacity: !isHomeTeamWinner ? 1 : 0 }}
            />
          </figure>
          <p
            className="text-[21px]/7"
            style={{
              color: !isHomeTeamWinner ? '#000000' : 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {visitorTeam.score}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={homeTeam.code} size={26} />
          <p className="grow text-[21px]/7 text-black">{homeTeam.code}</p>
          <figure>
            <img
              src="/assets/images/icons/icon-caret-winner.png"
              alt=""
              width="6"
              className="rotate-180"
              style={{ opacity: isHomeTeamWinner ? 1 : 0 }}
            />
          </figure>
          <p
            className="text-[21px]/7"
            style={{
              color: isHomeTeamWinner ? '#000000' : 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {homeTeam.score}
          </p>
        </div>
      </div>
    </div>
  );
}
