'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchIcon } from '@/archivo/components/ui';
import { normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchisePlayer } from '@/archivo/lib/types';

const PAGE = 60;

/** Every player who wore the jersey: search by name, progressive loading with an anchor so the list never jumps. */
export default function FranchisePlayersList({ players }: { players: FranchisePlayer[] }) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const list = useMemo(() => {
    const q = normalizeSearch(query);
    const base = [...players].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return q ? base.filter((p) => normalizeSearch(p.name).includes(q)) : base;
  }, [players, query]);
  const shown = list.slice(0, visible);

  return (
    <div>
      <label className="relative mb-[14px] block w-full md:max-w-[380px]">
        <span className="sr-only">Buscar jugador de la franquicia</span>
        <SearchIcon size={15} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.4)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE);
          }}
          placeholder="Buscar en el roster histórico"
          autoComplete="off"
          className="h-[44px] w-full rounded-[10px] border border-[rgba(0,0,0,0.16)] bg-white pl-[40px] pr-[14px] font-barlow text-[15px] text-[#0F171F] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(0,0,0,0.35)] focus:border-[#1772D9] focus:shadow-[0_0_0_3px_rgba(23,114,217,0.15)] [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      {shown.length ? (
        <ul className="columns-1 gap-x-[32px] sm:columns-2 lg:columns-3">
          {shown.map((p) => (
            <li key={p.id} className="break-inside-avoid border-b border-[rgba(0,0,0,0.05)] py-[7px]">
              <Link href={`/jugadores/${p.slug}`} className={`flex items-baseline justify-between gap-[8px] rounded-[4px] ${cls.focus}`}>
                <span className="truncate font-barlow text-[14px] font-medium text-[#0F171F]">{p.name}</span>
                <span className={`shrink-0 ${cls.meta} !text-[12px] ${cls.tabular}`}>{yearsLabel(p.fy, p.ly)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">Sin resultados para “{query.trim()}”.</p>
      )}
      {visible < list.length ? (
        <div className="flex justify-center pt-[14px]">
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className={`inline-flex h-[34px] items-center rounded-[99px] border border-[rgba(0,0,0,0.16)] bg-white px-[15px] text-[14px] text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(0,0,0,0.3)] hover:text-[#0F171F] ${cls.focus}`}>
            Ver más ({list.length - visible} restantes)
          </button>
        </div>
      ) : null}
    </div>
  );
}
