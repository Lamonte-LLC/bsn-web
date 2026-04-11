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

  const scoreColClass = 'w-10 shrink-0';
  const outerRowClass = 'flex flex-row items-center gap-4 py-2';
  const scoresClass = 'flex flex-row items-center gap-4';

  return (
    <div>
      {/* Header row */}
      <div className={outerRowClass}>
        <div className="flex-1" />
        <div className={scoresClass}>
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}`}
              className={scoreColClass}
            >
              <p className="font-special-gothic-condensed-one text-[14px] leading-[140%] tracking-[0.04em] uppercase text-center text-[rgba(0,0,0,0.9)]">
                {quarter.periodType === 'OVERTIME'
                  ? `OT${quarter.periodNumber > 1 ? `${quarter.periodNumber}` : ''}`
                  : `Q${quarter.periodNumber}`}
              </p>
            </div>
          ))}
          <div className="w-10 shrink-0">
            <p className="font-special-gothic-condensed-one text-[14px] leading-[140%] tracking-[0.04em] uppercase text-right text-[rgba(0,0,0,0.9)]">
              FINAL
            </p>
          </div>
        </div>
      </div>

      {/* Visitor team row */}
      <div className={`border-b border-[rgba(0,0,0,0.1)] ${outerRowClass}`}>
        <Link href={`/equipos/${visitorTeam.code}`} className="flex flex-1 flex-row items-center gap-3 min-w-0">
          <div className="w-8 shrink-0 flex items-center justify-center">
            <TeamLogoAvatar teamCode={visitorTeam.code} size={24} />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <p className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.9)] truncate">
              {getFirstWord(visitorTeam.nickname)}
            </p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.45)] shrink-0">
              {visitorTeam.competitionStandings?.won ?? 0}-{visitorTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className={scoresClass}>
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}-visitorTeam`}
              className={scoreColClass}
            >
              <p className="font-barlow text-[15px] text-[rgba(0,0,0,0.8)] text-center">
                {quarter.visitorTeam.score}
              </p>
            </div>
          ))}
          <div className="w-10 shrink-0">
            <p
              className={`font-barlow text-[15px] text-right ${
                visitorTeamTotalScore > homeTeamTotalScore
                  ? 'font-bold text-[rgba(0,0,0,0.9)]'
                  : 'text-[rgba(0,0,0,0.4)]'
              }`}
            >
              {visitorTeamTotalScore}
            </p>
          </div>
        </div>
      </div>

      {/* Home team row */}
      <div className={outerRowClass}>
        <Link href={`/equipos/${homeTeam.code}`} className="flex flex-1 flex-row items-center gap-3 min-w-0">
          <div className="w-8 shrink-0 flex items-center justify-center">
            <TeamLogoAvatar teamCode={homeTeam.code} size={24} />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <p className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.9)] truncate">
              {getFirstWord(homeTeam.nickname)}
            </p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.45)] shrink-0">
              {homeTeam.competitionStandings?.won ?? 0}-{homeTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className={scoresClass}>
          {quarters.map((quarter) => (
            <div
              key={`${quarter.periodType}-${quarter.periodNumber}-homeTeam`}
              className={scoreColClass}
            >
              <p className="font-barlow text-[15px] text-[rgba(0,0,0,0.8)] text-center">
                {quarter.homeTeam.score}
              </p>
            </div>
          ))}
          <div className="w-10 shrink-0">
            <p
              className={`font-barlow text-[15px] text-right ${
                homeTeamTotalScore > visitorTeamTotalScore
                  ? 'font-bold text-[rgba(0,0,0,0.9)]'
                  : 'text-[rgba(0,0,0,0.4)]'
              }`}
            >
              {homeTeamTotalScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
