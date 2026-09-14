'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { AlphaChip, Badge, Button, SearchIcon, Skeleton } from '@/archivo/components/ui';
import { usePlayerIndex, usePlayerSearch } from '@/archivo/hooks/usePlayerSearch';
import { fmtInt, normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { PlayerIndexEntry } from '@/archivo/lib/types';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAGE_SIZE = 60;
const GRID = 'grid-cols-[1fr_auto] md:grid-cols-[1fr_130px_140px_90px]';

interface Props {
  franchises: Record<string, FranchiseView>;
}

export function PlayerRow({ p, franchises }: { p: PlayerIndexEntry; franchises: Record<string, FranchiseView> }) {
  const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
  return (
    <Link href={`/archivo/jugadores/${p.slug}`} className={`grid ${GRID} min-h-[52px] items-center gap-x-[12px] border-b border-[rgba(0,0,0,0.06)] px-[4px] py-[6px] transition-colors duration-150 hover:bg-[#FAFAFA] ${cls.focus} focus-visible:outline-offset-[-2px] rounded-[6px]`}>
      <span className="flex min-w-0 items-center gap-[10px]">
        <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={34} />
        <span className="min-w-0">
          <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{p.name}</span>
          <span className={`block ${cls.meta} !text-[12px] md:hidden ${cls.tabular}`}>{yearsLabel(p.fy, p.ly)}</span>
        </span>
        {p.isMvp ? (
          <Badge tone="gold" className="hidden shrink-0 sm:inline-flex">
            MVP{p.mvpYears.length > 1 ? ` ×${p.mvpYears.length}` : ''}
          </Badge>
        ) : null}
      </span>
      <span className={`hidden font-barlow text-[13px] text-[rgba(0,0,0,0.6)] md:block ${cls.tabular}`}>{yearsLabel(p.fy, p.ly)}</span>
      <span className="flex items-center gap-[3px]">
        {p.franchiseSlugs.slice(0, 5).map((slug) => (
          <FranchiseLogo key={slug} franchise={franchises[slug] ?? null} fallbackName={slug} sizePx={20} />
        ))}
        {p.franchiseSlugs.length > 5 ? <span className={`ml-[2px] font-barlow text-[11.5px] font-semibold text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>+{p.franchiseSlugs.length - 5}</span> : null}
      </span>
      <span className={`hidden text-right font-barlow text-[13.5px] text-[#0F171F] md:block ${cls.tabular}`}>{p.pts !== null ? fmtInt(p.pts) : '–'}</span>
    </Link>
  );
}

export default function JugadoresClient({ franchises }: Props) {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('A');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const index = usePlayerIndex();
  const { results, ready } = usePlayerSearch(query, 100);

  const lettersWithPlayers = useMemo(() => {
    const set = new Set<string>();
    for (const p of index ?? []) set.add(normalizeSearch(p.name)[0]?.toUpperCase() ?? '');
    return set;
  }, [index]);

  const byLetter = useMemo(() => {
    if (!index) return [];
    return index.filter((p) => normalizeSearch(p.name).startsWith(letter.toLowerCase()));
  }, [index, letter]);

  const searching = query.trim().length > 0;
  const list = searching ? results : byLetter.slice(0, visible);

  return (
    <div>
      <div className="mb-[18px] flex flex-col gap-[12px] md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-[420px]">
          <span className="sr-only">Buscar jugador</span>
          <SearchIcon size={15} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.4)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido o apodo"
            autoComplete="off"
            className="h-[48px] w-full rounded-[10px] border border-[rgba(0,0,0,0.16)] bg-white pl-[40px] pr-[14px] font-barlow text-[15px] text-[#0F171F] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(0,0,0,0.35)] focus:border-[#1772D9] focus:shadow-[0_0_0_3px_rgba(23,114,217,0.15)] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <p className={`${cls.meta} ${cls.tabular}`} aria-live="polite">
          {!ready ? 'Cargando índice' : searching ? `${results.length} resultado${results.length === 1 ? '' : 's'}` : `${byLetter.length} jugadores con ${letter}`}
        </p>
      </div>

      {!searching ? (
        <div className="no-scrollbar -mx-4 mb-[18px] overflow-x-auto px-4 md:mx-0 md:px-0">
          <div role="group" aria-label="Filtrar por letra" className="flex min-w-max gap-[6px] md:flex-wrap">
            {LETTERS.map((l) => (
              <AlphaChip
                key={l}
                letter={l}
                active={letter === l}
                disabled={ready && !lettersWithPlayers.has(l)}
                onClick={() => {
                  setLetter(l);
                  setVisible(PAGE_SIZE);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={`${cls.card} px-[12px] pb-[6px] md:px-[20px]`}>
        <div className={`hidden ${GRID} gap-x-[12px] border-b border-[rgba(0,0,0,0.12)] px-[4px] pb-[9px] pt-[12px] md:grid`}>
          {['Jugador', 'Años', 'Equipos', 'Puntos'].map((h, i) => (
            <span key={h} className={`${cls.label} ${i === 3 ? 'text-right' : ''}`}>
              {h}
            </span>
          ))}
        </div>

        {!ready ? (
          <div className="py-[16px]">
            <Skeleton rows={6} />
          </div>
        ) : (
          list.map((p) => <PlayerRow key={p.id} p={p} franchises={franchises} />)
        )}

        {ready && list.length === 0 ? (
          <div className="px-[16px] py-[28px] text-center">
            <p className="font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">{searching ? `Sin resultados para “${query.trim()}”.` : `No hay jugadores con ${letter}.`}</p>
            {searching ? <p className={`mt-[4px] ${cls.meta}`}>Prueba sin acentos o con el apellido.</p> : null}
          </div>
        ) : null}

        {!searching && ready && visible < byLetter.length ? (
          <div className="flex justify-center py-[12px]">
            <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Cargar más ({byLetter.length - visible} restantes)
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
