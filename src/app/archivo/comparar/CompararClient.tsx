'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CareerArcChart from '@/archivo/components/CareerArcChart';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import Scrollable from '@/archivo/components/Scrollable';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { Badge, Button, ContainerTitle, Note, PaperCard, SearchIcon } from '@/archivo/components/ui';
import { usePlayerSearch } from '@/archivo/hooks/usePlayerSearch';
import { DASH, fmt, fmtInt, fmtPct, normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { shortName, tinyName } from '@/archivo/lib/names';
import { COMPARABLE_ROWS, type ComparableKey, type ComparableStats } from '@/archivo/lib/stats';
import { cls, RED, SLOT_COLORS } from '@/archivo/lib/tokens';
import type { CareerArcPoint, PlayerIndexEntry } from '@/archivo/lib/types';

export interface ComparePlayer {
  id: string;
  arc: { arc: CareerArcPoint[]; peakSeason: number | null } | null;
  slug: string;
  name: string;
  fy: number;
  ly: number;
  seasons: number;
  franchiseSlugs: string[];
  mvpYears: number[];
  championships: number[];
  stats: { career: ComparableStats; regular: ComparableStats; playoffs: ComparableStats };
  similar: Array<{ slug: string; name: string; score: number; fy: number | null; ly: number | null; franchiseSlug: string | null }>;
}

interface Props {
  players: Array<ComparePlayer | null>;
  franchises: Record<string, FranchiseView>;
}

const SLOTS = ['a', 'b', 'c'] as const;
type SlotKey = (typeof SLOTS)[number];
type Phase = 'career' | 'regular' | 'playoffs';
const PHASES: Array<{ key: Phase; label: string }> = [
  { key: 'career', label: 'Carrera' },
  { key: 'regular', label: 'Serie Regular' },
  { key: 'playoffs', label: 'Postemporada' },
];
const ERA_NOTE = 'Rebotes, asistencias y triples no se registraban de forma consistente antes de 1975. Los guiones indican data no disponible.';

function format(value: number | null, kind: 'int' | 'avg' | 'pct'): string {
  if (kind === 'int') return fmtInt(value);
  if (kind === 'pct') return fmtPct(value);
  return fmt(value);
}

/** Which slot wins a row: the max (or min for "lower is better"); null on ties or when any side is missing. */
function bestOf(values: Array<number | null>, lowerIsBetter?: boolean): number | null {
  if (values.some((v) => v === null) || values.length < 2) return null;
  const nums = values as number[];
  const best = lowerIsBetter ? Math.min(...nums) : Math.max(...nums);
  return nums.filter((v) => v === best).length > 1 ? null : best;
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

/** The alias that matched the query, when the name itself did not (e.g. "georgie" → George Torres Dougherty). */
function matchedAlias(p: PlayerIndexEntry, query: string): string | null {
  const q = normalizeSearch(query);
  if (!q || normalizeSearch(p.name).includes(q)) return null;
  return p.aliases.find((a) => normalizeSearch(a).includes(q)) ?? null;
}

function SlotSearch({ slot, onPick, franchises, autoFocus }: { slot: SlotKey; onPick: (slug: string) => void; franchises: Record<string, FranchiseView>; autoFocus?: boolean }) {
  const [query, setQuery] = useState('');
  const { results, ready } = usePlayerSearch(query, 8);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = query.trim().length > 0;
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  return (
    <PaperCard className="relative px-[20px] pb-[20px] pt-[22px] md:px-[28px] md:pb-[24px] md:pt-[28px]">
      <label htmlFor={`slot-${slot}`} className="block font-barlow text-[13px] font-bold tracking-[1.1px] text-[#0F171F]">
        JUGADOR {slot.toUpperCase()}
      </label>
      <div className="relative mt-[14px]">
        <SearchIcon size={15} className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.4)]" />
        <input
          id={`slot-${slot}`}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe un nombre"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`slot-${slot}-results`}
          className="h-[48px] w-full rounded-[10px] border border-[rgba(0,0,0,0.16)] bg-white pl-[40px] pr-[40px] font-barlow text-[15px] text-[#0F171F] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[rgba(0,0,0,0.35)] focus:border-[#1772D9] focus:shadow-[0_0_0_3px_rgba(23,114,217,0.15)] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Borrar" className={`absolute right-[6px] top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-[8px] font-barlow text-[13px] font-medium text-[rgba(0,0,0,0.4)] hover:text-[#0F171F] ${cls.focus}`}>
            ✕
          </button>
        ) : null}
      </div>
      <p className={`mt-[10px] ${cls.meta}`}>Busca por nombre o apellido, sin acentos.</p>

      {open ? (
        <div id={`slot-${slot}-results`} className="absolute inset-x-[20px] top-full z-30 -mt-[6px] overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[0_8px_28px_rgba(15,23,31,0.12)] md:inset-x-[28px]">
          {!ready ? (
            <div aria-busy className="py-[4px]">
              <p className="px-[16px] pb-[4px] pt-[12px] font-barlow text-[10px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.4)]">Cargando índice</p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-[12px] px-[16px] py-[10px]">
                  <span className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-full bg-[#ECECEC]" />
                  <span className="flex-1">
                    <span className="block h-[11px] w-[60%] animate-pulse rounded-[6px] bg-[#ECECEC]" />
                    <span className="mt-[6px] block h-[9px] w-[30%] animate-pulse rounded-[6px] bg-[#F2F2F2]" />
                  </span>
                </div>
              ))}
            </div>
          ) : !results.length ? (
            <div className="px-[24px] py-[24px] text-center">
              <p className="font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">Sin resultados para “{query.trim()}”.</p>
              <p className={`mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.45)]`}>
                Prueba sin acentos o con el apellido.{' '}
                <Link href="/archivo/jugadores" className={cls.textLink}>
                  Ver el índice completo
                </Link>
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Resultados">
              {results.map((r, i) => {
                const alias = matchedAlias(r, query);
                return (
                  <li key={r.id} role="option" aria-selected={false} className={i ? 'border-t border-[rgba(0,0,0,0.05)]' : ''}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        onPick(r.slug);
                      }}
                      className={`flex min-h-[44px] w-full items-center gap-[12px] px-[16px] py-[10px] text-left transition-colors duration-150 hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] ${cls.focus} focus-visible:outline-offset-[-2px]`}
                    >
                      <PlayerAvatar name={r.name} color={r.franchiseSlugs[0] ? franchises[r.franchiseSlugs[0]]?.colors.primary : null} sizePx={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">
                          {r.name}
                          {alias ? <span className="font-normal text-[12px] text-[rgba(0,0,0,0.45)]"> · apodo: {alias}</span> : null}
                        </span>
                        <span className={`block ${cls.meta} !text-[12px]`}>{yearsLabel(r.fy, r.ly)}</span>
                      </span>
                      <span className="flex shrink-0 gap-[4px]">
                        {r.franchiseSlugs.slice(0, 4).map((s) => (
                          <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} sizePx={18} />
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </PaperCard>
  );
}

function PlayerHeader({ p, color, franchises, onClear, mirrored }: { p: ComparePlayer; color: string; franchises: Record<string, FranchiseView>; onClear: () => void; mirrored: boolean }) {
  const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
  const end = mirrored ? 'items-end text-right' : 'items-start text-left';
  return (
    <PaperCard className={`flex flex-col p-[16px] md:px-[26px] md:py-[24px] ${end}`}>
      <span aria-hidden className="block h-[3px] w-[24px] rounded-[2px] md:w-[30px]" style={{ background: color }} />
      <div className={`mt-[14px] flex flex-col gap-[10px] md:mt-[16px] md:flex-row md:items-center md:gap-[14px] ${mirrored ? 'items-end md:flex-row-reverse' : 'items-start'}`}>
        <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={44} className="md:!h-[56px] md:!w-[56px] md:!text-[19px]" />
        <div className="min-w-0">
          <Link href={`/archivo/jugadores/${p.slug}`} className={`inline text-[17px] leading-[1.1] text-[#0F171F] md:text-[23px] ${cls.dataLink} ${cls.focus}`}>
            {p.name}
          </Link>
          <p className={`mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.5)]`}>
            {yearsLabel(p.fy, p.ly)}
            <span className="hidden md:inline"> · {p.seasons} temporadas</span>
          </p>
        </div>
      </div>
      <div className={`mt-[12px] hidden flex-wrap gap-[4px] md:flex ${mirrored ? 'justify-end' : ''}`}>
        {p.franchiseSlugs.map((s) => (
          <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} sizePx={18} />
        ))}
      </div>
      {p.mvpYears.length || p.championships.length ? (
        <div className={`mt-[10px] hidden flex-wrap gap-[6px] md:flex ${mirrored ? 'justify-end' : ''}`}>
          {p.mvpYears.length ? <Badge tone="gold">MVP ×{p.mvpYears.length}</Badge> : null}
          {p.championships.length ? <Badge tone="ink">{p.championships.length} título{p.championships.length === 1 ? '' : 's'}</Badge> : null}
        </div>
      ) : null}
      <button type="button" onClick={onClear} className={`mt-[12px] rounded-[4px] ${cls.textLink} md:mt-[14px] ${cls.focus}`}>
        Cambiar
      </button>
    </PaperCard>
  );
}

/** Two-player rows: value, bar, label, bar, value. Winner in league red with a red bar; the other side quiet. */
function CompareRows({ players, phase, preEra }: { players: ComparePlayer[]; phase: Phase; preEra: boolean }) {
  const anyData = players.some((p) => p.stats[phase].g);
  if (!anyData) return <p className="px-[4px] py-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">No hay datos disponibles para esta fase.</p>;
  const rows = COMPARABLE_ROWS.map((row) => ({ row, values: players.map((p) => p.stats[phase][row.key as ComparableKey]) })).filter(({ values }) => values.some((v) => v !== null));
  return (
    <div>
      {rows.map(({ row, values }, ri) => {
        const best = bestOf(values, row.lowerIsBetter);
        const max = Math.max(...values.map((v) => v ?? 0), 0);
        const side = (i: number) => {
          const v = values[i];
          const winner = best !== null && v === best;
          const width = v === null || max === 0 ? 0 : Math.max(4, (v / max) * 100);
          const right = i === 1;
          return (
            <>
              <div className={`md:contents ${right ? 'text-left' : 'text-right'}`}>
                <span className={`block text-[21px] leading-[1] md:text-[26px] ${cls.tabular} ${winner ? 'text-[#E51F1F]' : best !== null || v === null ? 'text-[rgba(15,23,31,0.38)]' : 'text-[#0F171F]'} ${right ? 'md:text-left' : 'md:text-right'}`}>
                  {v === null ? DASH : format(v, row.kind)}
                  {winner ? <span className="sr-only"> (mejor)</span> : null}
                </span>
                <span className={`mt-[6px] flex md:mt-0 ${right ? 'justify-start' : 'justify-end'}`}>
                  <span aria-hidden className="block h-[5px] rounded-[3px]" style={{ width: `${width}%`, background: winner ? RED : 'rgba(0,0,0,0.1)' }} />
                </span>
              </div>
            </>
          );
        };
        return (
          <div key={row.key} className={`grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-x-[12px] py-[14px] md:grid-cols-[110px_1fr_170px_1fr_110px] md:gap-x-[18px] md:py-[15px] ${ri < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.05)]' : ''}`}>
            {side(0)}
            <span className="text-center font-barlow text-[10.5px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.45)] md:text-[11.5px]">
              <span className="md:hidden">{row.short}</span>
              <span className="hidden md:inline">{row.label}</span>
            </span>
            {side(1)}
          </div>
        );
      })}
      <p className="max-w-[640px] pt-[16px] font-barlow text-[13px] leading-[1.6] text-[rgba(0,0,0,0.5)]">
        Carrera usa los totales publicados por la liga; Serie Regular y Postemporada se suman de las temporadas. Mayor gana, salvo en pérdidas por juego.{preEra ? ` ${ERA_NOTE}` : ''}
      </p>
    </div>
  );
}

/** Three-player matrix: stat rows, one column per player, best value in red. Mobile keeps the stat column fixed. */
function CompareMatrix({ players, phase, phaseLabel, franchises, preEra }: { players: ComparePlayer[]; phase: Phase; phaseLabel: string; franchises: Record<string, FranchiseView>; preEra: boolean }) {
  const rows = COMPARABLE_ROWS.map((row) => ({ row, values: players.map((p) => p.stats[phase][row.key as ComparableKey]) })).filter(({ values }) => values.some((v) => v !== null));
  if (!rows.length) return <p className="px-[4px] py-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">No hay datos disponibles para esta fase.</p>;
  const cellL = 'sticky left-0 z-10 bg-white pr-[10px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] md:static md:shadow-none';
  return (
    <div>
      <Scrollable>
        <table className={`w-full border-collapse ${cls.tabular}`}>
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)]">
              <th scope="col" className={`w-[64px] min-w-[64px] pb-[12px] text-left font-barlow text-[11px] font-bold tracking-[1px] text-[#0F171F] md:w-auto md:text-[13px] md:tracking-[1.1px] ${cellL}`}>
                {phaseLabel.toUpperCase()}
              </th>
              {players.map((p, i) => {
                const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
                return (
                  <th key={p.id} scope="col" className="w-[110px] min-w-[110px] pb-[12px] pl-[10px] text-right md:w-auto md:min-w-0">
                    <span className="mb-[6px] ml-auto block h-[3px] w-[24px] rounded-[2px]" style={{ background: SLOT_COLORS[i] }} />
                    <Link href={`/archivo/jugadores/${p.slug}`} className={`inline-flex max-w-full items-center gap-[7px] font-barlow text-[12px] font-semibold text-[#0F171F] md:text-[14px] ${cls.focus} rounded-[4px]`}>
                      <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={20} className="hidden md:inline-flex" />
                      <span className="md:hidden">{tinyName(p.name)}</span>
                      <span className="hidden md:inline">{shortName(p.name)}</span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, values }) => {
              const best = bestOf(values, row.lowerIsBetter);
              return (
                <tr key={row.key} className="border-b border-[rgba(0,0,0,0.05)] last:border-b-0">
                  <th scope="row" className={`h-[52px] text-left font-barlow text-[10.5px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.45)] md:h-[55px] md:text-[11.5px] ${cellL}`}>
                    <span className="md:hidden">{row.short}</span>
                    <span className="hidden md:inline">{row.label}</span>
                  </th>
                  {values.map((v, i) => (
                    <td key={i} className={`pl-[10px] text-right text-[19px] leading-[1] md:text-[22px] ${v !== null && v === best ? 'text-[#E51F1F]' : v === null || best !== null ? 'text-[rgba(15,23,31,0.38)]' : 'text-[#0F171F]'}`}>
                      {v === null ? DASH : format(v, row.kind)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Scrollable>
      <p className="max-w-[640px] pt-[16px] font-barlow text-[13px] leading-[1.6] text-[rgba(0,0,0,0.5)]">
        El mejor valor de cada fila va en rojo. Mayor gana, salvo en pérdidas por juego.{preEra ? ` ${ERA_NOTE}` : ''}
        <span className="md:hidden"> Columna de stats fija; desliza para ver el resto.</span>
      </p>
    </div>
  );
}

function SimilarList({ p, franchises, onPick }: { p: ComparePlayer; franchises: Record<string, FranchiseView>; onPick: (slug: string) => void }) {
  return (
    <div>
      <p className="mb-[8px] font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.45)]">A {shortName(p.name)}</p>
      <div className="flex flex-col gap-[8px]">
        {p.similar.map((s) => {
          const f = s.franchiseSlug ? franchises[s.franchiseSlug] : null;
          return (
            <PaperCard key={s.slug} className="flex items-center gap-[12px] px-[16px] py-[14px]">
              <Link href={`/archivo/jugadores/${s.slug}`} className={`flex min-w-0 flex-1 items-center gap-[12px] rounded-[6px] ${cls.focus}`}>
                <PlayerAvatar name={s.name} color={f?.colors.primary} size="avatar" />
                <span className="min-w-0">
                  <span className="block truncate font-barlow text-[13.5px] font-semibold text-[#0F171F]">{s.name}</span>
                  <span className={`block truncate font-barlow text-[11.5px] text-[rgba(0,0,0,0.5)]`}>
                    {f?.nickname ?? ''}
                    {s.fy && s.ly ? `${f ? ' · ' : ''}${yearsLabel(s.fy, s.ly)}` : ''}
                  </span>
                </span>
              </Link>
              <span className={`font-barlow text-[12px] font-semibold text-[rgba(0,0,0,0.55)] ${cls.tabular}`}>{s.score.toFixed(0)}</span>
              <Button variant="secondary" onClick={() => onPick(s.slug)} className="!h-[30px] !px-[12px] !text-[13px]">
                Comparar
              </Button>
            </PaperCard>
          );
        })}
      </div>
    </div>
  );
}

export default function CompararClient({ players, franchises }: Props) {
  const setSlot = useSlotNavigation();
  const [showThird, setShowThird] = useState(false);
  const filled = useMemo(() => players.filter((p): p is ComparePlayer => p !== null), [players]);
  const preEra = filled.some((p) => p.fy < 1975);
  const two = players[0] && players[1];
  const three = filled.length === 3;
  const visibleSlots = three || showThird || players[2] ? 3 : 2;

  return (
    <div>
      <div className={`grid grid-cols-1 gap-[10px] md:gap-[20px] ${visibleSlots === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${two ? 'grid-cols-2' : ''}`}>
        {SLOTS.slice(0, visibleSlots).map((slot, i) => {
          const p = players[i];
          return p ? (
            <PlayerHeader key={slot} p={p} color={SLOT_COLORS[i]} franchises={franchises} onClear={() => setSlot(slot, null)} mirrored={i === 1 && visibleSlots === 2} />
          ) : (
            <SlotSearch key={slot} slot={slot} onPick={(slug) => setSlot(slot, slug)} franchises={franchises} autoFocus={i === 0 || (i === 2 && showThird)} />
          );
        })}
      </div>

      {two && !three && !showThird && !players[2] ? (
        <div className="mt-[12px] text-right">
          <button type="button" onClick={() => setShowThird(true)} className={`rounded-[4px] ${cls.textLink} ${cls.focus}`}>
            Agregar un tercer jugador
          </button>
        </div>
      ) : null}

      {filled.length >= 2 ? (
        <>
          <section className="mt-[20px]">
            <TabGroup>
              <PaperCard className="px-[16px] pb-[16px] pt-[18px] md:px-[30px] md:pb-[20px] md:pt-[24px]">
                <TabList className="flex flex-wrap gap-[8px] pb-[14px] md:pb-[18px]">
                  {PHASES.map((ph) => (
                    <Tab key={ph.key} className={TAB_PILL} disabled={!filled.some((p) => p.stats[ph.key].g)}>
                      {ph.label}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {PHASES.map((ph) => (
                    <TabPanel key={ph.key}>
                      {three ? <CompareMatrix players={filled} phase={ph.key} phaseLabel={ph.label} franchises={franchises} preEra={preEra} /> : <CompareRows players={filled.slice(0, 2)} phase={ph.key} preEra={preEra} />}
                    </TabPanel>
                  ))}
                </TabPanels>
              </PaperCard>
            </TabGroup>
          </section>

          {filled.some((p) => p.arc && p.arc.arc.length >= 3) ? (
            <section className="mt-[20px]">
              <PaperCard className="px-[16px] py-[18px] md:px-[26px] md:py-[24px]">
                <CareerArcChart players={filled.filter((p) => p.arc).map((p) => ({ id: p.id, name: p.name, color: SLOT_COLORS[filled.indexOf(p)], arc: p.arc!.arc, peakSeason: p.arc!.peakSeason }))} franchises={franchises} />
              </PaperCard>
            </section>
          ) : null}

          {filled.some((p) => p.similar.length) ? (
            <section className="mt-[28px]">
              <ContainerTitle>Jugadores parecidos</ContainerTitle>
              <div className={`mt-[12px] grid grid-cols-1 gap-[24px] ${three ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {filled.map((p, i) => (
                  <SimilarList key={p.id} p={p} franchises={franchises} onPick={(slug) => setSlot(i === 0 ? 'b' : 'a', slug)} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <p className="mt-[28px] text-center font-barlow text-[14px] text-[rgba(0,0,0,0.5)]">{filled.length === 1 ? `Elige un segundo jugador para comparar con ${shortName(filled[0].name)}.` : 'Elige dos jugadores para ver la comparación.'}</p>
      )}
      <Note className="sr-only">{ERA_NOTE}</Note>
    </div>
  );
}
