'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { useAllPlayers } from '@/historia/hooks/useAllPlayers';
import { useDebouncedValue } from '@/historia/hooks/useDebouncedValue';
import { usePlayerSuggestions } from '@/historia/hooks/usePlayerSuggestions';
import HistoricoRow, { HIST_COLS, type HistoricoItem } from './HistoricoRow';
import { useJugadoresTab } from './useJugadoresTab';

const TEAM_SHORT_NAME: Record<string, string> = { AGU: 'Santeros', ARE: 'Capitanes', BAY: 'Vaqueros', CAG: 'Criollos', CAR: 'Gigantes', GBO: 'Mets', MAN: 'Osos', MAY: 'Indios', PON: 'Leones', QUE: 'Piratas', SGE: 'Atléticos', SCE: 'Cangrejeros' };
const TEAM_CITY: Record<string, string> = { AGU: 'Aguada', ARE: 'Arecibo', BAY: 'Bayamón', CAG: 'Caguas', CAR: 'Carolina', GBO: 'Guaynabo', MAN: 'Manatí', MAY: 'Mayagüez', PON: 'Ponce', QUE: 'Quebradillas', SGE: 'San Germán', SCE: 'Santurce' };
const POSITIONS: Array<[string, string]> = [['G', 'Guardias'], ['F', 'Aleros'], ['C', 'Pívots']];
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
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

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
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(15,23,31,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2">
        <path d="M2.5 4.5L6 8l3.5-3.5" />
      </svg>
    </label>
  );
}

function SortTh({ label, k, sort, onSort, align = 'center', desktopOnly = false, title }: { label: string; k: SortKey; sort: Sort; onSort: (k: SortKey) => void; align?: 'left' | 'center'; /** Secondary column: hidden on phones. */ desktopOnly?: boolean; title?: string }) {
  const on = sort.key === k;
  return (
    <button type="button" onClick={() => onSort(k)} title={title} aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cx(desktopOnly ? 'hidden md:inline-flex' : 'inline-flex', 'h-[40px] cursor-pointer items-center gap-[4px] whitespace-nowrap transition-colors hover:text-[#0F171F]', TH, on && 'text-[#0F171F]', align === 'center' ? 'justify-center' : 'justify-start', cls.focus, 'rounded-[4px] focus-visible:outline-offset-[-2px]')}>
      {label}
      <span aria-hidden className={cx('w-[8px] text-[#E51F1F]', !on && 'opacity-0')}>{sort.dir === 'asc' ? '↑' : '↓'}</span>
    </button>
  );
}

/* ---------- Activos ---------- */

const ACT_COLS = 'grid-cols-[minmax(0,1fr)_56px_56px] md:grid-cols-[minmax(0,1fr)_170px_56px_48px_56px_64px_64px_64px]';

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
  const num = (n: number | null, strong = false) => <span className={cx('text-center font-barlow text-[14px] tabular-nums', strong ? 'font-semibold text-[#0F171F]' : 'text-[rgba(15,23,31,0.7)]', n === null && 'text-[rgba(15,23,31,0.3)]')}>{n === null ? '–' : fmt(n)}</span>;

  return (
    <>
      <div className="flex gap-[10px] border-b border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:px-[24px] md:py-[18px]">
        <SearchField value={search} onChange={(v) => { setSearch(v); setLimit(PAGE_SIZE); }} placeholder="Buscar por nombre o apodo" placeholderMobile="Buscar jugador" />
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
      <div className={cx('grid items-center gap-x-[8px] border-b border-[rgba(15,23,31,0.08)] px-[14px] md:gap-x-[10px] md:px-[24px]', ACT_COLS)} role="row">
        <SortTh label="Jugador" k="name" sort={sort} onSort={onSort} align="left" />
        <SortTh label="Equipo" k="team" sort={sort} onSort={onSort} align="left" desktopOnly />
        <SortTh label="Pos" k="pos" sort={sort} onSort={onSort} desktopOnly />
        <SortTh label="#" k="num" sort={sort} onSort={onSort} desktopOnly title="Número" />
        <SortTh label="Edad" k="age" sort={sort} onSort={onSort} desktopOnly />
        <SortTh label="PPJ" k="ppg" sort={sort} onSort={onSort} title="Puntos por juego" />
        <SortTh label="RPJ" k="rpg" sort={sort} onSort={onSort} desktopOnly title="Rebotes por juego" />
        <SortTh label="APJ" k="apg" sort={sort} onSort={onSort} title="Asistencias por juego" />
      </div>

      {visible.map((p, i) => (
        <Link key={p.providerId} href={`/jugadores/${p.providerId}`} className={cx('grid h-[56px] items-center gap-x-[8px] px-[14px] transition-colors duration-150 hover:bg-[#FAFAFA] active:bg-[#F3F3F3] motion-reduce:transition-none md:gap-x-[10px] md:px-[24px]', ACT_COLS, i > 0 && 'border-t border-[rgba(15,23,31,0.05)]', cls.focus, 'focus-visible:outline-offset-[-2px]')}>
          <span className="flex min-w-0 items-center gap-[12px]">
            <PlayerAvatar name={p.name} photoUrl={p.avatarUrl ? `${p.avatarUrl}?size=200` : null} sizePx={34} />
            <span className="min-w-0">
              <span className="block truncate text-[16px] leading-[1.1] text-[#0F171F]">{p.name}</span>
              <span className="mt-[2px] block truncate font-barlow text-[12px] text-[rgba(15,23,31,0.5)] md:hidden">
                {TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode} · {p.playingPosition || '–'}
              </span>
            </span>
          </span>
          <span className="hidden min-w-0 items-center gap-[8px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.7)] md:flex">
            <TeamLogoAvatar teamCode={p.teamCode} size={20} />
            <span className="truncate">{TEAM_SHORT_NAME[p.teamCode] ?? p.teamCode}</span>
          </span>
          <span className="hidden text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.7)] md:block">{p.playingPosition || '–'}</span>
          <span className="hidden text-center font-barlow text-[14px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{p.jerseyNumber ?? '–'}</span>
          <span className="hidden text-center font-barlow text-[14px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{p.age ?? '–'}</span>
          {num(p.ppg, true)}
          <span className="hidden md:block">{num(p.rpg)}</span>
          {num(p.apg)}
        </Link>
      ))}

      {!rows.length ? <p className="px-[16px] py-[28px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">No hay jugadores con ese nombre en las plantillas de esta temporada.</p> : null}

      <div className="flex flex-col items-center gap-[12px] border-t border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:flex-row md:justify-between md:px-[24px]">
        <span className="font-barlow text-[12.5px] tabular-nums text-[rgba(15,23,31,0.5)]">Mostrando {fmtInt(visible.length)} de {fmtInt(rows.length)} jugadores · Temporada 2026</span>
        {visible.length < rows.length ? (
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)} className={`inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(15,23,31,0.14)] px-[18px] font-barlow text-[13px] font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] ${cls.focus}`}>
            Cargar {Math.min(PAGE_SIZE, rows.length - visible.length)} más
          </button>
        ) : null}
      </div>
    </>
  );
}

