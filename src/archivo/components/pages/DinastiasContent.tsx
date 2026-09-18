import DynastyTracker, { type DynastyTitle } from '@/app/archivo/en-numeros/dinastias/DynastyTracker';
import InsightPage from '@/archivo/components/InsightPage';
import { getChampions, getFranchises } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import type { Champion } from '@/archivo/lib/types';

/** Titles in chronological order, keyed by franchise (or by club name before 1946). */
export function dynastyTitles(champions: Champion[]): DynastyTitle[] {
  return champions.map((c) => ({ year: c.year, key: c.franchiseSlug ?? `club:${c.name}`, franchiseSlug: c.franchiseSlug, name: c.fullName })).sort((a, b) => a.year - b.year);
}

/** Dinastías: the titles accumulated per franchise, year by year, in the animated tracker. */
export default function DinastiasContent({ site = false }: { site?: boolean }) {
  const champions = getChampions();
  const franchises = franchiseViewMap(getFranchises());
  const titles = dynastyTitles(champions);
  const first = titles[0]?.year;
  const last = titles[titles.length - 1]?.year;
  return (
    <InsightPage site={site} title="Dinastías" context={`${champions.length} títulos en ${last - first + 1} años. Míralos acumularse.`} heroNumber={champions.length} heroNumberLabel={`títulos desde ${first}`} share={false}>
      <DynastyTracker titles={titles} franchises={franchises} site={site} />
    </InsightPage>
  );
}
