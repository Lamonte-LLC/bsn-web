'use client';

import cx from 'classnames';

/**
 * An ink sweep along the top edge of a card while the comparison is being resolved: 3px edge to edge on phones,
 * 2px inset on desktop. Fades in only after a beat, so a fast round trip shows nothing at all.
 */
export default function ComparePendingBar({ active }: { active: boolean }) {
  return (
    <span className={cx('pointer-events-none absolute inset-x-0 top-0 h-[3px] overflow-hidden rounded-t-[16px] transition-opacity duration-200 lg:inset-x-[44px] lg:h-[2px] lg:rounded-full', active ? 'opacity-100 delay-100' : 'opacity-0')} aria-hidden>
      <span className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-[#0F171F] motion-safe:animate-[compare-sweep_1.1s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
    </span>
  );
}
