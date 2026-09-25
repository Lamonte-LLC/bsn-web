'use client';

import { useState } from 'react';
import cx from 'classnames';
import { cls } from '@/archivo/lib/tokens';
import { f1, pct, type SeasonLine } from './profile-data';

const INK = '#0F171F';

type Key = 'ppg' | 'rpg' | 'apg' | 'tp';
const OPTIONS: Array<[Key, string]> = [['ppg', 'Puntos'], ['rpg', 'Rebotes'], ['apg', 'Asistencias'], ['tp', 'Triples %']];

function valueOf(l: SeasonLine, k: Key): number | null {
  const s = l.stats;
  if (k === 'ppg') return s.pointsAvg;
  if (k === 'rpg') return s.reboundsTotalAvg;
  if (k === 'apg') return s.assistsAvg;
  const p = s.threePointersPercentage;
  return p === null ? null : p <= 1 ? p * 100 : p;
}

/**
 * Season by season, regular season only: a line on desktop (the current season marked in red), one horizontal
 * bar per season on phones so every year keeps its label.
 */
/** `accent`: the club color the player is identified with; it marks the current season and the chosen stat. */
export default function SeasonTrend({ lines, accent }: { lines: SeasonLine[]; accent: string }) {
  const [key, setKey] = useState<Key>('ppg');
  const rows = [...lines].sort((a, b) => a.year - b.year).map((l) => ({ year: l.year, v: valueOf(l, key) ?? 0 }));
  if (rows.length < 2) return null;
  const fmt = (v: number) => (key === 'tp' ? pct(v) : f1(v));
  const max = Math.max(...rows.map((r) => r.v), 0.1);
  const last = rows.length - 1;
  // Desktop line: viewBox width fixed, the svg scales to the card.
  const W = 1000;
  const H = 120;
  const step = W / last;
  const y = (v: number) => H - (v / (max * 1.15)) * (H - 24) - 6;
  const path = rows.map((r, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${y(r.v).toFixed(1)}`).join(' ');
  return (
    <div className="rounded-[12px] border border-[rgba(15,23,31,0.08)] bg-white px-[14px] py-[14px] lg:px-[20px] lg:py-[18px]">
      <div className="mb-[16px] flex flex-col gap-[10px] lg:flex-row lg:items-baseline lg:justify-between lg:gap-[16px]">
        <span className="text-[18px] leading-[1.1] text-[#0F171F]">Temporada a temporada</span>
        {/* Third-level choice: words in a row, the chosen one in ink with a red underline. No borders, so it never reads like the pills above. */}
        <div role="radiogroup" aria-label="Estadística" className="flex gap-[14px] lg:gap-[18px]">
          {OPTIONS.map(([k, l]) => {
            const on = k === key;
            return (
              <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setKey(k)} style={{ '--accent': accent } as React.CSSProperties} className={cx('relative cursor-pointer whitespace-nowrap pb-[6px] font-barlow text-[13px] transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[var(--accent)] after:transition-opacity after:duration-150 after:content-[""] lg:text-[14px]', on ? 'font-bold text-[#0F171F] after:opacity-100' : 'font-medium text-[rgba(15,23,31,0.5)] after:opacity-0 hover:text-[#0F171F]', cls.focus, 'rounded-[3px] focus-visible:outline-offset-[3px]')}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
      {/* Phones: one bar per season. */}
      <div className="flex flex-col gap-[7px] lg:hidden">
        {rows.map((r, i) => (
          <div key={r.year} className="grid grid-cols-[40px_1fr_44px] items-center gap-[10px]">
            <span className={cx('font-barlow text-[12px] tabular-nums', i === last ? 'font-bold text-[#0F171F]' : 'font-semibold text-[rgba(15,23,31,0.5)]')}>{r.year}</span>
            <div className="h-[12px] rounded-[6px] bg-[#EEF0F3]"><div className="h-full rounded-[6px]" style={{ width: `${(r.v / max) * 100}%`, background: i === last ? accent : INK }} /></div>
            <span className="text-right text-[16px] leading-none text-[#0F171F] tabular-nums">{fmt(r.v)}</span>
          </div>
        ))}
      </div>
      {/* Desktop: the line. */}
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="hidden w-full overflow-visible lg:block" role="img" aria-label={`${OPTIONS.find((o) => o[0] === key)?.[1]} por temporada`}>
        <path d={`${path} L${(last * step).toFixed(1)} ${H} L0 ${H} Z`} fill="rgba(15,23,31,0.05)" />
        <path d={path} fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {rows.map((r, i) => (
          <g key={r.year}>
            <circle cx={i * step} cy={y(r.v)} r={i === last ? 5 : 3} fill={i === last ? accent : '#fff'} stroke={i === last ? accent : INK} strokeWidth="2" />
            <text x={i * step} y={H + 18} textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'} fontFamily="Barlow" fontSize="11" fontWeight="600" fill={i === last ? INK : 'rgba(15,23,31,0.45)'}>{r.year}</text>
            <text x={i * step} y={y(r.v) - 12} textAnchor={i === last ? 'end' : 'middle'} fontFamily="Special Gothic Condensed One" fontSize="15" fill={INK}>{fmt(r.v)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
