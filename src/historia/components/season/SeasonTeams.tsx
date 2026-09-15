'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { TeamCard, TeamPlayerRow } from '@/historia/lib/season-view';

interface Props {
  year: number;
  teams: TeamCard[];
  franchises: Record<string, FranchiseView>;
}

const PER_MOBILE = 2;
const PER_DESKTOP = 4;

function RosterPanel({ team, year, franchise, onClose, color }: { team: TeamCard; year: number; franchise: FranchiseView | null; onClose: () => void; color: string }) {
  const has = (pick: (p: TeamPlayerRow) => number | string | null) => team.players.some((p) => pick(p) !== null);
  const num = (key: string, label: string, title: string, pick: (p: TeamPlayerRow) => number | null, kind: 'int' | 'avg' | 'pct', strong = false): StatsColumn<TeamPlayerRow> | null =>
    has(pick) ? { key, label, title, align: 'right', strong, sortValue: pick, render: (p) => (kind === 'int' ? fmtInt(pick(p)) : kind === 'pct' ? fmtPct(pick(p)) : fmt(pick(p))) } : null;
  const columns = [
    {
      key: 'name',
      label: 'Jugador',
      sticky: true,
      render: (p: TeamPlayerRow) => (
        <Link href={`/jugadores/${p.key}`} className={`font-semibold ${cls.dataLink} rounded-[4px] ${cls.focus}`}>
          {p.name}
        </Link>
      ),
    },
    has((p) => p.position) ? { key: 'pos', label: 'Pos', title: 'Posición', render: (p: TeamPlayerRow) => <span className="text-[rgba(0,0,0,0.6)]">{p.position ?? '–'}</span> } : null,
    has((p) => p.number) ? { key: 'num', label: '#', title: 'Número', align: 'right' as const, render: (p: TeamPlayerRow) => p.number ?? '–' } : null,
    num('g', 'J', 'Juegos', (p) => p.g, 'int'),
    num('min', 'Min', 'Minutos por juego', (p) => p.min, 'avg'),
    num('ppg', 'PPJ', 'Puntos por juego', (p) => p.ppg, 'avg', true),
    num('rpg', 'RPJ', 'Rebotes por juego', (p) => p.rpg, 'avg'),
    num('apg', 'APJ', 'Asistencias por juego', (p) => p.apg, 'avg'),
    num('spg', 'ROB', 'Robos por juego', (p) => p.spg, 'avg'),
    num('bpg', 'BLQ', 'Bloqueos por juego', (p) => p.bpg, 'avg'),
    num('fg', 'TC%', 'Tiros de campo', (p) => p.fgPct, 'pct'),
    num('fg3', '3P%', 'Triples', (p) => p.fg3Pct, 'pct'),
  ].filter((c): c is StatsColumn<TeamPlayerRow> => c !== null);
  const historyHref = franchise ? (franchise.status === 'active' && franchise.code ? `/equipos/${franchise.code}?tab=historia` : `/equipos/historicos/${franchise.slug}`) : null;

  return (
    <div className={`${cls.card} col-span-full overflow-hidden`} style={{ borderColor: color }}>
      <div className="flex items-center gap-[14px] border-b border-[rgba(0,0,0,0.06)] px-[14px] py-[14px] md:px-[20px] md:py-[16px]">
        <FranchiseLogo franchise={franchise} fallbackName={team.name} sizePx={44} />
        <div className="min-w-0 flex-1">
          <p className="text-[18px] leading-[1] text-[#0F171F] md:text-[20px]">
            {team.name} · {year}
          </p>
          <p className={`mt-[4px] ${cls.meta} ${cls.tabular}`}>
            {team.meta}
            {team.champion ? ` · Campeones ${year}` : ''}
            {team.coach ? ` · Dirigente ${team.coach}` : ''}
          </p>
        </div>
        {historyHref ? (
          <Link href={historyHref} className={`hidden whitespace-nowrap ${cls.textLink} md:inline`}>
            Historia de la franquicia
          </Link>
        ) : null}
        <button type="button" onClick={onClose} aria-label="Cerrar roster" title="Cerrar" className={`flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EAEAEA] transition-colors duration-150 hover:border-[rgba(47,47,47,1)] ${cls.focus}`}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1L13 13M13 1L1 13" stroke="#0F171F" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <StatsTable columns={columns} rows={team.players} rowKey={(p) => p.key} caption={`Roster de ${team.name} ${year}`} maxHeight="60vh" className="!rounded-none !border-0" zebra={team.players.length > 12} />
      {historyHref ? (
        <div className="border-t border-[rgba(0,0,0,0.06)] px-[14px] py-[10px] md:hidden">
          <Link href={historyHref} className={cls.textLink}>
            Historia de la franquicia
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Twelve equal tiles; tapping one opens its roster right under that tile's row (two per row on phones,
 * four on desktop), so the panel never lands far from what was tapped. One panel at a time.
 */
export default function SeasonTeams({ year, teams, franchises }: Props) {
  const wanted = useSearchParams().get('equipo');
  const initial = wanted ? (teams.find((t) => t.slug === wanted || t.code === wanted.toUpperCase()) ?? null) : null;
  const [selected, setSelected] = useState<string | null>(initial ? (initial.slug ?? initial.code ?? initial.name) : null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openedAt = useRef<string | null>(null);
  // Bring the roster into view when it opens below the fold (phones), without stealing focus.
  useEffect(() => {
    if (!selected || openedAt.current === selected) return;
    openedAt.current = selected;
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [selected]);
  const idx = teams.findIndex((t) => (t.slug ?? t.code ?? t.name) === selected);
  const team = idx >= 0 ? teams[idx] : null;
  const rowEnd = (per: number) => (idx < 0 ? -1 : Math.ceil((idx + 1) / per) * per - 1);
  const endMobile = rowEnd(PER_MOBILE);
  const endDesktop = rowEnd(PER_DESKTOP);
  const franchiseOf = (t: TeamCard) => (t.slug ? (franchises[t.slug] ?? null) : null);
  const colorOf = (t: TeamCard) => franchiseOf(t)?.colors.primary ?? '#0F171F';

  return (
    <div className="grid grid-cols-2 gap-[8px] md:grid-cols-4 md:gap-[10px]">
      {teams.map((t, i) => {
        const key = t.slug ?? t.code ?? t.name;
        const on = key === selected;
        return (
          <div key={key} className="contents">
            <button
              type="button"
              aria-expanded={on}
              aria-controls={on ? 'roster-panel' : undefined}
              title={on ? 'Cerrar roster' : `Ver el roster de ${t.nickname} en ${year}`}
              onClick={() => setSelected(on ? null : key)}
              style={on ? { borderColor: colorOf(t) } : undefined}
              className={`relative flex cursor-pointer items-center gap-[10px] rounded-[12px] border px-[12px] py-[12px] text-left text-[#0F171F] transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 md:gap-[12px] md:px-[14px] ${cls.focus} ${on ? 'bg-[#F4F4F4]' : 'border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA]'}`}
            >
              <FranchiseLogo franchise={franchiseOf(t)} fallbackName={t.name} sizePx={32} />
              <span className="min-w-0">
                <span className="block truncate font-barlow text-[13px] font-semibold md:text-[14px]">
                  <span className="md:hidden">{t.nickname}</span>
                  <span className="hidden md:inline">{t.name}</span>
                </span>
                <span className={`block font-barlow text-[12px] font-medium text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>{t.meta}</span>
              </span>
              {on ? <span aria-hidden className="absolute -bottom-[8px] left-1/2 z-[1] h-[14px] w-[14px] -translate-x-1/2 rotate-45 border-b border-r bg-[#F4F4F4]" style={{ borderColor: colorOf(t) }} /> : null}
            </button>
            {team && i === endMobile ? (
              <div id="roster-panel" ref={panelRef} className="col-span-full md:hidden">
                <RosterPanel team={team} year={year} franchise={franchiseOf(team)} color={colorOf(team)} onClose={() => setSelected(null)} />
              </div>
            ) : null}
            {team && i === endDesktop ? (
              <div className="col-span-full hidden md:block">
                <RosterPanel team={team} year={year} franchise={franchiseOf(team)} color={colorOf(team)} onClose={() => setSelected(null)} />
              </div>
            ) : null}
          </div>
        );
      })}
      {team && (endMobile >= teams.length || endDesktop >= teams.length) ? (
        <>
          {endMobile >= teams.length ? (
            <div className="col-span-full md:hidden">
              <RosterPanel team={team} year={year} franchise={franchiseOf(team)} color={colorOf(team)} onClose={() => setSelected(null)} />
            </div>
          ) : null}
          {endDesktop >= teams.length ? (
            <div className="col-span-full hidden md:block">
              <RosterPanel team={team} year={year} franchise={franchiseOf(team)} color={colorOf(team)} onClose={() => setSelected(null)} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
