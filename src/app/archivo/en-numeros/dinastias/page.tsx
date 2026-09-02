import type { Metadata } from 'next';
import InsightPage from '@/archivo/components/InsightPage';
import { getChampions, getFranchises } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import DynastyTracker, { type DynastyTitle } from './DynastyTracker';

export const metadata: Metadata = { title: 'Dinastías · Archivo BSN', description: 'Los títulos acumulados por franquicia en el BSN, año por año desde 1930.' };

export default function DinastiasPage() {
  const champions = getChampions();
  const franchises = franchiseViewMap(getFranchises());
  const titles: DynastyTitle[] = champions
    .map((c) => ({ year: c.year, key: c.franchiseSlug ?? `club:${c.name}`, franchiseSlug: c.franchiseSlug, name: c.fullName }))
    .sort((a, b) => a.year - b.year);
  return (
    <InsightPage title="Dinastías" context="Noventa y cinco títulos en noventa y seis años. Míralos acumularse." heroNumber={champions.length} heroNumberLabel="títulos desde 1930">
      <DynastyTracker titles={titles} franchises={franchises} />
    </InsightPage>
  );
}
