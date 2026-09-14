'use client';

import { useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { NotRecorded } from '@/archivo/components/ui';
import { DASH, fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { StatLine } from '@/archivo/lib/types';

export type SeasonRow = StatLine & { live?: boolean; current?: boolean };

interface Props {
  /** Regular and playoff lines, any order; All-Star and other events go to a collapsed section. */
  lines: SeasonRow[];
  others: SeasonRow[];
  franchises: Record<string, FranchiseView>;
  /** Era note lines rendered inside the card, under the table. */
  footnote?: string[];
}

type View = 'avg' | 'total';
type NumKey = 'g' | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'topg' | 'fgPct' | 'fg3Pct' | 'ftPct' | 'pts' | 'reb' | 'ast';

const total = (avg: number | null, g: number): number | null => (avg === null ? null : Math.round(avg * g));

/**
 * Season by season, newest first, regular season and postseason of the same year kept together. One toggle
 * switches averages and totals; a whole column the era never recorded reads "no registrado".
 */
export default function CareerSeasonTable({ lines, others, franchises, footnote }: Props) {
  const [view, setView] = useState<View>('avg');
  const rows = [...lines].sort((a, b) => b.year - a.year || (a.phase === 'regular' ? -1 : 1));
  const absent = new Set<NumKey>();
  for (const k of ['rpg', 'apg', 'spg', 'bpg', 'topg', 'fgPct', 'fg3Pct', 'ftPct'] as NumKey[]) {
    if (rows.length && rows.every((l) => l[k] === null)) absent.add(k);
  }
  const cell = (key: NumKey, kind: 'int' | 'avg' | 'pct') =>
    function renderStat(r: SeasonRow) {
      if (absent.has(key)) return <NotRecorded />;
      const v = r[key];
      if (kind === 'int') return fmtInt(v);
      if (kind === 'pct') return fmtPct(v);
      return fmt(v);
    };
  const totalCell = (key: 'spg' | 'bpg' | 'topg') =>
    function renderTotal(r: SeasonRow) {
      if (absent.has(key)) return <NotRecorded />;
      const v = total(r[key], r.g);
      return v === null ? DASH : fmtInt(v);
    };

  const base: StatsColumn<SeasonRow>[] = [
    {
      key: 'year',
      label: 'Año',
      sticky: true,
      sortValue: (r) => r.year,
      initialSort: 'desc',
      render: (r) => (
        <span className="inline-flex items-center gap-[6px]">
          <Link href={`/temporadas/${r.year}`} className={`font-semibold text-[#0F171F] ${cls.dataLink}`}>
            {r.year}
          </Link>
          {r.current ? <span className={`${cls.label} !text-[9px] !tracking-[0.6px]`}>en curso</span> : null}
        </span>
      ),
    },
    {
      key: 'team',
      label: 'Equipo',
      render: (r) => {
        const f = r.franchiseSlug ? franchises[r.franchiseSlug] : null;
        const inner = (
          <span className="inline-flex items-center gap-[7px] font-medium">
            <FranchiseLogo franchise={f} fallbackName={r.teamName} size="chip" />
            <span>{f?.nickname ?? r.teamName}</span>
          </span>
        );
        if (!f) return inner;
        const href = f.status === 'active' && f.code ? `/equipos/${f.code}?tab=historia` : `/equipos/historicos/${f.slug}`;
        return (
          <Link href={href} className="transition-colors duration-150 hover:text-[rgba(0,0,0,0.65)]">
            {inner}
          </Link>
        );
      },
    },
    { key: 'phase', label: 'Fase', render: (r) => <span className="text-[12.5px] text-[rgba(0,0,0,0.55)]">{r.phaseLabel}</span> },
    { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: (r) => r.g, render: (r) => fmtInt(r.g) },
  ];
  const avgCols: StatsColumn<SeasonRow>[] = [
    { key: 'ppg', label: 'PPJ', align: 'right', strong: true, sortValue: (r) => r.ppg, render: cell('ppg', 'avg') },
    { key: 'rpg', label: 'RPJ', align: 'right', sortValue: (r) => r.rpg, render: cell('rpg', 'avg') },
    { key: 'apg', label: 'APJ', align: 'right', sortValue: (r) => r.apg, render: cell('apg', 'avg') },
    { key: 'spg', label: 'ROB', align: 'right', sortValue: (r) => r.spg, render: cell('spg', 'avg') },
    { key: 'bpg', label: 'BLQ', align: 'right', sortValue: (r) => r.bpg, render: cell('bpg', 'avg') },
    { key: 'topg', label: 'PÉR', title: 'Pérdidas por juego', align: 'right', sortValue: (r) => r.topg, render: cell('topg', 'avg') },
    { key: 'fgPct', label: 'TC%', align: 'right', sortValue: (r) => r.fgPct, render: cell('fgPct', 'pct') },
    { key: 'fg3Pct', label: '3P%', align: 'right', sortValue: (r) => r.fg3Pct, render: cell('fg3Pct', 'pct') },
    { key: 'ftPct', label: 'TL%', align: 'right', sortValue: (r) => r.ftPct, render: cell('ftPct', 'pct') },
  ];
  const totalCols: StatsColumn<SeasonRow>[] = [
    { key: 'pts', label: 'PTS', align: 'right', strong: true, sortValue: (r) => r.pts, render: cell('pts', 'int') },
    { key: 'reb', label: 'REB', align: 'right', sortValue: (r) => r.reb, render: cell('reb', 'int') },
    { key: 'ast', label: 'AST', align: 'right', sortValue: (r) => r.ast, render: cell('ast', 'int') },
    { key: 'stl', label: 'ROB', align: 'right', sortValue: (r) => total(r.spg, r.g), render: totalCell('spg') },
    { key: 'blk', label: 'BLQ', align: 'right', sortValue: (r) => total(r.bpg, r.g), render: totalCell('bpg') },
    { key: 'to', label: 'PÉR', title: 'Pérdidas', align: 'right', sortValue: (r) => total(r.topg, r.g), render: totalCell('topg') },
    { key: 'fg', label: 'TC', title: 'Tiros de campo anotados y tirados', align: 'right', render: (r) => (r.fgm === null || r.fga === null ? DASH : `${fmtInt(r.fgm)}/${fmtInt(r.fga)}`) },
    { key: 'fg3', label: '3P', title: 'Triples anotados y tirados', align: 'right', render: (r) => (absent.has('fg3Pct') ? <NotRecorded /> : r.fg3m === null || r.fg3a === null ? DASH : `${fmtInt(r.fg3m)}/${fmtInt(r.fg3a)}`) },
    { key: 'ft', label: 'TL', title: 'Tiros libres anotados y tirados', align: 'right', render: (r) => (r.ftm === null || r.fta === null ? DASH : `${fmtInt(r.ftm)}/${fmtInt(r.fta)}`) },
  ];

  return (
    <div>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] md:mb-[16px]">
        <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">Temporada por temporada</h2>
        <div role="radiogroup" aria-label="Vista" className="flex gap-[8px]">
          {(
            [
              ['avg', 'Promedios'],
              ['total', 'Totales'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={view === k} data-selected={view === k ? '' : undefined} onClick={() => setView(k)} className={TAB_PILL}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <StatsTable columns={[...base, ...(view === 'avg' ? avgCols : totalCols)]} rows={rows} rowKey={(r) => `${r.year}-${r.phase}-${r.teamIndex}-${r.teamName}`} caption="Temporada por temporada" zebra={rows.length > 12} footnote={footnote?.length ? footnote.map((f) => <span key={f} className="block">{f}</span>) : undefined} />
      {others.length ? (
        <details className="group mt-[12px]">
          <summary className={`inline-block cursor-pointer list-none rounded-[4px] ${cls.textLink} ${cls.focus} [&::-webkit-details-marker]:hidden`}>
            <span className="group-open:hidden">Ver All-Star y otros eventos ({others.length})</span>
            <span className="hidden group-open:inline">Ocultar All-Star y otros eventos</span>
          </summary>
          <div className="mt-[12px]">
            <StatsTable columns={[...base, ...avgCols]} rows={[...others].sort((a, b) => b.year - a.year)} rowKey={(r) => `${r.year}-${r.phaseLabel}-${r.teamName}`} caption="All-Star y otros eventos" />
          </div>
        </details>
      ) : null}
    </div>
  );
}
