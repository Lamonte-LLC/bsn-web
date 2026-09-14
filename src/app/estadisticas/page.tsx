import type { Metadata } from 'next';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { getFranchises } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { careerLeaders } from '@/historia/lib/data';
import { activePlayerIds } from '@/historia/lib/identity';
import EstadisticasHero from './EstadisticasHero';
import EstadisticasPageClient, { type AllTimeData } from './EstadisticasPageClient';

type SearchParams = Promise<{ vista?: string; tab?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.vista === 'historico') {
    return { title: 'Líderes de todos los tiempos · Estadísticas · BSN', description: 'Los líderes históricos del BSN en puntos, rebotes, asistencias, juegos y temporadas, con los jugadores activos resaltados.' };
  }
  return { title: 'Estadísticas · BSN' };
}

export default function EstadisticasPage() {
  const allTime: AllTimeData = { leaders: careerLeaders(), active: Object.fromEntries(activePlayerIds()), franchises: franchiseViewMap(getFranchises()) };
  return (
    <FullWidthLayout divider subheader={<EstadisticasHero />}>
      <EstadisticasPageClient allTime={allTime} />
    </FullWidthLayout>
  );
}
