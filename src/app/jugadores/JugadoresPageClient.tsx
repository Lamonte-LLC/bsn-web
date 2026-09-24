'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import HistoricoRow, { HIST_COLS } from './HistoricoRow';
import { useHistoricosIndex, type HistoricoEntry } from './historicos-index';
import { useJugadoresTab } from './useJugadoresTab';

const TEAM_SHORT_NAME: Record<string, string> = { AGU: 'Santeros', ARE: 'Capitanes', BAY: 'Vaqueros', CAG: 'Criollos', CAR: 'Gigantes', GBO: 'Mets', MAN: 'Osos', MAY: 'Indios', PON: 'Leones', QUE: 'Piratas', SGE: 'Atléticos', SCE: 'Cangrejeros' };
const TEAM_CITY: Record<string, string> = { AGU: 'Aguada', ARE: 'Arecibo', BAY: 'Bayamón', CAG: 'Caguas', CAR: 'Carolina', GBO: 'Guaynabo', MAN: 'Manatí', MAY: 'Mayagüez', PON: 'Ponce', QUE: 'Quebradillas', SGE: 'San Germán', SCE: 'Santurce' };
const POSITIONS: Array<[string, string]> = [['G', 'Guards'], ['F', 'Forwards'], ['C', 'Centers']];
const PAGE_SIZE = 40;

export type JugadorItem = {
  providerId: string;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  teamCode: string;
  playingPosition: string;
  jerseyNumber: string | null;
  age: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
};

type SortKey = 'name' | 'team' | 'pos' | 'num' | 'age' | 'ppg' | 'rpg' | 'apg';
type Sort<K extends string = SortKey> = { key: K; dir: 'asc' | 'desc' };

const surname = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  if (parts.length === 2) return parts[1];
  return parts[1].replace('.', '').length <= 2 ? parts[0] : parts[1];
};
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** G / F / C family of a roster position code (PG, SG, SF, PF, C…). */
const family = (pos: string) => (pos.endsWith('C') && pos !== 'SC' ? 'C' : pos.includes('F') ? 'F' : pos ? 'G' : '');

/* ---------- Card chrome ---------- */

const CARD = 'rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white shadow-[0_12px_32px_rgba(15,23,31,0.08)]';
const INPUT = 'h-[44px] w-full rounded-[10px] border border-[#D4D4D4] bg-[#fafafa] font-barlow text-[15px] font-medium text-[#0F171F] outline-none transition-[border-color,background-color] duration-150 placeholder:text-[rgba(15,23,31,0.4)] focus:border-[#0F171F] focus:bg-white';
const SELECT = `${INPUT} cursor-pointer appearance-none pl-[14px] pr-[36px] text-[14px]`;
/** Column label: caps at 45%; the sorted column reads in full ink with a red arrow. */
const TH = 'font-barlow text-[11px] font-semibold uppercase tracking-[0.8px] text-[rgba(15,23,31,0.45)]';

function SearchField({ value, onChange, placeholder, placeholderMobile }: { value: string; onChange: (v: string) => void; placeholder: string; placeholderMobile: string }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">Buscar</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,.45)" strokeWidth="1.8" strokeLinecap="round" aria-hidden className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2">
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5L14 14" />
      </svg>
      {/* Two inputs so each viewport gets its own placeholder: the short one at 14px never wraps on a phone. */}
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholderMobile} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="search" enterKeyHint="search" className={`${INPUT} pl-[40px] pr-[14px] text-[16px] placeholder:text-[14px] md:hidden [&::-webkit-search-cancel-button]:hidden`} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false} className={`${INPUT} hidden pl-[40px] pr-[14px] md:block [&::-webkit-search-cancel-button]:hidden`} />
    </label>
  );
}

function SelectField({ label, value, onChange, children, className = '' }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <label className={cx('relative block shrink-0', className)}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT} style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}>
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(15,23,31,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
    </label>
  );
}

