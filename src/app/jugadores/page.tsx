import { getClient } from '@/apollo-client';
import { SEASON_PLAYERS_CONNECTION } from '@/graphql/season';
import { TEAM_LEADERS_BASIC_STATS_CONNECTION } from '@/graphql/team';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import JugadoresHero from './JugadoresHero';
import JugadoresPageClient, { type JugadorItem } from './JugadoresPageClient';

const TEAM_CODES = ['AGU', 'ARE', 'BAY', 'CAG', 'CAR', 'GBO', 'MAN', 'MAY', 'PON', 'QUE', 'SGE', 'SCE'];

/**
 * Every player in the league's history, as `playersConnection` pages them. The connection exposes `totalCount`
 * but the API returns 0 for it, so the figure is fixed here (counted by paging the whole connection on
 * 2026-09-23) until the API answers it.
 */
const HISTORIC_PLAYERS_TOTAL = 3381;

type RosterResponse = {
  seasonRostersConnection: {
    edges: {
      node: {
        player: { providerId: string; name: string; nickname?: string | null; avatarUrl?: string | null; dob: string; height: number; weight: number };
        team: { providerId: string; code: string; nickname: string };
        playingPosition: string;
        jerseyNumber?: string | null;
      };
    }[];
  };
};

type LeaderEdge = { node: { player: { providerId: string }; value: number } };
type LeadersResponse = { pointsLeaders: { edges: LeaderEdge[] }; reboundsLeaders: { edges: LeaderEdge[] }; assistsLeaders: { edges: LeaderEdge[] } };

function ageFrom(iso: string, today = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age -= 1;
  return age;
}

/** This season's per-game averages, one leaders query per club (the league-wide query only ranks points). */
async function fetchSeasonAverages(): Promise<Map<string, { ppg: number | null; rpg: number | null; apg: number | null }>> {
  const stats = new Map<string, { ppg: number | null; rpg: number | null; apg: number | null }>();
  const results = await Promise.all(
    TEAM_CODES.map((teamCode) =>
      getClient()
        .query<LeadersResponse>({ query: TEAM_LEADERS_BASIC_STATS_CONNECTION, variables: { teamCode, first: 40 }, fetchPolicy: 'network-only' })
        .catch((error) => {
          console.error('Error fetching season averages:', teamCode, error);
          return null;
        }),
    ),
  );
  const put = (edges: LeaderEdge[] | undefined, key: 'ppg' | 'rpg' | 'apg') => {
    for (const { node } of edges ?? []) {
      const cur = stats.get(node.player.providerId) ?? { ppg: null, rpg: null, apg: null };
      cur[key] = node.value;
      stats.set(node.player.providerId, cur);
    }
  };
  for (const r of results) {
    put(r?.data?.pointsLeaders.edges, 'ppg');
    put(r?.data?.reboundsLeaders.edges, 'rpg');
    put(r?.data?.assistsLeaders.edges, 'apg');
  }
  return stats;
}

async function fetchPlayers(): Promise<JugadorItem[]> {
  const [results, averages] = await Promise.all([
    getClient().query<RosterResponse>({ query: SEASON_PLAYERS_CONNECTION, variables: { first: 500 }, fetchPolicy: 'network-only' }),
    fetchSeasonAverages(),
  ]);

  const seen = new Set<string>();
  const players: JugadorItem[] = [];
  for (const edge of results.data?.seasonRostersConnection?.edges ?? []) {
    const { player, playingPosition, team, jerseyNumber } = edge.node;
    if (!player?.providerId || seen.has(player.providerId)) continue;
    seen.add(player.providerId);
    const avg = averages.get(player.providerId);
    players.push({
      providerId: player.providerId,
      name: player.name,
      nickname: player.nickname ?? null,
      avatarUrl: player.avatarUrl ?? null,
      teamCode: team.code,
      playingPosition: playingPosition ?? '',
      jerseyNumber: jerseyNumber ?? null,
      age: player.dob ? ageFrom(player.dob) : null,
      ppg: avg?.ppg ?? null,
      rpg: avg?.rpg ?? null,
      apg: avg?.apg ?? null,
    });
  }
  return players;
}

export default async function JugadoresPage() {
  const players = await fetchPlayers();

  return (
    <FullWidthLayout divider subheader={<JugadoresHero activeCount={players.length} historicCount={HISTORIC_PLAYERS_TOTAL} />}>
      <JugadoresPageClient players={players} historicCount={HISTORIC_PLAYERS_TOTAL} />
    </FullWidthLayout>
  );
}
