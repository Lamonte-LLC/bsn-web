'use client';

import SportRadarStatisticsPersonsWidget from '@/stats/client/widgets/SportRadarStatisticsPersonsWidget';
import SportRadarStatisticsEntitiesWidget from '@/stats/client/widgets/SportRadarStatisticsEntitiesWidget';
import { useEstadisticasTab } from './useEstadisticasTab';

export default function EstadisticasPageClient() {
  const [activeTab] = useEstadisticasTab();

  return (
    <div className="bg-[#fdfdfd]">
      <div className="container pt-[22px] pb-8 lg:pt-[30px] lg:pb-12">
        {activeTab === 'jugadores' ? (
          <SportRadarStatisticsPersonsWidget />
        ) : (
          <SportRadarStatisticsEntitiesWidget />
        )}
      </div>
    </div>
  );
}
