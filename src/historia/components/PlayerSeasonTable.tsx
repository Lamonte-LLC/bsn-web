'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { DASH, fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { StatLine } from '@/archivo/lib/types';

/** A season line plus what the live snapshot adds: minutes and the "en curso" flag. */
export type SeasonRow = StatLine & { live?: boolean; current?: boolean; min?: number | null };

/** The career row, computed on the server with the same rules as the lines. */
export interface CareerRow {
  g: number | null;
  seasons: number;
  min: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
}

interface Props {
  regular: SeasonRow[];
  playoffs: SeasonRow[];
  others: SeasonRow[];
  career: CareerRow;
  careerPlayoffs: CareerRow | null;
  franchises: Record<string, FranchiseView>;
  /** Callouts rendered under the table. */
  notes?: ReactNode;
}

type View = 'avg' | 'total';
type Phase = 'regular' | 'playoffs';
type Row = (SeasonRow & { kind: 'season' }) | (CareerRow & { kind: 'career'; year: number; phase: Phase; teamName: string; franchiseSlug: null; g: number; current?: false; live?: false });

/* Design-system secondary pill (equipos/[slug]) and select (PlayerStatsFilter). */
const PILL = 'flex h-[35px] min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white px-[14px] font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-colors hover:border-[rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white md:flex-none md:min-w-[150px]';
const SELECT = 'h-[40px] w-full cursor-pointer rounded-[6px] border border-[#D4D4D4] bg-[#fafafa] px-[16px] font-barlow text-sm font-medium text-[rgba(0,0,0,0.8)] outline-none focus-visible:border-[#0F171F] md:w-auto md:min-w-[190px]';

const total = (avg: number | null, g: number): number | null => (avg === null ? null : Math.round(avg * g));
const pair = (m: number | null, a: number | null): string => (m === null || a === null ? DASH : `${fmtInt(m)}-${fmtInt(a)}`);
const perGame = (m: number | null, a: number | null, g: number): string => (m === null || a === null || !g ? DASH : `${fmt(m / g)}-${fmt(a / g)}`);

/**
 * Season by season, newest first, with the career row pinned at the bottom. Promedios | Totales as design-system
 * pills; Serie regular | Postemporada as the design-system select, only when the player has postseason lines.
 * Columns the era never recorded show a dash; the callouts under the table explain why.
 */
