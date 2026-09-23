'use client';

import cx from 'classnames';

/**
 * A 2px ink sweep along the top edge of a card while the comparison is being resolved. Fades in only after a
 * beat, so a fast round trip shows nothing at all.
 */
export default function ComparePendingBar({ active }: { active: boolean }) {
  return (
    <span className={cx('pointer-events-none absolute inset-x-[16px] top-0 h-[2px] overflow-hidden rounded-full transition-opacity duration-200 lg:inset-x-[44px]', active ? 'opacity-100 delay-150' : 'opacity-0')} aria-hidden>
      <span className="absolute inset-y-0 w-[38%] rounded-full bg-[#0F171F] motion-safe:animate-[compare-sweep_1.1s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
    </span>
  );
}
