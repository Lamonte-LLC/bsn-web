import numeral from 'numeral';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

export type MatchTeamComparisonBoxScore = {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowsPercentage: number;
  offensiveRebounds: number;
  reboundsTotal: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  foulsPersonal: number;
};

type StatItem = {
  key: string;
  label: string;
  field:
    | keyof MatchTeamComparisonBoxScore
    | [keyof MatchTeamComparisonBoxScore, keyof MatchTeamComparisonBoxScore];
};

export type MatchTeamComparisonRow = {
  key: string;
  label: string;
  /** `percent`: 0–1 (tiro). `decimal`: promedio con un decimal (temporada). */
  format?: 'number' | 'percent' | 'decimal';
  /** Por defecto true. `TO`: menos es mejor. */
  higherIsBetter?: boolean;
};

/** Partido en vivo o finalizado: acumulados del partido. */
export const MATCH_TEAM_COMPARISON_BOX_SCORE_ROWS: MatchTeamComparisonRow[] = [
  { key: 'points', label: 'PTS' },
  { key: 'rebounds', label: 'REB' },
  { key: 'assists', label: 'AST' },
  { key: 'steals', label: 'STL' },
  { key: 'blocks', label: 'BLK' },
  { key: 'turnovers', label: 'TO', higherIsBetter: false },
];

/** Partido programado: mismas 6 categorías que en vivo, con promedios por juego (temporada). */
export const MATCH_TEAM_COMPARISON_SEASON_PER_GAME_ROWS: MatchTeamComparisonRow[] = [
  { key: 'points', label: 'PTS', format: 'decimal' },
  { key: 'rebounds', label: 'REB', format: 'decimal' },
  { key: 'assists', label: 'AST', format: 'decimal' },
  { key: 'steals', label: 'STL', format: 'decimal' },
  { key: 'blocks', label: 'BLK', format: 'decimal' },
  { key: 'turnovers', label: 'TO', format: 'decimal', higherIsBetter: false },
];

const STAT_KEYS: StatItem[] = [
  { key: 'FG', label: 'FG', field: ['fieldGoalsMade', 'fieldGoalsAttempted'] },
  { key: 'FG%', label: 'FG%', field: 'fieldGoalsPercentage' },
  { key: '3PT%', label: '3PT%', field: 'threePointersPercentage' },
  { key: '3PT', label: '3PT', field: ['threePointersMade', 'threePointersAttempted'] },
  { key: 'FT', label: 'FT', field: ['freeThrowsMade', 'freeThrowsAttempted'] },
  { key: 'FT%', label: 'FT%', field: 'freeThrowsPercentage' },
  { key: 'REB', label: 'REB', field: 'reboundsTotal' },
  { key: 'OREB', label: 'OREB', field: 'offensiveRebounds' },
  { key: 'AST', label: 'AST', field: 'assists' },
  { key: 'STL', label: 'STL', field: 'steals' },
  { key: 'BLK', label: 'BLK', field: 'blocks' },
  { key: 'TO', label: 'TO', field: 'turnovers' },
  { key: 'PF', label: 'PF', field: 'foulsPersonal' },
];

type Props = {
  homeTeam: {
    code: string;
  };
  visitorTeam: {
    code: string;
  };
  homeTeamBoxScore: MatchTeamComparisonBoxScore | Record<string, number>;
  visitorTeamBoxScore: MatchTeamComparisonBoxScore | Record<string, number>;
  rows?: MatchTeamComparisonRow[];
  subtitle?: string;
};

function formatCellValue(
  value: number,
  format: 'number' | 'percent' | 'decimal' | undefined,
) {
  if (format === 'percent') {
    return numeral(value).format('0.0%');
  }
  if (format === 'decimal') {
    return numeral(value).format('0.0');
  }
  return value;
}

const PERCENTAGE_STATS = new Set(['FG%', '3PT%', 'FT%']);

/**
 * Synergy / GraphQL often returns shooting % as 0–100 (e.g. 45.5).
 * Numeral's `0.0%` format expects a 0–1 fraction and multiplies by 100, so
 * passing 45.5 would render as ~4550%. Normalize to decimal before formatting.
 */
function shootingPercentToDecimal(value: number): number {
  if (value == null || Number.isNaN(value)) return 0;
  return value > 1 ? value / 100 : value;
}

function isTypedBoxScore(
  bs: MatchTeamComparisonBoxScore | Record<string, number>,
): bs is MatchTeamComparisonBoxScore {
  return 'fieldGoalsMade' in bs;
}

