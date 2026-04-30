'use client';

import SportRadarStatisticsPersonsWidget from '@/stats/client/widgets/SportRadarStatisticsPersonsWidget';

export default function EstadisticasPageClient() {
  return (
    <div className="bg-[#fdfdfd]">
      <div className="container pt-[22px] pb-8 lg:pt-[30px] lg:pb-12">
        <SportRadarStatisticsPersonsWidget />
      </div>
    </div>
  );
}
