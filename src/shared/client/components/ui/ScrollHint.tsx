'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';

/**
 * Horizontal scroll with a fading edge and a chevron while there is more content to the right, so a phone
 * user knows a wide table keeps going. The hint disappears once the end is reached.
 */
export default function ScrollHint({ children, className = '', innerClassName = '' }: { children: React.ReactNode; /** On the outer box, so the fade reaches its edges (negative margins go here). */ className?: string; /** On the scrolling box itself. */ innerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);
  return (
    <div className={cx('relative', className)}>
      <div ref={ref} className={cx('overflow-x-auto overflow-y-hidden overscroll-x-contain', innerClassName)}>{children}</div>
      <div aria-hidden className={cx('pointer-events-none absolute inset-y-0 right-0 flex w-[72px] items-center justify-end bg-gradient-to-l from-white via-white/85 to-transparent pr-[10px] transition-opacity duration-200', more ? 'opacity-100' : 'opacity-0')}>
        <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(15,23,31,0.12)] bg-white text-[#0F171F] shadow-[0_2px_8px_rgba(15,23,31,0.1)]">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5L8 6l-3.5 3.5" /></svg>
        </span>
      </div>
    </div>
  );
}
