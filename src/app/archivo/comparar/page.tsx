import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getCareerArc, getFranchises, getPlayerBySlug, getPlayerIndexById, getSimilarPlayers } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { shortName } from '@/archivo/lib/names';
import { careerStats, playoffStats, regularStats } from '@/archivo/lib/stats';
import CompararClient, { type ComparePlayer } from './CompararClient';

type SearchParams = Promise<{ a?: string; b?: string; c?: string }>;

function loadPlayer(slug: string | undefined): ComparePlayer | null {
  if (!slug) return null;
  const p = getPlayerBySlug(slug);
  if (!p) return null;
  const arc = getCareerArc(p.id);
  return {
    id: p.id,
    arc: arc ? { arc: arc.arc, peakSeason: arc.peakSeason } : null,
    slug: p.slug,
    name: p.name,
    fy: p.fy,
    ly: p.ly,
    seasons: p.seasons,
    franchiseSlugs: p.franchiseSlugs,
    mvpYears: p.mvpYears,
    championships: p.championships.map((c) => c.year),
    stats: { career: careerStats(p), regular: regularStats(p), playoffs: playoffStats(p) },
    similar: getSimilarPlayers(p.id)
      .slice(0, 2)
      .map((s) => {
        const idx = getPlayerIndexById(s.playerId);
        return { slug: s.slug, name: s.name, score: s.score, fy: idx?.fy ?? null, ly: idx?.ly ?? null, franchiseSlug: idx?.franchiseSlugs[0] ?? null };
      }),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const names = [sp.a, sp.b, sp.c].map((s) => getPlayerBySlug(s ?? '')?.name).filter((n): n is string => Boolean(n));
  return {
    title: names.length >= 2 ? `${names.map(shortName).join(' vs ')} · Archivo BSN` : 'Head to head · Archivo BSN',
    description: 'Compara a dos jugadores del BSN número por número: carrera, Serie Regular y Postemporada.',
  };
}

export default async function CompararPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const players = [loadPlayer(sp.a), loadPlayer(sp.b), loadPlayer(sp.c)];
  const franchises = franchiseViewMap(getFranchises());
  const filled = players.filter((p): p is ComparePlayer => p !== null);
  const title = filled.length >= 2 ? filled.map((p) => shortName(p.name)).join(' vs ') : 'Head to head';

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>Jugador vs jugador{filled.length >= 2 ? ' · Carrera' : ''}</HeroEyebrow>
          <HeroTitle>{title}</HeroTitle>
        </div>
      }
    >
      <CompararClient players={players} franchises={franchises} />
    </ArchivoShell>
  );
}
