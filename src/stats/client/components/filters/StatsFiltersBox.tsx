'use client';

import { useCallback, useState } from 'react';
import { Disclosure, DisclosureButton } from '@headlessui/react';

const SEASONS = [
  { value: '2026', label: 'Temporada 2026' },
  { value: '2025', label: 'Temporada 2025' },
  { value: '2024', label: 'Temporada 2024' },
];

const PHASES = [
  { value: 'REGULAR', label: 'Temporada regular' },
  { value: 'QUARTERFINALS', label: 'Cuartos de final' },
  { value: 'SEMIFINALS', label: 'Semifinales' },
  { value: 'FINALS', label: 'Final' },
];

const VIEWS = [
  { value: 'AVERAGE', label: 'Promedios por juego' },
  { value: 'TOTAL', label: 'Totales' },
];

export type StatsFilters = {
  season: string | null;
  phase: string;
  view: string;
};

type Props = {
  onApply?: (filters: StatsFilters) => void;
};

const DEFAULT_FILTERS: StatsFilters = {
  season: null,
  phase: 'REGULAR',
  view: 'AVERAGE',
};

export default function StatsFiltersBox({ onApply }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState('REGULAR');
  const [selectedView, setSelectedView] = useState('AVERAGE');

  const handleClear = useCallback(() => {
    setSelectedSeason('');
    setSelectedPhase(DEFAULT_FILTERS.phase);
    setSelectedView(DEFAULT_FILTERS.view);
    onApply?.(DEFAULT_FILTERS);
  }, [onApply]);

  const handleApply = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onApply?.({
        season: selectedSeason || null,
        phase: selectedPhase,
        view: selectedView,
      });
    },
    [onApply, selectedSeason, selectedPhase, selectedView],
  );

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
      <Disclosure>
        {({ open }) => (
          <>
            <div className="flex items-center justify-between px-5 py-[10px] lg:px-[30px] lg:pt-6 lg:pb-0">
              <h3 className="font-special-gothic-condensed-one text-[16px] text-[rgba(15,23,31,0.9)] tracking-[0.16px] lg:text-2xl">
                Filtros
              </h3>
              <DisclosureButton className="lg:hidden flex items-center justify-center size-6">
                <img
                  src={`/assets/images/icons/${open ? 'icon-minus-circle' : 'icon-plus-circle'}.svg`}
                  alt={open ? 'Cerrar filtros' : 'Abrir filtros'}
                  width={24}
                  height={24}
                />
              </DisclosureButton>
            </div>

            <div className={open ? 'block' : 'hidden lg:block'}>
              <form
                onSubmit={handleApply}
                className="p-5 pt-3 space-y-5 lg:px-[30px] lg:pt-5 lg:pb-6"
              >
                <div className="space-y-[5px]">
                  <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)] tracking-[-0.13px]">
                    Temporada
                  </label>
                  <div className="relative">
                    <select
                      className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] pl-4 pr-10 rounded-[6px] text-sm font-barlow text-[rgba(15,23,31,0.9)] tracking-[-0.14px] w-full appearance-none"
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                    >
                      <option value="">Seleccionar temporada</option>
                      {SEASONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <img
                      src="/assets/images/icons/icon-chevron-down.png"
                      alt=""
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-[5px]">
                  <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)] tracking-[-0.13px]">
                    Fase
                  </label>
                  <div className="relative">
                    <select
                      className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] pl-4 pr-10 rounded-[6px] text-sm font-barlow text-[rgba(15,23,31,0.9)] tracking-[-0.14px] w-full appearance-none"
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                    >
                      {PHASES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <img
                      src="/assets/images/icons/icon-chevron-down.png"
                      alt=""
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-[5px]">
                  <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)] tracking-[-0.13px]">
                    Vista
                  </label>
                  <div className="relative">
                    <select
                      className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] pl-4 pr-10 rounded-[6px] text-sm font-barlow text-[rgba(15,23,31,0.9)] tracking-[-0.14px] w-full appearance-none"
                      value={selectedView}
                      onChange={(e) => setSelectedView(e.target.value)}
                    >
                      {VIEWS.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <img
                      src="/assets/images/icons/icon-chevron-down.png"
                      alt=""
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="flex gap-[10px]">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 bg-[#f3f3f3] border border-[#f3f3f3] px-3 py-2 rounded-[100px]"
                  >
                    <span className="font-special-gothic-condensed-one text-[15px] text-[#0F171F] tracking-[0.3px]">
                      Limpiar
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white border border-[rgba(168,168,168,0.35)] px-3 py-2 rounded-[100px]"
                  >
                    <span className="font-special-gothic-condensed-one text-[15px] text-[#0F171F] tracking-[0.3px]">
                      Aplicar
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </Disclosure>
    </div>
  );
}