function SortTh<K extends string>({ label, k, sort, onSort, align = 'center', desktopOnly = false, phoneOnly = false, title }: { label: string; k: K; sort: Sort<K>; onSort: (k: K) => void; align?: 'left' | 'center'; /** Secondary column: hidden on phones. */ desktopOnly?: boolean; /** A column that sits elsewhere on desktop: shown on phones only. */ phoneOnly?: boolean; title?: string }) {
  const on = sort.key === k;
  return (
    <button type="button" onClick={() => onSort(k)} title={title} aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cx(desktopOnly ? 'hidden md:inline-flex' : phoneOnly ? 'inline-flex md:hidden' : 'inline-flex', 'h-[40px] cursor-pointer items-center whitespace-nowrap transition-colors hover:text-[#0F171F]', TH, on && 'text-[#0F171F]', align === 'center' ? 'justify-center' : 'justify-start', cls.focus, 'rounded-[4px] focus-visible:outline-offset-[-2px]')}>
      {/* The arrow hangs off the label instead of sitting beside it, so the label stays centered over its column. */}
      <span className="relative">
        {label}
        {on ? <span aria-hidden className="absolute left-full top-0 ml-[3px] text-[#E51F1F]">{sort.dir === 'asc' ? '↑' : '↓'}</span> : null}
      </span>
    </button>
  );
}

/* ---------- Activos ---------- */

