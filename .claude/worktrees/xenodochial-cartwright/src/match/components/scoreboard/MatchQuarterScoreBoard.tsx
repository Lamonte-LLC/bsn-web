import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';
import Link from 'next/link';
import { useMemo } from 'react';

export type PeriodScoreProps = {
  periodNumber: number;
  periodType: string;
  homeTeam: {
    score: number;
  };
  visitorTeam: {
    score: number;
  };
};

export type Props = {
  homeTeam: {
    code: string;
    nickname: string;
    competitionStandings: {
      won: number;
      lost: number;
    };
  };
  visitorTeam: {
    code: string;
    nickname: string;
    competitionStandings: {
      won: number;
      lost: number;
    };
  };
  quarters: PeriodScoreProps[];
};

export default function MatchQuarterScoreBoard({
  homeTeam,
  visitorTeam,
  quarters = [],
}: Props) {
  const homeTeamTotalScore = useMemo(() => {
    return quarters.reduce(
      (total, quarter) => total + quarter.homeTeam.score,
      0,
    );
  }, [quarters]);

  const visitorTeamTotalScore = useMemo(() => {
    return quarters.reduce(
      (total, quarter) => total + quarter.visitorTeam.score,
      0,
    );
  }, [quarters]);

  return (
    <div>
      <div className="flex flex-row gap-3 py-2 md:gap-6">
        <div className="flex flex-1 gap-2">&nbsp;</div>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}`}
              className="w-[32px]"
            >
              <p className="text-sm text-[rgba(0,0,0,0.5)] text-center">
                {quarter.periodType === 'OVERTIME'
                  ? `OT${quarter.periodNumber > 1 ? `${quarter.periodNumber}` : ''}`
                  : `Q${quarter.periodNumber}`}
              </p>
            </div>
          ))}
          <div className="w-[32px]">
            <p className="text-sm text-[rgba(0,0,0,0.5)] text-right">FINAL</p>
          </div>
        </div>
      </div>
      <div className="border-t border-t-[rgba(0,0,0,0.1)] flex flex-row gap-6 py-2">
        <Link href={`/equipos/${visitorTeam.code}`} className="flex flex-1 flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={visitorTeam.code} size={28} />
          <div className="flex flex-row items-center gap-2">
            <p className="text-[17px]">{getFirstWord(visitorTeam.nickname)}</p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
              {visitorTeam.competitionStandings?.won ?? 0}-
              {visitorTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}-visitorTeam`}
              className="w-[32px]"
            >
              <p className="font-barlow text-base text-[rgba(0,0,0,0.9)] text-center">
                {quarter.visitorTeam.score}
              </p>
            </div>
          ))}
          <div className="w-[32px]">
            <p
              className="font-barlow text-base text-right"
              style={{
                color:
                  visitorTeamTotalScore > homeTeamTotalScore
                    ? 'rgba(0,0,0,0.9)'
                    : 'rgba(0,0,0,0.6)',
                fontWeight:
                  visitorTeamTotalScore > homeTeamTotalScore ? '700' : '400',
              }}
            >
              {visitorTeamTotalScore}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6 py-2">
        <Link href={`/equipos/${homeTeam.code}`} className="flex flex-1 flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={homeTeam.code} size={28} />
          <div className="flex flex-row items-center gap-2">
            <p className="text-[19px]">{getFirstWord(homeTeam.nickname)}</p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
              {homeTeam.competitionStandings?.won ?? 0}-
              {homeTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}-homeTeam`}
              className="w-[32px]"
            >
              <p className="font-barlow text-base text-[rgba(0,0,0,0.9)] text-center">
                {quarter.homeTeam.score}
              </p>
            </div>
          ))}
          <div className="w-[32px]">
            <p
              className="font-barlow text-base text-right"
              style={{
                color:
                  homeTeamTotalScore > visitorTeamTotalScore
                    ? 'rgba(0,0,0,0.9)'
                    : 'rgba(0,0,0,0.6)',
                fontWeight:
                  homeTeamTotalScore > visitorTeamTotalScore ? '700' : '400',
              }}
            >
              {homeTeamTotalScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