export default function MatchTeamStatsComparison({
  homeTeam,
  visitorTeam,
  homeTeamBoxScore,
  visitorTeamBoxScore,
  rows,
  subtitle,
}: Props) {
  const useDetailedView =
    !rows &&
    isTypedBoxScore(homeTeamBoxScore) &&
    isTypedBoxScore(visitorTeamBoxScore);

  const getStatValue = (
    boxScore: MatchTeamComparisonBoxScore,
    stat: StatItem,
  ): number | string => {
    if (Array.isArray(stat.field)) {
      return `${boxScore[stat.field[0]]}/${boxScore[stat.field[1]]}`;
    }
    if (PERCENTAGE_STATS.has(stat.key)) {
      const raw = boxScore[stat.field];
      return numeral(shootingPercentToDecimal(raw)).format('0.0%');
    }
    return boxScore[stat.field];
  };

  const getStatNumericValue = (
    boxScore: MatchTeamComparisonBoxScore,
    stat: StatItem,
  ): number => {
    if (Array.isArray(stat.field)) {
      return boxScore[stat.field[0]];
    }
    if (PERCENTAGE_STATS.has(stat.key)) {
      return shootingPercentToDecimal(boxScore[stat.field]);
    }
    return boxScore[stat.field];
  };

  return (
    <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="px-[30px] pt-[24px] flex flex-row justify-between items-center">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Comparación de equipos
          </h3>
          {subtitle ? (
            <p className="mt-1 font-barlow text-sm text-[rgba(0,0,0,0.45)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="px-[30px] py-[24px]">
        <div className="flex flex-row justify-between items-center gap-2 py-3">
          <div className="w-[80px]">
            <TeamLogoAvatar teamCode={visitorTeam.code} size={40} />
          </div>
          <div className="grow"></div>
          <div className="w-[80px]">
            <TeamLogoAvatar teamCode={homeTeam.code} size={40} />
          </div>
        </div>
        <div className="divide-y divide-[rgba(0,0,0,0.07)]">
          {useDetailedView
            ? STAT_KEYS.map((stat) => (
                <div
                  key={`match-team-stats-comparison-${stat.key}`}
                  className="flex flex-row justify-between items-center gap-2 py-2"
                >
                  <div className="w-[80px]">
                    <p
                      className="text-center text-[19px]"
                      style={{
                        color:
                          getStatNumericValue(
                            homeTeamBoxScore as MatchTeamComparisonBoxScore,
                            stat,
                          ) <
                          getStatNumericValue(
                            visitorTeamBoxScore as MatchTeamComparisonBoxScore,
                            stat,
                          )
                            ? '#000000'
                            : 'rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {getStatValue(
                        visitorTeamBoxScore as MatchTeamComparisonBoxScore,
                        stat,
                      )}
                    </p>
                  </div>
                  <div className="grow">
                    <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                      {stat.label}
                    </p>
                  </div>
                  <div className="w-[80px]">
                    <p
                      className="text-center text-[19px]"
                      style={{
                        color:
                          getStatNumericValue(
                            homeTeamBoxScore as MatchTeamComparisonBoxScore,
                            stat,
                          ) >
                          getStatNumericValue(
                            visitorTeamBoxScore as MatchTeamComparisonBoxScore,
                            stat,
                          )
                            ? '#000000'
                            : 'rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {getStatValue(
                        homeTeamBoxScore as MatchTeamComparisonBoxScore,
                        stat,
                      )}
                    </p>
                  </div>
                </div>
              ))
            : (rows ?? MATCH_TEAM_COMPARISON_BOX_SCORE_ROWS).map(
                ({ key, label, format, higherIsBetter = true }) => {
                  const h = (homeTeamBoxScore as Record<string, number>)[key] ?? 0;
                  const v = (visitorTeamBoxScore as Record<string, number>)[key] ?? 0;
                  const visitorAhead = higherIsBetter ? v > h : v < h;
                  const homeAhead = higherIsBetter ? h > v : h < v;
                  return (
                    <div
                      key={`match-team-stats-comparison-${key}`}
                      className="flex flex-row justify-between items-center gap-2 py-2"
                    >
                      <div className="min-w-[4.5rem] flex-1">
                        <p
                          className="text-center text-[17px] md:text-[19px] tabular-nums"
                          style={{
                            color: visitorAhead
                              ? '#000000'
                              : 'rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          {formatCellValue(v, format)}
                        </p>
                      </div>
                      <div className="grow shrink-0 px-1">
                        <p className="font-barlow-condensed font-semibold text-center text-[15px] text-[rgba(0,0,0,0.4)]">
                          {label}
                        </p>
                      </div>
                      <div className="min-w-[4.5rem] flex-1">
                        <p
                          className="text-center text-[17px] md:text-[19px] tabular-nums"
                          style={{
                            color: homeAhead
                              ? '#000000'
                              : 'rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          {formatCellValue(h, format)}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
        </div>
      </div>
    </div>
  );
}
