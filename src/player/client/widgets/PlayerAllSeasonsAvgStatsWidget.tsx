'use client';

import numeral from 'numeral';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';
import { usePlayerAllSeasonsAvgStats } from '../hooks/player';


const STATS_HEADER: Record<string, string>[] = [
  { label: 'MIN', key: 'minutesAvg' },
  { label: 'PTS', key: 'pointsAvg' },
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
};

export default function PlayerAllSeasonsAvgStatsWidget({
  playerProviderId,
}: Props) {
  const { data, loading } = usePlayerAllSeasonsAvgStats(playerProviderId);

  if (loading) {
    return (
      <div className="space-y-2">
        <ShimmerLine height="24px" />
        <ShimmerLine height="24px" />
        <ShimmerLine height="24px" />
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
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-2 py-2 text-center whitespace-nowrap w-[1%]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                AÑO
              </span>
            </th>
            <th className="border-b border-b-[rgba(0,0,0,0.07)] px-2 py-2 text-left whitespace-nowrap w-[1%]">
              <span className="font-normal text-[13px] text-[rgba(0,0,0,0.6)]">
                EQUIPO
              </span>
            </th>
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
          {data.map((item) => (
            <tr
              key={`${item.season?.year}-${item.team?.code}-${item.player.providerId}`}
            >
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {item.season?.year ?? '—'}
                </span>
              </td>
              <td className="px-2 py-2 pr-[40px] text-center">
                <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                  <TeamLogoAvatar teamCode={item.team?.code ?? ''} size={20} />
                  <span className="font-special-gothic-condensed-one text-[16px] leading-[1.4] tracking-[0.32px] text-black">
                    {getFirstWord(item.team?.nickname ?? '')}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.minutesAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.pointsAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.fieldGoalsPercentage ?? 0).format(
                    '0.0%',
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.threePointersMadeAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.threePointersAttemptedAvg ?? 0).format(
                    '0.0',
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.threePointersPercentage ?? 0).format(
                    '0.0%',
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.freeThrowsMadeAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.freeThrowsAttemptedAvg ?? 0).format(
                    '0.0',
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.freeThrowsPercentage ?? 0).format(
                    '0.0%',
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.offensiveReboundsAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.defensiveReboundsAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.reboundsTotalAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.assistsAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.turnoversAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.stealsAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.blocksAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.foulsPersonalAvg ?? 0).format('0.0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.plusMinusPointsAvg ?? 0).format('0.0')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
