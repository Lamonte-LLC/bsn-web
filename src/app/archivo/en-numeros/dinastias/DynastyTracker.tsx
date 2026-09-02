'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import type { FranchiseView } from '@/archivo/lib/franchise-view';

export interface DynastyTitle {
  year: number;
  /** franchiseSlug, or "club:<name>" for pre-1946 clubs without a franchise record. */
  key: string;
  franchiseSlug: string | null;
  name: string;
}

// Captions shown for two seconds when the year is reached. Edit freely.
const CAPTIONS: Record<number, string> = {
  1975: 'Vaqueros: cinco al hilo',
  2001: 'Cangrejeros: cuatro seguidos con Julio Toro',
  2009: 'Julio Toro gana su título número doce',
};

const ROW_H = 44;
const ROW_H_MOBILE = 48;
const SPEEDS = [1, 2] as const;
const BASE_MS = 700;

interface Props {
  titles: DynastyTitle[];
  franchises: Record<string, FranchiseView>;
}

export default function DynastyTracker({ titles, franchises }: Props) {
  const years = useMemo(() => titles.map((t) => t.year), [titles]);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const [year, setYear] = useState(maxYear);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const captionTimer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mm = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setReduced(mq.matches);
      setMobile(mm.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    mm.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      mm.removeEventListener('change', sync);
    };
  }, []);

  // Advance one title-year per tick while playing.
  useEffect(() => {
    if (!playing || reduced) return;
    const t = window.setTimeout(() => {
      const idx = years.indexOf(year);
      const next = years[idx + 1];
      if (next === undefined) setPlaying(false);
      else setYear(next);
    }, BASE_MS / speed);
    return () => window.clearTimeout(t);
  }, [playing, reduced, year, years, speed]);

  // Captions for landmark years.
  useEffect(() => {
    const text = CAPTIONS[year];
    if (!text) return;
    setCaption(text);
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
    captionTimer.current = window.setTimeout(() => setCaption(null), 2000);
    return () => {
      if (captionTimer.current) window.clearTimeout(captionTimer.current);
    };
  }, [year]);

  const { ranked, max } = useMemo(() => {
    const counts = new Map<string, { key: string; name: string; franchiseSlug: string | null; count: number; last: number }>();
    for (const t of titles) {
      if (t.year > year) break;
      const e = counts.get(t.key) ?? { key: t.key, name: t.name, franchiseSlug: t.franchiseSlug, count: 0, last: t.year };
      e.count++;
      e.last = t.year;
      counts.set(t.key, e);
    }
    const list = [...counts.values()].sort((a, b) => b.count - a.count || b.last - a.last || a.name.localeCompare(b.name));
    return { ranked: list, max: list[0]?.count ?? 1 };
  }, [titles, year]);

  const visibleCount = mobile ? 6 : 8;
  const rowH = mobile ? ROW_H_MOBILE : ROW_H;
  const rankOf = new Map(ranked.map((r, i) => [r.key, i]));
  // Keep every franchise mounted so bars animate in and out instead of remounting.
  const allKeys = useMemo(() => [...new Set(titles.map((t) => t.key))], [titles]);
  const nameOf = new Map(titles.map((t) => [t.key, t]));
  const champion = titles.find((t) => t.year === year);
  const transition = reduced ? 'none' : 'transform 250ms cubic-bezier(0.4,0,0.2,1), width 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms';

  const jump = (y: number) => {
    setPlaying(false);
    setYear(y);
  };
  const play = () => {
    if (year >= maxYear) setYear(minYear);
    setPlaying(true);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-[8px]">
        {!reduced ? (
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-pressed={playing}
            className="inline-flex h-[40px] min-w-[96px] items-center justify-center gap-[6px] rounded-[100px] border border-[#0F171F] bg-[#0F171F] px-[16px] text-[16px] text-white transition-colors duration-150 hover:bg-[#17222D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F171F]"
          >
            {playing ? 'Pausa' : year >= maxYear ? 'Ver desde 1930' : 'Reproducir'}
          </button>
        ) : null}
        {!reduced ? (
          <div role="radiogroup" aria-label="Velocidad" className="inline-flex overflow-hidden rounded-[100px] border border-[#D5D5D5]">
            {SPEEDS.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)} className={`h-[38px] px-[14px] text-[15px] transition-colors duration-150 ${speed === s ? 'bg-[#0F171F] text-white' : 'bg-white text-[rgba(0,0,0,0.65)] hover:bg-[#FAFAFA]'}`}>
                {s}x
              </button>
            ))}
          </div>
        ) : (
          <label className="inline-flex items-center gap-[8px] font-barlow text-[14px] text-[rgba(15,23,31,0.7)]">
            Año
            <select value={year} onChange={(e) => jump(Number(e.target.value))} className="h-[38px] rounded-[6px] border border-[#D5D5D5] bg-white px-[10px] font-barlow text-[15px] text-[rgba(15,23,31,0.9)]">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="ml-auto font-barlow text-[13px] text-[rgba(15,23,31,0.55)]">{playing ? 'Pausa para tocar una barra' : 'Toca una barra para ir a la franquicia'}</span>
      </div>

      <div className="relative rounded-[12px] border border-[#EAEAEA] bg-white p-[16px] md:p-[24px]">
        <div className="mb-[10px] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-barlow text-[12px] font-semibold uppercase tracking-[1px] text-[rgba(15,23,31,0.55)]">Campeón {year}</p>
            <p className="truncate text-[18px] text-[rgba(15,23,31,0.9)]">{champion?.name ?? '–'}</p>
          </div>
          <div aria-live="polite" className="shrink-0 text-right text-[56px] leading-[0.9] text-black [font-variant-numeric:tabular-nums] md:text-[80px]">
            {year}
          </div>
        </div>

        <div className="relative" style={{ height: visibleCount * rowH }}>
          {allKeys.map((key) => {
            const rank = rankOf.get(key);
            const entry = rank === undefined ? null : ranked[rank];
            const visible = rank !== undefined && rank < visibleCount;
            const t = nameOf.get(key)!;
            const f = t.franchiseSlug ? franchises[t.franchiseSlug] : null;
            const color = f?.colors.primary ?? '#0F171F';
            const y = (visible ? rank! : visibleCount) * rowH;
            const inner = (
              <>
                <FranchiseLogo franchise={f} fallbackName={t.name} sizePx={mobile ? 30 : 32} />
                <span className="relative min-w-0 flex-1">
                  <span className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: `${entry ? Math.max(4, (entry.count / max) * 100) : 0}%`, background: color, opacity: 0.85, transition }} />
                  <span className={`relative flex h-full items-center gap-[8px] pl-[10px] ${mobile ? 'text-[16px]' : 'text-[16px]'} text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]`}>
                    <span className="truncate">{f?.nickname ?? t.name}</span>
                  </span>
                </span>
                <span className={`w-[36px] shrink-0 text-right text-black [font-variant-numeric:tabular-nums] ${mobile ? 'text-[22px]' : 'text-[22px]'}`}>{entry?.count ?? 0}</span>
              </>
            );
            const cls = 'absolute inset-x-0 flex items-center gap-[10px]';
            const style = { height: rowH - 8, transform: `translateY(${y}px)`, opacity: visible ? 1 : 0, transition, pointerEvents: visible && !playing ? 'auto' : 'none' } as const;
            return f ? (
              <Link key={key} href={`/archivo/franquicias/${f.slug}`} className={`${cls} rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F171F]`} style={style} aria-hidden={!visible} tabIndex={visible && !playing ? 0 : -1}>
                {inner}
              </Link>
            ) : (
              <div key={key} className={cls} style={style} aria-hidden={!visible}>
                {inner}
              </div>
            );
          })}
        </div>

        {caption ? (
          <p role="status" className="pointer-events-none absolute left-[16px] top-[16px] rounded-[6px] bg-[#0F171F] px-[10px] py-[6px] font-barlow text-[14px] font-semibold text-white md:left-[24px] md:top-[24px]">
            {caption}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="sr-only">Año</span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={year}
            onChange={(e) => {
              const v = Number(e.target.value);
              // Snap to the nearest year with a title so the scrubber never lands on a gap year.
              const nearest = years.reduce((best, y) => (Math.abs(y - v) < Math.abs(best - v) ? y : best), years[0]);
              jump(nearest);
            }}
            className="h-[6px] w-full cursor-pointer accent-[#E51F1F]"
            aria-valuetext={`Año ${year}`}
          />
        </label>
        <div className="mt-[4px] flex justify-between font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>
      <p className="mt-4 max-w-[72ch] font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">
        Se muestran las {visibleCount} franquicias con más títulos en cada año. Los clubes anteriores a 1946 que ya no existen aparecen con su nombre y sin enlace. {reduced ? 'La animación está desactivada porque tu sistema pide menos movimiento.' : ''}
      </p>
    </div>
  );
}
