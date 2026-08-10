import type { CSSProperties } from 'react';
import { TeamType, TeamSeasonStatsType } from '@/team/types';
import { SeasonType } from '@/season/types';
import {
  COMPARE_SECTIONS,
  formatStatValue,
  getStatValue,
} from '@/team/components/compare/compareStats';

type Props = {
  data: {
    team: TeamType;
    stats: TeamSeasonStatsType;
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

export default function SeasonTeamStatsExtendedDocument({
  data,
  season,
}: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.titleLabel}>BSN · Estadísticas de equipos</h1>
        {season && (
          <span style={styles.seasonLabel}>{season.name.toUpperCase()}</span>
        )}
      </div>
      {COMPARE_SECTIONS.map((section) => (
        <>
          <div>
            <h3 style={styles.sectionTitle}>
              {section.title}
            </h3>
          </div>
          <table key={section.id} style={styles.tableStats}>
            <tbody>
              <tr style={styles.rowCategory}>
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
                  key={`${section.id}-${item.team.code}`}
                  style={index % 2 === 1 ? styles.oddRow : styles.evenRow}
                >
                  <td style={styles.colTeam}>
                    <span style={styles.teamCode}>{item.team.code}</span>
                    <span style={styles.teamName}>{item.team.name}</span>
                  </td>
                  {section.stats.map((stat) => (
                    <td
                      key={`${section.id}-${item.team.code}-${stat.code}`}
                      style={styles.colStatValue}
                    >
                      <span style={styles.statValue}>
                        {formatStatValue(
                          getStatValue(stat, item.stats),
                          stat.format,
                        )}
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
          <div style={styles.pageBreak} />
        </>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: 24,
    fontFamily: 'Barlow, Arial, sans-serif',
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
    marginTop: '16px',
    marginBottom: '24px',
  },
  legendTitle: {
    margin: 0,
    color: '#666',
    fontSize: '8px',
    fontWeight: '600',
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
    color: '#333',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '7.6px',
    fontWeight: '700',
    minWidth: '26px',
  },
  legendLabel: {
    color: '#333',
    fontFamily: 'Barlow, Arial, sans-serif',
    fontSize: '7.6px',
    fontWeight: '400',
  },
  pageBreak: {
    pageBreakAfter: 'always',
  },
};
