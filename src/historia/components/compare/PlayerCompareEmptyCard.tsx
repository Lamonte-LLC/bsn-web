'use client';

import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { displayName } from '@/archivo/lib/names';
import { cls } from '@/archivo/lib/tokens';
import type { SeasonLeaderSuggestionEdge } from '@/historia/lib/season-leader-suggestion';
import { MAX_COMPARE_PLAYERS, MIN_COMPARE_PLAYERS } from '@/historia/lib/compare-players';
import { setPickerOpen, useCompareNavigation } from './useCompareState';

type Props = {
  selectedKeys: string[];
  suggested: SeasonLeaderSuggestionEdge[];
  /** "BSN 2026" */
  seasonName?: string;
};

/** "Cangrejeros de Santurce" → "Cangrejeros". */
const clubShortName = (name: string) => name.replace(/\s+de\s+.+$/i, '');

/**
 * Initial card of the comparison: title, the search that opens the picker, the season's scoring leaders as
 * a grid of tiles (six by two on desktop, three by four on phones), and a ghost button that opens the picker
 * too, for whoever isn't in the twelve. Every tile has the same two lines: the
 * player's given name and one surname, and the club's name; the avatar carries the club's color as a ring.
 */
export default function PlayerCompareEmptyCard({ selectedKeys, suggested, seasonName }: Props) {
  const { add } = useCompareNavigation(selectedKeys);
  // "BSN 2026" → "Líderes Temporada 2026"; until the page passes the season, "Líderes de la temporada".
  const seasonLabel = seasonName ? `Temporada ${seasonName.replace(/^BSN\s+/i, '')}` : 'de la temporada';
  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[20px] pt-[22px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[30px] lg:pt-[34px]">
      <div className="text-center">
        <h2 className="text-[21px] leading-[1.1] tracking-[0.3px] text-[#0F171F] lg:text-[26px]">
          Compara de {MIN_COMPARE_PLAYERS} a {MAX_COMPARE_PLAYERS} jugadores del BSN
        </h2>
        <p className="mx-auto mt-[6px] max-w-[520px] font-barlow text-[15px] font-normal leading-[1.45] text-[rgba(15,23,31,0.78)] lg:mt-[8px] lg:text-[16px]">Activos o históricos, de cualquier época, lado a lado.</p>
      </div>

      <button type="button" onClick={() => setPickerOpen(true)} className={`mt-[20px] flex h-[46px] w-full cursor-pointer items-center gap-[10px] rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] px-[16px] text-left font-barlow text-[15px] font-medium text-[rgba(15,23,31,0.45)] transition-colors duration-150 hover:border-[#0F171F] ${cls.focus}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,.45)" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        Buscar jugador
      </button>

      {suggested.length ? (
        <>
          <h3 className="mt-[22px] text-[19px] tracking-[0.3px] text-[#0F171F] lg:mt-[26px] lg:text-[21px]">Líderes {seasonLabel}</h3>
          <ul className="mt-[12px] grid grid-cols-3 gap-[7px] md:grid-cols-6 md:gap-[10px]">
            {suggested.map(({ node: { player } }) => {
              const taken = selectedKeys.includes(player.providerId);
              const color = player.teamColor || '#7D7D7D';
              return (
                <li key={player.providerId} className="min-w-0">
                  <button
                    type="button"
                    disabled={taken}
                    aria-pressed={taken}
                    onClick={() => add(player.providerId)}
                    title={player.name}
                    className={cx(
                      `relative flex w-full flex-col items-center gap-[6px] rounded-[12px] border px-[6px] pb-[10px] pt-[12px] text-center transition-[border-color,background-color,transform] duration-150 md:gap-[8px] md:pb-[14px] md:pt-[16px] ${cls.focus}`,
                      taken ? 'border-[rgba(15,23,31,0.12)] bg-[#F4F4F4]' : 'cursor-pointer border-[#EAEAEA] bg-white hover:border-[rgba(15,23,31,0.3)] hover:bg-[#FAFAFA] active:scale-[0.98] motion-reduce:active:scale-100',
                    )}
                  >
                    {taken ? (
                      <span className="absolute right-[8px] top-[8px] inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#0F171F]" aria-hidden>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8.5l3 3 7-7" />
                        </svg>
                      </span>
                    ) : null}
                    <span className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full border-[2px] md:h-[64px] md:w-[64px]" style={{ borderColor: color }}>
                      {player.avatarUrl ? <img src={`${player.avatarUrl}?size=200`} alt="" className="h-full w-full object-cover" /> : <PlayerAvatar name={player.name} color={color} sizePx={58} />}
                    </span>
                    <span className="block w-full truncate text-[14px] leading-[1.15] text-[#0F171F] md:text-[16px]">{displayName(player.name)}</span>
                    <span className="block w-full truncate font-barlow text-[11px] font-medium text-[rgba(15,23,31,0.55)] md:text-[12px]">{clubShortName(player.teamName)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <button type="button" onClick={() => setPickerOpen(true)} className={`mt-[18px] flex h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(15,23,31,0.2)] bg-transparent font-barlow text-[15px] font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] lg:mt-[22px] ${cls.focus}`}>
        Ver todos los jugadores
      </button>
    </div>
  );
}
