'use client';

import numeral from 'numeral';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { usePlayerTotalStats } from '../hooks/player';

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'games' },
  { label: 'MIN', key: 'minutes' },
  { label: 'PTS', key: 'points' },
  { label: '3PM', key: 'threePointersMade' },
  { label: 'AST', key: 'assists' },
  { label: 'REB', key: 'reboundsTotal' },
  { label: 'STL', key: 'steals' },
  { label: 'BLK', key: 'blocks' },
];

type Props = {
  playerProviderId: string;
  seasonProviderId: string;
};

export default function PlayerSeasonTotalStatsWidget({
  playerProviderId,
  seasonProviderId,
}: Props) {
  const { data, loading } = usePlayerTotalStats(
    playerProviderId,
    seasonProviderId,
  );

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
                {numeral(data.player.seasonStats?.games ?? 0).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.minutes ?? 0).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.points ?? 0).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(
                  data.player.seasonStats?.threePointersMade ?? 0,
                ).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.assists ?? 0).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.reboundsTotal ?? 0).format(
                  '0',
                )}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.steals ?? 0).format('0')}
              </span>
            </td>
            <td className="px-2 py-2 text-center">
              <span className="font-barlow text-[13px]">
                {numeral(data.player.seasonStats?.blocks ?? 0).format('0')}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
