'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SportRadarStatisticsPersonsWidget from '@/stats/client/widgets/SportRadarStatisticsPersonsWidget';
import SportRadarStatisticsEntitiesWidget from '@/stats/client/widgets/SportRadarStatisticsEntitiesWidget';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { useEstadisticasTab, initEstadisticasTabFromParam } from './useEstadisticasTab';
import AllTimeLeaders from '@/historia/components/AllTimeLeaders';
import type { CareerLeader, CareerLeaderKey } from '@/historia/lib/data';
import type { FranchiseView } from '@/archivo/lib/franchise-view';

export type AllTimeData = { leaders: Record<CareerLeaderKey, CareerLeader[]>; active: Record<string, string>; franchises: Record<string, FranchiseView> };

/**
 * El link del tab en el menú de header apunta a la misma ruta con distinto
 * query param (?tab=equipos), así que Next no remonta la página — solo
 * cambia el valor de useSearchParams(). Por eso este efecto reacciona a
 * cada cambio del param en vez de leerlo una sola vez al montar.
 */
function EstadisticasTabSync() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    initEstadisticasTabFromParam(tabParam);
  }, [tabParam]);

  return null;
}

function EstadisticasContent({ allTime }: { allTime: AllTimeData }) {
  const [activeTab] = useEstadisticasTab();
  const vista = useSearchParams().get('vista');

  if (vista === 'historico') {
    return (
      <section className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
        <EstadisticasTabSync />
        <div className="mx-auto max-w-[1040px]">
          <AllTimeLeaders leaders={allTime.leaders} active={allTime.active} franchises={allTime.franchises} />
        </div>
      </section>
    );
  }

  return (
    <div className="container pt-[22px] pb-8 lg:pt-[30px] lg:pb-12">
      <EstadisticasTabSync />
      {activeTab === 'jugadores' ? (
        <SportRadarStatisticsPersonsWidget />
      ) : (
        <SportRadarStatisticsEntitiesWidget />
      )}
    </div>
  );
}

export default function EstadisticasPageClient({ allTime }: { allTime: AllTimeData }) {
  return (
    <div className="bg-[#fdfdfd]">
      <Suspense
        fallback={
          <div className="container pt-[22px] pb-8 lg:pt-[30px] lg:pb-12">
            <ShimmerLine height="480px" />
          </div>
        }
      >
        <EstadisticasContent allTime={allTime} />
      </Suspense>
    </div>
  );
}
