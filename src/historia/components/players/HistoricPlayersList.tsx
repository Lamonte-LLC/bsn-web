'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { StatsTableSkeleton } from '@/archivo/components/StatsTable';
import { SearchIcon } from '@/archivo/components/ui';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { fmtInt, yearsLabel } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import { keyOf } from '@/historia/components/compare/PlayerPickerDialog';
import { useUnifiedSearch } from '@/historia/hooks/useUnifiedSearch';
import { decadesSince, filterHistoric, HISTORIC_PAGE, lettersWith, loadMoreLabel, sortBySurname, type HistoricOnly } from '@/historia/lib/players-list';
import type { UnifiedIndexEntry } from '../../../../types/historia';

/* ---------- Pieces shared by both views of /jugadores ---------- */

/** Small design-system pill (filters, "Cargar más"). 44px tall on phones so it stays a target, 32px on desktop. */
export const PILL_SM = `inline-flex h-[44px] min-w-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[100px] border border-[#d5d5d5] bg-white px-[14px] font-special-gothic-condensed-one text-[14px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] transition-[background-color,border-color,transform] duration-200 ease-out hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white data-selected:hover:bg-[#0f171f] md:h-[32px] ${cls.focus}`;

/** Column header of the list cards. */
export const TH = 'whitespace-nowrap font-barlow text-[12.5px] font-normal uppercase text-[rgba(0,0,0,0.6)]';

/** Row of the list cards: the whole row is the link. */
export const ROW = `grid h-[52px] items-center rounded-[6px] border-t border-[rgba(0,0,0,0.06)] transition-colors duration-150 hover:bg-[#FAFAFA] active:bg-[#F3F3F3] motion-reduce:transition-none ${cls.focus} focus-visible:outline-offset-[-2px]`;

const FIELD_LABEL = 'block font-barlow text-[13px] font-semibold tracking-[-0.13px] text-[rgba(94,94,94,0.9)]';
const SELECT = `h-[40px] w-full cursor-pointer appearance-none rounded-[6px] border border-[#D4D4D4] bg-[#fafafa] pl-[14px] pr-[36px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.9)] transition-[border-color] duration-150 focus:border-[#0F171F] ${cls.focus}`;
const INPUT = 'h-[44px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] pl-[40px] pr-[14px] font-barlow text-[15px] font-medium text-[#0F171F] outline-none transition-[border-color,background-color] duration-150 placeholder:text-[rgba(15,23,31,0.45)] focus:border-[#0F171F] focus:bg-white [&::-webkit-search-cancel-button]:hidden';

export function SearchField({ value, onChange, placeholder, label = 'Buscar', showLabel = true }: { value: string; onChange: (v: string) => void; placeholder: string; label?: string; showLabel?: boolean }) {
  return (
    <label className="block space-y-[5px]">
      <span className={showLabel ? FIELD_LABEL : 'sr-only'}>{label}</span>
      <span className="relative block">
        <SearchIcon size={15} className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]" />
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" className={INPUT} />
      </span>
    </label>
  );
}

