import type { CSSProperties } from 'react';

import { PlayerStatsType, PlayerType } from '@/player/types';
import { SeasonType } from '@/season/types';
import { TeamType } from '@/team/types';
import { formatStatValue } from '@/team/components/compare/compareStats';

const PLAYER_STATS_SECTIONS: {
  id: string;
  title: string;
  shortTitle: string;
  stats: {
    code: string;
    label: string;
    key: keyof PlayerStatsType;
    format: 'avg' | 'int' | 'pct';
  }[];
}[] = [
  {
    id: 'promedio',
    title: 'Promedio',
    shortTitle: 'Promedio',
    stats: [
      { code: 'J', label: 'Juegos', key: 'games', format: 'int' },
      { code: 'PPJ', label: 'Puntos por juego', key: 'pointsAvg', format: 'avg' },
      { code: 'MPJ', label: 'Minutos por juego', key: 'minutesAvg', format: 'avg' },
      { code: 'TI%', label: 'Tiros porcentaje', key: 'fieldGoalsPercentage', format: 'avg' },
      { code: 'APJ', label: 'Asistencia por juego', key: 'assistsAvg', format: 'avg' },
      { code: 'RPJ', label: 'Rebote por juego', key: 'reboundsTotalAvg', format: 'avg' },
      { code: '3P%', label: 'Tres puntos porcentaje', key: 'threePointersPercentage', format: 'avg' },
      { code: 'TL%', label: 'Tiro libre porcentaje', key: 'freeThrowsPercentage', format: 'avg' },
      { code: 'RDPJ', label: 'Rebote defensivo por juego', key: 'defensiveReboundsAvg', format: 'avg' },
      { code: 'ROPJ', label: 'Rebote ofensivo por juego', key: 'offensiveReboundsAvg', format: 'avg' },
      { code: 'RPJ', label: 'Robadas por juego', key: 'stealsAvg', format: 'avg' },
      { code: 'BPJ', label: 'Bloqueo por juego', key: 'blocksAvg', format: 'avg' },
      { code: 'FPJ', label: 'Faltas personales por juego', key: 'foulsPersonalAvg', format: 'avg' },
      { code: 'PPJ', label: 'Pérdidas por juego', key: 'turnoversAvg', format: 'avg' },
    ],
  },
  {
    id: 'totales',
    title: 'Totales',
    shortTitle: 'Totales',
    stats: [
      { code: 'J', label: 'Juegos', key: 'games', format: 'int' },
      { code: 'MIN', label: 'Minutos', key: 'minutes', format: 'int' },
      { code: 'PTS', label: 'Puntos', key: 'points', format: 'int' },
      { code: 'AST', label: 'Asistencias', key: 'assists', format: 'int' },
      { code: 'REB', label: 'Rebotes', key: 'reboundsTotal', format: 'int' },
      { code: 'RD', label: 'Rebote defensivo', key: 'defensiveRebounds', format: 'int' },
      { code: 'RO', label: 'Rebote ofensivo', key: 'offensiveRebounds', format: 'int' },
      { code: 'TC', label: 'Tiros convertidos', key: 'fieldGoalsMade', format: 'int' },
      { code: 'TI', label: 'Tiros intentados', key: 'fieldGoalsAttempted', format: 'int' },
      { code: '2PC', label: 'Dos puntos convertidos', key: 'twoPointsMade', format: 'int' },
      { code: '2PI', label: 'Dos puntos intentados', key: 'twoPointsAttempted', format: 'int' },
      { code: '3PC', label: 'Tres puntos convertidos', key: 'threePointersMade', format: 'int' },
      { code: '3PI', label: 'Tres puntos intentados', key: 'threePointersAttempted', format: 'int' },
      { code: 'TLC', label: 'Tiros libres hechos', key: 'freeThrowsMade', format: 'int' },
      { code: 'TLI', label: 'Tiros libres intentados', key: 'freeThrowsAttempted', format: 'int' },
      { code: 'REC', label: 'Robadas', key: 'steals', format: 'int' },
      { code: 'BLQ', label: 'Bloqueos', key: 'blocks', format: 'int' },
      { code: 'TF', label: 'Faltas', key: 'foulsPersonal', format: 'int' },
      { code: 'PE', label: 'Pérdidas', key: 'turnovers', format: 'int' },
    ],
  },
  {
    id: 'resumen',
    title: 'Resumen Estadístico',
    shortTitle: 'Resumen',
    stats: [
      { code: 'EF', label: 'Eficiencia', key: 'efficiency', format: 'int' },
      { code: 'IDE', label: 'Índice de éxito', key: 'indexOfSuccess', format: 'int' },
      { code: '+/-', label: 'Más menos', key: 'plusMinusPointsAvg', format: 'avg' },
      { code: 'DD', label: 'Doble doble', key: 'doubleDouble', format: 'int' },
      { code: 'M', label: 'Mates', key: 'dunks', format: 'int' },
      { code: 'PC', label: 'Puntos contraataque', key: 'pointsFastBreak', format: 'int' },
      { code: 'RAP', label: 'Asistencia perdida', key: 'assistsTurnoverRatio', format: 'avg' },
      { code: 'FR', label: 'Faltas cometidas', key: 'foulsDrawn', format: 'int' },
      { code: 'PIR', label: 'Calificación del índice de rendimiento', key: 'pir', format: 'int' },
      { code: 'PP', label: 'Puntos en la pintura', key: 'pointsInThePaint', format: 'int' },
      { code: 'P2', label: 'Puntos de segunda oportunidad', key: 'pointsSecondChance', format: 'int' },
    ],
  },
];

