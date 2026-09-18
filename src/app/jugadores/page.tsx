import { getClient } from '@/apollo-client';
import { getFranchises, getPlayerIndex, getSeason } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { SEASON_PLAYERS_CONNECTION } from '@/graphql/season';
import { CURRENT_SEASON } from '@/historia/lib/data';
import { sortBySurname } from '@/historia/lib/players-list';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import JugadoresPageClient, { JugadoresHeroControls, type JugadorItem, type JugadoresView } from './JugadoresPageClient';

type SearchParams = Promise<{ vista?: string | string[] }>;

const TEAM_CODES = [
  'AGU',
  'ARE',
  'BAY',
  'CAG',
  'CAR',
  'GBO',
  'MAN',
  'MAY',
  'PON',
  'QUE',
  'SGE',
  'SCE',
];

type RosterResponse = {
  seasonRostersConnection: {
    edges: {
      node: {
        player: {
          providerId: string;
          name: string;
          avatarUrl?: string | null;
          dob: string;
          height: number;
          weight: number;
        };
        team: {
          providerId: string;
          code: string;
          nickname: string;
        };
        playingPosition: string;
      };
    }[];
  };
};

async function fetchPlayers(): Promise<JugadorItem[]> {
  const results = await getClient().query<RosterResponse>({
    query: SEASON_PLAYERS_CONNECTION,
    variables: { first: 500 },
    fetchPolicy: 'network-only',
  });

  // Points per game of the season, from the archive's live stats (no extra API call).
  const ppgById = new Map((getSeason(CURRENT_SEASON)?.results?.playerStats ?? []).map((st) => [st.playerProviderId, st.ppg]));

  const seen = new Set<string>();
  const players: JugadorItem[] = [];

  const edges = results.data?.seasonRostersConnection?.edges ?? [];

  for (const edge of edges) {
    const { player, playingPosition, team } = edge.node;
    if (!player?.providerId || seen.has(player.providerId)) continue;
    seen.add(player.providerId);
    players.push({
      providerId: player.providerId,
      name: player.name,
      avatarUrl: player.avatarUrl ?? null,
      teamCode: team.code,
      playingPosition: playingPosition ?? '',
      height: player.height ?? 0,
      weight: player.weight ?? 0,
      dob: player.dob ?? '',
      ppg: ppgById.get(player.providerId) ?? null,
    });
  }

  // Sort by last name (Spanish naming: "First LastName1 LastName2" → LastName1); see surnameOf in players-list.
  return sortBySurname(players);
}

export default async function JugadoresPage({ searchParams }: { searchParams: SearchParams }) {
  const { vista } = await searchParams;
  const view: JugadoresView = vista === 'historicos' ? 'historicos' : 'activos';
  const players = await fetchPlayers();
  const franchises = franchiseViewMap(getFranchises());
  const firstYear = getPlayerIndex().reduce((min, p) => Math.min(min, p.fy), CURRENT_SEASON);

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="hidden lg:block lg:pt-[50px] lg:pb-11">
          <div className="container">
            <h1 className="font-special-gothic-condensed-one text-white text-center text-[42px] tracking-[0.4px] mb-0">
              Jugadores
            </h1>
            <JugadoresHeroControls vista={view} />
          </div>
        </section>
      }
    >
      <JugadoresPageClient players={players} vista={view} franchises={franchises} firstYear={firstYear} season={CURRENT_SEASON} />
    </FullWidthLayout>
  );
}
