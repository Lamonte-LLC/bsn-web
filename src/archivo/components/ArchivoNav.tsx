'use client';

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

/** Section tabs of the archive, rendered inside the dark band under the site header. Scrolls horizontally on mobile. */
export default function ArchivoNav() {
  const pathname = usePathname() ?? '';
  return (
    <nav aria-label="Secciones del archivo" className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max flex-row gap-[18px] lg:gap-[26px]">
        {ARCHIVO_SECTIONS.map((s) => {
          const active = s.href === '/archivo' ? pathname === '/archivo' : pathname.startsWith(s.href);
          return (
            <li key={s.href} className="relative pb-[10px]">
              <Link
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap text-[17px] tracking-[0.3px] transition-colors duration-150 lg:text-[19px] ${active ? 'text-white' : 'text-white/50 hover:text-white/75'}`}
              >
                {s.label}
              </Link>
              {active ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-white" /> : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