type Props = {
  data: {
    team: TeamType;
    player: PlayerType;
    stats: PlayerStatsType;
  }[];
  season?: SeasonType | null;
};

const LEGEND_COLUMNS = 4;

function chunkIntoColumns<T>(items: T[], columns: number): T[][] {
  const perColumn = Math.ceil(items.length / columns);
  return Array.from({ length: columns }, (_, index) =>
    items.slice(index * perColumn, index * perColumn + perColumn),
  ).filter((column) => column.length > 0);
}

export default function SeasonPlayerStatsExtendedDocument({ data, season }: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.titleLabel}>BSN · Estadísticas de jugadores</h1>
        {season && (
          <span style={styles.seasonLabel}>{season.name.toUpperCase()}</span>
        )}
      </div>
      {PLAYER_STATS_SECTIONS.map((section) => (
        <>
          <div>
            <h3 style={styles.sectionTitle}>{section.title}</h3>
          </div>
          <table key={section.id} style={styles.tableStats}>
            <tbody>
              <tr style={styles.rowCategory}>
                <th style={styles.colCategory}>JUGADOR</th>
                <th style={styles.colCategory}>EQUIPO</th>
                {section.stats.map((stat) => (
                  <th
                    key={`${section.id}-head-${stat.code}`}
                    style={{ ...styles.colCategory, textAlign: 'right' }}
                  >
                    {stat.code}
                  </th>
                ))}
              </tr>
              {data.map((item, index) => (
                <tr
                  key={`${section.id}-${item.player.providerId}`}
                  style={index % 2 === 1 ? styles.oddRow : styles.evenRow}
                >
                  <td style={styles.colTeam}>
                    <span style={styles.teamName}>{item.player.name}</span>
                  </td>
                  <td style={styles.colTeam}>
                    <span style={styles.teamName}>{item.team.name}</span>
                  </td>
                  {section.stats.map((stat) => (
                    <td
                      key={`${section.id}-${item.player.providerId}-${stat.code}`}
                      style={styles.colStatValue}
                    >
                      <span style={styles.statValue}>
                        {formatStatValue(item.stats[stat.key] ?? null, stat.format)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.legend}>
            <h4 style={styles.legendTitle}>LEYENDA</h4>
            <div style={styles.legendGrid}>
              {chunkIntoColumns(section.stats, LEGEND_COLUMNS).map(
                (column, columnIndex) => (
                  <div
                    key={`${section.id}-legend-col-${columnIndex}`}
                    style={styles.legendColumn}
                  >
                    {column.map((stat) => (
                      <div
                        key={`${section.id}-legend-${stat.code}`}
                        style={styles.legendItem}
                      >
                        <span style={styles.legendCode}>{stat.code}</span>
                        <span style={styles.legendLabel}>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        </>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    fontFamily: 'Barlow, Arial, sans-serif',
    padding: 24,
  },
  header: {
    borderBottom: '0.5px solid #bfbfbf',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  titleLabel: {
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '27px',
    lineHeight: 1,
    letterSpacing: '0.4px',
    color: '#000',
  },
  seasonLabel: {
    color: '#333',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1.4px',
  },
  tableStats: {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: 20,
  },
  rowHead: {
    alignItems: 'bottom',
    marginBottom: '6px',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f5f5f5',
  },
  rowCategory: {
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: '600',
  },
  colCategory: {
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '8.2px',
    fontWeight: '600',
    letterSpacing: '0.6px',
    padding: '4px 6px',
    textAlign: 'left',
  },
  colHeadTeam: {
    color: '#666',
    fontSize: '8px',
    fontWeight: '600',
    letterSpacing: '1.4px',
    padding: '8px 6px',
    textAlign: 'left',
    width: '150px',
  },
  colHeadStat: {
    color: '#666',
    fontSize: '8px',
    fontWeight: '600',
    letterSpacing: '0.8px',
    padding: '8px 6px',
    textAlign: 'right',
    borderLeft: '0.5px solid #d8d8d8',
  },
  colTeam: {
    padding: '1px 6px',
  },
  colStatValue: {
    padding: '1px 6px',
    textAlign: 'right',
  },
  teamCode: {
    color: '#000',
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '12px',
    letterSpacing: '0.4px',
    marginRight: '6px',
  },
  teamName: {
    color: '#666',
    fontSize: '8.5px',
    fontWeight: '400',
  },
  statValue: {
    color: '#111',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '9.6px',
  },
  sectionTitle: {
    color: '#000',
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '20px',
    lineHeight: 1,
    letterSpacing: '0.4px',
  },
  legend: {
    marginTop: '10px',
    marginBottom: '18px',
  },
  legendTitle: {
    margin: 0,
    color: '#000',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.4px',
    paddingBottom: '6px',
    borderBottom: '0.5px solid #d8d8d8',
    marginBottom: '8px',
  },
  legendGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
  },
  legendColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
  },
  legendItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    fontSize: '9px',
  },
  legendCode: {
    color: '#000',
    fontWeight: '700',
    minWidth: '26px',
  },
  legendLabel: {
    color: '#666',
    fontWeight: '400',
  },
};
