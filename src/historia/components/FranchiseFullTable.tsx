'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Button } from '@/archivo/components/ui';
import { fmt, fmtInt, yearsLabel } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchiseCareerRow } from '@/historia/lib/franchise-stats';

const FIRST = 25;
const pctOrDash = (v: number | null) => (v === null ? '–' : fmt(v));

/** The complete career table of a franchise: one row per player, every stat the archive holds, sortable. */
export default function FranchiseFullTable({ rows, nickname }: { rows: FranchiseCareerRow[]; nickname: string }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rows : rows.slice(0, FIRST);
  const cols: StatsColumn<FranchiseCareerRow>[] = [
    { key: 'name', label: 'Jugador', sticky: true, sortValue: (r) => r.name, render: (r) => <Link href={`/jugadores/${r.slug}`} className={`font-semibold ${cls.dataLink}`}>{r.name}</Link> },
    { key: 'years', label: 'Años', hideBelowMd: true, sortValue: (r) => r.fy, render: (r) => <span className="text-[rgba(0,0,0,0.6)]">{yearsLabel(r.fy, r.ly)}</span> },
    { key: 'seasons', label: 'Temp.', align: 'right', sortValue: (r) => r.seasons, render: (r) => String(r.seasons) },
    { key: 'g', label: 'J', align: 'right', sortValue: (r) => r.g, render: (r) => fmtInt(r.g) },
    { key: 'pts', label: 'PTS', align: 'right', strong: true, sortValue: (r) => r.pts, initialSort: 'desc', render: (r) => fmtInt(r.pts) },
    { key: 'reb', label: 'REB', align: 'right', sortValue: (r) => r.reb, render: (r) => (r.reb === null ? '–' : fmtInt(r.reb)) },
    { key: 'ast', label: 'AST', align: 'right', sortValue: (r) => r.ast, render: (r) => (r.ast === null ? '–' : fmtInt(r.ast)) },
    { key: 'ppg', label: 'PPJ', align: 'right', sortValue: (r) => r.ppg, render: (r) => fmt(r.ppg) },
    { key: 'rpg', label: 'RPJ', align: 'right', sortValue: (r) => r.rpg, render: (r) => pctOrDash(r.rpg) },
    { key: 'apg', label: 'APJ', align: 'right', sortValue: (r) => r.apg, render: (r) => pctOrDash(r.apg) },
    { key: 'fgPct', label: 'TC%', align: 'right', sortValue: (r) => r.fgPct, render: (r) => pctOrDash(r.fgPct) },
    { key: 'fg3Pct', label: '3P%', align: 'right', sortValue: (r) => r.fg3Pct, render: (r) => pctOrDash(r.fg3Pct) },
    { key: 'ftPct', label: 'TL%', align: 'right', sortValue: (r) => r.ftPct, render: (r) => pctOrDash(r.ftPct) },
  ];
  return (
    <div>
      <StatsTable columns={cols} rows={shown} rowKey={(r) => r.playerId} caption={`Estadísticas de carrera con ${nickname}, serie regular`} zebra />
      {!expanded && rows.length > FIRST ? (
        <div className="flex justify-center pt-[14px]">
          <Button variant="secondary" onClick={() => setExpanded(true)}>
            Ver los {fmtInt(rows.length)} jugadores
          </Button>
        </div>
      ) : null}
    </div>
  );
}
