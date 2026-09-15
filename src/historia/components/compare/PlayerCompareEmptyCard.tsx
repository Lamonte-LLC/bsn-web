'use client';

import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { MAX_COMPARE_PLAYERS, MIN_COMPARE_PLAYERS } from '@/historia/lib/compare-players';
import type { SuggestedPlayer } from './PlayerPickerDialog';
import { setPickerOpen, useCompareNavigation } from './useCompareState';

type Props = {
  selectedKeys: string[];
  suggested: SuggestedPlayer[];
};

/** Initial card, like CompareEmptyCard: a search box that opens the picker and the season leaders as shortcuts. */
export default function PlayerCompareEmptyCard({ selectedKeys, suggested }: Props) {
  const { add } = useCompareNavigation(selectedKeys);
  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] py-[22px] text-center shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[38px] lg:pt-[34px]">
      <h2 className="text-[20px] tracking-[0.3px] text-[#0F171F] lg:text-[24px]">Compara de {MIN_COMPARE_PLAYERS} a {MAX_COMPARE_PLAYERS} jugadores del BSN</h2>
      <p className="mt-[5px] font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] lg:mt-[6px] lg:text-[13px]">Activos o históricos. Escoge los jugadores para ver sus estadísticas lado a lado y quién gana cada categoría.</p>

      <button type="button" onClick={() => setPickerOpen(true)} className="mt-[18px] flex h-[46px] w-full cursor-pointer items-center gap-[10px] rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] px-[16px] text-left font-barlow text-[15px] font-medium text-[rgba(15,23,31,0.45)] transition-colors hover:border-[#0F171F] lg:mt-[26px]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,.45)" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        Buscar jugador
      </button>

      {suggested.length ? (
        <>
          <p className="mt-[14px] text-left font-barlow text-[10px] font-semibold uppercase tracking-[1.4px] text-[rgba(15,23,31,0.4)]">Sugeridos · líderes de la temporada</p>
          <div className="mt-[10px] grid grid-cols-3 gap-[7px] md:grid-cols-6 md:gap-[10px]">
            {suggested.map((s) => {
              const taken = selectedKeys.includes(s.key);
              return (
                <button key={s.key} type="button" disabled={taken} aria-pressed={taken} onClick={() => add(s.key)} className={`flex aspect-square flex-col items-center justify-center gap-[6px] rounded-[10px] border bg-white px-[6px] text-center transition-colors ${taken ? 'border-[#0F171F] bg-[rgba(15,23,31,0.03)]' : 'cursor-pointer border-[#EAEAEA] hover:border-[rgba(47,47,47,1)]'}`}>
                  <span className="flex items-center justify-center overflow-hidden rounded-full border-2" style={{ width: 48, height: 48, borderColor: s.color }}>
                    {s.avatarUrl ? <img src={`${s.avatarUrl}?size=200`} alt="" className="h-full w-full object-cover" /> : <PlayerAvatar name={s.name} color={s.color} sizePx={44} />}
                  </span>
                  <span className="text-[15px] leading-[1.15] text-[rgba(15,23,31,0.9)] md:text-[16px]">{s.name.split(' ').slice(-1)[0]}</span>
                  <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.5)]">{s.team}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p className="mt-[14px] font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] lg:mt-[18px] lg:text-[12px]">Escoge al menos {MIN_COMPARE_PLAYERS} jugadores · La comparación aparece automáticamente</p>
    </div>
  );
}
