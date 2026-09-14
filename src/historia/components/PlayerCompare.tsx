'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import Scrollable from '@/archivo/components/Scrollable';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { Badge, Button, Note, PaperCard, SearchIcon } from '@/archivo/components/ui';
import { DASH, fmt, fmtInt, fmtPct, normalizeSearch, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { shortName, tinyName } from '@/archivo/lib/names';
import type { ComparableStats } from '@/archivo/lib/stats';
import { cls, RED, SLOT_COLORS } from '@/archivo/lib/tokens';
import { useUnifiedSearch } from '../hooks/useUnifiedSearch';
import { AVG_ROWS, bestOf, CONTEXT_ROWS, TOTAL_ROWS, totalCell, type TotalStats } from '../lib/compare';
import { countBadge, eraNotes, UNLINKED_CAREER, yearsActive } from '../lib/copy';
import type { UnifiedIndexEntry } from '../../../types/historia';

type Phase = 'career' | 'regular' | 'playoffs';

export interface ComparePlayer {
  /** Slug or providerId, as used in the URL. */
  key: string;
  providerId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  slug: string | null;
  name: string;
  fy: number;
  ly: number;
  seasons: number;
  franchiseSlugs: string[];
  mvpCount: number;
  titleCount: number;
  /** False for an active player without a historical record (only live seasons). */
  linked: boolean;
  stats: Record<Phase, ComparableStats>;
  totals: Record<Phase, TotalStats>;
  best: { year: number; franchiseSlug: string | null; teamName: string; stats: ComparableStats; fallback: boolean } | null;
}

const SLOTS = ['a', 'b', 'c'] as const;
type SlotKey = (typeof SLOTS)[number];
type View = 'career' | 'regular' | 'playoffs' | 'best';
type Unit = 'avg' | 'total';
const VIEWS: Array<{ key: View; label: string }> = [
  { key: 'career', label: 'Carrera' },
  { key: 'regular', label: 'Serie Regular' },
  { key: 'playoffs', label: 'Postemporada' },
  { key: 'best', label: 'Mejor temporada' },
];

interface Row {
  key: string;
  label: string;
  short: string;
  values: Array<number | null>;
  texts: Array<string | null>;
  lowerIsBetter?: boolean;
  /** Context rows never mark a winner. */
  context?: boolean;
}

function fmtAvg(v: number | null, kind: 'int' | 'avg' | 'pct'): string | null {
  if (v === null) return null;
  return kind === 'int' ? fmtInt(v) : kind === 'pct' ? fmtPct(v) : fmt(v);
}

function buildRows(players: ComparePlayer[], view: View, unit: Unit): Row[] {
  const rows: Row[] = [];
  const statsOf = (p: ComparePlayer): ComparableStats | null => (view === 'best' ? (p.best?.stats ?? null) : p.stats[view]);
  for (const r of CONTEXT_ROWS) {
    const values = players.map((p) => statsOf(p)?.[r.key] ?? null);
    rows.push({ key: r.key, label: r.label, short: r.short, values, texts: values.map((v) => fmtAvg(v, 'int')), context: true });
  }
  if (unit === 'avg' || view === 'best') {
    for (const r of AVG_ROWS) {
      const values = players.map((p) => statsOf(p)?.[r.key] ?? null);
      if (values.every((v) => v === null)) continue;
      rows.push({ key: r.key, label: r.label, short: r.short, values, texts: values.map((v) => fmtAvg(v, r.kind as 'int' | 'avg' | 'pct')), lowerIsBetter: r.lowerIsBetter });
    }
  } else {
    for (const r of TOTAL_ROWS) {
      const cells = players.map((p) => totalCell(p.totals[view], r.key));
      if (cells.every((c) => c.value === null)) continue;
      rows.push({ key: r.key, label: r.label, short: r.short, values: cells.map((c) => c.value), texts: cells.map((c) => c.text), lowerIsBetter: r.lowerIsBetter });
    }
  }
  return rows;
}

function useSlotNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useCallback(
    (slot: SlotKey, key: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (key) next.set(slot, key);
      else next.delete(slot);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );
}

function matchedAlias(p: UnifiedIndexEntry, query: string): string | null {
  const q = normalizeSearch(query);
  if (!q || normalizeSearch(p.name).includes(q)) return null;
  return p.aliases.find((a) => normalizeSearch(a).includes(q)) ?? null;
}

function SlotSearch({ slot, onPick, franchises, autoFocus, onCancel }: { slot: SlotKey; onPick: (key: string) => void; franchises: Record<string, FranchiseView>; autoFocus?: boolean; onCancel?: () => void }) {
  const [query, setQuery] = useState('');
  const { results, ready } = useUnifiedSearch(query, 8);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = query.trim().length > 0;
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  return (
    <PaperCard className="relative px-[20px] pb-[20px] pt-[22px] md:px-[28px] md:pb-[24px] md:pt-[28px]">
      <div className="flex items-center justify-between">
        <label htmlFor={`slot-${slot}`} className="block font-barlow text-[13px] font-bold tracking-[1.1px] text-[#0F171F]">
          JUGADOR {slot.toUpperCase()}
        </label>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={`rounded-[4px] ${cls.textLink} ${cls.focus}`}>
            Quitar
          </button>
        ) : null}
      </div>
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
      <p className={`mt-[10px] ${cls.meta}`}>Busca por nombre, apellido o apodo, sin acentos. Activos y retirados.</p>
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
              <p className="mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.45)]">
                Prueba sin acentos o con el apellido.{' '}
                <Link href="/jugadores" className={cls.textLink}>
                  Ver el índice de jugadores
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
                        onPick(r.providerId && !r.slug.includes('-') ? r.providerId : r.slug);
                      }}
                      className={`flex min-h-[44px] w-full items-center gap-[12px] px-[16px] py-[10px] text-left transition-colors duration-150 hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] ${cls.focus} focus-visible:outline-offset-[-2px]`}
                    >
                      <PlayerAvatar name={r.name} color={r.franchiseSlugs[0] ? franchises[r.franchiseSlugs[0]]?.colors.primary : null} sizePx={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">
                          {r.name}
                          {alias ? <span className="font-normal text-[12px] text-[rgba(0,0,0,0.45)]"> · apodo: {alias}</span> : null}
                        </span>
                        <span className={`block ${cls.meta} !text-[12px] ${cls.tabular}`}>
                          {yearsLabel(r.fy, r.ly)}
                          {r.isActive ? <span className="ml-[6px] font-semibold uppercase tracking-[0.8px] text-[#0F171F]">Activo</span> : null}
                        </span>
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
  const href = `/jugadores/${p.slug ?? p.providerId}`;
  return (
    <PaperCard className={`flex flex-col p-[16px] md:px-[26px] md:py-[24px] ${end}`}>
      <span aria-hidden className="block h-[3px] w-[24px] rounded-[2px] md:w-[30px]" style={{ background: color }} />
      <div className={`mt-[14px] flex flex-col gap-[10px] md:mt-[16px] md:flex-row md:items-center md:gap-[14px] ${mirrored ? 'items-end md:flex-row-reverse' : 'items-start'}`}>
        {p.avatarUrl ? (
          <img src={`${p.avatarUrl}?size=200`} alt={p.name} width={56} height={56} className="h-[44px] w-[44px] shrink-0 rounded-full border border-[#E5E5E5] object-cover md:h-[56px] md:w-[56px]" />
        ) : (
          <PlayerAvatar name={p.name} color={main?.colors.primary} sizePx={44} className="md:!h-[56px] md:!w-[56px] md:!text-[19px]" />
        )}
        <div className="min-w-0">
          <Link href={href} className={`inline text-[17px] leading-[1.1] text-[#0F171F] md:text-[23px] ${cls.dataLink} ${cls.focus}`}>
            {p.name}
          </Link>
          <p className={`mt-[4px] font-barlow text-[13px] text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>
            {yearsActive(p.fy, p.ly)}
            {p.seasons ? <span className="hidden md:inline"> · {p.seasons} temporada{p.seasons === 1 ? '' : 's'}</span> : null}
            {p.isActive ? <span className="ml-[6px] font-semibold uppercase tracking-[0.8px] text-[#0F171F]">Activo</span> : null}
          </p>
        </div>
      </div>
      <div className={`mt-[12px] hidden flex-wrap gap-[4px] md:flex ${mirrored ? 'justify-end' : ''}`}>
        {p.franchiseSlugs.map((s) => (
          <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} sizePx={18} />
        ))}
      </div>
      {p.mvpCount || p.titleCount ? (
        <div className={`mt-[10px] hidden flex-wrap gap-[6px] md:flex ${mirrored ? 'justify-end' : ''}`}>
          {p.mvpCount ? <Badge tone="gold">{countBadge('MVP', p.mvpCount)}</Badge> : null}
          {p.titleCount ? <Badge tone="ink">{countBadge('Campeón', p.titleCount)}</Badge> : null}
        </div>
      ) : null}
      <button type="button" onClick={onClear} className={`mt-[12px] rounded-[4px] ${cls.textLink} md:mt-[14px] ${cls.focus}`}>
        Cambiar
      </button>
    </PaperCard>
  );
}

function TwoRows({ rows }: { rows: Row[] }) {
  return (
    <div>
      {rows.map((row, ri) => {
        const best = row.context ? null : bestOf(row.values, row.lowerIsBetter);
        const max = Math.max(...row.values.map((v) => v ?? 0), 0);
        const side = (i: number) => {
          const v = row.values[i];
          const winner = best !== null && v === best;
          const width = v === null || max === 0 || row.context ? 0 : Math.max(4, (v / max) * 100);
          const right = i === 1;
          const tone = winner ? 'text-[#E51F1F]' : best !== null || v === null ? 'text-[rgba(15,23,31,0.38)]' : 'text-[#0F171F]';
          return (
            <div key={i} className={`md:contents ${right ? 'text-left' : 'text-right'}`}>
              <span className={`block leading-[1] ${row.context ? 'font-barlow text-[15px] font-semibold md:text-[17px]' : 'text-[21px] md:text-[26px]'} ${cls.tabular} ${row.context ? 'text-[#0F171F]' : tone} ${right ? 'md:text-left' : 'md:text-right'}`}>
                {row.texts[i] ?? DASH}
                {winner ? <span className="sr-only"> (mejor)</span> : null}
              </span>
              <span className={`mt-[6px] flex md:mt-0 ${right ? 'justify-start' : 'justify-end'}`}>
                {row.context ? null : <span aria-hidden className="block h-[5px] rounded-[3px]" style={{ width: `${width}%`, background: winner ? RED : 'rgba(0,0,0,0.1)' }} />}
              </span>
            </div>
          );
        };
        return (
          <div key={row.key} className={`grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-x-[12px] md:grid-cols-[110px_1fr_170px_1fr_110px] md:gap-x-[18px] ${row.context ? 'py-[8px]' : 'py-[14px] md:py-[15px]'} ${ri < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.05)]' : ''}`}>
            {side(0)}
            <span className="text-center font-barlow text-[10.5px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.45)] md:text-[11.5px]">
              <span className="md:hidden">{row.short}</span>
              <span className="hidden md:inline">{row.label}</span>
            </span>
            {side(1)}
          </div>
        );
      })}
    </div>
  );
}

