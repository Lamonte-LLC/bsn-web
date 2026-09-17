import type { Metadata } from 'next';
import { getClient } from '@/apollo-client';
import { SEASON_LEADER_SUGGESTIONS } from '@/graphql/player';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getFranchiseMap } from '@/archivo/lib/data';
import { toFranchiseView, type FranchiseView } from '@/archivo/lib/franchise-view';
import { shortName } from '@/archivo/lib/names';
import type { StatLine } from '@/archivo/lib/types';
import PlayerCompareEmptyCard from '@/historia/components/compare/PlayerCompareEmptyCard';
import PlayerCompareHero from '@/historia/components/compare/PlayerCompareHero';
import PlayerComparePanel from '@/historia/components/compare/PlayerComparePanel';
import { MIN_COMPARE_PLAYERS, parseCompareKeys, type ComparePlayerData } from '@/historia/lib/compare-players';
import { positionLabel, yearsActive } from '@/historia/lib/copy';
import { CURRENT_SEASON } from '@/historia/lib/data';
import { liveRoster, resolveUnifiedPlayer } from '@/historia/lib/identity';
import { liveSeasonLines } from '@/historia/lib/live';
import type { SeasonLeaderSuggestionEdge } from '@/historia/lib/season-leader-suggestion';
import { getCompareTeam } from '@/team/components/compare/teams';
const SUGGESTIONS_COUNT = 6;


type SearchParams = Promise<{ p?: string | string[] }>;

function franchiseView(slug: string | null | undefined): FranchiseView | null {
  const f = slug ? getFranchiseMap().get(slug) : null;
  return f ? toFranchiseView(f) : null;
}

/**
 * Everything the comparison needs for one player, from the archive file plus the live seasons.
 * Temporary: stats still come from the season JSON snapshot via `resolveUnifiedPlayer`/`liveRoster`/
 * `liveSeasonLines`. Once there's a query for a single player's stats by providerId, this is where it
 * replaces that JSON lookup — picks from PlayerPickerDialog already pass a providerId here.
 */
function load(key: string): ComparePlayerData | null {
  const u = resolveUnifiedPlayer(key);
  if (!u) return null;
  const a = u.archive;
  const live = u.providerId ? liveRoster(u.providerId) : null;
  const liveLines = liveSeasonLines({ providerId: u.providerId, archiveId: a?.id ?? null });
  const regularLines: StatLine[] = [...(a?.lines.regular.filter((l) => l.franchiseSlug !== null) ?? []), ...liveLines];

  const lastLine = regularLines[regularLines.length - 1];
  const team = live ? getCompareTeam(live.code) : null;
  const franchise = franchiseView(live?.franchiseSlug ?? lastLine?.franchiseSlug ?? a?.franchiseSlugs.slice(-1)[0]);
  const fy = a?.fy ?? liveLines[0]?.year ?? CURRENT_SEASON;
  const ly = u.providerId ? CURRENT_SEASON : (a?.ly ?? CURRENT_SEASON);
  const teams = [...new Set(regularLines.map((l) => franchiseView(l.franchiseSlug)?.nickname ?? l.teamName))];
  const line = live
    ? [team?.nickname ?? franchise?.nickname, positionLabel(live.position)].filter(Boolean).join(' · ')
    : `${yearsActive(fy, ly)} · ${teams.slice(0, 3).join(', ')}${teams.length > 3 ? ` y ${teams.length - 3} más` : ''}`;

  return {
    key,
    name: u.name,
    slug: a?.slug ?? null,
    providerId: u.providerId,
    isActive: u.providerId !== null,
    avatarUrl: live?.avatarUrl ?? null,
    teamCode: live?.code ?? null,
    franchise,
    color: team?.color ?? franchise?.colors.primary ?? '#7D7D7D',
    line,
    fy,
    ly,
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

  return data?.seasonPlayerStatsConnection.edges ?? [];
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const keys = parseCompareKeys((await searchParams).p);
  const names = keys.map((k) => resolveUnifiedPlayer(k)?.name).filter((n): n is string => Boolean(n));
  return {
    title: names.length >= 2 ? `${names.map(shortName).join(' vs ')} · Comparar jugadores · BSN` : 'Comparar jugadores · BSN',
    description: 'Compara de 2 a 4 jugadores del BSN, activos o retirados: promedios, estadísticas de tiros y totales, lado a lado, por temporada o por carrera.',
  };
}

export default async function CompararJugadoresPage({ searchParams }: { searchParams: SearchParams }) {
  const keys = parseCompareKeys((await searchParams).p);
  const players = keys.map(load).filter((p): p is ComparePlayerData => p !== null);
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
