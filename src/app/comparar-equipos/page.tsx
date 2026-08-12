import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getClient } from '@/apollo-client';
import { STANDINGS_TABLE_BASIC } from '@/graphql/stats';
import type { TeamRecord } from '@/team/components/compare/types';
import CompararEquiposHero from './CompararEquiposHero';
import CompararEquiposPageClient from './CompararEquiposPageClient';

/**
 * Los récords (G-P) vienen de standings en el servidor; sin esto la página se
 * prerenderiza estática en build (sin backend) y quedarían vacíos para siempre.
 * Mismo comportamiento dinámico que el home, que consume la misma query.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Comparar equipos | BSN – Baloncesto Superior Nacional',
  description:
    'Compara de 2 a 4 equipos del BSN: promedios, estadísticas de tiros, totales y últimos encuentros, lado a lado.',
};

type StandingsResponse = {
  standings: {
    groups: {
      name: string;
      teams: {
        code: string;
        competitionStandings: { won: number; lost: number };
      }[];
    }[];
  };
};

/**
 * Récords G-P por equipo desde la query de standings existente (mismo patrón
 * server-side que SeasonStandingsTableBasicGroupsWidget). Si falla, la página
 * funciona igual — el hero simplemente no muestra la línea de récord.
 */
async function fetchTeamRecords(): Promise<Record<string, TeamRecord>> {
  try {
    const { data, error } = await getClient().query<StandingsResponse>({
      query: STANDINGS_TABLE_BASIC,
      fetchPolicy: 'network-only',
    });

    if (error || !data) {
      if (error) console.error('Error fetching standings:', error);
      return {};
    }

    const records: Record<string, TeamRecord> = {};
    for (const group of data.standings.groups) {
      group.teams.forEach((team, index) => {
        records[team.code] = {
          won: team.competitionStandings?.won ?? 0,
          lost: team.competitionStandings?.lost ?? 0,
          position: index + 1,
          groupName: group.name,
        };
      });
    }
    return records;
  } catch (error) {
    console.error('Error fetching standings:', error);
    return {};
  }
}

export default async function CompararEquiposPage() {
  const records = await fetchTeamRecords();

  return (
    <FullWidthLayout divider subheader={<CompararEquiposHero />}>
      <CompararEquiposPageClient records={records} />
    </FullWidthLayout>
  );
}
