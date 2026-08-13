'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SportRadarStatisticsPersonsWidget from '@/stats/client/widgets/SportRadarStatisticsPersonsWidget';
import SportRadarStatisticsEntitiesWidget from '@/stats/client/widgets/SportRadarStatisticsEntitiesWidget';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { useEstadisticasTab, initEstadisticasTabFromParam } from './useEstadisticasTab';

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

function EstadisticasContent() {
  const [activeTab] = useEstadisticasTab();

  return (
    <>
      <EstadisticasTabSync />
      {activeTab === 'jugadores' ? (
        <SportRadarStatisticsPersonsWidget />
      ) : (
        <SportRadarStatisticsEntitiesWidget />
      )}
    </>
  );
}

export default function EstadisticasPageClient() {
  return (
    <div className="bg-[#fdfdfd]">
      <div className="container pt-[22px] pb-8 lg:pt-[30px] lg:pb-12">
        <Suspense fallback={<ShimmerLine height="480px" />}>
          <EstadisticasContent />
        </Suspense>
      </div>
    </div>
  );
}