export function SelectField({ label, value, onChange, children, showLabel = true }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; showLabel?: boolean }) {
  return (
    <label className="block space-y-[5px]">
      <span className={showLabel ? FIELD_LABEL : 'sr-only'}>{label}</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
          {children}
        </select>
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
          <path d="M4 6l4 4 4-4" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}

/** Row of small pills that behaves as a radio group. */
export function PillGroup<T extends string>({ label, value, options, onChange, className = '' }: { label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex gap-[8px] ${className}`}>
      {options.map(([k, text]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} data-selected={value === k ? '' : undefined} onClick={() => onChange(k)} className={`${PILL_SM} flex-1 lg:flex-none`}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** Desktop sidebar card with the filters. */
export function FiltersCard({ children }: { children: ReactNode }) {
  return (
    <div className={cls.card}>
      <h2 className="px-[24px] pt-[20px] text-[22px] leading-[1.1] text-[#0F171F]">Filtros</h2>
      <div className="space-y-[18px] px-[24px] pb-[24px] pt-[16px]">{children}</div>
    </div>
  );
}

/** Mini card under the filters: one big number and a line of context. */
export function CountCard({ count, children }: { count: number | null; children: ReactNode }) {
  return (
    <div className={`${cls.card} mt-[14px] px-[24px] py-[20px]`}>
      {count === null ? <div aria-hidden className="h-[30px] w-[88px] animate-pulse rounded-[6px] bg-[#ECECEC]" /> : <p className={`text-[30px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{fmtInt(count)}</p>}
      <p className="mt-[8px] font-barlow text-[13px] leading-[1.5] text-[rgba(0,0,0,0.6)]">{children}</p>
    </div>
  );
}

export function CountLine({ shown, total, order }: { shown: number; total: number; order: string }) {
  return (
    <p className={`mb-[14px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.7)] ${cls.tabular}`}>
      Mostrando {fmtInt(shown)} de {fmtInt(total)} jugadores · {order}
    </p>
  );
}

export function LoadMore({ page, remaining, onClick }: { page: number; remaining: number; onClick: () => void }) {
  if (remaining <= 0) return null;
  return (
    <div className="flex justify-center pt-[14px]">
      <button type="button" onClick={onClick} className={`${PILL_SM} px-[20px] ${cls.tabular}`}>
        {loadMoreLabel(page, remaining)}
      </button>
    </div>
  );
}

export function EmptyRows({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  return (
    <div className="px-[16px] py-[28px] text-center">
      <p className="font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">{children}</p>
      <button type="button" onClick={onReset} className={`mt-[8px] cursor-pointer ${cls.textLink} ${cls.focus} rounded-[4px]`}>
        Limpiar filtros
      </button>
    </div>
  );
}

/* ---------- Historical view ---------- */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ONLY_OPTIONS: Array<[HistoricOnly, string]> = [
  ['mvp', 'MVP'],
  ['club', '5,000+ puntos'],
];
const MOBILE_ONLY: Array<[HistoricOnly, string]> = [['all', 'Todos'], ...ONLY_OPTIONS];
const COLS = 'grid-cols-[minmax(0,1fr)_76px_64px] gap-x-[12px] px-[8px] lg:grid-cols-[minmax(0,1fr)_180px_110px_90px] lg:gap-x-[16px] lg:px-[10px]';

function LetterChip({ letter, active, disabled, onClick }: { letter: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[99px] border px-[8px] font-barlow text-[13px] font-semibold transition-colors duration-150 motion-reduce:transition-none md:h-[28px] md:min-w-[28px] md:px-[6px] md:text-[12.5px] ${cls.focus} ${cls.tabular} ${
        active ? 'border-[#0F171F] bg-[#0F171F] text-white' : disabled ? 'cursor-default border-[rgba(0,0,0,0.07)] text-[rgba(0,0,0,0.25)]' : 'cursor-pointer border-[rgba(0,0,0,0.14)] bg-white text-[rgba(0,0,0,0.65)] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] hover:text-[#0F171F]'
      }`}
    >
      {letter}
    </button>
  );
}

/** "1975 a 2001 · MVP ×3 · Activo": the line under the name. */
function metaLine(p: UnifiedIndexEntry): string {
  const mvp = p.isMvp ? (p.mvpYears.length > 1 ? `MVP ×${p.mvpYears.length}` : 'MVP') : null;
  return [yearsLabel(p.fy, p.ly), mvp].filter(Boolean).join(' · ');
}

function Avatar({ p, color, px }: { p: UnifiedIndexEntry; color: string | null; px: number }) {
  return p.avatarUrl ? <PlayerAvatar name={p.name} photoUrl={`${p.avatarUrl}?size=200`} sizePx={px} /> : <PlayerAvatar name={p.name} color={color} sizePx={px} />;
}

function Logos({ p, franchises, max }: { p: UnifiedIndexEntry; franchises: Record<string, FranchiseView>; max: number }) {
  const slugs = p.franchiseSlugs;
  if (!slugs.length) return <span className="font-barlow text-[13px] text-[rgba(0,0,0,0.3)]">–</span>;
  const extra = slugs.length - max;
  return (
    <span className="inline-flex items-center gap-[4px]">
      {slugs.slice(0, max).map((slug) => (
        <FranchiseLogo key={slug} franchise={franchises[slug] ?? null} fallbackName={slug} sizePx={20} />
      ))}
      {extra > 0 ? <span className={`font-barlow text-[12px] font-medium text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>+{extra}</span> : null}
    </span>
  );
}

type Props = {
  franchises: Record<string, FranchiseView>;
  /** Earliest debut year of the archive, for the count card. */
  firstYear: number;
  season: number;
};

/**
 * Every player of the archive, active ones included, as one list: search by name or nickname, franchise, debut
 * decade, honors, and an A–Z of surnames. Rows link to the unified profile. Grows 40 at a time.
 */
export default function HistoricPlayersList({ franchises, firstYear, season }: Props) {
  const [query, setQuery] = useState('');
  const [franchise, setFranchise] = useState('');
  const [decade, setDecade] = useState(0);
  const [only, setOnly] = useState<HistoricOnly>('all');
  const [letter, setLetter] = useState('');
  const [visible, setVisible] = useState(HISTORIC_PAGE);
  const { results, all: everyone, ready } = useUnifiedSearch(query, 600);
  const typing = query.trim().length > 0;
  // Históricos means retired: the players of today live under Activos.
  const all = useMemo(() => everyone.filter((p) => !p.isActive), [everyone]);
  const lastYear = useMemo(() => all.reduce((m, p) => Math.max(m, p.ly), 0), [all]);
  const retiredResults = useMemo(() => results.filter((p) => !p.isActive), [results]);

  const withoutLetter = useMemo(() => filterHistoric(typing ? retiredResults : all, { franchise, decade, only, letter: '' }), [typing, retiredResults, all, franchise, decade, only]);
  const letters = useMemo(() => lettersWith(withoutLetter), [withoutLetter]);
  const list = useMemo(() => {
    const f = letter ? filterHistoric(withoutLetter, { franchise: '', decade: 0, only: 'all', letter }) : withoutLetter;
    // Search results keep the hook's relevance order; the browse list goes by surname.
    return typing ? f : sortBySurname(f);
  }, [withoutLetter, letter, typing]);
  const shown = list.slice(0, visible);

  const franchiseOptions = useMemo(() => {
    const sorted = Object.values(franchises).sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
    return { active: sorted.filter((f) => f.status === 'active'), extinct: sorted.filter((f) => f.status !== 'active') };
  }, [franchises]);

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setVisible(HISTORIC_PAGE);
  };
  const reset = () => {
    setQuery('');
    setFranchise('');
    setDecade(0);
    setOnly('all');
    setLetter('');
    setVisible(HISTORIC_PAGE);
  };
  const colorOf = (p: UnifiedIndexEntry) => franchises[p.franchiseSlugs[0]]?.colors.primary ?? null;

  const searchField = (showLabel: boolean) => <SearchField value={query} onChange={change(setQuery)} placeholder="Nombre o apodo" label="Buscar" showLabel={showLabel} />;
  const franchiseField = (showLabel: boolean) => (
    <SelectField label="Por franquicia" value={franchise} onChange={change(setFranchise)} showLabel={showLabel}>
      <option value="">Todas las franquicias</option>
      <optgroup label="Activas">
        {franchiseOptions.active.map((f) => (
          <option key={f.slug} value={f.slug}>
            {f.fullName}
          </option>
        ))}
      </optgroup>
      <optgroup label="Históricas">
        {franchiseOptions.extinct.map((f) => (
          <option key={f.slug} value={f.slug}>
            {f.fullName}
          </option>
        ))}
      </optgroup>
    </SelectField>
  );

  return (
    <>
      <div className="min-w-0 flex-1">
        {/* Phone filters */}
        <div className="mb-[20px] flex flex-col gap-[10px] lg:hidden">
          {searchField(false)}
          <div className="-mx-[16px] overflow-x-auto px-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PillGroup label="Solo" value={only} options={MOBILE_ONLY} onChange={change(setOnly)} className="w-max" />
          </div>
          {franchiseField(false)}
        </div>

        {ready ? <CountLine shown={shown.length} total={list.length} order={typing ? 'por relevancia' : 'orden por apellido'} /> : <div aria-hidden className="mb-[14px] h-[14px] w-[240px] animate-pulse rounded-[6px] bg-[#ECECEC]" />}

        {/* A to Z of surnames */}
        <div role="group" aria-label="Apellidos por letra" className="-mx-[16px] mb-[14px] flex gap-[6px] overflow-x-auto px-[16px] [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
          <LetterChip letter="Todos" active={!letter} onClick={() => change(setLetter)('')} />
          {LETTERS.map((l) => (
            <LetterChip key={l} letter={l} active={letter === l} disabled={ready && !letters.has(l)} onClick={() => change(setLetter)(letter === l ? '' : l)} />
          ))}
        </div>

        {!ready ? (
          <StatsTableSkeleton rows={12} />
        ) : (
          <div className={`${cls.card} px-[12px] pb-[4px] pt-[12px]`}>
            <div role="table" aria-label="Jugadores del archivo">
              <div role="row" className={`grid ${COLS} items-center pb-[9px] pt-[2px]`}>
                <span role="columnheader" className={TH}>
                  Jugador
                </span>
                <span role="columnheader" className={TH}>
                  <span className="lg:hidden">Equipos</span>
                  <span className="hidden lg:inline">Franquicias</span>
                </span>
                <span role="columnheader" className={`${TH} text-right`}>
                  Puntos
                </span>
                <span role="columnheader" className={`${TH} hidden text-right lg:block`}>
                  Equipos
                </span>
              </div>

              {shown.map((p) => (
                <Link key={p.id} href={`/jugadores/${keyOf(p)}`} role="row" className={`${ROW} ${COLS}`}>
                  <span role="cell" className="flex min-w-0 items-center gap-[8px] lg:gap-[10px]">
                    <span className="shrink-0 lg:hidden">
                      <Avatar p={p} color={colorOf(p)} px={32} />
                    </span>
                    <span className="hidden shrink-0 lg:block">
                      <Avatar p={p} color={colorOf(p)} px={36} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] leading-[1.3] tracking-[0.15px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
                      <span className={`block truncate font-barlow text-[11.5px] leading-[1.3] text-[rgba(0,0,0,0.5)] lg:text-[12.5px] ${cls.tabular}`}>{metaLine(p)}</span>
                    </span>
                  </span>
                  <span role="cell" className="whitespace-nowrap">
                    <span className="lg:hidden">
                      <Logos p={p} franchises={franchises} max={2} />
                    </span>
                    <span className="hidden lg:inline">
                      <Logos p={p} franchises={franchises} max={3} />
                    </span>
                  </span>
                  <span role="cell" className={`whitespace-nowrap text-right font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.9)] ${cls.tabular}`}>
                    {fmtInt(p.pts)}
                  </span>
                  <span role="cell" className={`hidden whitespace-nowrap text-right font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.6)] lg:block ${cls.tabular}`}>
                    {p.franchiseSlugs.length || '–'}
                  </span>
                </Link>
              ))}

              {!shown.length ? <EmptyRows onReset={reset}>{typing ? `Sin resultados para “${query.trim()}”. Prueba sin acentos o con el apellido.` : 'Ningún jugador con esos filtros.'}</EmptyRows> : null}
            </div>
          </div>
        )}

        <LoadMore page={HISTORIC_PAGE} remaining={list.length - shown.length} onClick={() => setVisible((v) => v + HISTORIC_PAGE)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-6 hidden w-[360px] shrink-0 lg:block">
        <FiltersCard>
          {searchField(true)}
          {franchiseField(true)}
          <SelectField label="Época" value={String(decade)} onChange={(v) => change(setDecade)(Number(v))}>
            <option value="0">Todas</option>
            {decadesSince(firstYear).map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </SelectField>
          <div className="space-y-[5px]">
            <span className={FIELD_LABEL}>Solo</span>
            <div role="radiogroup" aria-label="Solo" className="flex gap-[8px]">
              {ONLY_OPTIONS.map(([k, text]) => (
                <button key={k} type="button" role="radio" aria-checked={only === k} data-selected={only === k ? '' : undefined} onClick={() => change(setOnly)(only === k ? 'all' : k)} className={PILL_SM}>
                  {text}
                </button>
              ))}
            </div>
          </div>
        </FiltersCard>
        <CountCard count={ready ? all.length : null}>
          jugadores retirados en el archivo, de {firstYear} a {lastYear || season}. Los de hoy están en Activos.
        </CountCard>
      </aside>
    </>
  );
}
