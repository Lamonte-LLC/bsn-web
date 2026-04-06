import numeral from 'numeral';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

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

type Props = {
  homeTeam: {
    code: string;
  };
  visitorTeam: {
    code: string;
  };
  homeTeamBoxScore: Record<string, number>;
  visitorTeamBoxScore: Record<string, number>;
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

export default function MatchTeamStatsComparison({
  homeTeam,
  visitorTeam,
  homeTeamBoxScore,
  visitorTeamBoxScore,
  rows = MATCH_TEAM_COMPARISON_BOX_SCORE_ROWS,
  subtitle,
}: Props) {
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
          {rows.map(({ key, label, format, higherIsBetter = true }) => {
            const h = homeTeamBoxScore[key] ?? 0;
            const v = visitorTeamBoxScore[key] ?? 0;
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
                      color: visitorAhead ? '#000000' : 'rgba(0, 0, 0, 0.5)',
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
                      color: homeAhead ? '#000000' : 'rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {formatCellValue(h, format)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
