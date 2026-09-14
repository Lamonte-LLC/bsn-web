'use client';

import { useId, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmt } from '../lib/format';
import type { FranchiseView } from '../lib/franchise-view';
import { cls } from '../lib/tokens';
import type { CareerArcPoint } from '../lib/types';
import FranchiseLogo from './FranchiseLogo';
import { TAB_PILL } from './Tabs';
import { ContainerTitle, Note, Skeleton } from './ui';

export interface ArcPlayer {
  id: string;
  name: string;
  /** Color per player (not per franchise) so the line stays continuous across teams. */
  color: string;
  arc: CareerArcPoint[];
  peakSeason: number | null;
}

type StatKey = 'ppg' | 'rpg' | 'apg';
const STATS: Array<{ key: StatKey; label: string; unit: string }> = [
  { key: 'ppg', label: 'Puntos', unit: 'PPJ' },
  { key: 'rpg', label: 'Rebotes', unit: 'RPJ' },
  { key: 'apg', label: 'Asistencias', unit: 'APJ' },
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
const AXIS = { fontSize: 10, fontFamily: 'var(--font-barlow)', fill: 'rgba(0,0,0,0.4)' } as const;

/**
 * Career arc: one line per player (up to 3), x = season number so careers from different eras align, with a
 * toggle to calendar year. Nulls break the line (no interpolation). The peak season (points view) gets a large
 * dot with its value; a change of franchise gets a hollow marker. The only chart in the archive.
 */
export default function CareerArcChart({ players, franchises, stat: initialStat = 'ppg', className = '' }: Props) {
  const [stat, setStat] = useState<StatKey>(initialStat);
  const [byYear, setByYear] = useState(false);
  const id = useId();
  const eligible = useMemo(() => players.filter((p) => p.arc.length >= MIN_SEASONS).slice(0, 3), [players]);
  const unit = STATS.find((s) => s.key === stat)!.unit;

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
  // Season ticks every 4 (1, 5, 9…) plus the last one; calendar ticks let Recharts pick.
  const seasonTicks = (() => {
    const t: number[] = [];
    for (let s = 1; s <= maxSeasons; s += 4) t.push(s);
    if (maxSeasons - t[t.length - 1] >= 3) t.push(maxSeasons);
    return t;
  })();

  const renderDot = (playerIndex: number) => {
    const p = eligible[playerIndex];
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
            <circle cx={cx} cy={cy} r={5.5} fill={p.color} />
            <text x={cx} y={cy - 11} textAnchor="middle" fontSize={11.5} fontFamily="var(--font-barlow)" fontWeight={600} fill={p.color}>
              {fmt(value)}
            </text>
          </g>
        );
      }
      if (changed) return <circle key={`${playerIndex}-${cx}`} cx={cx} cy={cy} r={4} fill="#fff" stroke={p.color} strokeWidth={2} />;
      return <circle key={`${playerIndex}-${cx}`} cx={cx} cy={cy} r={2.3} fill={p.color} />;
    };
    return Dot;
  };

  const TooltipContent = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload as Row;
    return (
      <div className="rounded-[9px] border border-[rgba(0,0,0,0.1)] bg-white px-[14px] py-[10px] font-barlow shadow-[0_8px_28px_rgba(15,23,31,0.12)]">
        {eligible.map((p, i) => {
          const pt = row[`m${i}`] as CareerArcPoint | undefined;
          if (!pt) return null;
          const f = pt.franchiseSlug ? franchises[pt.franchiseSlug] : null;
          return (
            <div key={p.id} className="py-[3px]">
              <div className="flex items-center gap-[6px] text-[12px] font-semibold text-[#0F171F]">
                {eligible.length > 1 ? <span aria-hidden className="h-[3px] w-[10px] rounded-[2px]" style={{ background: p.color }} /> : null}
                {pt.year} · {f?.nickname ?? 'Sin franquicia'}
              </div>
              <div className={`mt-[4px] flex items-center gap-[7px] text-[12px] text-[rgba(0,0,0,0.65)] ${cls.tabular}`}>
                <FranchiseLogo franchise={f} fallbackName={pt.franchiseSlug ?? ''} sizePx={16} />
                {fmt(pt[stat])} {unit} · {pt.g} J
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      <ContainerTitle>Arco de carrera</ContainerTitle>
      <div className="mt-[12px] flex flex-wrap items-center justify-between gap-[10px]">
        <div role="radiogroup" aria-label="Estadística" className="flex flex-wrap gap-[8px]">
          {STATS.map((s) => (
            <button key={s.key} type="button" role="radio" aria-checked={stat === s.key} data-selected={stat === s.key ? '' : undefined} onClick={() => setStat(s.key)} className={`${TAB_PILL} !text-[14px] md:!text-[15px]`}>
              {s.label}
            </button>
          ))}
        </div>
        <label className={`inline-flex min-h-[28px] cursor-pointer items-center gap-[8px] font-barlow text-[13px] font-medium text-[rgba(0,0,0,0.6)] ${cls.focus} rounded-[4px]`}>
          <input type="checkbox" checked={byYear} onChange={(e) => setByYear(e.target.checked)} className="h-[15px] w-[15px] cursor-pointer rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.3)] text-[#0F171F] focus:ring-0 focus:ring-offset-0" />
          Por año calendario
        </label>
      </div>

      {eligible.length > 1 ? (
        <ul className="mt-[12px] flex flex-wrap gap-x-[16px] gap-y-[6px]">
          {eligible.map((p) => (
            <li key={p.id} className="inline-flex items-center gap-[6px] font-barlow text-[12.5px] font-medium text-[rgba(0,0,0,0.7)]">
              <span aria-hidden className="h-[3px] w-[14px] rounded-[2px]" style={{ background: p.color }} />
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}

      {!hasData ? (
        <div className={`${cls.card} mt-[14px] flex h-[170px] items-center justify-center px-[20px] text-center font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.5)]`}>Esta estadística no se registró durante la carrera de este jugador.</div>
      ) : (
        <div className={`${cls.card} mt-[14px] h-[264px] w-full px-[10px] pb-[4px] pt-[14px] md:h-[346px] md:px-[16px] md:pb-[8px] md:pt-[18px]`} aria-describedby={`${id}-desc`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 18, right: 10, bottom: 8, left: -22 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                ticks={byYear ? undefined : seasonTicks}
                tickCount={byYear ? 6 : undefined}
                interval={byYear ? 'preserveStartEnd' : 0}
                tick={AXIS}
                tickLine={false}
                axisLine={false}
                label={byYear ? undefined : { value: 'Temporada', position: 'insideBottomRight', offset: -6, fontSize: 9, fontFamily: 'var(--font-barlow)', fill: 'rgba(0,0,0,0.35)' }}
              />
              <YAxis domain={[0, 'auto']} tickCount={5} tick={AXIS} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={TooltipContent} cursor={{ stroke: 'rgba(0,0,0,0.12)' }} isAnimationActive={false} />
              {eligible.map((p, i) => (
                <Line key={p.id} type="linear" dataKey={`v${i}`} name={p.name} stroke={p.color} strokeWidth={2} connectNulls={false} dot={renderDot(i)} activeDot={{ r: 4.5, strokeWidth: 0 }} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <Note id={`${id}-desc`} className="mt-[14px] !max-w-none">
        Serie Regular. El punto grande marca la mejor temporada en puntos; el punto hueco, un cambio de franquicia. Las líneas se cortan donde la estadística no se registró.
      </Note>
    </div>
  );
}

/** Loading footprint of the chart. */
export function CareerArcSkeleton() {
  return (
    <div>
      <ContainerTitle>Arco de carrera</ContainerTitle>
      <div className={`${cls.card} mt-[14px] p-[20px]`}>
        <Skeleton rows={5} />
      </div>
    </div>
  );
}
