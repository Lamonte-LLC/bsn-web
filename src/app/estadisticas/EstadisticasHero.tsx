'use client';

import { useEstadisticasTab, type EstadisticasTab } from './useEstadisticasTab';

const TABS: EstadisticasTab[] = ['jugadores', 'equipos'];

export default function EstadisticasHero() {
  const [activeTab, setActiveTab] = useEstadisticasTab();

  return (
    <div className="container">
      {/* Mobile: centered title with tabs underneath */}
      <div className="flex flex-col items-center pt-8 pb-6 lg:hidden">
        <h1 className="font-special-gothic-condensed-one text-white text-[38px] tracking-[0.4px] mb-4">
          Estadísticas
        </h1>
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative font-special-gothic-condensed-one text-[20px] pb-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/75 active:text-white/60'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: centered title with tabs underneath */}
      <div className="hidden lg:block pt-[50px] pb-11 text-center">
        <h1 className="font-special-gothic-condensed-one text-white text-[42px] tracking-[0.4px] mb-5">
          Estadísticas
        </h1>
        <div className="flex justify-center gap-[22px]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative font-special-gothic-condensed-one text-[22px] pb-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/75 active:text-white/60'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
