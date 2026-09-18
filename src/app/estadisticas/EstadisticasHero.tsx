'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import HistoriaSubnav from '@/historia/components/HistoriaSubnav';
import { Suspense } from 'react';
import PrintableViewButton from './PrintableViewButton';
import { useEstadisticasTab, type EstadisticasTab } from './useEstadisticasTab';

type HeroTab = EstadisticasTab | 'historicos';
/** Three tabs: today's players, the all-time players (the archive) and the teams. The all-time tab is `?vista=historico`. */
const TABS: Array<{ key: HeroTab; label: string }> = [
  { key: 'jugadores', label: 'Jugadores activos' },
  { key: 'historicos', label: 'Jugadores históricos' },
  { key: 'equipos', label: 'Equipos' },
];
const TAB = 'relative cursor-pointer whitespace-nowrap pb-2 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40';
const TAB_ON = 'text-white';
const TAB_OFF = 'text-white/50 hover:text-white/75 active:text-white/60';

/** Which tab is lit: the all-time one whenever the URL says so, else the stored players/teams tab. */
function useHeroTab(activeTab: EstadisticasTab): HeroTab {
  const historico = useSearchParams().get('vista') === 'historico';
  return historico ? 'historicos' : activeTab;
}

/** All-time view: the historical sections under the toggle, plus the band the leaders panel overlaps. */
function HistoricoBand({ className = '' }: { className?: string }) {
  const historico = useSearchParams().get('vista') === 'historico';
  if (!historico) return null;
  return (
    <div className={className}>
      <HistoriaSubnav active="todos" />
      <div className="h-[52px] lg:h-[66px]" aria-hidden />
    </div>
  );
}

function HeroTabs({ size }: { size: 'sm' | 'lg' }) {
  const [activeTab, setActiveTab] = useEstadisticasTab();
  const current = useHeroTab(activeTab);
  const router = useRouter();
  const pathname = usePathname();

  const go = (tab: HeroTab) => {
    if (tab === 'historicos') {
      router.replace(`${pathname}?vista=historico`, { scroll: false });
      return;
    }
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  return (
    <div role="tablist" aria-label="Estadísticas" className={size === 'sm' ? 'flex gap-[18px]' : 'flex justify-center gap-[26px]'}>
      {TABS.map((t) => {
        const on = current === t.key;
        return (
          <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => go(t.key)} className={`${TAB} ${size === 'sm' ? 'text-[17px]' : 'text-[22px]'} ${on ? TAB_ON : TAB_OFF}`}>
            {t.label}
            {on ? <span className="absolute bottom-0 left-0 h-[1.5px] w-full rounded-full bg-white" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export default function EstadisticasHero() {
  const [activeTab] = useEstadisticasTab();

  return (
    <div className="container">
      {/* Mobile: centered title with tabs underneath */}
      <div className="flex flex-col items-center pt-8 pb-6 lg:hidden">
        <h1 className="font-special-gothic-condensed-one text-white text-[38px] tracking-[0.4px] mb-4">
          Estadísticas
        </h1>
        <Suspense fallback={null}>
          <HeroTabs size="sm" />
        </Suspense>
        <Suspense fallback={null}>
          <HistoricoBand className="mt-[18px] w-full" />
        </Suspense>
      </div>

      {/* Desktop: centered title with tabs underneath */}
      <div className="hidden lg:block pt-[50px] pb-11 text-center">
        <h1 className="font-special-gothic-condensed-one text-white text-[42px] tracking-[0.4px] mb-5">
          Estadísticas
        </h1>
        {/*
          Grid 1fr auto 1fr: los tabs quedan centrados en el eje real del
          contenedor y el botón se ancla a la derecha sin desplazarlos.
        */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="col-start-2">
            <Suspense fallback={null}>
              <HeroTabs size="lg" />
            </Suspense>
          </div>
          {/*
            mr-[7px]: el último ícono social del header mide 18px dentro de un
            box de 32px centrado, así que su glifo cae 7px adentro del borde
            del container. mb-2 compensa el pb-2 de los tabs para que el botón
            quede centrado con el texto y no con el subrayado.
          */}
          <div className="col-start-3 mr-[7px] mb-2 justify-self-end">
            <PrintableViewButton scope={activeTab} />
          </div>
        </div>
        <Suspense fallback={null}>
          <HistoricoBand className="mt-[22px]" />
        </Suspense>
      </div>
    </div>
  );
}
