'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Chevron } from './ui';

/**
 * Horizontal scroll container with an honest overflow hint: the white fade and chevron only render when
 * there really is content past the right edge, and they disappear once the user reaches it.
 */
export default function Scrollable({ children, className = '', maxHeight }: { children: ReactNode; className?: string; maxHeight?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="archivo-scroll overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        {children}
      </div>
      {more ? (
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 flex w-[36px] items-center justify-end rounded-r-[12px] bg-gradient-to-l from-white from-15% to-transparent pr-[8px] text-[rgba(0,0,0,0.45)]">
          <Chevron />
        </div>
      ) : null}
    </div>
  );
}
