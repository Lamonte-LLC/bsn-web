import type { Metadata } from 'next';
import { getClient } from '@/apollo-client';
import { PLAYER_PROFILE, SEASON_LEADER_SUGGESTIONS } from '@/graphql/player';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { shortName } from '@/archivo/lib/names';
import PlayerCompareEmptyCard from '@/historia/components/compare/PlayerCompareEmptyCard';
import PlayerCompareHero from '@/historia/components/compare/PlayerCompareHero';
import PlayerComparePanel from '@/historia/components/compare/PlayerComparePanel';
import { MIN_COMPARE_PLAYERS, parseCompareKeys, type ComparePlayerData } from '@/historia/lib/compare-players';
import { positionLabel } from '@/historia/lib/copy';
import type { SeasonLeaderSuggestionEdge } from '@/historia/lib/season-leader-suggestion';
const SUGGESTIONS_COUNT = 12;


type SearchParams = Promise<{ p?: string | string[] }>;

type PlayerProfileResponse = {
  player: {
    providerId: string;
    name: string;
    nickname: string | null;
    avatarUrl: string | null;
    playingPosition: string;
    team: { code: string; nickname: string; colorPrimary: string } | null;
  } | null;
};

/** Everything the comparison needs for one player, resolved live by providerId (no archive JSON). */
async function load(key: string): Promise<ComparePlayerData | null> {
  const { data, error } = await getClient().query<PlayerProfileResponse>({
    query: PLAYER_PROFILE,
    variables: { geniusId: 0, providerId: key },
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }

  const p = data?.player;
  if (!p) return null;

  return {
    key,
    name: p.name,
    nickname: p.nickname ?? null,
    providerId: p.providerId,
    avatarUrl: p.avatarUrl,
    teamCode: p.team?.code ?? null,
    color: p.team?.colorPrimary ?? '#7D7D7D',
    line: positionLabel(p.playingPosition) ?? '',
  };
}

type SeasonLeaderSuggestionsResponse = {
  seasonPlayerStatsConnection: {
    edges: SeasonLeaderSuggestionEdge[];
  };
};

export async function fetchSeasonLeaderSuggestions(): Promise<SeasonLeaderSuggestionEdge[]> {
  const { data, error } = await getClient().query<SeasonLeaderSuggestionsResponse>({
    query: SEASON_LEADER_SUGGESTIONS,
    variables: { first: SUGGESTIONS_COUNT },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching season leader suggestions:', error);
    return [];
  }

  // The leaders endpoint abbreviates names ("K. Davis"); the tiles show the given name and a surname, so each
  // leader's full name is resolved from the profile query.
  const edges = data?.seasonPlayerStatsConnection.edges ?? [];
  const full = await Promise.all(
    edges.map(async (edge) => {
      try {
        const res = await getClient().query<PlayerProfileResponse>({ query: PLAYER_PROFILE, variables: { geniusId: 0, providerId: edge.node.player.providerId }, fetchPolicy: 'network-only', context: { fetchOptions: { cache: 'no-store' } } });
        return res.data?.player?.name ?? null;
      } catch {
        return null;
      }
    }),
  );
  return edges.map((edge, i) => (full[i] ? { ...edge, node: { ...edge.node, player: { ...edge.node.player, name: full[i]! } } } : edge));
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const keys = parseCompareKeys((await searchParams).p);
  const loaded = await Promise.all(keys.map(load));
  const names = loaded.filter((p): p is ComparePlayerData => p !== null).map((p) => p.name);
  return {
    title: names.length >= 2 ? `${names.map(shortName).join(' vs ')} · Comparar jugadores · BSN` : 'Comparar jugadores · BSN',
    description: 'Compara de 2 a 4 jugadores del BSN, activos o retirados: promedios, estadísticas de tiros y totales, lado a lado, por temporada o por carrera.',
  };
}

export default async function CompararJugadoresPage({ searchParams }: { searchParams: SearchParams }) {
  const keys = parseCompareKeys((await searchParams).p);
  const loaded = await Promise.all(keys.map(load));
  const players = loaded.filter((p): p is ComparePlayerData => p !== null);
  const leaderSuggestions = await fetchSeasonLeaderSuggestions();
  const hasComparison = players.length >= MIN_COMPARE_PLAYERS;

  return (
    <FullWidthLayout divider subheader={<PlayerCompareHero players={players} />}>
      <section className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
        <div className={`mx-auto ${players.length === 2 ? 'max-w-[900px]' : 'max-w-[1040px]'}`}>
          {hasComparison ? <PlayerComparePanel players={players} /> : <PlayerCompareEmptyCard selectedKeys={players.map((p) => p.key)} suggested={leaderSuggestions} />}
        </div>
      </section>
    </FullWidthLayout>
  );
}
