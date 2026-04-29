import { getClient } from '@/apollo-client';
import { TEAM_PLAYERS_CONNECTION } from '@/graphql/team';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import JugadoresPageClient, { JugadorItem } from './JugadoresPageClient';

const TEAM_CODES = ['AGU', 'ARE', 'BAY', 'CAG', 'CAR', 'GBO', 'MAN', 'MAY', 'PON', 'QUE', 'SGE', 'SCE'];

type RosterResponse = {
  teamRostersConnection: {
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
        playingPosition: string;
      };
    }[];
  };
};

async function fetchPlayers(): Promise<JugadorItem[]> {
  const results = await Promise.all(
    TEAM_CODES.map((code) =>
      getClient()
        .query<RosterResponse>({
          query: TEAM_PLAYERS_CONNECTION,
          variables: { code, first: 50 },
          fetchPolicy: 'network-only',
        })
        .catch((e) => {
          console.error(`[JugadoresPage] error fetching ${code}:`, e);
          return null;
        }),
    ),
  );

  const seen = new Set<string>();
  const players: JugadorItem[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const code = TEAM_CODES[i];
    const edges = result?.data?.teamRostersConnection?.edges ?? [];
    for (const edge of edges) {
      const { player, playingPosition } = edge.node;
      if (!player?.providerId || seen.has(player.providerId)) continue;
      seen.add(player.providerId);
      players.push({
        providerId: player.providerId,
        name: player.name,
        avatarUrl: player.avatarUrl ?? null,
        teamCode: code,
        playingPosition: playingPosition ?? '',
        height: player.height ?? 0,
        weight: player.weight ?? 0,
        dob: player.dob ?? '',
      });
    }
  }

  // Sort by last name. Spanish naming: "First LastName1 LastName2" → sort key is LastName1.
  // For two-word names "First Last" → sort key is Last.
  // If parts[1] looks like a middle initial (≤2 chars), fall back to first name.
  const lastName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0];
    if (parts.length === 2) return parts[1];
    // 3+ words: check if parts[1] is a middle initial
    const second = parts[1].replace('.', '');
    if (second.length <= 2) return parts[0];
    return parts[1];
  };

  return players.sort((a, b) =>
    lastName(a.name).localeCompare(lastName(b.name), 'es'),
  );
}

export default async function JugadoresPage() {
  const players = await fetchPlayers();

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="hidden lg:block lg:pt-[50px] lg:pb-11">
          <div className="container">
            <h1 className="font-special-gothic-condensed-one text-white text-center text-[42px] tracking-[0.4px] mb-0">
              Jugadores
            </h1>
          </div>
        </section>
      }
    >
      <JugadoresPageClient players={players} />
    </FullWidthLayout>
  );
}
