'use client';

import { useMemo, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import Link from 'next/link';
import { Chevron } from '@/archivo/components/ui';
import { cls } from '@/archivo/lib/tokens';

interface Props {
  years: number[];
  current: number;
  /** The season being viewed. */
  selected: number;
  /** Where the current season lives (the section itself); every other year goes to /temporadas/[year]. */
  currentHref: string;
  onDark?: boolean;
  className?: string;
}

/**
 * Season selector, 1930 to today, with decades as tabs so 97 years never become an endless list. Persists in the
 * URL because it navigates: the current season stays in the section, any other year opens /temporadas/[year].
 */
export default function SeasonSelector({ years, current, selected, currentHref, onDark = false, className = '' }: Props) {
  const decades = useMemo(() => [...new Set(years.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => b - a), [years]);
  const [decade, setDecade] = useState(Math.floor(selected / 10) * 10);
  const inDecade = years.filter((y) => Math.floor(y / 10) * 10 === decade).sort((a, b) => a - b);
  const hrefFor = (y: number) => (y === current ? currentHref : `/temporadas/${y}`);

  const trigger = onDark
    ? 'border border-white/30 text-white hover:border-white/60 hover:bg-white/5'
    : 'border border-[rgba(0,0,0,0.16)] bg-white text-[#0F171F] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA]';

  return (
    <Popover className={`relative ${className}`}>
      <PopoverButton className={`inline-flex h-[38px] cursor-pointer items-center gap-[8px] rounded-[99px] px-[16px] text-[15px] leading-[1] transition-colors duration-150 ${cls.tabular} ${trigger} ${onDark ? cls.focusOnDark : cls.focus}`}>
        <span className="font-barlow text-[11px] font-semibold uppercase tracking-[1.2px] opacity-60">Temporada</span>
        {selected}
        <Chevron direction="down" size={12} className="opacity-60" />
      </PopoverButton>
      <PopoverPanel anchor="bottom start" transition className="z-50 mt-[8px] w-[min(92vw,360px)] rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white p-[14px] shadow-[0_8px_28px_rgba(15,23,31,0.12)] transition duration-150 data-closed:opacity-0">
        {({ close }) => (
          <div>
            <div role="tablist" aria-label="Década" className="no-scrollbar -mx-[14px] flex gap-[6px] overflow-x-auto px-[14px] pb-[12px]">
              {decades.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={decade === d}
                  onClick={() => setDecade(d)}
                  className={`shrink-0 rounded-[8px] px-[10px] py-[6px] font-barlow text-[13px] font-semibold transition-colors duration-150 ${cls.tabular} ${cls.focus} ${decade === d ? 'bg-[#0F171F] text-white' : 'text-[rgba(0,0,0,0.6)] hover:bg-[#FAFAFA] hover:text-[#0F171F]'}`}
                >
                  {d}s
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-[6px] border-t border-[rgba(0,0,0,0.06)] pt-[12px]">
              {inDecade.map((y) => (
                <Link
                  key={y}
                  href={hrefFor(y)}
                  onClick={() => close()}
                  aria-current={y === selected ? 'page' : undefined}
                  className={`inline-flex h-[44px] items-center justify-center rounded-[8px] border font-barlow text-[13.5px] font-semibold transition-colors duration-150 ${cls.tabular} ${cls.focus} ${
                    y === selected ? 'border-[#0F171F] bg-[#0F171F] text-white' : 'border-[rgba(0,0,0,0.12)] text-[#0F171F] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {y}
                </Link>
              ))}
            </div>
            <p className={`pt-[10px] ${cls.meta} !text-[11.5px]`}>{years[0]} a {years[years.length - 1]}. Los años anteriores a 1956 solo tienen campeón y MVP.</p>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
