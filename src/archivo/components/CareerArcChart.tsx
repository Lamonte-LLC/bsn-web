'use client';

import { useId, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import FranchiseLogo from './FranchiseLogo';
import { TAB_PILL } from './Tabs';
import { fmt } from '../lib/format';
import type { FranchiseView } from '../lib/franchise-view';
import type { CareerArcPoint } from '../lib/types';

export interface ArcPlayer {
  id: string;
  name: string;
  /** Color per player (not per franchise) so the line stays continuous across teams. */
  color: string;
  arc: CareerArcPoint[];
  peakSeason: number | null;
}

type StatKey = 'ppg' | 'rpg' | 'apg';
const STATS: Array<{ key: StatKey; label: string }> = [
  { key: 'ppg', label: 'Puntos' },
  { key: 'rpg', label: 'Rebotes' },
  { key: 'apg', label: 'Asistencias' },
];

interface Row {
  x: number;
  [key: string]: number | null | CareerArcPoint | undefined;
}

interface Props {
  players: ArcPlayer[];
  franchises: Record<string, FranchiseView>;
  stat?: StatKey;
  className?: string;
}

const MIN_SEASONS = 3;

/**
 * Career arc: one line per player (up to 3), x = season number so careers from different eras align,
 * toggle to calendar year. Nulls break the line (no interpolation). Peak season gets a larger dot with its
 * value; a change of franchise gets a hollow marker.
 */
export default function CareerArcChart({ players, franchises, stat: initialStat = 'ppg', className = '' }: Props) {
  const [stat, setStat] = useState<StatKey>(initialStat);
  const [byYear, setByYear] = useState(false);
  const id = useId();
  const eligible = players.filter((p) => p.arc.length >= MIN_SEASONS).slice(0, 3);

  const rows = useMemo<Row[]>(() => {
    const map = new Map<number, Row>();
    eligible.forEach((p, i) => {
      for (const pt of p.arc) {
        const x = byYear ? pt.year : pt.seasonNumber;
        const row = map.get(x) ?? { x };
        row[`v${i}`] = pt[stat];
        row[`m${i}`] = pt;
        map.set(x, row);
      }
    });
    return [...map.values()].sort((a, b) => a.x - b.x);
  }, [eligible, stat, byYear]);

  if (!eligible.length) return null;
  const hasData = eligible.some((p) => p.arc.some((pt) => pt[stat] !== null));
  const maxSeasons = Math.max(...eligible.map((p) => p.arc.length));

  const renderDot = (playerIndex: number) => {
    const p = eligible[playerIndex];
    // Recharts passes a props bag; we only need the coordinates and the row payload.
    const Dot = (props: { cx?: number; cy?: number; payload?: Row; value?: number | null }) => {
      const { cx, cy, payload, value } = props;
      if (cx === undefined || cy === undefined || value === null || value === undefined || !payload) return <g key={`${playerIndex}-${cx}`} />;
      const pt = payload[`m${playerIndex}`] as CareerArcPoint | undefined;
      if (!pt) return <g key={`${playerIndex}-${cx}`} />;
      const isPeak = stat === 'ppg' && p.peakSeason === pt.seasonNumber;
      const prev = p.arc.find((a) => a.seasonNumber === pt.seasonNumber - 1);
      const changed = prev !== undefined && prev.franchiseSlug !== pt.franchiseSlug;
      if (isPeak) {
        return (
          <g key={`${playerIndex}-${cx}`}>
            <circle cx={cx} cy={cy} r={6} fill={p.color} stroke="#fff" strokeWidth={2} />
            <text x={cx} y={cy - 11} textAnchor="middle" fontSize={12} fontFamily="var(--font-barlow)" fontWeight={600} fill={p.color}>
              {fmt(value)}
            </text>
          </g>
        );
      }
      if (changed) return <circle key={`${playerIndex}-${cx}`} cx={cx} cy={cy} r={4} fill="#fff" stroke={p.color} strokeWidth={2} />;
      return <circle key={`${playerIndex}-${cx}`} cx={cx} cy={cy} r={2.5} fill={p.color} />;
    };
    return Dot;
  };

  // Typed against the subset of Recharts' tooltip props we read, so it stays compatible with its generics.
  const TooltipContent = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload as Row;
    return (
      <div className="rounded-[8px] border border-[#E2E2E2] bg-white px-[10px] py-[8px] font-barlow text-[13px] shadow-[0px_1px_15px_0px_#5858581A]">
        {eligible.map((p, i) => {
          const pt = row[`m${i}`] as CareerArcPoint | undefined;
          if (!pt) return null;
          const f = pt.franchiseSlug ? franchises[pt.franchiseSlug] : null;
          return (
            <div key={p.id} className="flex items-center gap-[8px] py-[2px]">
              <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: p.color }} />
              <span className="w-[42px] text-[rgba(15,23,31,0.6)]">{pt.year}</span>
              <FranchiseLogo franchise={f} fallbackName={pt.franchiseSlug ?? ''} sizePx={16} />
              <span className="text-[rgba(15,23,31,0.8)]">{f?.nickname ?? '–'}</span>
              <span className="ml-auto font-semibold text-[rgba(15,23,31,0.9)] [font-variant-numeric:tabular-nums]">{fmt(pt[stat])}</span>
              <span className="text-[rgba(15,23,31,0.5)]">{pt.g} j</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[8px]">
        <div role="radiogroup" aria-label="Estadística" className="flex flex-wrap gap-[6px]">
          {STATS.map((s) => (
            <button key={s.key} type="button" role="radio" aria-checked={stat === s.key} data-selected={stat === s.key ? '' : undefined} onClick={() => setStat(s.key)} className={TAB_PILL}>
              {s.label}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-[8px] font-barlow text-[13px] text-[rgba(15,23,31,0.7)]">
          <input type="checkbox" checked={byYear} onChange={(e) => setByYear(e.target.checked)} className="h-[16px] w-[16px] rounded-[4px] border-[#D5D5D5] text-[#0F171F] focus:ring-[#0F171F]" />
          Por año calendario
        </label>
      </div>

      {eligible.length > 1 ? (
        <ul className="mb-[8px] flex flex-wrap gap-[14px]">
          {eligible.map((p) => (
            <li key={p.id} className="inline-flex items-center gap-[6px] font-barlow text-[13px] text-[rgba(15,23,31,0.8)]">
              <span className="h-[3px] w-[18px] rounded-full" style={{ background: p.color }} />
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}

      {!hasData ? (
        <p className="rounded-[12px] border border-[#EAEAEA] bg-white px-4 py-6 font-barlow text-[15px] text-[rgba(15,23,31,0.7)]">Esta estadística no se registró durante la carrera de este jugador.</p>
      ) : (
        <div className="h-[240px] w-full rounded-[12px] border border-[#EAEAEA] bg-white p-[8px] md:h-[320px]" aria-describedby={`${id}-desc`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 18, right: 12, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                interval="preserveStartEnd"
                tickCount={byYear ? 6 : Math.min(maxSeasons, 8)}
                tick={{ fontSize: 12, fontFamily: 'var(--font-barlow)', fill: 'rgba(15,23,31,0.55)' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.12)' }}
                label={byYear ? undefined : { value: 'Temporada', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: 'rgba(15,23,31,0.45)' }}
              />
              <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-barlow)', fill: 'rgba(15,23,31,0.55)' }} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={TooltipContent} cursor={{ stroke: 'rgba(0,0,0,0.15)' }} />
              {eligible.map((p, i) => (
                <Line key={p.id} type="monotone" dataKey={`v${i}`} name={p.name} stroke={p.color} strokeWidth={2} connectNulls={false} dot={renderDot(i)} activeDot={{ r: 5 }} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p id={`${id}-desc`} className="mt-[8px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">
        Serie Regular. El punto grande marca la mejor temporada en puntos; el punto hueco, un cambio de franquicia. Las líneas se cortan donde la estadística no se registró.
      </p>
    </div>
  );
}
