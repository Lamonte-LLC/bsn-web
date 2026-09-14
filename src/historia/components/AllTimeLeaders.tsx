'use client';

import { useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { Button, Note } from '@/archivo/components/ui';
import { fmtInt, yearsLabel } from '@/archivo/lib/format';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import type { CareerLeader, CareerLeaderKey } from '../lib/data';

const CATEGORIES: Array<{ key: CareerLeaderKey; label: string; unit: string }> = [
  { key: 'pts', label: 'Puntos', unit: 'PTS' },
  { key: 'reb', label: 'Rebotes', unit: 'REB' },
  { key: 'ast', label: 'Asistencias', unit: 'AST' },
  { key: 'g', label: 'Juegos', unit: 'J' },
  { key: 'seasons', label: 'Temporadas', unit: 'TEMP.' },
];
const FIRST = 25;

interface Props {
  leaders: Record<CareerLeaderKey, CareerLeader[]>;
  /** Archive id → providerId of the players on the 2026 roster. */
  active: Record<string, string>;
  franchises: Record<string, FranchiseView>;
}

type Row = CareerLeader & { rank: number; active: boolean };

/**
 * All-time career leaders inside Estadísticas. Same table component as the rest of the archive; active players
 * are bolder with an "Activo" mark, so the fan sees today's players among the legends.
 */
export default function AllTimeLeaders({ leaders, active, franchises }: Props) {
  const [cat, setCat] = useState<CareerLeaderKey>('pts');
  const [expanded, setExpanded] = useState(false);
  const current = CATEGORIES.find((c) => c.key === cat)!;
  const all: Row[] = leaders[cat].map((l, i) => ({ ...l, rank: i + 1, active: l.playerId in active }));
  const rows = expanded ? all : all.slice(0, FIRST);
  const activeCount = all.filter((r) => r.active).length;

  const cols: StatsColumn<Row>[] = [
    { key: 'rank', label: '#', width: 28, render: (r) => <span className="font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)]">{r.rank}</span> },
    {
      key: 'name',
      label: 'Jugador',
      sticky: true,
      render: (r) => (
        <span className="inline-flex items-center gap-[8px]">
          <Link href={`/jugadores/${r.active ? active[r.playerId] : r.slug}`} className={`${r.active ? 'font-bold' : 'font-semibold'} ${cls.dataLink}`}>
            {r.name}
          </Link>
          {r.active ? <span className={`${cls.label} !text-[9px] !tracking-[0.6px] !text-[#0F171F]`}>Activo</span> : null}
        </span>
      ),
    },
    { key: 'years', label: 'Años', render: (r) => <span className="text-[rgba(0,0,0,0.6)]">{yearsLabel(r.fy, r.active ? 2026 : r.ly)}</span> },
    {
      key: 'teams',
      label: 'Equipos',
      render: (r) => (
        <span className="inline-flex items-center gap-[3px]">
          {r.franchiseSlugs.slice(0, 5).map((s) => (
            <FranchiseLogo key={s} franchise={franchises[s] ?? null} fallbackName={s} sizePx={18} />
          ))}
          {r.franchiseSlugs.length > 5 ? <span className={`ml-[2px] text-[11.5px] font-semibold text-[rgba(0,0,0,0.5)] ${cls.tabular}`}>+{r.franchiseSlugs.length - 5}</span> : null}
        </span>
      ),
    },
    { key: 'value', label: current.unit, align: 'right', strong: true, sortValue: (r) => r.value, initialSort: 'desc', render: (r) => fmtInt(r.value) },
  ];

  return (
    <div>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px] md:mb-[16px]">
        <div role="radiogroup" aria-label="Categoría" className="flex flex-wrap gap-[8px]">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="radio"
              aria-checked={cat === c.key}
              data-selected={cat === c.key ? '' : undefined}
              onClick={() => {
                setCat(c.key);
                setExpanded(false);
              }}
              className={TAB_PILL}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className={`${cls.meta} ${cls.tabular}`}>{activeCount ? `${activeCount} activo${activeCount === 1 ? '' : 's'} en el top ${all.length}` : `Top ${all.length}`}</span>
      </div>
      <StatsTable columns={cols} rows={rows} rowKey={(r) => r.playerId} caption={`Líderes de todos los tiempos en ${current.label.toLowerCase()}`} zebra />
      {!expanded && all.length > FIRST ? (
        <div className="flex justify-center pt-[14px]">
          <Button variant="secondary" onClick={() => setExpanded(true)}>
            Ver los {all.length}
          </Button>
        </div>
      ) : null}
      <Note className="mt-[12px] !max-w-none">Totales de carrera publicados por la liga, Serie Regular, hasta 2023 para los retirados. Los activos siguen sumando y su total se actualiza al cierre de cada temporada.</Note>
    </div>
  );
}
