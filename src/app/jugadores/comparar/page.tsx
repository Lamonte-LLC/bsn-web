import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getFranchises } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { shortName } from '@/archivo/lib/names';
import { careerStats, playoffStats, statsFromLines } from '@/archivo/lib/stats';
import PlayerCompare, { type ComparePlayer } from '@/historia/components/PlayerCompare';
import { totalsFromLines } from '@/historia/lib/compare';
import { bestSeason, CURRENT_SEASON } from '@/historia/lib/data';
import { liveRoster, resolveUnifiedPlayer } from '@/historia/lib/identity';
import { liveSeasonLines } from '@/historia/lib/live';

type SearchParams = Promise<{ a?: string; b?: string; c?: string }>;

function load(key: string | undefined): ComparePlayer | null {
  if (!key) return null;
  const u = resolveUnifiedPlayer(key);
  if (!u) return null;
  const a = u.archive;
  const live = u.providerId ? liveRoster(u.providerId) : null;
  const liveLines = liveSeasonLines({ providerId: u.providerId, archiveId: a?.id ?? null });
  const regularLines = [...(a?.lines.regular.filter((l) => l.franchiseSlug !== null) ?? []), ...liveLines];
  const playoffLines = a?.lines.playoffs.filter((l) => l.franchiseSlug !== null) ?? [];
  const regular = statsFromLines(regularLines);
  const career = a ? { ...careerStats(a), spg: regular.spg, bpg: regular.bpg, topg: regular.topg } : regular;
  const regularTotals = totalsFromLines(regularLines);
  const careerTotals = a?.career ? { ...regularTotals, pts: a.career.pts, reb: a.career.reb, ast: a.career.ast, fgm: a.career.fgm, fga: a.career.fga, fg3m: a.career.fg3m, fg3a: a.career.fg3a, ftm: a.career.ftm, fta: a.career.fta } : regularTotals;
  const best = a ? bestSeason(a) : null;
  const seasons = new Set(regularLines.map((l) => l.year)).size;
  return {
    key,
    providerId: u.providerId,
    isActive: u.providerId !== null,
    avatarUrl: live?.avatarUrl ?? null,
    slug: a?.slug ?? null,
    name: u.name,
    fy: a?.fy ?? CURRENT_SEASON,
    ly: u.providerId ? CURRENT_SEASON : (a?.ly ?? CURRENT_SEASON),
    seasons,
    franchiseSlugs: [...new Set([...(a?.franchiseSlugs ?? []), ...liveLines.map((l) => l.franchiseSlug).filter((s): s is string => Boolean(s))])],
    mvpCount: a?.mvpYears.length ?? 0,
    titleCount: a?.championships.length ?? 0,
    linked: a !== null,
    stats: { career, regular, playoffs: a ? playoffStats(a) : statsFromLines([]) },
    totals: { career: careerTotals, regular: regularTotals, playoffs: totalsFromLines(playoffLines) },
    best: best ? { year: best.line.year, franchiseSlug: best.line.franchiseSlug, teamName: best.line.teamName, stats: statsFromLines([best.line]), fallback: best.fallback } : null,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const names = [sp.a, sp.b, sp.c].map((k) => resolveUnifiedPlayer(k ?? '')?.name).filter((n): n is string => Boolean(n));
  return {
    title: names.length >= 2 ? `${names.map(shortName).join(' vs ')} · Comparar jugadores · BSN` : 'Comparar jugadores · BSN',
    description: 'Compara a dos o tres jugadores del BSN, activos o retirados, número por número: carrera, Serie Regular, Postemporada y mejor temporada.',
  };
}

export default async function CompararJugadoresPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const players = [load(sp.a), load(sp.b), load(sp.c)];
  const filled = players.filter((p): p is ComparePlayer => p !== null);
  const title = filled.length >= 2 ? filled.map((p) => shortName(p.name)).join(' vs ') : 'Comparar jugadores';
  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[28px] pt-[24px] lg:pb-[32px] lg:pt-[28px]">
          <HeroEyebrow>Jugadores · cara a cara</HeroEyebrow>
          <HeroTitle>{title}</HeroTitle>
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          <PlayerCompare players={players} franchises={franchiseViewMap(getFranchises())} />
        </div>
      </div>
    </FullWidthLayout>
  );
}
