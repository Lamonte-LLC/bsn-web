'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import { useUnifiedSearch } from '@/historia/hooks/useUnifiedSearch';
import { MAX_COMPARE_PLAYERS, MIN_COMPARE_PLAYERS } from '@/historia/lib/compare-players';
import type { UnifiedIndexEntry } from '../../../../types/historia';

/** A player offered as a shortcut on the empty card: the season leaders, resolved on the server. */
export interface SuggestedPlayer {
  key: string;
  name: string;
  /** "Piratas" */
  team: string;
  color: string;
  avatarUrl: string | null;
}

type Props = {
  open: boolean;
  onClose: () => void;
  selectedKeys: string[];
  suggested?: SuggestedPlayer[];
  onPick: (key: string) => void;
};

/** URL key of an index entry: the providerId for unlinked actives, the archive slug otherwise. */
export function keyOf(entry: UnifiedIndexEntry): string {
  return entry.providerId && !entry.slug.includes('-') ? entry.providerId : entry.slug;
}

function matchedAlias(p: UnifiedIndexEntry, query: string): string | null {
  const q = normalizeSearch(query);
  if (!q || normalizeSearch(p.name).includes(q)) return null;
  return p.aliases.find((a) => normalizeSearch(a).includes(q)) ?? null;
}

const PAGE = 80;

/**
 * Picker of the player comparison: one A-to-Z list of every player, active or historical, with the photo when
 * there is one, scrollable and searchable. Same dialog chrome as CompareTeamPickerDialog. Picking adds and closes.
 */
export default function PlayerPickerDialog({ open, onClose, selectedKeys, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const { results, all, ready } = useUnifiedSearch(query, 60);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const isFull = selectedKeys.length >= MAX_COMPARE_PLAYERS;
  const typing = query.trim().length > 0;
  const list = useMemo(() => (typing ? results : all), [typing, results, all]);
  const shown = typing ? list : list.slice(0, limit);

  // Grow the A-to-Z list as the user scrolls; no button to press.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typing) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setLimit((n) => Math.min(n + PAGE, all.length));
    });
    io.observe(el);
    return () => io.disconnect();
  }, [typing, all.length, shown.length]);

  const close = () => {
    setQuery('');
    setLimit(PAGE);
    onClose();
  };
  const pick = (key: string) => {
    if (selectedKeys.includes(key) || isFull) return;
    onPick(key);
    close();
  };

  return (
    <Dialog open={open} onClose={close} initialFocus={inputRef} className="relative z-[999]">
      <div className="fixed inset-0 bg-[rgba(15,23,31,0.6)] transition-opacity duration-150" aria-hidden />
      <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-0 md:items-center md:p-4">
        <DialogPanel className="flex max-h-[92vh] w-full max-w-[560px] flex-col rounded-t-[16px] border border-[#E2E2E2] bg-white p-[18px] shadow-[0px_2px_14px_rgba(14,20,32,0.08)] md:max-h-[80vh] md:rounded-[16px] md:p-[24px]">
          <div className="mb-[14px] flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[20px] text-[#0F171F] md:text-[24px]">Escoge un jugador</DialogTitle>
              <p className="mt-[4px] font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] md:text-[13px]">
                De {MIN_COMPARE_PLAYERS} a {MAX_COMPARE_PLAYERS} jugadores, activos o históricos, de cualquier época.
              </p>
            </div>
            <button type="button" onClick={close} aria-label="Cerrar" className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EAEAEA] transition-colors hover:border-[rgba(47,47,47,1)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="#0F171F" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,.45)" strokeWidth="1.8" strokeLinecap="round" aria-hidden className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre o apodo"
              autoComplete="off"
              aria-label="Buscar jugador"
              className="h-[46px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] pl-[42px] pr-[14px] font-barlow text-[15px] text-[#0F171F] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(15,23,31,0.4)] focus:border-[#0F171F] focus:bg-white [&::-webkit-search-cancel-button]:hidden"
            />
          </div>

          <div className="mt-[10px] flex items-center justify-between font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] text-[rgba(15,23,31,0.4)]">
            <span>{typing ? 'Resultados' : 'Todos los jugadores · A a Z'}</span>
            <span className="tabular-nums">{ready ? `${list.length}` : ''}</span>
          </div>

          <ul role="listbox" aria-label={typing ? 'Resultados' : 'Todos los jugadores'} className="mt-[6px] min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[rgba(15,23,31,0.08)]">
            {!ready ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Cargando jugadores…</li>
            ) : !shown.length ? (
              <li className="px-[16px] py-[14px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Sin resultados para “{query.trim()}”. Prueba sin acentos o con el apellido.</li>
            ) : (
              shown.map((r, i) => {
                const key = keyOf(r);
                const taken = selectedKeys.includes(key);
                const alias = typing ? matchedAlias(r, query) : null;
                return (
                  <li key={r.id} role="option" aria-selected={taken} className={i ? 'border-t border-[rgba(15,23,31,0.05)]' : ''}>
                    <button type="button" disabled={taken || isFull} onClick={() => pick(key)} className={cx('flex min-h-[52px] w-full items-center gap-[12px] px-[14px] py-[8px] text-left transition-colors', taken || isFull ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-[#F5F5F5]')}>
                      {r.avatarUrl ? <img src={`${r.avatarUrl}?size=200`} alt="" width={36} height={36} loading="lazy" className="h-[36px] w-[36px] shrink-0 rounded-full border border-[#E5E5E5] object-cover" /> : <PlayerAvatar name={r.name} sizePx={36} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">
                          {r.name}
                          {alias ? <span className="font-normal text-[12px] text-[rgba(15,23,31,0.45)]"> · apodo: {alias}</span> : null}
                        </span>
                        <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)] tabular-nums">
                          {yearsLabel(r.fy, r.ly)}
                          {r.isActive ? <span className="ml-[6px] font-semibold uppercase tracking-[0.8px] text-[#0F171F]">Activo</span> : null}
                          {taken ? <span className="ml-[6px]">· ya está en la comparación</span> : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
            {!typing && ready && shown.length < list.length ? <li ref={sentinelRef} aria-hidden className="h-[40px]" /> : null}
          </ul>

          <div className="mt-[14px] flex items-center justify-between gap-4">
            <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] md:text-[12px]">
              {selectedKeys.length} de {MAX_COMPARE_PLAYERS} seleccionados
            </span>
            <button type="button" onClick={close} className="cursor-pointer rounded-[100px] bg-[#0F171F] px-[18px] py-[7px] text-[15px] text-white transition-opacity">
              {selectedKeys.length >= MIN_COMPARE_PLAYERS ? 'Ver comparación' : 'Cerrar'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
