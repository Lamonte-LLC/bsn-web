import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getClient } from '@/apollo-client';
import { STANDINGS_TABLE_BASIC } from '@/graphql/stats';
import type { TeamRecord } from '@/team/components/compare/types';
import CompararEquiposHero from './CompararEquiposHero';
import CompararEquiposPageClient from './CompararEquiposPageClient';
import { getFranchiseFile, getSeason } from '@/archivo/lib/data';
import { franchiseByCode } from '@/historia/lib/data';
import { seriesBetween, teamHistoryFacts, type TeamHistoryFacts } from '@/historia/lib/head-to-head';
import { COMPARE_TEAMS } from '@/team/components/compare/teams';

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

/** Historical facts per live code and the real playoff series of the last seasons, for the head-to-head block. */
function history(): { facts: Record<string, TeamHistoryFacts>; seasons: ReturnType<typeof getSeason>[] } {
  const facts: Record<string, TeamHistoryFacts> = {};
  for (const t of COMPARE_TEAMS) {
    const f = franchiseByCode(t.code);
    const file = f ? getFranchiseFile(f.slug) : null;
    if (file) facts[t.code] = teamHistoryFacts(t.code, file);
  }
  return { facts, seasons: [2025, 2026].map((y) => getSeason(y)) };
}

export default async function CompararEquiposPage() {
  const records = await fetchTeamRecords();
  const { facts, seasons } = history();
  const series = seriesBetween(seasons.filter((s): s is NonNullable<typeof s> => s !== null), COMPARE_TEAMS.map((t) => t.code));

  return (
    <FullWidthLayout divider subheader={<CompararEquiposHero />}>
      <CompararEquiposPageClient records={records} historyFacts={facts} playoffSeries={series} />
    </FullWidthLayout>
  );
}
