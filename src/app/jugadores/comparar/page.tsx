import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getFranchiseMap, getSeason } from '@/archivo/lib/data';
import { toFranchiseView, type FranchiseView } from '@/archivo/lib/franchise-view';
import { shortName } from '@/archivo/lib/names';
import { careerStats, statsFromLines } from '@/archivo/lib/stats';
import type { StatLine } from '@/archivo/lib/types';
import PlayerCompareEmptyCard from '@/historia/components/compare/PlayerCompareEmptyCard';
import PlayerCompareHero from '@/historia/components/compare/PlayerCompareHero';
import PlayerComparePanel from '@/historia/components/compare/PlayerComparePanel';
import type { SuggestedPlayer } from '@/historia/components/compare/PlayerPickerDialog';
import { totalsFromLines } from '@/historia/lib/compare';
import { MIN_COMPARE_PLAYERS, parseCompareKeys, valuesFrom, type ComparePlayerData } from '@/historia/lib/compare-players';
import { positionLabel, yearsActive } from '@/historia/lib/copy';
import { CURRENT_SEASON } from '@/historia/lib/data';
import { liveRoster, resolveUnifiedPlayer } from '@/historia/lib/identity';
import { liveMinutesByYear, liveSeasonLines } from '@/historia/lib/live';
import { getCompareTeam } from '@/team/components/compare/teams';

type SearchParams = Promise<{ p?: string | string[] }>;

function franchiseView(slug: string | null | undefined): FranchiseView | null {
  const f = slug ? getFranchiseMap().get(slug) : null;
  return f ? toFranchiseView(f) : null;
}

/** Everything the comparison needs for one player, from the archive file plus the live seasons. */
function load(key: string): ComparePlayerData | null {
  const u = resolveUnifiedPlayer(key);
  if (!u) return null;
  const a = u.archive;
  const live = u.providerId ? liveRoster(u.providerId) : null;
  const liveLines = liveSeasonLines({ providerId: u.providerId, archiveId: a?.id ?? null });
  const minutes = liveMinutesByYear({ providerId: u.providerId, archiveId: a?.id ?? null });
  const regularLines: StatLine[] = [...(a?.lines.regular.filter((l) => l.franchiseSlug !== null) ?? []), ...liveLines];

  const seasons: ComparePlayerData['seasons'] = {};
  for (const year of new Set(regularLines.map((l) => l.year))) {
    const lines = regularLines.filter((l) => l.year === year);
    seasons[String(year)] = valuesFrom(statsFromLines(lines), totalsFromLines(lines), minutes[year] ?? null);
  }
  const regular = statsFromLines(regularLines);
  const career = a ? { ...careerStats(a), spg: regular.spg, bpg: regular.bpg, topg: regular.topg } : regular;
  const totals = totalsFromLines(regularLines);
  const careerTotals = a?.career ? { ...totals, pts: a.career.pts, reb: a.career.reb, ast: a.career.ast, fgm: a.career.fgm, fga: a.career.fga, fg3m: a.career.fg3m, fg3a: a.career.fg3a, ftm: a.career.ftm, fta: a.career.fta } : totals;
  const liveYears = Object.keys(minutes).map(Number);
  const careerMin = liveYears.length && liveYears.length === new Set(regularLines.map((l) => l.year)).size ? Math.round((liveYears.reduce((s, y) => s + minutes[y] * (seasons[String(y)].g ?? 0), 0) / Math.max(1, regular.g ?? 0)) * 10) / 10 : null;

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
    seasons,
    career: valuesFrom(career, careerTotals, careerMin),
  };
}

/** Season leaders in points (min 10 games) as picker shortcuts. Real data from the current snapshot. */
function suggestedPlayers(): SuggestedPlayer[] {
  const results = getSeason(CURRENT_SEASON)?.results;
  if (!results || results.fpo.playerStats) return [];
  return [...results.playerStats]
    .filter((s) => s.g >= 10 && s.ppg !== null)
    .sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0))
    .slice(0, 6)
    .map((s) => {
      const roster = results.rosters.find((r) => r.playerProviderId === s.playerProviderId);
      const team = getCompareTeam(s.code);
      return { key: s.slug ?? s.playerProviderId, name: s.name, team: team?.nickname ?? s.code, color: team?.color ?? '#7D7D7D', avatarUrl: roster?.avatarUrl ?? null };
    });
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
  const suggested = suggestedPlayers();
  const hasComparison = players.length >= MIN_COMPARE_PLAYERS;

  return (
    <FullWidthLayout divider subheader={<PlayerCompareHero players={players} suggested={suggested} />}>
      <section className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
        <div className={`mx-auto ${players.length === 2 ? 'max-w-[900px]' : 'max-w-[1040px]'}`}>
          {hasComparison ? <PlayerComparePanel players={players} /> : <PlayerCompareEmptyCard selectedKeys={players.map((p) => p.key)} suggested={suggested} />}
        </div>
      </section>
    </FullWidthLayout>
  );
}
