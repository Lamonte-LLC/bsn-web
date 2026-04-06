'use client';

import numeral from "numeral";
import ShimmerLine from "@/shared/client/components/ui/ShimmerLine";
import TeamLogoAvatar from "@/team/components/avatar/TeamLogoAvatar";
import { usePlayerAllSeasonsTotalStats } from "../hooks/player";
import { getFirstWord } from "@/utils/text";

const STATS_HEADER: Record<string, string>[] = [
  { label: 'PJ', key: 'games' },
  { label: 'MIN', key: 'minutes' },
  { label: 'PTS', key: 'points' },
  { label: 'FGM', key: 'fieldGoalsMade' },
  { label: 'FGA', key: 'fieldGoalsAttempted' },
  { label: 'FG%', key: 'fieldGoalsPercentage' },
  { label: '3PM', key: 'threePointersMade' },
  { label: '3PA', key: 'threePointersAttempted' },
  { label: '3P%', key: 'threePointersPercentage' },
  { label: 'FTM', key: 'freeThrowsMade' },
  { label: 'FTA', key: 'freeThrowsAttempted' },
  { label: 'FT%', key: 'freeThrowsPercentage' },
  { label: 'OREB', key: 'offensiveRebounds' },
  { label: 'DREB', key: 'defensiveRebounds' },
  { label: 'REB', key: 'reboundsTotal' },
  { label: 'AST', key: 'assists' },
  { label: 'TOV', key: 'turnovers' },
  { label: 'STL', key: 'steals' },
  { label: 'BLK', key: 'blocks' },
  { label: 'PF', key: 'foulsPersonal' },
];

type Props = {
  playerProviderId: string;
};

export default function PlayerAllSeasonsTotalStatsWidget({
  playerProviderId,
}: Props) {
  const { data, loading } = usePlayerAllSeasonsTotalStats(playerProviderId);

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
              <td className="px-2 py-2 text-center">
                <div className="flex flex-row items-center gap-2 w-[200px]">
                  <TeamLogoAvatar teamCode={item.team?.code ?? ''} size={20} />
                  <span className="font-special-gothic-condensed-one text-[16px] leading-[1.4] tracking-[0.32px] text-black">
                    {getFirstWord(item.team?.nickname ?? '')}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.games ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.minutes ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.points ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.fieldGoalsMade ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.fieldGoalsAttempted ?? 0).format(
                    '0',
                  )}
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
                  {numeral(item.stats?.threePointersMade ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.threePointersAttempted ?? 0).format(
                    '0',
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
                  {numeral(item.stats?.freeThrowsMade ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.freeThrowsAttempted ?? 0).format(
                    '0',
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
                  {numeral(item.stats?.offensiveRebounds ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.defensiveRebounds ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.reboundsTotal ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.assists ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.turnovers ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.steals ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.blocks ?? 0).format('0')}
                </span>
              </td>
              <td className="px-2 py-2 text-center">
                <span className="font-barlow text-[13px]">
                  {numeral(item.stats?.foulsPersonal ?? 0).format('0')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
