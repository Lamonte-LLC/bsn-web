import type { Metadata } from 'next';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import { HeroEyebrow, HeroTitle } from '@/archivo/components/ui';
import { getCareerArc, getFranchises, getPlayerBySlug, getSimilarPlayers } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { careerStats, playoffStats, regularStats } from '@/archivo/lib/stats';
import CompararClient, { type ComparePlayer } from './CompararClient';

type SearchParams = Promise<{ a?: string; b?: string; c?: string }>;

export const SLOT_KEYS = ['a', 'b'] as const;

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
    franchiseSlugs: p.franchiseSlugs,
    mvpYears: p.mvpYears,
    championships: p.championships.map((c) => c.year),
    stats: { career: careerStats(p), regular: regularStats(p), playoffs: playoffStats(p) },
    similar: getSimilarPlayers(p.id)
      .slice(0, 3)
      .map((s) => ({ slug: s.slug, name: s.name, score: s.score })),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const names = [sp.a, sp.b].map((s) => getPlayerBySlug(s ?? '')?.name).filter((n): n is string => Boolean(n));
  return {
    title: names.length === 2 ? `${names[0]} vs ${names[1]} · Archivo BSN` : 'Cara a cara · Archivo BSN',
    description: 'Compara a dos jugadores del BSN número por número: carrera, Serie Regular y Postemporada.',
  };
}

export default async function CompararPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const players = [loadPlayer(sp.a), loadPlayer(sp.b)];
  const franchises = franchiseViewMap(getFranchises());
  const filled = players.filter((p): p is ComparePlayer => p !== null);

  return (
    <ArchivoShell
      hero={
        <div>
          <HeroEyebrow>Jugador vs jugador</HeroEyebrow>
          <HeroTitle>{filled.length === 2 ? `${filled[0].name} vs ${filled[1].name}` : 'Cara a cara'}</HeroTitle>
        </div>
      }
    >
      <CompararClient players={players} franchises={franchises} />
    </ArchivoShell>
  );
}
