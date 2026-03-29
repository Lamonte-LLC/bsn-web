import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useMatchQuarterScoreBoard } from '../hooks/matches';

export type Props = {
  matchProviderId: string;
};

export default function MatchQuarterScoreBoardWidget({ matchProviderId }: Props) {
  const { data, stopPolling } = useMatchQuarterScoreBoard(matchProviderId, true);

  const homeTeamTotalScore = useMemo(() => {
    return data?.periods?.reduce(
      (total, period) => total + period.homeTeam.score,
      0,
    ) ?? 0;
  }, [data?.periods]);

  const visitorTeamTotalScore = useMemo(() => {
    return data?.periods?.reduce(
      (total, period) => total + period.visitorTeam.score,
      0,
    ) ?? 0;
  }, [data?.periods]);

  useEffect(() => {
      return () => {
        stopPolling();
      };
    }, [stopPolling]);

  return (
    <div>
      <div className="flex flex-row gap-3 py-2 md:gap-6">
        <div className="flex flex-1 gap-2">&nbsp;</div>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {data?.periods?.map((period) => (
            <div
              key={`${period.periodType}-${period.periodNumber}`}
              className="w-[32px]"
            >
              <p className="text-sm text-[rgba(0,0,0,0.5)] text-center">
                {period.periodType === 'OVERTIME'
                  ? `OT${period.periodNumber > 1 ? `${period.periodNumber}` : ''}`
                  : `Q${period.periodNumber}`}
              </p>
            </div>
          ))}
          <div className="w-[32px]">
            <p className="text-sm text-[rgba(0,0,0,0.5)] text-right">FINAL</p>
          </div>
        </div>
      </div>
      <div className="border-t border-t-[rgba(0,0,0,0.1)] flex flex-row gap-6 py-2">
        <Link href={`/equipos/${data?.visitorTeam.code}`} className="flex flex-1 flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={data?.visitorTeam.code ?? 'ZZZ'} size={28} />
          <div className="flex flex-row items-center gap-2">
            <p className="text-[17px]">{getFirstWord(data?.visitorTeam.nickname ?? '')}</p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
              {data?.visitorTeam.competitionStandings?.won ?? 0}-
              {data?.visitorTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {data?.periods?.map((period) => (
            <div
              key={`${period.periodType}-${period.periodNumber}-visitorTeam`}
              className="w-[32px]"
            >
              <p className="font-barlow text-base text-[rgba(0,0,0,0.9)] text-center">
                {period.visitorTeam.score}
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
        <Link href={`/equipos/${data?.homeTeam.code}`} className="flex flex-1 flex-row items-center gap-2">
          <TeamLogoAvatar teamCode={data?.homeTeam.code ?? 'ZZZ'} size={28} />
          <div className="flex flex-row items-center gap-2">
            <p className="text-[19px]">{getFirstWord(data?.homeTeam.nickname ?? '')}</p>
            <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
              {data?.homeTeam.competitionStandings?.won ?? 0}-
              {data?.homeTeam.competitionStandings?.lost ?? 0}
            </p>
          </div>
        </Link>
        <div className="flex flex-row justify-end gap-1 md:gap-4">
          {data?.periods?.map((period) => (
            <div
              key={`${period.periodType}-${period.periodNumber}-homeTeam`}
              className="w-[32px]"
            >
              <p className="font-barlow text-base text-[rgba(0,0,0,0.9)] text-center">
                {period.homeTeam.score}
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
