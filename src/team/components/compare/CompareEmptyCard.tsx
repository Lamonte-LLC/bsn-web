'use client';

import TeamPickerGrid from './TeamPickerGrid';
import { MIN_COMPARE_TEAMS } from './teams';

type Props = {
  selected: string[];
  onToggle: (code: string) => void;
};

/** Variación 4b: tarjeta inicial con el selector de equipos. */
export default function CompareEmptyCard({ selected, onToggle }: Props) {
  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] py-[22px] text-center shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[38px] lg:pt-[34px]">
      <h2 className="text-[20px] tracking-[0.3px] text-[#0F171F] lg:text-[24px]">
        Compara de 2 a 4 equipos del BSN
      </h2>
      <p className="mt-[5px] font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] lg:mt-[6px] lg:text-[13px]">
        Escoge los equipos para ver todas sus estadísticas lado a lado, quién
        gana cada categoría y su historial de juegos.
      </p>

      <TeamPickerGrid
        selected={selected}
        onToggle={onToggle}
        className="mt-[18px] lg:mt-[26px]"
      />

      <p className="mt-[14px] font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] lg:mt-[18px] lg:text-[12px]">
        Escoge al menos {MIN_COMPARE_TEAMS} equipos · La comparación aparece
        automáticamente
      </p>
    </div>
  );
}
