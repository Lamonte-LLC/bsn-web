'use client';

import { useEffect, useState } from 'react';
import cx from 'classnames';

const PILL = 'inline-flex h-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white px-[14px] font-special-gothic-condensed-one text-[14px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white';

export interface SubnavItem {
  id: string;
  label: string;
}

/**
 * Sticky row of section pills inside the history panel, the way the comparator keeps its player row in view.
 * The active pill follows the section under the reader; a tap scrolls to the section.
 */
export default function HistorySubnav({ items }: { items: SubnavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="Secciones de la historia" className="sticky top-0 z-[3] -mx-[16px] border-b border-[rgba(15,23,31,0.06)] bg-white lg:-mx-[44px]">
      <div className="flex gap-[8px] overflow-x-auto px-[16px] py-[12px] [scrollbar-width:none] lg:justify-center lg:px-[44px] lg:py-[14px] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <a key={i.id} href={`#${i.id}`} onClick={go(i.id)} data-selected={active === i.id ? '' : undefined} aria-current={active === i.id ? 'location' : undefined} className={cx(PILL)}>
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