/* ---------- Históricos ---------- */

function HistoricosTable({ total }: { total: number }) {
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim(), 300);
  const typing = query.length > 0;
  const { data: found, loading: searching } = usePlayerSuggestions(query, 60);
  const all = useAllPlayers(typing);
  const rows: HistoricoItem[] = (typing ? found : all.players).map((p) => ({ providerId: p.providerId, name: p.name, nickname: p.nickname, avatarUrl: p.avatarUrl, nationality: (p as { nationality?: string | null }).nationality ?? null }));

  // Pages itself as the page scrolls: the next page starts while the end of the list is still a screen away.
  const endRef = useRef<HTMLDivElement>(null);
  const { hasMore, loadMore, loading } = all;
  useEffect(() => {
    const el = endRef.current;
    if (!el || typing || !hasMore) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) loadMore();
    }, { rootMargin: '800px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [typing, hasMore, loadMore, rows.length]);

  const th = (label: string, opts: { left?: boolean; desktopOnly?: boolean; title?: string } = {}) => <span title={opts.title} className={cx(opts.desktopOnly ? 'hidden md:inline-flex' : 'inline-flex', 'h-[40px] items-center whitespace-nowrap', opts.left ? 'justify-start' : 'justify-center', TH)}>{label}</span>;

  return (
    <>
      <div className="flex gap-[10px] border-b border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:px-[24px] md:py-[18px]">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar por nombre o apodo" placeholderMobile="Buscar jugador" />
      </div>
      <div className={cx('grid items-center gap-x-[8px] border-b border-[rgba(15,23,31,0.08)] px-[14px] md:gap-x-[10px] md:px-[24px]', HIST_COLS)} role="row">
        {th('Jugador', { left: true })}
        {th('Equipos', { left: true, desktopOnly: true })}
        {th('Temporadas', { desktopOnly: true })}
        {th('J', { desktopOnly: true, title: 'Juegos' })}
        {th('PTS', { title: 'Puntos en su carrera' })}
        {th('PPJ', { title: 'Puntos por juego' })}
        {th('RPJ', { desktopOnly: true, title: 'Rebotes por juego' })}
        {th('APJ', { desktopOnly: true, title: 'Asistencias por juego' })}
      </div>
      {rows.map((p, i) => <HistoricoRow key={p.providerId} p={p} first={i === 0} />)}
      {typing && searching ? <p className="px-[16px] py-[18px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Buscando…</p> : null}
      {typing && !searching && !rows.length ? <p className="px-[16px] py-[28px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">Sin resultados para “{query}”. Prueba sin acentos o con el apellido.</p> : null}
      <div ref={endRef} aria-hidden />
      <div className="flex flex-col items-center gap-[12px] border-t border-[rgba(15,23,31,0.06)] px-[14px] py-[14px] md:flex-row md:justify-between md:px-[24px]">
        <span className="font-barlow text-[12.5px] tabular-nums text-[rgba(15,23,31,0.5)]">{typing ? `${fmtInt(rows.length)} resultados` : `Mostrando ${fmtInt(rows.length)} de ${fmtInt(total)} jugadores · A-Z · promedios de carrera`}</span>
        {!typing && hasMore ? <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.45)]">{loading ? 'Cargando más jugadores…' : 'Sigue bajando para ver más'}</span> : null}
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
