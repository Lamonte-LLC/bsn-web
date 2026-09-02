'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { NotRecorded } from '@/archivo/components/ui';
import { fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { CareerTotals, StatLine } from '@/archivo/lib/types';

interface Props {
  lines: { regular: StatLine[]; playoffs: StatLine[]; other: StatLine[] };
  totals: { regular: CareerTotals; playoffs: CareerTotals };
  franchises: Record<string, FranchiseView>;
  /** Era note rendered inside the table card for careers that predate consistent record keeping. */
  footnote?: string;
}

type Row = { key: string; label: string; year: number | null; line: StatLine | CareerTotals; franchiseSlug: string | null; teamName: string | null; phaseLabel: string | null; isTotal: boolean; seasons: number };

type NumKey = 'g' | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'fgPct' | 'fg3Pct' | 'ftPct' | 'pts' | 'reb' | 'ast';

function buildRows(lines: StatLine[], totals: CareerTotals | null, withPhase: boolean): Row[] {
  const seasons = new Set(lines.map((l) => l.year)).size;
  const rows: Row[] = lines.map((l, i) => ({
    key: `${l.year}-${l.teamIndex}-${l.phaseLabel}-${i}`,
    label: withPhase ? `${l.year} · ${l.phaseLabel}` : String(l.year),
    year: l.year,
    line: l,
    franchiseSlug: l.franchiseSlug,
    teamName: l.teamName,
    phaseLabel: l.phaseLabel,
    isTotal: false,
    seasons,
  }));
  if (totals && totals.g) rows.push({ key: 'total', label: 'Total', year: null, line: totals, franchiseSlug: null, teamName: null, phaseLabel: null, isTotal: true, seasons });
  return rows;
}

/** Season-by-season table with Serie Regular, Postemporada and Otros as pill tabs; tabs without lines are disabled. */
export default function PlayerSeasonTabs({ lines, totals, franchises, footnote }: Props) {
  const panels = [
    { name: 'Serie Regular', rows: buildRows(lines.regular, totals.regular, false), lines: lines.regular },
    { name: 'Postemporada', rows: buildRows(lines.playoffs, totals.playoffs, true), lines: lines.playoffs },
    { name: 'Otros', rows: buildRows(lines.other, null, true), lines: lines.other },
  ];

  const columnsFor = (source: StatLine[]): StatsColumn<Row>[] => {
    // A stat that no line of this phase records is "no registrado" for the whole era, not a row-level gap.
    const absent = new Set<NumKey>();
    for (const k of ['rpg', 'apg', 'spg', 'bpg', 'fgPct', 'fg3Pct', 'ftPct', 'reb', 'ast'] as NumKey[]) {
      if (source.length && source.every((l) => l[k] === null)) absent.add(k);
    }
    const value = (key: NumKey) => (r: Row) => (key in r.line ? ((r.line as unknown as Record<string, number | null>)[key] ?? null) : null);
    const num = (key: NumKey, kind: 'int' | 'avg' | 'pct') => (r: Row) => {
      if (absent.has(key)) return r.isTotal ? '–' : <NotRecorded />;
      const v = value(key)(r);
      return kind === 'int' ? fmtInt(v) : kind === 'pct' ? fmtPct(v) : fmt(v);
    };
    const sort = (key: NumKey) => (r: Row) => (r.isTotal ? null : value(key)(r));
    return [
      {
        key: 'year',
        label: (
          <>
            <span className="md:hidden">Temp.</span>
            <span className="hidden md:inline">Temporada</span>
          </>
        ),
        sticky: true,
        sortValue: (r) => r.year,
        initialSort: 'asc',
        render: (r) =>
          r.year ? (
            <Link href={`/archivo/temporadas/${r.year}`} className={`font-semibold text-[#0F171F] ${cls.dataLink}`}>
              {r.label}
            </Link>
          ) : (
            <span className="font-bold">{r.label}</span>
          ),
      },
      {
        key: 'team',
        label: 'Equipo',
        render: (r) => {
          if (r.isTotal) return <span className="font-medium text-[13px] text-[rgba(0,0,0,0.5)]">{r.seasons} temporada{r.seasons === 1 ? '' : 's'}</span>;
          const f = r.franchiseSlug ? franchises[r.franchiseSlug] : null;
          if (!r.teamName) return '';
          const inner = (
            <span className="inline-flex items-center gap-[7px] font-medium">
              <FranchiseLogo franchise={f} fallbackName={r.teamName} size="chip" />
              <span>{f?.nickname ?? r.teamName}</span>
            </span>
          );
          return f ? (
            <Link href={`/archivo/franquicias/${f.slug}`} className="transition-colors duration-150 hover:text-[rgba(0,0,0,0.65)]">
              {inner}
            </Link>
          ) : (
            inner
          );
        },
      },
      { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: sort('g'), render: num('g', 'int') },
      { key: 'ppg', label: 'PPJ', title: 'Puntos por juego', align: 'right', strong: true, sortValue: sort('ppg'), render: num('ppg', 'avg') },
      { key: 'rpg', label: 'RPJ', title: 'Rebotes por juego', align: 'right', sortValue: sort('rpg'), render: num('rpg', 'avg') },
      { key: 'apg', label: 'APJ', title: 'Asistencias por juego', align: 'right', sortValue: sort('apg'), render: num('apg', 'avg') },
      { key: 'spg', label: 'ROB', title: 'Robos por juego', align: 'right', sortValue: sort('spg'), render: num('spg', 'avg') },
      { key: 'bpg', label: 'BLQ', title: 'Bloqueos por juego', align: 'right', sortValue: sort('bpg'), render: num('bpg', 'avg') },
      { key: 'fgPct', label: 'TC%', title: 'Tiros de campo', align: 'right', sortValue: sort('fgPct'), render: num('fgPct', 'pct') },
      { key: 'fg3Pct', label: '3P%', title: 'Triples', align: 'right', sortValue: sort('fg3Pct'), render: num('fg3Pct', 'pct') },
      { key: 'ftPct', label: 'TL%', title: 'Tiros libres', align: 'right', sortValue: sort('ftPct'), render: num('ftPct', 'pct') },
      { key: 'pts', label: 'PTS', title: 'Puntos', align: 'right', sortValue: sort('pts'), render: num('pts', 'int') },
      { key: 'reb', label: 'REB', title: 'Rebotes', align: 'right', sortValue: sort('reb'), render: num('reb', 'int') },
      { key: 'ast', label: 'AST', title: 'Asistencias', align: 'right', sortValue: sort('ast'), render: num('ast', 'int') },
    ];
  };

  return (
    <TabGroup>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] md:mb-[16px]">
        <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">Temporada por temporada</h2>
        <TabList className="flex flex-wrap gap-[8px]">
          {panels.map((p) => (
            <Tab key={p.name} className={TAB_PILL} disabled={p.rows.length === 0}>
              {p.name}
            </Tab>
          ))}
        </TabList>
      </div>
      <TabPanels>
        {panels.map((p) => (
          <TabPanel key={p.name}>
            <StatsTable columns={columnsFor(p.lines)} rows={p.rows} rowKey={(r) => r.key} emphasize={(r) => r.isTotal} caption={`Estadísticas de ${p.name}`} zebra={p.rows.length > 12} footnote={footnote} emptyMessage="No hay datos disponibles." />
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