const ACT_COLS = 'grid-cols-[minmax(0,1fr)_48px_78px_20px] md:grid-cols-[minmax(0,1fr)_180px_64px_56px_64px_72px_72px_72px]';
/** Quiet chevron at the end of a phone row: the row is a link to the profile. */
const Chevron = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(15,23,31,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="justify-self-end md:hidden"><path d="M4.5 2.5L8 6l-3.5 3.5" /></svg>;

function ActivosTable({ players }: { players: JugadorItem[] }) {
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [pos, setPos] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'ppg', dir: 'desc' });
  const [limit, setLimit] = useState(PAGE_SIZE);

  const rows = useMemo(() => {
    const q = fold(search.trim());
    const list = players.filter((p) => (!q || fold(p.name).includes(q) || (p.nickname ? fold(p.nickname).includes(q) : false)) && (!team || p.teamCode === team) && (!pos || family(p.playingPosition) === pos));
    const val = (p: JugadorItem): string | number | null => {
      switch (sort.key) {
        case 'name': return surname(p.name);
        case 'team': return TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode;
        case 'pos': return p.playingPosition || null;
        case 'num': return p.jerseyNumber ? Number(p.jerseyNumber) : null;
        case 'age': return p.age;
        case 'ppg': return p.ppg;
        case 'rpg': return p.rpg;
        case 'apg': return p.apg;
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
      return sort.dir === 'asc' ? c : -c;
    });
  }, [players, search, team, pos, sort]);

  const onSort = (k: SortKey) => setSort((s) => (s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: k === 'name' || k === 'team' || k === 'pos' ? 'asc' : 'desc' }));
  const visible = rows.slice(0, limit);
  const num = (n: number | null, strong = false) => <span className={cx('block text-center font-barlow text-[14px] tabular-nums', strong ? 'font-semibold text-[#0F171F]' : 'text-[rgba(15,23,31,0.7)]', n === null && 'text-[rgba(15,23,31,0.3)]')}>{n === null ? '–' : fmt(n)}</span>;

  return (
    <>
      <div className="flex gap-[10px] border-b border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:px-[24px] md:py-[18px]">
        <SearchField value={search} onChange={(v) => { setSearch(v); setLimit(PAGE_SIZE); }} placeholder="Buscar jugador por nombre, apellido o apodo" placeholderMobile="Buscar jugador" />
        {/* Two selects for one filter: the phone's "all" option must be a single short word to fit its width. */}
        <SelectField label="Equipo" value={team} onChange={(v) => { setTeam(v); setLimit(PAGE_SIZE); }} className="w-[104px] md:hidden">
          <option value="">Todos</option>
          {Object.entries(TEAM_CITY).sort(([, a], [, b]) => a.localeCompare(b, 'es')).map(([code, city]) => <option key={code} value={code}>{city}</option>)}
        </SelectField>
        <SelectField label="Equipo" value={team} onChange={(v) => { setTeam(v); setLimit(PAGE_SIZE); }} className="hidden md:block md:w-[190px]">
          <option value="">Todos los equipos</option>
          {Object.entries(TEAM_CITY).sort(([, a], [, b]) => a.localeCompare(b, 'es')).map(([code, city]) => <option key={code} value={code}>{city}</option>)}
        </SelectField>
        <SelectField label="Posición" value={pos} onChange={(v) => { setPos(v); setLimit(PAGE_SIZE); }} className="hidden md:block md:w-[190px]">
          <option value="">Todas las posiciones</option>
          {POSITIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </SelectField>
      </div>

      {/* Header: every label sits exactly over its column and shares the cell's alignment. */}
      <div className={cx('grid items-center gap-x-[10px] border-b border-[rgba(15,23,31,0.08)] px-[14px] md:gap-x-[12px] md:px-[24px]', ACT_COLS)} role="row">
        <SortTh label="Jugador" k="name" sort={sort} onSort={onSort} align="left" />
        <SortTh label="Pos" k="pos" sort={sort} onSort={onSort} phoneOnly />
        <SortTh label="Equipo" k="team" sort={sort} onSort={onSort} align="left" />
        <SortTh label="Pos" k="pos" sort={sort} onSort={onSort} desktopOnly />
        <SortTh label="#" k="num" sort={sort} onSort={onSort} desktopOnly title="Número" />
        <SortTh label="Edad" k="age" sort={sort} onSort={onSort} desktopOnly />
        <SortTh label="PPJ" k="ppg" sort={sort} onSort={onSort} desktopOnly title="Puntos por juego" />
        <SortTh label="RPJ" k="rpg" sort={sort} onSort={onSort} desktopOnly title="Rebotes por juego" />
        <SortTh label="APJ" k="apg" sort={sort} onSort={onSort} desktopOnly title="Asistencias por juego" />
        <span className="md:hidden" aria-hidden />
      </div>

      {visible.map((p, i) => (
        <Link key={p.providerId} href={`/jugadores/${p.providerId}`} className={cx('grid h-[56px] items-center gap-x-[10px] px-[14px] transition-colors duration-150 hover:bg-[#FAFAFA] active:bg-[#F3F3F3] motion-reduce:transition-none md:gap-x-[12px] md:px-[24px]', ACT_COLS, i > 0 && 'border-t border-[rgba(15,23,31,0.05)]', cls.focus, 'focus-visible:outline-offset-[-2px]')}>
          <span className="flex min-w-0 items-center gap-[12px]">
            <span className="hidden md:block"><PlayerAvatar name={p.name} photoUrl={p.avatarUrl ? `${p.avatarUrl}?size=200` : null} sizePx={34} /></span>
            <span className="block truncate text-[16px] leading-[1.1] text-[#0F171F] md:text-[17px]">{p.name}</span>
          </span>
          <span className="text-center font-barlow text-[13px] font-medium text-[rgba(15,23,31,0.7)] md:hidden">{p.playingPosition || '–'}</span>
          {/* Club: logo and the three-letter code on phones, logo and name on desktop. */}
          <span className="flex min-w-0 items-center gap-[6px] font-barlow text-[13px] font-semibold text-[rgba(15,23,31,0.7)] md:gap-[8px] md:text-[14px] md:font-medium">
            <TeamLogoAvatar teamCode={p.teamCode} size={22} />
            <span className="md:hidden">{p.teamCode}</span>
            <span className="hidden truncate md:inline">{TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode}</span>
          </span>
          <span className="hidden text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.7)] md:block">{p.playingPosition || '–'}</span>
          <span className="hidden text-center font-barlow text-[14px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{p.jerseyNumber ?? '–'}</span>
          <span className="hidden text-center font-barlow text-[14px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{p.age ?? '–'}</span>
          <span className="hidden text-center md:block">{num(p.ppg, true)}</span>
          <span className="hidden text-center md:block">{num(p.rpg)}</span>
          <span className="hidden text-center md:block">{num(p.apg)}</span>
          <Chevron />
        </Link>
      ))}

      {!rows.length ? <p className="px-[16px] py-[28px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">No hay jugadores con ese nombre en las plantillas de esta temporada.</p> : null}

      <div className="flex flex-col items-center gap-[14px] border-t border-[rgba(15,23,31,0.06)] px-[14px] py-[20px] md:py-[24px]">
        <span className="font-barlow text-[13px] tabular-nums text-[rgba(15,23,31,0.5)]">Mostrando {fmtInt(visible.length)} de {fmtInt(rows.length)} jugadores · Temporada 2026</span>
        {visible.length < rows.length ? (
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)} className={`inline-flex h-[48px] w-full max-w-[360px] cursor-pointer items-center justify-center rounded-[12px] border border-[rgba(15,23,31,0.16)] px-[28px] font-barlow text-[15px] font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] ${cls.focus}`}>
            Cargar {fmtInt(Math.min(PAGE_SIZE, rows.length - visible.length))} más
          </button>
        ) : null}
      </div>
    </>
  );
}