function Matrix({ rows, players, franchises, heading }: { rows: Row[]; players: ComparePlayer[]; franchises: Record<string, FranchiseView>; heading: string }) {
  const cellL = 'sticky left-0 z-10 bg-white pr-[10px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] md:static md:shadow-none';
  return (
    <Scrollable>
      <table className={`w-full border-collapse ${cls.tabular}`}>
        <thead>
          <tr className="border-b border-[rgba(0,0,0,0.08)]">
            <th scope="col" className={`w-[64px] min-w-[64px] pb-[12px] text-left font-barlow text-[11px] font-bold tracking-[1px] text-[#0F171F] md:w-auto md:text-[13px] md:tracking-[1.1px] ${cellL}`}>
              {heading.toUpperCase()}
            </th>
            {players.map((p, i) => {
              const main = p.franchiseSlugs[0] ? franchises[p.franchiseSlugs[0]] : null;
              return (
                <th key={p.key} scope="col" className="w-[110px] min-w-[110px] pb-[12px] pl-[10px] text-right md:w-auto md:min-w-0">
                  <span className="mb-[6px] ml-auto block h-[3px] w-[24px] rounded-[2px]" style={{ background: SLOT_COLORS[i] }} />
                  <Link href={`/jugadores/${p.slug ?? p.providerId}`} className={`inline-flex max-w-full items-center gap-[7px] font-barlow text-[12px] font-semibold text-[#0F171F] md:text-[14px] ${cls.focus} rounded-[4px]`}>
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
          {rows.map((row) => {
            const best = row.context ? null : bestOf(row.values, row.lowerIsBetter);
            return (
              <tr key={row.key} className="border-b border-[rgba(0,0,0,0.05)] last:border-b-0">
                <th scope="row" className={`h-[52px] text-left font-barlow text-[10.5px] font-semibold uppercase tracking-[1.2px] text-[rgba(0,0,0,0.45)] md:h-[55px] md:text-[11.5px] ${cellL}`}>
                  <span className="md:hidden">{row.short}</span>
                  <span className="hidden md:inline">{row.label}</span>
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className={`pl-[10px] text-right leading-[1] ${row.context ? 'font-barlow text-[15px] font-semibold text-[#0F171F]' : `text-[19px] md:text-[22px] ${v !== null && v === best ? 'text-[#E51F1F]' : v === null || best !== null ? 'text-[rgba(15,23,31,0.38)]' : 'text-[#0F171F]'}`}`}>
                    {row.texts[i] ?? DASH}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Scrollable>
  );
}

export default function PlayerCompare({ players, franchises }: { players: Array<ComparePlayer | null>; franchises: Record<string, FranchiseView> }) {
  const setSlot = useSlotNavigation();
  const [showThird, setShowThird] = useState(false);
  const [view, setView] = useState<View>('career');
  const [unit, setUnit] = useState<Unit>('avg');
  const filled = useMemo(() => players.filter((p): p is ComparePlayer => p !== null), [players]);
  const three = filled.length === 3;
  const visibleSlots = three || showThird || players[2] ? 3 : 2;
  const rows = useMemo(() => buildRows(filled, view, unit), [filled, view, unit]);
  const notes = eraNotes({ debutYears: filled.map((p) => p.fy) });
  const unlinked = filled.filter((p) => !p.linked);

  return (
    <div>
      <div className={`grid grid-cols-1 gap-[10px] md:gap-[20px] ${visibleSlots === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${players[0] && players[1] ? 'grid-cols-2' : ''}`}>
        {SLOTS.slice(0, visibleSlots).map((slot, i) => {
          const p = players[i];
          return p ? (
            <PlayerHeader key={slot} p={p} color={SLOT_COLORS[i]} franchises={franchises} onClear={() => setSlot(slot, null)} mirrored={i === 1 && visibleSlots === 2} />
          ) : (
            <SlotSearch key={slot} slot={slot} onPick={(k) => setSlot(slot, k)} franchises={franchises} autoFocus={i === 0 || (i === 2 && showThird)} onCancel={i === 2 ? () => setShowThird(false) : undefined} />
          );
        })}
      </div>

      {players[0] && players[1] && !three && !showThird && !players[2] ? (
        <div className="mt-[12px] text-right">
          <Button variant="secondary" onClick={() => setShowThird(true)}>
            Añadir jugador
          </Button>
        </div>
      ) : null}

      {filled.length >= 2 ? (
        <section className="mt-[20px]">
          <PaperCard className="px-[16px] pb-[16px] pt-[18px] md:px-[30px] md:pb-[20px] md:pt-[24px]">
            <div className="flex flex-wrap items-center justify-between gap-[10px] pb-[14px] md:pb-[18px]">
              <div role="radiogroup" aria-label="Vista" className="flex flex-wrap gap-[8px]">
                {VIEWS.map((v) => {
                  const disabled = v.key === 'best' ? !filled.every((p) => p.best) : v.key === 'career' ? false : !filled.some((p) => p.stats[v.key as Phase].g);
                  return (
                    <button key={v.key} type="button" role="radio" aria-checked={view === v.key} data-selected={view === v.key ? '' : undefined} disabled={disabled} onClick={() => setView(v.key)} className={TAB_PILL}>
                      {v.label}
                    </button>
                  );
                })}
              </div>
              <div role="radiogroup" aria-label="Unidad" className={`flex gap-[8px] ${view === 'best' ? 'invisible' : ''}`}>
                {(
                  [
                    ['avg', 'Promedios'],
                    ['total', 'Totales'],
                  ] as const
                ).map(([k, label]) => (
                  <button key={k} type="button" role="radio" aria-checked={unit === k} data-selected={unit === k ? '' : undefined} onClick={() => setUnit(k)} className={`${TAB_PILL} !px-[13px] !py-[5px] !text-[13px]`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'best' ? (
              <div className={`mb-[10px] grid gap-[10px] ${three ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {filled.map((p, i) => (
                  <p key={p.key} className={`font-barlow text-[12.5px] text-[rgba(0,0,0,0.55)] ${i === 1 && !three ? 'text-right' : ''} ${cls.tabular}`}>
                    <span className="font-semibold text-[#0F171F]">{p.best?.year ?? DASH}</span>
                    {p.best ? ` · ${franchises[p.best.franchiseSlug ?? '']?.nickname ?? p.best.teamName}` : ''}
                    {p.best?.fallback ? ' · menos de 10 juegos' : ''}
                  </p>
                ))}
              </div>
            ) : null}

            {rows.length ? three ? <Matrix rows={rows} players={filled} franchises={franchises} heading={VIEWS.find((v) => v.key === view)!.label} /> : <TwoRows rows={rows} /> : <p className="py-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">No hay datos disponibles para esta vista.</p>}

            <div className="max-w-[640px] pt-[16px] font-barlow text-[13px] leading-[1.6] text-[rgba(0,0,0,0.5)]">
              <p>
                {view === 'best' ? 'Mejor temporada: la de más puntos por juego en Serie Regular con al menos 10 juegos.' : 'Carrera usa los totales publicados por la liga; Serie Regular y Postemporada se suman de las temporadas.'} Mayor gana, salvo en pérdidas. Empate no marca ganador.
              </p>
              {notes.map((n) => (
                <p key={n}>{n}</p>
              ))}
              {unlinked.map((p) => (
                <p key={p.key}>
                  {shortName(p.name)}: {UNLINKED_CAREER} Se comparan solo sus temporadas en vivo.
                </p>
              ))}
            </div>
          </PaperCard>
        </section>
      ) : (
        <p className="mt-[28px] text-center font-barlow text-[14px] text-[rgba(0,0,0,0.5)]">{filled.length === 1 ? `Elige un segundo jugador para comparar con ${shortName(filled[0].name)}.` : 'Elige dos jugadores para ver la comparación.'}</p>
      )}
      <Note className="sr-only">Comparación de jugadores del BSN.</Note>
    </div>
  );
}
