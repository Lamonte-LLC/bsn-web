'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { usePlayerSearch } from '@/archivo/hooks/usePlayerSearch';
import { fmt, fmtInt, fmtPct, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { COMPARABLE_ROWS, type ComparableKey, type ComparableStats } from '@/archivo/lib/stats';

export interface ComparePlayer {
  id: string;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  franchiseSlugs: string[];
  mvpYears: number[];
  championships: number[];
  stats: { career: ComparableStats; regular: ComparableStats; playoffs: ComparableStats };
  similar: Array<{ slug: string; name: string; score: number }>;
}

interface Props {
  players: Array<ComparePlayer | null>;
  franchises: Record<string, FranchiseView>;
}

const SLOTS = ['a', 'b'] as const;
type SlotKey = (typeof SLOTS)[number];
const TAB_CLS = 'cursor-pointer rounded-[100px] border border-[#D5D5D5] bg-white px-[16px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] outline-none data-selected:border-[#0F171F] data-selected:bg-[#0F171F] data-selected:text-white';
/** One color per slot so a player's line stays continuous across teams (also used by the chart). */
export const SLOT_COLORS = ['#E51F1F', '#1772D9', '#16A14A'];

function format(value: number | null, kind: 'int' | 'avg' | 'pct'): string {
  if (kind === 'int') return fmtInt(value);
  if (kind === 'pct') return fmtPct(value);
  return fmt(value);
}

function useSlotNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useCallback(
    (slot: SlotKey, slug: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (slug) next.set(slot, slug);
      else next.delete(slot);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );
}

function SlotSearch({ slot, onPick, franchises, autoFocus }: { slot: SlotKey; onPick: (slug: string) => void; franchises: Record<string, FranchiseView>; autoFocus?: boolean }) {
  const [query, setQuery] = useState('');
  const { results, ready } = usePlayerSearch(query, 8);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  return (
    <div className="relative">
      <label className="block">
        <span className="mb-[6px] block font-barlow text-[12px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.5)]">Jugador {slot.toUpperCase()}</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe un nombre"
          autoComplete="off"
          className="h-[44px] w-full rounded-[6px] border border-[#D4D4D4] bg-[#fafafa] px-3 font-barlow text-[14px] font-medium tracking-[-0.14px] text-[rgba(15,23,31,0.9)] outline-none placeholder:text-[rgba(15,23,31,0.4)] focus:border-[rgba(15,23,31,0.3)]"
        />
      </label>
      {query.trim() ? (
        <ul data-search-results role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-[320px] overflow-y-auto rounded-[12px] border border-[#E2E2E2] bg-white shadow-[0px_1px_15px_0px_#5858581A]">
          {!ready ? <li className="px-3 py-2 font-barlow text-[13px] text-[rgba(0,0,0,0.5)]">Cargando índice…</li> : null}
          {ready && !results.length ? <li className="px-3 py-2 font-barlow text-[13px] text-[rgba(0,0,0,0.5)]">Sin resultados.</li> : null}
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  onPick(r.slug);
                }}
                className="flex w-full items-center gap-[10px] px-3 py-[8px] text-left transition-colors duration-150 hover:bg-[#FAFAFA]"
              >
                <PlayerAvatar name={r.name} color={r.franchiseSlugs[0] ? franchises[r.franchiseSlugs[0]]?.colors.primary : null} sizePx={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-[rgba(15,23,31,0.9)]">{r.name}</span>
                  <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{yearsLabel(r.fy, r.ly)}</span>
                </span>
                <span className="flex gap-[2px]">
                  {r.franchiseSlugs.slice(0, 4).map((s) => (
                    <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} size="chip" />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PlayerHeader({ p, color, franchises, onClear, align }: { p: ComparePlayer; color: string; franchises: Record<string, FranchiseView>; onClear: () => void; align: 'left' | 'right' }) {
  const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
  return (
    <PaperCard className={`flex flex-col gap-[10px] p-[14px] md:p-[18px] ${align === 'right' ? 'items-end text-right' : 'items-start'}`} >
      <div className={`flex items-center gap-[10px] ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={56} />
        <div className="min-w-0">
          <Link href={`/archivo/jugadores/${p.slug}`} className="block text-[20px] leading-[1.1] text-[rgba(15,23,31,0.9)] hover:underline md:text-[24px]">
            {p.name}
          </Link>
          <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">{yearsLabel(p.fy, p.ly)}</p>
        </div>
      </div>
      <div className={`flex flex-wrap gap-[4px] ${align === 'right' ? 'justify-end' : ''}`}>
        {p.franchiseSlugs.map((s) => (
          <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} size="chip" />
        ))}
      </div>
      {p.mvpYears.length || p.championships.length ? (
        <div className={`flex flex-wrap gap-[4px] ${align === 'right' ? 'justify-end' : ''}`}>
          {p.mvpYears.length ? <Badge>MVP ×{p.mvpYears.length}</Badge> : null}
          {p.championships.length ? <Badge tone="red">{p.championships.length} título{p.championships.length === 1 ? '' : 's'}</Badge> : null}
        </div>
      ) : null}
      <span aria-hidden className="h-[3px] w-[40px] rounded-full" style={{ background: color }} />
      <button type="button" onClick={onClear} className="font-barlow text-[12px] text-[#1772D9] hover:text-[#1257A8]">
        Cambiar
      </button>
    </PaperCard>
  );
}

function CompareRows({ players, statsKey }: { players: ComparePlayer[]; statsKey: 'career' | 'regular' | 'playoffs' }) {
  const anyData = players.some((p) => p.stats[statsKey].g);
  if (!anyData) return <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">No hay datos disponibles para esta fase.</p>;
  return (
    <div className="flex flex-col divide-y divide-[rgba(0,0,0,0.07)] rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
      {COMPARABLE_ROWS.map((row) => {
        const values = players.map((p) => p.stats[statsKey][row.key as ComparableKey]);
        if (values.every((v) => v === null)) return null;
        const valid = values.filter((v): v is number => v !== null);
        const best = valid.length === values.length && valid.length > 1 ? (row.lowerIsBetter ? Math.min(...valid) : Math.max(...valid)) : null;
        const tie = best !== null && valid.every((v) => v === best);
        const max = Math.max(...valid, 0);
        return (
          <div key={row.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-[10px] px-[12px] py-[9px] md:px-[18px]">
            {values.map((v, i) => {
              const winner = best !== null && !tie && v === best;
              const dim = best !== null && !tie && v !== best;
              const right = i === 1;
              return (
                <div key={i} className={`min-w-0 ${right ? 'order-3 text-right' : 'order-1 text-left'}`}>
                  <span className={`block text-[22px] leading-[1] [font-variant-numeric:tabular-nums] md:text-[26px] ${winner ? 'text-[#E51F1F]' : dim ? 'text-[rgba(15,23,31,0.4)]' : 'text-[rgba(15,23,31,0.9)]'}`}>
                    {format(v, row.kind)}
                    {winner ? <span className="sr-only"> (mejor)</span> : null}
                  </span>
                  <span className={`mt-[6px] block h-[4px] rounded-full ${right ? 'ml-auto' : ''}`} style={{ width: v === null || max === 0 ? 0 : `${Math.max(4, (v / max) * 100)}%`, background: winner ? '#E51F1F' : 'rgba(15,23,31,0.12)' }} />
                </div>
              );
            })}
            <div className="order-2 text-center">
              <span className="hidden font-barlow text-[12px] font-semibold uppercase tracking-[0.8px] text-[rgba(15,23,31,0.6)] sm:block">{row.label}</span>
              <span className="font-barlow text-[12px] font-semibold uppercase tracking-[0.8px] text-[rgba(15,23,31,0.6)] sm:hidden">{row.short}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CompararClient({ players, franchises }: Props) {
  const setSlot = useSlotNavigation();
  const filled = players.filter((p): p is ComparePlayer => p !== null);
  const preEra = filled.some((p) => p.fy < 1975);
  const freeSlot: SlotKey | null = players[0] === null ? 'a' : players[1] === null ? 'b' : null;

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {SLOTS.map((slot, i) => {
          const p = players[i];
          return p ? (
            <PlayerHeader key={slot} p={p} color={SLOT_COLORS[i]} franchises={franchises} onClear={() => setSlot(slot, null)} align={i === 1 ? 'right' : 'left'} />
          ) : (
            <PaperCard key={slot} className="p-[14px] md:p-[18px]">
              <SlotSearch slot={slot} onPick={(slug) => setSlot(slot, slug)} franchises={franchises} autoFocus={i === 0 && !players[0]} />
              <p className="mt-[8px] font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">Busca por nombre o apellido, sin acentos.</p>
            </PaperCard>
          );
        })}
      </div>

      {filled.length === 2 ? (
        <>
          <section className="mb-8">
            <TabGroup>
              <TabList className="mb-[14px] flex flex-wrap gap-[8px]">
                <Tab className={TAB_CLS}>Carrera</Tab>
                <Tab className={TAB_CLS}>Serie Regular</Tab>
                <Tab className={TAB_CLS}>Postemporada</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CompareRows players={filled} statsKey="career" />
                </TabPanel>
                <TabPanel>
                  <CompareRows players={filled} statsKey="regular" />
                </TabPanel>
                <TabPanel>
                  <CompareRows players={filled} statsKey="playoffs" />
                </TabPanel>
              </TabPanels>
            </TabGroup>
            <p className="mt-[10px] max-w-[72ch] font-barlow text-[15px] leading-[1.35] text-[rgba(15,23,31,0.6)]">
              Carrera usa los totales publicados por la liga; Serie Regular y Postemporada se suman de las temporadas. Mayor gana, salvo en pérdidas por juego.
              {preEra ? ' Rebotes, asistencias y triples no se registraban de forma consistente antes de 1975. Los guiones indican data no disponible.' : ''}
            </p>
          </section>

          <section>
            <SectionTitle right="Según su perfil estadístico">Jugadores parecidos</SectionTitle>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filled.map((p, i) => (
                <div key={p.id}>
                  <p className="mb-2 font-barlow text-[12px] font-semibold uppercase tracking-[1px]" style={{ color: SLOT_COLORS[i] }}>
                    Parecidos a {p.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    {p.similar.map((s) => (
                      <PaperCard key={s.slug} className="flex items-center justify-between gap-3 px-[12px] py-[10px]">
                        <Link href={`/archivo/jugadores/${s.slug}`} className="min-w-0">
                          <span className="block truncate text-[16px] text-[rgba(15,23,31,0.9)]">{s.name}</span>
                          <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">Similitud {s.score.toFixed(0)}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSlot(i === 0 ? 'b' : 'a', s.slug)}
                          className="shrink-0 rounded-[100px] border border-[#D5D5D5] px-[12px] py-[4px] text-[14px] text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]"
                        >
                          Comparar
                        </button>
                      </PaperCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="font-barlow text-[15px] text-[rgba(15,23,31,0.7)]">
          {filled.length === 1 ? `Elige un segundo jugador para comparar con ${filled[0].name}.` : 'Elige dos jugadores para ver la comparación.'}
          {freeSlot && filled.length === 1 ? ' También puedes tocar "Comparar" en cualquier jugador parecido desde su perfil.' : ''}
        </p>
      )}
    </div>
  );
}
