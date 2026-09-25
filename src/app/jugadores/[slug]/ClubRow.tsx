'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import ClubMark from '@/historia/components/ClubMark';
import type { ProfileClub } from './profile-data';

/**
 * One club mark with its full name in a small tooltip: on hover and keyboard focus on desktop, on tap on
 * phones (a second tap, or a tap anywhere else, closes it).
 */
function ClubChip({ club, size }: { club: ProfileClub; size: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <span ref={ref} className="group/club relative inline-flex">
      <button
        type="button"
        aria-label={club.name}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="flex cursor-default items-center justify-center rounded-full border border-white/12 bg-[#1A222B] shadow-[0_0_0_2px_#0F171F] outline-none transition-colors duration-150 hover:border-white/30 focus-visible:border-white/50"
        style={{ width: size + 10, height: size + 10 }}
      >
        <ClubMark code={club.code} color={club.color} size={size} />
      </button>
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute bottom-full left-1/2 z-10 mb-[8px] -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-white px-[9px] py-[5px] font-barlow text-[12px] font-semibold text-[#0F171F] shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-150 motion-reduce:transition-none',
          'after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-white after:content-[""]',
          open ? 'translate-y-0 opacity-100' : 'translate-y-[3px] opacity-0 group-hover/club:translate-y-0 group-hover/club:opacity-100 group-focus-within/club:translate-y-0 group-focus-within/club:opacity-100',
        )}
      >
        {club.name}
      </span>
    </span>
  );
}

/** The clubs of the career as a row of marks, oldest first, each with its name on hover or tap. */
export default function ClubRow({ clubs, size = 24, stack = false }: { clubs: ProfileClub[]; /** Mark size; the disc adds 10px. */ size?: number; /** Overlap the discs (four or more clubs on one line), like the season table's stacks. */ stack?: boolean }) {
  return (
    <span className={cx('flex items-center', stack ? 'flex-nowrap' : 'flex-wrap gap-[5px]')} role="list" aria-label="Equipos">
      {clubs.map((c, i) => (
        <span key={c.code} role="listitem" className="relative inline-flex" style={stack ? { marginLeft: i ? -Math.round(size * 0.3) : 0, zIndex: clubs.length - i } : undefined}>
          <ClubChip club={c} size={size} />
        </span>
      ))}
    </span>
  );
}
