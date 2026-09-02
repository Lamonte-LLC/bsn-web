'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import type { CareerTotals, StatLine } from '@/archivo/lib/types';

interface Props {
  lines: { regular: StatLine[]; playoffs: StatLine[]; other: StatLine[] };
  totals: { regular: CareerTotals; playoffs: CareerTotals };
  franchises: Record<string, FranchiseView>;
}

type Row = { key: string; label: string; year: number | null; line: StatLine | CareerTotals; franchiseSlug: string | null; teamName: string | null; phaseLabel: string | null; isTotal: boolean };

const TAB_CLS = 'cursor-pointer rounded-[100px] border border-[#D5D5D5] bg-white px-[16px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] outline-none data-selected:border-[#0F171F] data-selected:bg-[#0F171F] data-selected:text-white';

function buildRows(lines: StatLine[], totals: CareerTotals | null, withPhase: boolean): Row[] {
  const rows: Row[] = lines.map((l, i) => ({
    key: `${l.year}-${l.teamIndex}-${l.phaseLabel}-${i}`,
    label: withPhase ? `${l.year} · ${l.phaseLabel}` : String(l.year),
    year: l.year,
    line: l,
    franchiseSlug: l.franchiseSlug,
    teamName: l.teamName,
    phaseLabel: l.phaseLabel,
    isTotal: false,
  }));
  if (totals && totals.g) rows.push({ key: 'total', label: 'Total', year: null, line: totals, franchiseSlug: null, teamName: null, phaseLabel: null, isTotal: true });
  return rows;
}

export default function PlayerSeasonTabs({ lines, totals, franchises }: Props) {
  const num = (key: keyof CareerTotals) => (r: Row) => (r.isTotal ? null : (r.line[key] as number | null));
  const columns: StatsColumn<Row>[] = [
    {
      key: 'year',
      label: 'Temporada',
      sticky: true,
      sortValue: (r) => r.year,
      render: (r) =>
        r.year ? (
          <Link href={`/archivo/temporadas/${r.year}`} className="text-[15px] text-[rgba(15,23,31,0.9)] hover:underline">
            {r.label}
          </Link>
        ) : (
          <span className="text-[15px]">{r.label}</span>
        ),
    },
    {
      key: 'team',
      label: 'Equipo',
      render: (r) => {
        const f = r.franchiseSlug ? franchises[r.franchiseSlug] : null;
        if (!r.teamName) return '';
        const inner = (
          <span className="inline-flex items-center gap-[6px]">
            <FranchiseLogo franchise={f} fallbackName={r.teamName} size="chip" />
            <span>{f?.nickname ?? r.teamName}</span>
          </span>
        );
        return f ? (
          <Link href={`/archivo/franquicias/${f.slug}`} className="hover:underline">
            {inner}
          </Link>
        ) : (
          inner
        );
      },
    },
    { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: num('g'), render: (r) => fmtInt(r.line.g) },
    { key: 'ppg', label: 'PPJ', title: 'Puntos por juego', align: 'right', sortValue: num('ppg'), render: (r) => fmt(r.line.ppg) },
    { key: 'rpg', label: 'RPJ', title: 'Rebotes por juego', align: 'right', sortValue: num('rpg'), render: (r) => fmt(r.line.rpg) },
    { key: 'apg', label: 'APJ', title: 'Asistencias por juego', align: 'right', sortValue: num('apg'), render: (r) => fmt(r.line.apg) },
    { key: 'spg', label: 'ROB', title: 'Robos por juego', align: 'right', sortValue: (r) => ('spg' in r.line ? r.line.spg : null), render: (r) => ('spg' in r.line ? fmt(r.line.spg) : '–') },
    { key: 'bpg', label: 'BLQ', title: 'Bloqueos por juego', align: 'right', sortValue: (r) => ('bpg' in r.line ? r.line.bpg : null), render: (r) => ('bpg' in r.line ? fmt(r.line.bpg) : '–') },
    { key: 'fgPct', label: 'TC%', title: 'Tiros de campo', align: 'right', sortValue: num('fgPct'), render: (r) => fmtPct(r.line.fgPct) },
    { key: 'fg3Pct', label: '3P%', title: 'Triples', align: 'right', sortValue: num('fg3Pct'), render: (r) => fmtPct(r.line.fg3Pct) },
    { key: 'ftPct', label: 'TL%', title: 'Tiros libres', align: 'right', sortValue: num('ftPct'), render: (r) => fmtPct(r.line.ftPct) },
    { key: 'pts', label: 'PTS', align: 'right', sortValue: num('pts'), render: (r) => fmtInt(r.line.pts) },
    { key: 'reb', label: 'REB', align: 'right', sortValue: num('reb'), render: (r) => fmtInt(r.line.reb) },
    { key: 'ast', label: 'AST', align: 'right', sortValue: num('ast'), render: (r) => fmtInt(r.line.ast) },
  ];

  const panels = [
    { name: 'Serie Regular', rows: buildRows(lines.regular, totals.regular, false) },
    { name: 'Postemporada', rows: buildRows(lines.playoffs, totals.playoffs, true) },
    { name: 'Otros', rows: buildRows(lines.other, null, true) },
  ].filter((p) => p.rows.length > 0);

  if (!panels.length) return <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">No hay datos disponibles.</p>;

  return (
    <TabGroup>
      <TabList className="mb-[16px] flex flex-wrap gap-[8px]">
        {panels.map((p) => (
          <Tab key={p.name} className={TAB_CLS}>
            {p.name}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {panels.map((p) => (
          <TabPanel key={p.name}>
            <StatsTable columns={columns} rows={p.rows} rowKey={(r) => r.key} emphasize={(r) => r.isTotal} caption={`Estadísticas de ${p.name}`} />
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
