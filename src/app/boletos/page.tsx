import { getClient } from '@/apollo-client';
import { TEAM_DETAIL } from '@/graphql/team';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import BoletosPageClient, { BoletosTeam } from './BoletosPageClient';
import BoletosHero from './BoletosHero';
import { BOLETOS_TEAMS_META } from './teams';

type TeamDetailResponse = {
  team: {
    code: string;
    name: string;
    ticketUrl?: string | null;
  } | null;
};

async function fetchBoletosTeams(): Promise<BoletosTeam[]> {
  const results = await Promise.all(
    BOLETOS_TEAMS_META.map((meta) =>
      getClient()
        .query<TeamDetailResponse>({
          query: TEAM_DETAIL,
          variables: { code: meta.code },
          fetchPolicy: 'network-only',
        })
        .catch((e) => {
          console.error(`[BoletosPage] error fetching ${meta.code}:`, e);
          return null;
        }),
    ),
  );

  const teams: BoletosTeam[] = BOLETOS_TEAMS_META.map((meta, i) => {
    const team = results[i]?.data?.team;
    return {
      code: meta.code,
      fullName: team?.name || meta.fallbackName,
      venue: meta.venue,
      borderColor: meta.borderColor,
      ticketUrl: team?.ticketUrl || '',
    };
  });

  return teams.sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
}

export default async function BoletosPage() {
  const teams = await fetchBoletosTeams();

  return (
    <FullWidthLayout divider subheader={<BoletosHero />}>
      <BoletosPageClient teams={teams} />
    </FullWidthLayout>
  );
}