export default function PlayerSeasonTable({ regular, playoffs, others, career, careerPlayoffs, franchises, notes }: Props) {
  const [view, setView] = useState<View>('avg');
  const [phase, setPhase] = useState<Phase>('regular');
  const lines = (phase === 'regular' ? regular : playoffs).map((l) => ({ ...l, kind: 'season' as const })).sort((a, b) => b.year - a.year || a.teamIndex - b.teamIndex);
  const careerOf = phase === 'regular' ? career : careerPlayoffs;
  const rows: Row[] = careerOf ? [...lines, { ...careerOf, kind: 'career', year: 0, phase, teamName: `${careerOf.seasons} temporada${careerOf.seasons === 1 ? '' : 's'}`, franchiseSlug: null, g: careerOf.g ?? 0 }] : lines;
  const has = (pick: (r: Row) => number | null | undefined) => rows.some((r) => pick(r) !== null && pick(r) !== undefined);
  const isCareer = (r: Row) => r.kind === 'career';

  const num = (label: string, title: string, pick: (r: Row) => number | null | undefined, kind: 'int' | 'avg' | 'pct', opts: { strong?: boolean; when?: boolean } = {}): StatsColumn<Row> | null => {
    if (opts.when === false) return null;
    return {
      key: label,
      label,
      title,
      align: 'right',
      strong: opts.strong,
      sortValue: (r) => (isCareer(r) ? null : (pick(r) ?? null)),
      render: (r) => {
        const v = pick(r) ?? null;
        return kind === 'int' ? fmtInt(v) : kind === 'pct' ? fmtPct(v) : fmt(v);
      },
    };
  };
  const text = (label: string, title: string, render: (r: Row) => string, when = true): StatsColumn<Row> | null => (when ? { key: label, label, title, align: 'right', render } : null);

  const base: StatsColumn<Row>[] = [
    {
      key: 'year',
      label: 'Año',
      sticky: true,
      sortValue: (r) => (isCareer(r) ? null : r.year),
      render: (r) =>
        isCareer(r) ? (
          <span className="font-semibold">Carrera</span>
        ) : (
          <span className="inline-flex items-center gap-[6px] font-semibold">
            {r.year}
            {r.current ? <span className={`${cls.label} !text-[9px] !tracking-[0.6px]`}>en curso</span> : null}
          </span>
        ),
    },
    {
      key: 'team',
      label: 'Equipo',
      render: (r) => {
        if (isCareer(r)) return <span className="text-[rgba(0,0,0,0.5)]">{r.teamName}</span>;
        const f = r.franchiseSlug ? (franchises[r.franchiseSlug] ?? null) : null;
        const inner = (
          <span className="inline-flex items-center gap-[7px] font-medium">
            <FranchiseLogo franchise={f} fallbackName={r.teamName} sizePx={20} />
            {f?.nickname ?? r.teamName}
          </span>
        );
        return f ? (
          <Link href={f.status === 'active' && f.code ? `/equipos/${f.code}` : `/equipos/historicos/${f.slug}`} className={`${cls.dataLink} rounded-[4px] ${cls.focus}`}>
            {inner}
          </Link>
        ) : (
          inner
        );
      },
    },
    num('J', 'Juegos', (r) => r.g, 'int')!,
  ];

  const avgCols = [
    num('Min', 'Minutos por juego', (r) => r.min, 'avg', { when: has((r) => r.min) }),
    num('Pts', 'Puntos por juego', (r) => r.ppg, 'avg', { strong: true }),
    num('Reb', 'Rebotes por juego', (r) => r.rpg, 'avg'),
    num('Ast', 'Asistencias por juego', (r) => r.apg, 'avg'),
    num('Rob', 'Robos por juego', (r) => r.spg, 'avg', { when: has((r) => r.spg) }),
    num('Blq', 'Bloqueos por juego', (r) => r.bpg, 'avg', { when: has((r) => r.bpg) }),
    num('Pér', 'Pérdidas por juego', (r) => r.topg, 'avg', { when: has((r) => r.topg) }),
    text('TC', 'Tiros de campo hechos-intentados por juego', (r) => perGame(r.fgm, r.fga, r.g), has((r) => r.fgm)),
    num('TC%', 'Tiros de campo', (r) => r.fgPct, 'pct'),
    text('3P', 'Triples hechos-intentados por juego', (r) => perGame(r.fg3m, r.fg3a, r.g), has((r) => r.fg3m)),
    num('3P%', 'Triples', (r) => r.fg3Pct, 'pct'),
    text('TL', 'Tiros libres hechos-intentados por juego', (r) => perGame(r.ftm, r.fta, r.g), has((r) => r.ftm)),
    num('TL%', 'Tiros libres', (r) => r.ftPct, 'pct'),
  ].filter((c): c is StatsColumn<Row> => c !== null);

  const totalCols = [
    num('Min', 'Minutos', (r) => (r.min === null || r.min === undefined ? null : Math.round(r.min * r.g)), 'int', { when: has((r) => r.min) }),
    num('Pts', 'Puntos', (r) => r.pts, 'int', { strong: true }),
    num('Reb', 'Rebotes', (r) => r.reb, 'int'),
    num('Ast', 'Asistencias', (r) => r.ast, 'int'),
    num('Rob', 'Robos', (r) => total(r.spg, r.g), 'int', { when: has((r) => r.spg) }),
    num('Blq', 'Bloqueos', (r) => total(r.bpg, r.g), 'int', { when: has((r) => r.bpg) }),
    num('Pér', 'Pérdidas', (r) => total(r.topg, r.g), 'int', { when: has((r) => r.topg) }),
    text('TC', 'Tiros de campo hechos-intentados', (r) => pair(r.fgm, r.fga), has((r) => r.fgm)),
    num('TC%', 'Tiros de campo', (r) => r.fgPct, 'pct'),
    text('3P', 'Triples hechos-intentados', (r) => pair(r.fg3m, r.fg3a), has((r) => r.fg3m)),
    num('3P%', 'Triples', (r) => r.fg3Pct, 'pct'),
    text('TL', 'Tiros libres hechos-intentados', (r) => pair(r.ftm, r.fta), has((r) => r.ftm)),
    num('TL%', 'Tiros libres', (r) => r.ftPct, 'pct'),
  ].filter((c): c is StatsColumn<Row> => c !== null);

  return (
    <section>
      <div className="mb-[16px] flex flex-col gap-[10px] md:flex-row md:items-center md:justify-between">
        <div role="radiogroup" aria-label="Unidad" className="flex gap-[8px]">
          {(
            [
              ['avg', 'Promedios'],
              ['total', 'Totales'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={view === k} data-selected={view === k ? '' : undefined} onClick={() => setView(k)} className={PILL}>
              {label}
            </button>
          ))}
        </div>
        {playoffs.length ? (
          <label className="flex items-center gap-[10px]">
            <span className="sr-only">Tipo de temporada</span>
            <select value={phase} onChange={(e) => setPhase(e.target.value as Phase)} className={SELECT}>
              <option value="regular">Serie regular</option>
              <option value="playoffs">Postemporada</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="mb-[12px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
        <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">Temporada por temporada</h2>
        <span className={`${cls.meta} ${cls.tabular}`}>
          {view === 'avg' ? 'Promedios' : 'Totales'} · {phase === 'regular' ? 'serie regular' : 'postemporada'} · {lines.length} temporada{lines.length === 1 ? '' : 's'}
        </span>
      </div>

      <StatsTable columns={[...base, ...(view === 'avg' ? avgCols : totalCols)]} rows={rows} rowKey={(r) => (isCareer(r) ? 'career' : `${r.year}-${r.phase}-${r.teamIndex}-${r.teamName}`)} emphasize={isCareer} caption="Temporada por temporada" zebra={rows.length > 12} emptyMessage="Sin temporadas registradas en esta fase." />

      {notes ? <div className="mt-[12px] flex flex-col gap-[8px]">{notes}</div> : null}

      {others.length ? (
        <details className="group mt-[16px]">
          <summary className={`inline-flex cursor-pointer list-none items-center gap-[6px] rounded-[4px] ${cls.textLink} ${cls.focus} [&::-webkit-details-marker]:hidden`}>
            All-Star y otros eventos ({others.length})
          </summary>
          <div className="mt-[10px]">
            <StatsTable columns={[base[0], base[1], base[2], ...avgCols.filter((c) => ['Pts', 'Reb', 'Ast'].includes(c.key))]} rows={[...others].map((l) => ({ ...l, kind: 'season' as const })).sort((a, b) => b.year - a.year)} rowKey={(r) => `${r.year}-${r.phaseLabel}-${r.teamName}`} caption="All-Star y otros eventos" />
          </div>
        </details>
      ) : null}
    </section>
  );
}
