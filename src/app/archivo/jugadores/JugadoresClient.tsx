'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge } from '@/archivo/components/ui';
import { usePlayerIndex, usePlayerSearch } from '@/archivo/hooks/usePlayerSearch';
import { fmtInt, normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import type { PlayerIndexEntry } from '@/archivo/lib/types';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAGE_SIZE = 60;

interface Props {
  franchises: Record<string, FranchiseView>;
}

export function PlayerRow({ p, franchises }: { p: PlayerIndexEntry; franchises: Record<string, FranchiseView> }) {
  const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
  return (
    <Link
      href={`/archivo/jugadores/${p.slug}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[rgba(0,0,0,0.07)] py-[9px] transition-colors duration-150 hover:bg-[#FAFAFA] md:grid-cols-[1fr_140px_120px_90px]"
    >
      <span className="flex min-w-0 items-center gap-[10px]">
        <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={32} />
        <span className="min-w-0">
          <span className="block truncate text-[16px] tracking-[0.15px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
          <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)] md:hidden">{yearsLabel(p.fy, p.ly)}</span>
        </span>
        {p.isMvp ? <Badge className="hidden sm:inline-flex">MVP{p.mvpYears.length > 1 ? ` ×${p.mvpYears.length}` : ''}</Badge> : null}
      </span>
      <span className="hidden font-barlow text-[13px] text-[rgba(15,23,31,0.7)] md:block">{yearsLabel(p.fy, p.ly)}</span>
      <span className="flex items-center gap-[3px]">
        {p.franchiseSlugs.slice(0, 5).map((slug) => (
          <FranchiseLogo key={slug} franchise={franchises[slug] ?? null} fallbackName={slug} size="chip" />
        ))}
        {p.franchiseSlugs.length > 5 ? <span className="font-barlow text-[11px] text-[rgba(15,23,31,0.5)]">+{p.franchiseSlugs.length - 5}</span> : null}
      </span>
      <span className="hidden text-right font-barlow text-[13px] text-[rgba(15,23,31,0.7)] [font-variant-numeric:tabular-nums] md:block">
        {p.pts !== null ? `${fmtInt(p.pts)} pts` : '–'}
      </span>
    </Link>
  );
}

export default function JugadoresClient({ franchises }: Props) {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('A');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const index = usePlayerIndex();
  const { results, ready } = usePlayerSearch(query, 100);

  const byLetter = useMemo(() => {
    if (!index) return [];
    return index.filter((p) => normalizeSearch(p.name).startsWith(letter.toLowerCase()));
  }, [index, letter]);

  const searching = query.trim().length > 0;
  const list = searching ? results : byLetter.slice(0, visible);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-[420px]">
          <span className="sr-only">Buscar jugador</span>
          <svg aria-hidden width="17" height="17" viewBox="0 0 17 17" fill="none" className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" />
            <path d="M11.5 11.5L14.5 14.5" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o apellido"
            autoComplete="off"
            className="h-[44px] w-full rounded-[6px] border border-[#D4D4D4] bg-[#fafafa] pl-[36px] pr-3 font-barlow text-[14px] font-medium tracking-[-0.14px] text-[rgba(15,23,31,0.9)] outline-none placeholder:text-[rgba(15,23,31,0.4)] focus:border-[rgba(15,23,31,0.3)]"
          />
        </label>
        <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">
          {!ready ? 'Cargando índice…' : searching ? `${results.length} resultado${results.length === 1 ? '' : 's'}` : `${byLetter.length} jugadores con ${letter}`}
        </p>
      </div>

      {!searching ? (
        <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-[4px]">
            {LETTERS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLetter(l);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={letter === l}
                className={`h-[34px] w-[34px] rounded-[100px] border text-[15px] transition-colors duration-150 ${
                  letter === l ? 'border-[#0F171F] bg-[#0F171F] text-white' : 'border-[#D5D5D5] bg-white text-[rgba(0,0,0,0.65)] hover:border-[rgba(47,47,47,1)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="hidden grid-cols-[1fr_140px_120px_90px] gap-3 border-b border-[rgba(0,0,0,0.08)] py-2 md:grid">
        {['Jugador', 'Años', 'Equipos', 'Puntos'].map((h, i) => (
          <span key={h} className={`font-barlow text-[12px] font-medium uppercase tracking-[1px] text-[rgba(0,0,0,0.6)] ${i === 3 ? 'text-right' : ''}`}>
            {h}
          </span>
        ))}
      </div>

      {list.map((p) => (
        <PlayerRow key={p.id} p={p} franchises={franchises} />
      ))}

      {ready && list.length === 0 ? <p className="py-12 text-center font-barlow text-[13px] text-[rgba(0,0,0,0.4)]">No se encontraron jugadores.</p> : null}

      {!searching && visible < byLetter.length ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-4 w-full rounded-[12px] border border-[#D9D9D9] bg-[#fcfcfc] px-4 py-[10px] text-[16px] tracking-[0.32px] text-black transition-colors duration-150 hover:bg-[#F4F4F4]"
        >
          Cargar más ({byLetter.length - visible} restantes)
        </button>
      ) : null}
    </div>
  );
}
