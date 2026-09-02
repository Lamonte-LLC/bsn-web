'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ARCHIVO_SECTIONS: Array<{ href: string; label: string }> = [
  { href: '/archivo', label: 'Inicio' },
  { href: '/archivo/temporadas', label: 'Temporadas' },
  { href: '/archivo/campeones', label: 'Campeones' },
  { href: '/archivo/jugadores', label: 'Jugadores' },
  { href: '/archivo/mvps', label: 'MVPs' },
  { href: '/archivo/records', label: 'Récords' },
  { href: '/archivo/franquicias', label: 'Franquicias' },
  { href: '/archivo/en-numeros', label: 'En números' },
  { href: '/archivo/comparar', label: 'Comparar' },
];

/**
 * Section tabs of the archive, inside the ink band under the site header. Active = white with the league red
 * underline, one of the three permitted uses of red. Scrolls horizontally on mobile with the active tab in view.
 */
export default function ArchivoNav() {
  const pathname = usePathname() ?? '';
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Keep the active tab visible when the row overflows (mobile). Instant, so nothing animates on load.
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

  return (
    <nav aria-label="Secciones del archivo" className="no-scrollbar -mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,#000_0%,#000_calc(100%-40px),transparent_100%)] md:mx-0 md:px-0 md:[mask-image:none]">
      <ul className="flex min-w-max flex-row gap-[20px] lg:gap-[24px]">
        {ARCHIVO_SECTIONS.map((s) => {
          const active = s.href === '/archivo' ? pathname === '/archivo' : pathname.startsWith(s.href);
          return (
            <li key={s.href} ref={active ? activeRef : undefined} className="shrink-0">
              <Link
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap border-b-2 text-[15px] leading-[1] tracking-[0.2px] transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 lg:text-[16px] ${
                  active ? 'border-[#E51F1F] pb-[9px] text-white' : 'border-transparent pb-[9px] text-white/55 hover:text-white/85'
                }`}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
