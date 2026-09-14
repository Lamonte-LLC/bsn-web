import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Label } from '@/archivo/components/ui';
import { fmt } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { LeaderRow, SeriesRow, StandingRow, StandingsGroup, TeamRef } from '@/historia/lib/season-view';

type Franchises = Record<string, FranchiseView>;

const teamHref = (t: TeamRef, f: FranchiseView | null) => (f ? (f.status === 'active' && f.code ? `/equipos/${f.code}` : `/equipos/historicos/${f.slug}`) : null);

function TeamName({ t, franchises, size = 22, full = false, dim = false, bold = false }: { t: TeamRef; franchises: Franchises; size?: number; full?: boolean; dim?: boolean; bold?: boolean }) {
  const f = t.slug ? (franchises[t.slug] ?? null) : null;
  const href = teamHref(t, f);
  const inner = (
    <span className={`inline-flex items-center gap-[8px] font-barlow text-[14px] ${bold ? 'font-bold text-[#0F171F]' : 'font-medium'} ${dim ? 'text-[rgba(0,0,0,0.45)]' : ''}`}>
      <FranchiseLogo franchise={f} fallbackName={t.name} sizePx={size} />
      <span className="md:hidden">{t.nickname}</span>
      <span className="hidden md:inline">{full ? t.name : t.nickname}</span>
    </span>
  );
  return href ? (
    <Link href={href} className={`rounded-[4px] ${cls.focus} transition-colors duration-150 hover:text-[rgba(0,0,0,0.65)]`}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function SectionHead({ title, right, className = '' }: { title: string; right?: string; className?: string }) {
  return (
    <div className={`mb-[16px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px] ${className}`}>
      <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">{title}</h2>
      {right ? <span className={`${cls.meta} ${cls.tabular}`}>{right}</span> : null}
    </div>
  );
}

/** Standings per group: position, team, W, L, %, PPJ, games behind; dashed rule under the fourth (playoff line). */
export function StandingsPanel({ groups, franchises, playoffSpots = 4 }: { groups: StandingsGroup[]; franchises: Franchises; playoffSpots?: number }) {
  const columns: StatsColumn<StandingRow>[] = [
    { key: 'pos', label: '#', width: 28, render: (r) => <span className="text-[rgba(0,0,0,0.45)]">{r.position}</span> },
    { key: 'team', label: 'Equipo', sticky: true, render: (r) => <TeamName t={r} franchises={franchises} bold={r.position <= playoffSpots} /> },
    { key: 'w', label: 'G', title: 'Ganados', align: 'right', strong: true, sortValue: (r) => r.won, render: (r) => String(r.won) },
    { key: 'l', label: 'P', title: 'Perdidos', align: 'right', sortValue: (r) => r.lost, render: (r) => String(r.lost) },
    { key: 'pct', label: '%', title: 'Porcentaje', align: 'right', render: (r) => r.pct },
    { key: 'ppg', label: 'PPJ', title: 'Puntos por juego', align: 'right', sortValue: (r) => r.ppg, render: (r) => fmt(r.ppg) },
    { key: 'gb', label: 'Dif', title: 'Juegos detrás del líder', align: 'right', render: (r) => (r.behind === 0 ? '–' : `-${r.behind}`) },
  ];
  return (
    <div className={`grid grid-cols-1 gap-[16px] ${groups.length > 1 ? 'lg:grid-cols-2' : ''}`}>
      {groups.map((g) => (
        <div key={g.group ?? 'all'}>
          {g.group ? <Label className="mb-[8px]">Grupo {g.group}</Label> : null}
          <StatsTable columns={columns} rows={g.rows} rowKey={(r) => r.code ?? r.name} caption={g.group ? `Posiciones del Grupo ${g.group}` : 'Posiciones'} />
        </div>
      ))}
    </div>
  );
}

/** One linear block, one row per series: round, winner in bold, games, eliminated dimmed. Final first. */
export function SeriesPanel({ series, franchises }: { series: SeriesRow[]; franchises: Franchises }) {
  return (
    <div className={`${cls.card} overflow-hidden`}>
      <div className="hidden grid-cols-[150px_1fr_72px_1fr] border-b border-[rgba(0,0,0,0.07)] px-[20px] py-[10px] font-barlow text-[12.5px] uppercase text-[rgba(0,0,0,0.6)] md:grid">
        <span>Serie</span>
        <span className="text-right">Ganador</span>
        <span className="text-center">Juegos</span>
        <span>Eliminado</span>
      </div>
      {series.map((s, i) => (
        <div key={s.id} className={`grid grid-cols-[1fr_56px_1fr] items-center gap-x-[8px] px-[14px] py-[10px] transition-colors duration-150 hover:bg-[#FAFAFA] md:grid-cols-[150px_1fr_72px_1fr] md:px-[20px] md:py-0 md:h-[48px] ${i ? 'border-t border-[rgba(0,0,0,0.06)]' : ''} ${s.final ? 'bg-[#F9F9F9]' : ''}`}>
          <span className={`col-span-3 mb-[6px] inline-flex items-center gap-[6px] ${cls.label} md:col-span-1 md:mb-0`}>
            {s.final ? <span aria-hidden className="text-[12px] text-[#FEC200]">★</span> : null}
            {s.label}
            {s.group ? <span className="text-[rgba(0,0,0,0.3)]">{s.group}</span> : null}
          </span>
          <span className="flex justify-end">
            <TeamName t={s.winner} franchises={franchises} full bold />
          </span>
          <span className={`text-center text-[18px] text-[#0F171F] md:text-[20px] ${cls.tabular}`}>
            {s.wins}
            <span className="px-[3px] text-[rgba(0,0,0,0.3)]">–</span>
            <span className="text-[rgba(0,0,0,0.45)]">{s.losses}</span>
          </span>
          <span>
            <TeamName t={s.loser} franchises={franchises} full dim />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Two compact columns, one row per category: category, leader with logo and team, value, Top 10 link. */
export function LeadersPanel({ leaders, franchises, year }: { leaders: LeaderRow[]; franchises: Franchises; year: number }) {
  const half = Math.ceil(leaders.length / 2);
  const cols = [leaders.slice(0, half), leaders.slice(half)].filter((c) => c.length);
  return (
    <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
      {cols.map((col, ci) => (
        <div key={ci} className={`${cls.card} px-[14px] md:px-[18px]`}>
          {col.map((l, i) => {
            const f = l.slug ? (franchises[l.slug] ?? null) : null;
            return (
              <div key={l.category} className={`grid h-[52px] grid-cols-[92px_1fr_auto] items-center gap-[10px] md:grid-cols-[128px_1fr_72px] ${i ? 'border-t border-[rgba(0,0,0,0.06)]' : ''}`}>
                <span className={`${cls.label} !text-[10px]`}>{l.label}</span>
                <span className="flex min-w-0 items-center gap-[8px]">
                  <FranchiseLogo franchise={f} fallbackName={l.name} sizePx={22} />
                  <Link href={`/jugadores/${l.playerKey}`} className={`truncate font-barlow text-[14px] font-semibold ${cls.dataLink} rounded-[4px] ${cls.focus}`}>
                    {l.playerName}
                  </Link>
                  <span className={`hidden whitespace-nowrap ${cls.meta} md:inline`}>{l.nickname}</span>
                </span>
                <span className={`text-right text-[20px] text-[#0F171F] ${cls.tabular}`} title={`${l.label} por juego, temporada ${year}`}>{l.value}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
