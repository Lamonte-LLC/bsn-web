'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import ShareButton from '@/archivo/components/ShareButton';
import { Button, PaperCard } from '@/archivo/components/ui';
import { textOn } from '@/archivo/lib/color';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls, EASE, NEUTRAL_CLUB, RED } from '@/archivo/lib/tokens';

export interface DynastyTitle {
  year: number;
  /** franchiseSlug, or "club:<name>" for pre-1946 clubs without a franchise record. */
  key: string;
  franchiseSlug: string | null;
  name: string;
}

// Captions shown for two seconds when the year is reached.
const CAPTIONS: Record<number, string> = {
  1975: 'Vaqueros: cinco al hilo',
  2001: 'Cangrejeros: cuatro seguidos con Julio Toro',
  2009: 'Julio Toro gana su título número doce',
};

const SPEEDS = [1, 2] as const;
const BASE_MS = 700;

interface Props {
  titles: DynastyTitle[];
  franchises: Record<string, FranchiseView>;
}

/**
 * Titles accumulated per franchise, year by year. Bars reorder as the year advances; only transform and width
 * animate (250ms, system curve). Paused at the final year on load. With reduced motion there is no playback:
 * a year selector jumps without transition and the year is announced politely.
 */
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

  // Every change of year goes through here so landmark captions fire with it. The caption slot under the
  // champion's name is reserved, so nothing moves when one appears.
  const goTo = useCallback((y: number) => {
    setYear(y);
    const text = CAPTIONS[y];
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
    if (!text) {
      setCaption(null);
      return;
    }
    setCaption(text);
    captionTimer.current = window.setTimeout(() => setCaption(null), 2000);
  }, []);

  useEffect(() => () => {
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
  }, []);

  // Advance one title-year per tick while playing.
  useEffect(() => {
    if (!playing || reduced) return;
    const t = window.setTimeout(() => {
      const idx = years.indexOf(year);
      const next = years[idx + 1];
      if (next === undefined) setPlaying(false);
      else goTo(next);
    }, BASE_MS / speed);
    return () => window.clearTimeout(t);
  }, [playing, reduced, year, years, speed, goTo]);

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
  const rowH = mobile ? 35 : 40;
  const barH = mobile ? 23 : 26;
  const logoPx = mobile ? 26 : 30;
  const rankOf = new Map(ranked.map((r, i) => [r.key, i]));
  // Keep every franchise mounted so bars animate in and out instead of remounting.
  const allKeys = useMemo(() => [...new Set(titles.map((t) => t.key))], [titles]);
  const nameOf = new Map(titles.map((t) => [t.key, t]));
  const champion = titles.find((t) => t.year === year);
  const championF = champion?.franchiseSlug ? franchises[champion.franchiseSlug] : null;
  const transition = reduced ? 'none' : `transform 250ms ${EASE}, width 250ms ${EASE}, opacity 200ms ${EASE}`;
  const progress = ((year - minYear) / (maxYear - minYear)) * 100;

  const jump = (y: number) => {
    setPlaying(false);
    goTo(y);
  };
  const play = () => {
    if (year >= maxYear) goTo(minYear);
    setPlaying(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[10px] pb-[14px] md:pb-[16px]">
        {!reduced ? (
          <>
            <Button onClick={() => (playing ? setPlaying(false) : play())} aria-pressed={playing} className="min-w-[96px]">
              {playing ? 'Pausa' : year >= maxYear ? `Ver desde ${minYear}` : 'Reproducir'}
            </Button>
            <div role="radiogroup" aria-label="Velocidad" className="inline-flex h-[38px] overflow-hidden rounded-[99px] border border-[rgba(0,0,0,0.14)] bg-white">
              {SPEEDS.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)} className={`px-[15px] text-[14px] transition-colors duration-150 ${cls.focus} focus-visible:outline-offset-[-2px] ${speed === s ? 'bg-[#0F171F] text-white' : 'text-[rgba(0,0,0,0.6)] hover:bg-[#FAFAFA] hover:text-[#0F171F]'}`}>
                  {s}x
                </button>
              ))}
            </div>
          </>
        ) : (
          <label className="inline-flex items-center gap-[10px] font-barlow text-[13px] font-semibold text-[#0F171F]">
            Año
            <select value={year} onChange={(e) => jump(Number(e.target.value))} className={`h-[38px] rounded-[8px] border border-[rgba(0,0,0,0.16)] bg-white px-[14px] font-barlow text-[14px] font-medium text-[#0F171F] ${cls.tabular} ${cls.focus}`}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="ml-auto flex items-center gap-[14px]">
          <span className={`hidden ${cls.meta} sm:inline`}>{reduced ? '' : playing ? 'Pausa para tocar una barra' : 'Toca una barra para ir a la franquicia'}</span>
          <ShareButton />
        </span>
      </div>
      {reduced ? <p className={`pb-[14px] ${cls.meta}`}>Tu sistema tiene el movimiento reducido: elige un año y el chart salta sin animación. El año se anuncia en voz alta.</p> : null}
      <p className={`pb-[10px] ${cls.meta} sm:hidden`}>{reduced ? '' : playing ? 'Pausa para tocar una barra' : 'Toca una barra para ir a la franquicia'}</p>

      <PaperCard className="px-[18px] pb-[16px] pt-[18px] md:px-[30px] md:pb-[20px] md:pt-[24px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-barlow text-[11px] font-bold uppercase tracking-[1.1px] text-[#0F171F] md:text-[12px]">Campeón {year}</p>
            {champion ? (
              championF ? (
                <Link href={`/archivo/franquicias/${championF.slug}`} className={`mt-[3px] block truncate font-barlow text-[14.5px] font-semibold text-[#0F171F] md:text-[16px] rounded-[4px] ${cls.focus}`}>
                  {champion.name}
                </Link>
              ) : (
                <p className="mt-[3px] truncate font-barlow text-[14.5px] font-semibold text-[#0F171F] md:text-[16px]">{champion.name}</p>
              )
            ) : null}
            <p role="status" className="flex h-[30px] items-center md:h-[34px]">
              {caption ? <span className="inline-block rounded-[7px] bg-[#0F171F] px-[12px] py-[4px] font-barlow text-[12.5px] font-semibold text-white">{caption}</span> : null}
            </p>
          </div>
          <div aria-live="polite" className={`shrink-0 text-right text-[52px] leading-[0.9] text-[#0F171F] md:text-[72px] ${cls.tabular}`}>
            {year}
          </div>
        </div>

        <div className="relative pt-[4px]" style={{ height: visibleCount * rowH + 4 }}>
          {allKeys.map((key) => {
            const rank = rankOf.get(key);
            const entry = rank === undefined ? null : ranked[rank];
            const visible = rank !== undefined && rank < visibleCount;
            const t = nameOf.get(key)!;
            const f = t.franchiseSlug ? franchises[t.franchiseSlug] : null;
            const color = f?.colors.primary ?? NEUTRAL_CLUB;
            const y = (visible ? rank! : visibleCount) * rowH;
            const inner = (
              <>
                <FranchiseLogo franchise={f} fallbackName={t.name} sizePx={logoPx} />
                <span className="relative min-w-0 flex-1" style={{ height: barH }}>
                  <span className="absolute inset-y-0 left-0 flex items-center rounded-[6px] px-[10px]" style={{ width: `${entry ? Math.max(6, (entry.count / max) * 100) : 0}%`, background: color, transition, color: textOn(color) }}>
                    <span className="truncate text-[13px] leading-[1] md:text-[14px]">{f?.nickname ?? t.name}</span>
                  </span>
                </span>
                <span className={`w-[34px] shrink-0 text-right text-[21px] leading-[1] text-[#0F171F] md:w-[40px] md:text-[24px] ${cls.tabular}`}>{entry?.count ?? 0}</span>
              </>
            );
            const base = 'absolute inset-x-0 flex items-center gap-[12px]';
            const style = { height: rowH, transform: `translateY(${y}px)`, opacity: visible ? 1 : 0, transition, pointerEvents: visible && !playing ? 'auto' : 'none' } as const;
            return f ? (
              <Link key={key} href={`/archivo/franquicias/${f.slug}`} className={`${base} rounded-[6px] ${cls.focus}`} style={style} aria-hidden={!visible} tabIndex={visible && !playing ? 0 : -1}>
                {inner}
              </Link>
            ) : (
              <div key={key} className={base} style={style} aria-hidden={!visible}>
                {inner}
              </div>
            );
          })}
        </div>
      </PaperCard>

      {!reduced ? (
        <div className="px-[2px] pt-[18px]">
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
              aria-valuetext={`Año ${year}`}
              className={`block h-[14px] w-full cursor-pointer appearance-none bg-transparent ${cls.focus} rounded-[7px] [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-[2px] [&::-webkit-slider-runnable-track]:[background:var(--track)] [&::-webkit-slider-thumb]:-mt-[5.5px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E51F1F] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.25)] [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-[2px] [&::-moz-range-track]:[background:var(--track)] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#E51F1F]`}
              style={{ ['--track' as string]: `linear-gradient(to right, ${RED} ${progress}%, rgba(0,0,0,0.1) ${progress}%)` }}
            />
          </label>
          <div className={`flex justify-between pt-[6px] font-barlow text-[11.5px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`}>
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      ) : null}
      <p className={`max-w-[560px] pt-[16px] font-barlow text-[13px] leading-[1.6] text-[rgba(0,0,0,0.5)]`}>
        Se muestran las {visibleCount} franquicias con más títulos en cada año. Los clubes anteriores a 1946 que ya no existen aparecen con su nombre y sin enlace.
      </p>
    </div>
  );
}