/* ---------- Históricos ---------- */

type HistSortKey = 'name' | 'seasons' | 'years' | 'games';
const HIST_PAGE = 50;
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

function ShimmerRows() {
  return (
    <div aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={cx('grid h-[56px] items-center gap-x-[8px] px-[14px] md:gap-x-[12px] md:px-[24px]', HIST_COLS, i > 0 && 'border-t border-[rgba(15,23,31,0.05)]')}>
          <span className="flex items-center gap-[12px]"><span className="h-[34px] w-[34px] animate-pulse rounded-full bg-[rgba(15,23,31,0.07)]" /><span className="h-[14px] w-[160px] animate-pulse rounded-[4px] bg-[rgba(15,23,31,0.07)]" /></span>
          <span className="h-[26px] w-[64px] animate-pulse rounded-full bg-[rgba(15,23,31,0.07)]" />
          <span className="mx-auto hidden h-[14px] w-[24px] animate-pulse rounded-[4px] bg-[rgba(15,23,31,0.07)] md:block" />
          <span className="mx-auto hidden h-[14px] w-[64px] animate-pulse rounded-[4px] bg-[rgba(15,23,31,0.07)] md:block" />
          <span className="mx-auto h-[14px] w-[28px] animate-pulse rounded-[4px] bg-[rgba(15,23,31,0.07)]" />
        </div>
      ))}
    </div>
  );
}

/**
 * Every player in the league's history, from the static index (public/data/jugadores-historicos.json): search
 * by name or nickname, filters by decade and club, sortable columns, pages of 50. No request per row.
 */
