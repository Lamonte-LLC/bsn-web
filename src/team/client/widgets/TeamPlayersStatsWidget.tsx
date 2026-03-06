'use client';

import numeral from 'numeral';
import { useTeamPlayersStatsConnection } from '../hooks/teams';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';

type Props = {
  teamCode: string;
};

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'games' },
  { label: 'MIN', key: 'minutes' },
  { label: 'PTS', key: 'points' },
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
  { label: 'REB', key: 'reboundsTotalAvg' },
  { label: 'AST', key: 'assistsAvg' },
  { label: 'TOV', key: 'turnoversAvg' },
  { label: 'STL', key: 'stealsAvg' },
  { label: 'BLK', key: 'blocksAvg' },
  { label: 'PF', key: 'foulsPersonalAvg' },
];

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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3">
              <span className="font-semibold text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
                JUGADOR
              </span>
            </th>
            {STATS_HEADER.map((item) => (
              <th
                key={`header-${item.key}`}
                className="border-b border-b-[rgba(0,0,0,0.07)] px-4 py-3 text-center whitespace-nowrap w-[1%]"
              >
                <span className="font-semibold text-[13px] text-[rgba(0,0,0,0.6)] tracking-[0.05em]">
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
                <div className="flex flex-row items-center gap-2">
                  <span className="text-base">{node.name}</span>
                  <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.7)]">
                    {node.playingPosition}
                  </span>
                </div>
              </td>
              {STATS_HEADER.map((item) => (
                <td key={`value-${item.key}`} className="px-4 py-3 text-center">
                  <span className="font-barlow text-[13px]">
                    {['FG%', '3PT%', 'FT%'].includes(item.label)
                      ? numeral(
                          node.stats?.[item.key as keyof typeof node.stats] ??
                            0,
                        ).format('0.0%')
                      : (node.stats?.[item.key as keyof typeof node.stats] ??
                        0)}
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
