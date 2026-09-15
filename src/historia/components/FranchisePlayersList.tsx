'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { SearchIcon } from '@/archivo/components/ui';
import { normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchisePlayer } from '@/archivo/lib/types';

const PAGE = 20;
type Filter = 'todos' | 'activos';

/* Design-system secondary pill, as the team page uses it. */
const PILL = 'inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white px-[18px] font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none hover:border-[rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white';
const TH = 'whitespace-nowrap px-[10px] pb-[9px] pt-[10px] font-barlow text-[12.5px] font-normal uppercase text-[rgba(0,0,0,0.6)]';
const TD = 'h-[48px] whitespace-nowrap px-[10px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.9)]';

/**
 * Every player who wore the jersey, as one table: search, a Todos | Activos filter, and "Cargar 20 más" so
 * the list grows in place. Avatars are neutral initials (no team color, so weak primaries never fail).
 */
export default function FranchisePlayersList({ players, currentSeason }: { players: FranchisePlayer[]; currentSeason: number }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [visible, setVisible] = useState(PAGE);
  const hasActive = players.some((p) => p.ly >= currentSeason - 1);
  const list = useMemo(() => {
    const q = normalizeSearch(query);
    const base = [...players].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const filtered = filter === 'activos' ? base.filter((p) => p.ly >= currentSeason - 1) : base;
    return q ? filtered.filter((p) => normalizeSearch(p.name).includes(q)) : filtered;
  }, [players, query, filter, currentSeason]);
  const shown = list.slice(0, visible);
  const reset = () => setVisible(PAGE);

  return (
    <div>
      <div className="mb-[14px] flex flex-col gap-[10px] md:flex-row md:items-center">
        <label className="relative block w-full md:max-w-[420px] md:flex-1">
          <span className="sr-only">Buscar jugador de la franquicia</span>
          <SearchIcon size={15} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
            placeholder="Buscar jugador"
            autoComplete="off"
            className="h-[44px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] pl-[40px] pr-[14px] font-barlow text-[15px] font-medium text-[#0F171F] outline-none transition-[border-color,background-color] duration-150 placeholder:text-[rgba(15,23,31,0.45)] focus:border-[#0F171F] focus:bg-white [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        {hasActive ? (
          <div role="radiogroup" aria-label="Filtro" className="flex gap-[8px]">
            {(
              [
                ['todos', 'Todos'],
                ['activos', 'Activos'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={filter === k}
                data-selected={filter === k ? '' : undefined}
                onClick={() => {
                  setFilter(k);
                  reset();
                }}
                className={`${PILL} flex-1 md:flex-none md:min-w-[110px]`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {shown.length ? (
        <div className={`${cls.card} overflow-hidden px-[4px] md:px-[12px]`}>
          <table className={`w-full border-collapse ${cls.tabular}`}>
            <caption className="sr-only">Jugadores de la franquicia</caption>
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.08)]">
                <th scope="col" className={`${TH} text-left`}>Jugador</th>
                <th scope="col" className={`${TH} text-left`}>Años</th>
                <th scope="col" className={`${TH} w-[110px] text-right`}>Temporadas</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-t border-[rgba(0,0,0,0.06)] transition-colors duration-150 hover:bg-[#FAFAFA]">
                  <td className={`${TD} text-left`}>
                    <Link href={`/jugadores/${p.slug}`} className={`inline-flex items-center gap-[10px] rounded-[4px] ${cls.focus}`}>
                      <PlayerAvatar name={p.name} sizePx={30} />
                      <span className="font-semibold">{p.name}</span>
                      {p.ly >= currentSeason - 1 ? <span className={`${cls.label} !text-[9px] !tracking-[0.8px]`}>Activo</span> : null}
                    </Link>
                  </td>
                  <td className={`${TD} text-left text-[rgba(0,0,0,0.55)]`}>{yearsLabel(p.fy, p.ly)}</td>
                  <td className={`${TD} text-right`}>{p.seasons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`${cls.card} px-[20px] py-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]`}>Sin resultados para “{query.trim()}”.</div>
      )}
      {visible < list.length ? (
        <div className="flex justify-center pt-[14px]">
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className={`${PILL} h-[38px] px-[22px] ${cls.tabular}`}>
            Cargar {Math.min(PAGE, list.length - visible)} más · {list.length - visible} restantes
          </button>
        </div>
      ) : null}
    </div>
  );
}