function HistoricosTable({ total }: { total: number }) {
  const { index, loading, error } = useHistoricosIndex();
  const [search, setSearch] = useState('');
  const [decade, setDecade] = useState('');
  const [team, setTeam] = useState('');
  const [sort, setSort] = useState<Sort<HistSortKey>>({ key: 'name', dir: 'asc' });
  const [limit, setLimit] = useState(HIST_PAGE);
  const reset = () => setLimit(HIST_PAGE);

  const onSort = (key: HistSortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));
    reset();
  };

  const clubs = useMemo(() => index?.teams ?? {}, [index]);
  const teamOptions = useMemo(() => Object.entries(clubs).sort(([, a], [, b]) => a.name.localeCompare(b.name, 'es')), [clubs]);

  const rows = useMemo(() => {
    if (!index) return [];
    const q = fold(search.trim());
    const dec = decade ? Number(decade) : null;
    const list = index.players.filter((p) => (!q || fold(p.n).includes(q) || (p.k ? fold(p.k).includes(q) : false)) && (dec === null || p.d.includes(dec)) && (!team || p.t.includes(team)));
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (p: HistoricoEntry): number | null => {
      switch (sort.key) {
        case 'seasons': return p.s || null;
        case 'years': return p.fy;
        case 'games': return p.g || null;
        default: return null;
      }
    };
    return [...list].sort((a, b) => {
      if (sort.key === 'name') return dir * a.n.localeCompare(b.n, 'es');
      const av = val(a);
      const bv = val(b);
      if (av === null && bv === null) return a.n.localeCompare(b.n, 'es');
      if (av === null) return 1;
      if (bv === null) return -1;
      return av === bv ? a.n.localeCompare(b.n, 'es') : dir * (av - bv);
    });
  }, [index, search, decade, team, sort]);

  const filtered = Boolean(search.trim() || decade || team);
  const shown = rows.slice(0, limit);
  const count = index ? rows.length : total;

  return (
    <>
      <div className="flex gap-[10px] border-b border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:px-[24px] md:py-[18px]">
        <SearchField value={search} onChange={(v) => { setSearch(v); reset(); }} placeholder="Buscar jugador por nombre, apellido o apodo" placeholderMobile="Buscar jugador" />
        <SelectField label="Época" value={decade} onChange={(v) => { setDecade(v); reset(); }} className="w-[96px] md:w-[150px]">
          <option value="">Épocas</option>
          {DECADES.map((d) => <option key={d} value={d}>{d}s</option>)}
        </SelectField>
        <SelectField label="Equipo" value={team} onChange={(v) => { setTeam(v); reset(); }} className="hidden md:block md:w-[230px]">
          <option value="">Todos los equipos</option>
          {teamOptions.map(([code, c]) => <option key={code} value={code}>{c.name}</option>)}
        </SelectField>
      </div>
      <div className="border-b border-[rgba(15,23,31,0.06)] px-[14px] py-[10px] md:hidden">
        <SelectField label="Equipo" value={team} onChange={(v) => { setTeam(v); reset(); }} className="w-full">
          <option value="">Todos los equipos</option>
          {teamOptions.map(([code, c]) => <option key={code} value={code}>{c.name}</option>)}
        </SelectField>
      </div>

      <div className={cx('grid items-center gap-x-[8px] border-b border-[rgba(15,23,31,0.08)] px-[14px] md:gap-x-[12px] md:px-[24px]', HIST_COLS)} role="row">
        <SortTh label="Jugador" k="name" sort={sort} onSort={onSort} align="left" />
        <span className={cx('inline-flex h-[40px] items-center whitespace-nowrap', TH)}>Equipos</span>
        <SortTh label="Temporadas" k="seasons" sort={sort} onSort={onSort} desktopOnly />
        <SortTh label="Años activo" k="years" sort={sort} onSort={onSort} desktopOnly title="Primera y última temporada" />
        <SortTh label="Total juegos" k="games" sort={sort} onSort={onSort} title="Total de juegos jugados" />
        <span className="md:hidden" aria-hidden />
      </div>

      {loading ? <ShimmerRows /> : null}
      {error ? <p className="px-[16px] py-[28px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">No se pudo cargar el listado. Intenta de nuevo.</p> : null}
      {shown.map((p, i) => <HistoricoRow key={p.id} p={p} clubs={clubs} first={i === 0} />)}
      {index && !rows.length ? <p className="px-[16px] py-[28px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">{search.trim() ? <>Sin resultados para “{search.trim()}”. Prueba sin acentos o con el apellido.</> : 'Sin jugadores con esos filtros.'}</p> : null}

      <div className="flex flex-col items-center gap-[14px] border-t border-[rgba(15,23,31,0.06)] px-[14px] py-[20px] md:py-[24px]">
        <span className="font-barlow text-[13px] tabular-nums text-[rgba(15,23,31,0.5)]">
          {filtered ? `Mostrando ${fmtInt(shown.length)} de ${fmtInt(count)} jugadores` : `Mostrando ${fmtInt(shown.length)} de ${fmtInt(count)} jugadores · A-Z`}
        </span>
        {rows.length > shown.length ? (
          <button type="button" onClick={() => setLimit((n) => n + HIST_PAGE)} className={`inline-flex h-[48px] w-full max-w-[360px] cursor-pointer items-center justify-center rounded-[12px] border border-[rgba(15,23,31,0.16)] px-[28px] font-barlow text-[15px] font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] ${cls.focus}`}>
            Cargar {fmtInt(Math.min(HIST_PAGE, rows.length - shown.length))} más
          </button>
        ) : null}
      </div>
    </>
  );
}

/* ---------- Page ---------- */

export default function JugadoresPageClient({ players, historicCount }: { players: JugadorItem[]; historicCount: number }) {
  const tab = useJugadoresTab();
  return (
    <section className="container -mt-[40px] mb-[24px] lg:-mt-[56px] lg:mb-[44px]">
      <div className={cx(CARD, 'mx-auto max-w-[1040px] overflow-hidden')}>{tab === 'activos' ? <ActivosTable players={players} /> : <HistoricosTable total={historicCount} />}</div>
    </section>
  );
}
