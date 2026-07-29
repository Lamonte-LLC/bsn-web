import { TeamType } from '@/team/types';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import 'moment/locale/es';
import numeral from 'numeral';
import type { CSSProperties } from 'react';
import { TeamStatsType } from '../types';
import { getTeamLogoBase64 } from '@/utils/bsn-team';
import { SeasonType } from '@/season/types';

const logoPath = path.join(process.cwd(), 'public/assets/images/logo.png');
const logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

const TEAM_STATS_COLUMNS: {
  label: string;
  key: keyof TeamStatsType;
  format?: 'percentage';
}[] = [
  { label: 'PTS', key: 'points' },
  { label: 'FGM', key: 'fieldGoalsMade' },
  { label: 'FGA', key: 'fieldGoalsAttempted' },
  { label: 'FG%', key: 'fieldGoalsPercentage', format: 'percentage' },
  { label: '3PM', key: 'threePointersMade' },
  { label: '3PA', key: 'threePointersAttempted' },
  { label: '3P%', key: 'threePointersPercentage', format: 'percentage' },
  { label: 'FTM', key: 'freeThrowsMade' },
  { label: 'FTA', key: 'freeThrowsAttempted' },
  { label: 'FT%', key: 'freeThrowsPercentage', format: 'percentage' },
  { label: 'OREB', key: 'offensiveRebounds' },
  { label: 'DREB', key: 'defensiveRebounds' },
  { label: 'REB', key: 'reboundsTotal' },
  { label: 'AST', key: 'assists' },
  { label: 'TO', key: 'turnovers' },
  { label: 'STL', key: 'steals' },
  { label: 'BLK', key: 'blocks' },
  { label: 'PF', key: 'foulsPersonal' },
];

type Props = {
  data: {
    team: TeamType;
    stats: TeamStatsType;
  }[];
  season?: SeasonType | null;
};

export default function SeasonTeamStatsExtendedDocument({ data, season }: Props) {
  const currentDate = moment().locale('es').format('D [de] MMMM [de] YYYY');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerCol}>
          <img src={logoSrc} width={72} height={72} alt="BSN" />
        </div>
        <div style={styles.headerCol}>
          <h1 style={styles.headerTitle}>Estadísticas de Equipos</h1>
          {season && <h2 style={styles.headerSubtitle}>{season.name}</h2>}
        </div>
        <div style={{ ...styles.headerCol, ...styles.textRight }}>
          {currentDate}
        </div>
      </div>
      <table style={styles.table}>
        <thead style={styles.tableHead}>
          <tr>
            <th style={styles.tableColHeader}>NOMBRE</th>
            {TEAM_STATS_COLUMNS.map((column) => (
              <th
                key={`team-stats-header-${column.key}`}
                style={{ ...styles.tableColHeader, ...styles.textRight }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={`team-stats-row-${index}`}
              style={index % 2 === 1 ? styles.tableRowStriped : undefined}
            >
              <td style={styles.tableCol}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src={getTeamLogoBase64(item.team.code)}
                    width={24}
                    height={24}
                    alt={item.team.name}
                  />
                  <span>{item.team.name}</span>
                </div>
              </td>
              {TEAM_STATS_COLUMNS.map((column) => (
                <td
                  key={`team-stats-col-${index}-${column.key}`}
                  style={{ ...styles.tableCol, ...styles.textRight }}
                >
                  {column.format === 'percentage'
                    ? numeral(item.stats[column.key]).format('0.0%')
                    : numeral(item.stats[column.key]).format('0')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: 24,
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCol: {
    flex: 1,
  },
  headerTitle: {
    margin: 0,
    fontSize: 18,
    textAlign: 'center',
  },
  headerSubtitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #dee2e6',
    marginTop: 20,
  },
  tableHead: {
    backgroundColor: '#f0f0f0',
    verticalAlign: 'bottom',
  },
  tableColHeader: {
    border: '1px solid #dee2e6',
    padding: '8px',
    fontSize: 10,
  },
  tableRowStriped: {
    backgroundColor: '#f2f2f2',
  },
  tableCol: {
    border: '1px solid #dee2e6',
    padding: '8px',
    fontSize: 10,
    verticalAlign: 'top',
  },
  textRight: {
    textAlign: 'right',
  },
};
