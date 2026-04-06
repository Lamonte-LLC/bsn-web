'use client';

import numeral from 'numeral';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { usePlayerAvgStats } from '../hooks/player';

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'gamesAvg' },
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
  { label: 'REB', key: 'reboundsTotalAvg' },
  { label: 'AST', key: 'assistsAvg' },
  { label: 'TOV', key: 'turnoversAvg' },
  { label: 'STL', key: 'stealsAvg' },
  { label: 'BLK', key: 'blocksAvg' },
  { label: 'PF', key: 'foulsPersonalAvg' },
  { label: '+/-', key: 'plusMinusPointsAvg' },
];

type Props = {
  playerProviderId: string;
  seasonProviderId: string;
};

export default function PlayerSeasonAvgStatsWidget({
  playerProviderId,
  seasonProviderId,
}: Props) {
  const { data, loading } = usePlayerAvgStats(playerProviderId, seasonProviderId);

  if (loading) {
    return (
      <div className="space-y-2">
        <ShimmerLine height="24px" />
        <ShimmerLine height="24px" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {STATS_HEADER.map((item) => (
              <th
                key={`header-${item.key}`}
                className="border-b border-b-[rgba(0,0,0,0.07)] px-2 py-2 text-center whitespace-nowrap w-[1%]"
              >
                <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                  {item.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.gamesAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.minutesAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.pointsAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.fieldGoalsMadeAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.fieldGoalsAttemptedAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.fieldGoalsPercentage ?? 0).format(
                  '0.0%',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.threePointersMadeAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(
                  data.player.seasonStats?.threePointersAttemptedAvg ?? 0,
                ).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(
                  data.player.seasonStats?.threePointersPercentage ?? 0,
                ).format('0.0%')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.freeThrowsMadeAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.freeThrowsAttemptedAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.freeThrowsPercentage ?? 0).format(
                  '0.0%',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.offensiveReboundsAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.defensiveReboundsAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.reboundsTotalAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.assistsAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.turnoversAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.stealsAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.blocksAvg ?? 0).format('0.0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.foulsPersonalAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.plusMinusPointsAvg ?? 0).format(
                  '0.0',
                )}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
