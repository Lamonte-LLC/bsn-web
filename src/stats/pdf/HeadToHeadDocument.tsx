import { TeamType, TeamSeasonStatsType } from '@/team/types';
import type { CSSProperties } from 'react';
import { SeasonType } from '@/season/types';
import {
  COMPARE_SECTIONS,
  formatStatValue,
  getStatValue,
  getWinningIndexes,
} from '@/team/components/compare/compareStats';

type Props = {
  data: {
    team: TeamType;
    stats: TeamSeasonStatsType;
  }[];
  season?: SeasonType | null;
  section?: string;
};

export default function HeadToHeadDocument({ season, data, section = 'todos' }: Props) {
  const sections =
    section === 'todos'
      ? COMPARE_SECTIONS
      : COMPARE_SECTIONS.filter((compareSection) => compareSection.id === section);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.titleLabel}>BSN · Comparación de equipos</h1>
        {season && <span style={styles.seasonLabel}>{season.name.toUpperCase()}</span>}
      </div>
      <div>
        <table style={styles.tableStats}>
          <tbody>
            <tr style={styles.rowHead}>
              <th style={styles.colHead}>ESTADÍSTICA</th>
              {data.map((item) => (
                <th key={`head-${item.team.code}`} style={styles.colHeadTeam}>
                  <div style={{ borderLeft: '0.5px solid #d8d8d8' }}>
                    <div style={styles.teamCode}>{item.team.code}</div>
                    <div style={styles.teamRecord}>3-5 · 4to Grupo A</div>
                  </div>
                </th>
              ))}
            </tr>
            {sections.flatMap((compareSection) => [
              <tr key={`${compareSection.id}-header`} style={styles.rowCategory}>
                <td colSpan={1 + data.length} style={styles.colCategory}>
                  {compareSection.title.toUpperCase()}
                </td>
              </tr>,
              ...compareSection.stats.map((stat, index) => {
                const values = data.map((item) => getStatValue(stat, item.stats));
                const winners = getWinningIndexes(values, stat.higherIsBetter);

                return (
                  <tr
                    key={`${compareSection.id}-${stat.code}-${stat.label}`}
                    style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td style={compareSection.id === 'promedio' ? styles.colCategory : styles.colStat}>
                      <span style={styles.statCode}>{stat.code}</span>
                      <span style={styles.statName}>{stat.label}</span>
                    </td>
                    {data.map((item, teamIndex) => (
                      <td key={`${stat.code}-${item.team.code}`} style={styles.colStatValue}>
                        <div style={styles.colStatValueContent}>
                          <span
                            style={
                              winners.includes(teamIndex)
                                ? styles.statValueHighlighted
                                : styles.statValue
                            }
                          >
                            {formatStatValue(values[teamIndex], stat.format)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              }),
            ])}
          </tbody>
        </table>
      </div>
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
    fontSize: '11px',
    letterSpacing: '1.4px',
  },
  tableStats: {
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    width: '100%',
  },
  rowHead: {
    alignItems: 'bottom',
    marginBottom: '6px',
  },
  evenRow: {
    backgroundColor: '#f5f5f5',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  rowCategory: {
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: '600',
  },
  colCategory: {
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.6px',
    padding: '3px 6px',
  },
  colHead: {
    color: '#666',
    fontSize: '8px',
    fontWeight: '600',
    letterSpacing: '1.4px',
    padding: '10px 6px',
    textAlign: 'left',
  },
  colHeadTeam: {
    padding: '10px 6px',
    textAlign: 'right',
  },
  colStat: {
    padding: '3px 6px',
  },
  colStatValueContent: {
    borderLeft: '0.5px solid #d8d8d8',
  },
  colStatValue: {
    padding: '3px 6px',
    textAlign: 'right',
  },
  teamCode: {
    color: '#000',
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '19px',
    lineHeight: 1,
    letterSpacing: '0.6px',
  },
  teamRecord: {
    color: '#666',
    fontSize: '9.5px',
    fontWeight: '500',
    lineHeight: 1.35,
  },
  statCode: {
    color: '#000',
    fontWeight: '600',
    fontSize: '9.5px',
    letterSpacing: '0.3px',
    marginRight: '4px',
  },
  statName: {
    color: '#666',
    fontSize: '8.5px',
    fontWeight: '400',
  },
  statValue: {
    color: '#7a7a7a',
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.35',
  },
  statValueHighlighted: {
    backgroundColor: '#000',
    borderRadius: '2px',
    color: '#fff',
    fontFamily: 'Special Gothic Condensed One, Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.35',
    padding: '1px 7px',
  },
};
