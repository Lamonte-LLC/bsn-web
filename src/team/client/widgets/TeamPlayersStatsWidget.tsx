'use client';

import numeral from 'numeral';
import { useTeamPlayersStatsConnection } from '../hooks/teams';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { getInitials } from '@/utils/text';
import Link from 'next/link';

type Props = {
  teamCode: string;
};

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'games' },
  { label: 'MIN', key: 'minutesAvg' },
  { label: 'PTS', key: 'pointsAvg' },
  { label: 'FGM', key: 'fieldGoalsMadeAvg' },
  { label: 'FGA', key: 'fieldGoalsAttemptedAvg' },
  { label: 'FG%', key: 'fieldGoalsPercentage' },
  { label: '3PM', key: 'threePointersMadeAvg' },
  { label: '3PA', key: 'threePointersAttemptedAvg' },
  { label: '3P%', key: 'threePointersPercentage' },
  { label: 'FTM', key: 'freeThrowsMadeAvg' },
  { label: 'FTA', key: 'freeThrowsAttemptedAvg' },
  { label: 'FT%', key: 'freeThrowsPercentage' },
  { label: 'OREB', key: 'offensiveReboundsAvg' },
  { label: 'DREB', key: 'defensiveReboundsAvg' },
  { label: 'REB', key: 'reboundsTotal' },
  { label: 'AST', key: 'assistsAvg' },
  { label: 'TOV', key: 'turnoversAvg' },
  { label: 'STL', key: 'stealsAvg' },
  { label: 'BLK', key: 'blocksAvg' },
  { label: 'PF', key: 'foulsPersonalAvg' },
  { label: '+/-', key: 'plusMinusPointsAvg' },
];

const getStatFormat = (key: string) => {
  const lower = key.toLowerCase();
  if (lower.includes('percentage')) return '0.0%';
  if (lower.includes('avg')) return '0.0';
  return '0';
}

export default function TeamPlayersStatsWidget({ teamCode }: Props) {
  const { data, loading } = useTeamPlayersStatsConnection(teamCode);

  if (loading) {
    return (
      <div className="space-y-3">
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
        <ShimmerLine height="32px" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                JUGADOR
              </span>
            </th>
            {STATS_HEADER.map((item) => (
              <th
                key={`header-${item.key}`}
                className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap w-[1%]"
              >
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                  {item.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.edges.map(({ node }, index) => (
            <tr
              key={`player-${node.providerId}`}
              style={{
                backgroundColor: index % 2 === 1 ? '#F9F9F9' : 'transparent',
              }}
            >
              <td className="px-4 py-3">
                <Link href={`/jugadores/${node.providerId}`}>
                  <div className="flex flex-row items-center gap-2 w-[140px] md:w-[180px]">
                    <span className="hidden text-base md:inline truncate min-w-0">{node.name}</span>
                    <span className="text-base md:hidden truncate min-w-0">{getInitials(node.name)}</span>
                    <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)] shrink-0">
                      {node.seasonRoster?.playingPosition}
                    </span>
                  </div>
                </Link>
              </td>
              {STATS_HEADER.map((item) => (
                <td key={`value-${item.key}`} className="px-4 py-3 text-center">
                  <span className="font-barlow text-[13px]">
                    {numeral(node.seasonStats?.[item.key as keyof typeof node.seasonStats] ??
                        0).format(getStatFormat(item.key))}
                  </span>
                </td>
              ))}
            </tr>
          ))}
          {data.edges.length === 0 && (
            <tr>
              <td
                colSpan={STATS_HEADER.length + 1}
                className="px-4 py-3 text-center"
              >
                <span className="text-[rgba(0,0,0,0.6)]">
                  No hay estadísticas disponibles
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
