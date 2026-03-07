'use client';

import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { useTeamStats } from '@/team/client/hooks/teams';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';
import numeral from 'numeral';

type Props = {
  teamCode: string;
};

const AVG_STATS_HEADER: Record<string, string>[] = [
  { label: 'PTS', key: 'pointsAverage' },
  { label: 'FGM', key: 'fieldGoalsMadeAverage' },
  { label: 'FGA', key: 'fieldGoalsAttemptedAverage' },
  { label: 'FG%', key: 'fieldGoalsPercentage' },
  { label: '3PM', key: 'threePointersMadeAverage' },
  { label: '3PA', key: 'threePointersAttemptedAverage' },
  { label: '3P%', key: 'threePointersPercentage' },
  { label: 'FTM', key: 'freeThrowsMadeAverage' },
  { label: 'FTA', key: 'freeThrowsAttemptedAverage' },
  { label: 'FT%', key: 'freeThrowsPercentage' },
  { label: 'OREB', key: 'offensiveReboundsAverage' },
  { label: 'DREB', key: 'defensiveReboundsAverage' },
  { label: 'REB', key: 'reboundsTotalAverage' },
  { label: 'AST', key: 'assistsAverage' },
  { label: 'TO', key: 'turnoversAverage' },
  { label: 'STL', key: 'stealsAverage' },
  { label: 'BLK', key: 'blocksAverage' },
  { label: 'PF', key: 'foulsPersonalAverage' },
];

const TOTAL_STATS_HEADER: Record<string, string>[] = [
  { label: 'PTS', key: 'points' },
  { label: 'FGM', key: 'fieldGoalsMade' },
  { label: 'FGA', key: 'fieldGoalsAttempted' },
  { label: '3PM', key: 'threePointersMade' },
  { label: '3PA', key: 'threePointersAttempted' },
  { label: 'FTM', key: 'freeThrowsMade' },
  { label: 'FTA', key: 'freeThrowsAttempted' },
  { label: 'OREB', key: 'offensiveRebounds' },
  { label: 'DREB', key: 'defensiveRebounds' },
  { label: 'REB', key: 'reboundsTotal' },
  { label: 'AST', key: 'assists' },
  { label: 'TO', key: 'turnovers' },
  { label: 'STL', key: 'steals' },
  { label: 'BLK', key: 'blocks' },
  { label: 'PF', key: 'foulsPersonal' },
];

export default function TeamSeasonStatsWidget({ teamCode }: Props) {
  const { data, loading } = useTeamStats(teamCode);
  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h2 className="font-special-gothic-condensed-one text-[24px] leading-none text-black tracking-[0.24px]">
          Promedios - Temporada 2026
        </h2>
      </div>
      <div className="mb-6 md:mb-10 lg:mb-15">
        {loading ? (
          <div className="space-y-2">
            <ShimmerLine height="24px" />
            <ShimmerLine height="24px" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b border-b-[rgba(0,0,0,0.1)] py-3 pr-3 whitespace-nowrap w-[1%] hidden md:table-cell">
                    <span className="font-normal text-[13px] tracking-[0.52px] text-[rgba(0,0,0,0.6)] uppercase">
                      EQUIPO
                    </span>
                  </th>
                  {AVG_STATS_HEADER.map((item) => (
                    <th
                      key={`header-${item.key}`}
                      className="border-b border-b-[rgba(0,0,0,0.1)] py-3 px-2 text-center whitespace-nowrap w-[1%]"
                    >
                      <span className="font-normal text-[13px] tracking-[1.17px] text-[rgba(0,0,0,0.6)] uppercase">
                        {item.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 pr-3 whitespace-nowrap w-[1%] hidden md:table-cell">
                    <div className="flex flex-row items-center gap-2 w-[200px]">
                      <TeamLogoAvatar teamCode={data?.code ?? ''} size={20} />
                      <span className="font-special-gothic-condensed-one text-[16px] leading-[1.4] tracking-[0.32px] text-black">
                        {getFirstWord(data?.name ?? '')}
                      </span>
                    </div>
                  </td>
                  {AVG_STATS_HEADER.map((item) => (
                    <td
                      key={`value-${item.key}`}
                      className="py-3 px-2 text-center"
                    >
                      <span className="font-barlow text-[13px] text-black">
                        {['FG%', '3P%', 'FT%'].includes(item.label)
                          ? numeral(
                              data?.seasonStats?.[
                                item.key as keyof typeof data.seasonStats
                              ] ?? 0,
                            ).format('0%')
                          : numeral(
                              data?.seasonStats?.[
                                item.key as keyof typeof data.seasonStats
                              ] ?? 0,
                            ).format('0.0')}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mb-6 md:mb-8">
        <h2 className="font-special-gothic-condensed-one text-[24px] leading-none text-black tracking-[0.24px]">
          Totales - Temporada 2026
        </h2>
      </div>
      <div className="mb-6 md:mb-10 lg:mb-15">
        {loading ? (
          <div className="space-y-2">
            <ShimmerLine height="24px" />
            <ShimmerLine height="24px" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b border-b-[rgba(0,0,0,0.1)] py-3 pr-3 whitespace-nowrap w-[1%] hidden md:table-cell">
                    <span className="font-normal text-[13px] tracking-[0.52px] text-[rgba(0,0,0,0.6)] uppercase">
                      EQUIPO
                    </span>
                  </th>
                  {TOTAL_STATS_HEADER.map((item) => (
                    <th
                      key={`header-${item.key}`}
                      className="border-b border-b-[rgba(0,0,0,0.1)] py-3 px-2 text-center whitespace-nowrap w-[1%]"
                    >
                      <span className="font-normal text-[13px] tracking-[1.17px] text-[rgba(0,0,0,0.6)] uppercase">
                        {item.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 pr-3 whitespace-nowrap w-[1%] hidden md:table-cell">
                    <div className="flex flex-row items-center gap-2 w-[180px]">
                      <TeamLogoAvatar teamCode={data?.code ?? ''} size={20} />
                      <span className="font-special-gothic-condensed-one text-[16px] leading-[1.4] tracking-[0.32px] text-black">
                        {getFirstWord(data?.name ?? '')}
                      </span>
                    </div>
                  </td>
                  {TOTAL_STATS_HEADER.map((item) => (
                    <td
                      key={`value-${item.key}`}
                      className="py-3 px-2 text-center"
                    >
                      <span className="font-barlow text-[13px] text-black">
                        {numeral(
                          data?.seasonStats?.[
                            item.key as keyof typeof data.seasonStats
                          ] ?? 0,
                        ).format('0')}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
