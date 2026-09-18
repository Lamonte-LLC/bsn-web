import Link from 'next/link';

export const HISTORIA_SECTIONS = [
  { key: 'todos', label: 'Todos los tiempos', href: '/estadisticas?vista=historico' },
  { key: 'records', label: 'Récords', href: '/estadisticas/records' },
  { key: 'mvps', label: 'MVPs', href: '/estadisticas/mvps' },
  { key: 'campeones', label: 'Campeones', href: '/estadisticas/campeones' },
  { key: 'en-numeros', label: 'En números', href: '/estadisticas/en-numeros' },
] as const;

export type HistoriaSubnavKey = (typeof HISTORIA_SECTIONS)[number]['key'];

/** Tertiary pill on the ink band, as the comparator hero uses it: hairline idle, solid white when current. */
const PILL =
  'inline-flex h-[30px] shrink-0 items-center justify-center whitespace-nowrap rounded-[100px] border px-[13px] font-barlow text-[12px] font-medium transition-[border-color,background-color,color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:h-[32px] lg:px-[15px] lg:text-[12.5px]';
const PILL_IDLE = 'border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.75)] hover:border-[rgba(255,255,255,0.45)] hover:text-white';
const PILL_ACTIVE = 'border-white bg-white text-[#0F171F]';

interface Props {
  active: HistoriaSubnavKey;
  className?: string;
}

/**
 * Row of the historical sections of Estadísticas, inside the ink band of each one, under the title. Third level
 * of the hierarchy: title, then the season/all-time toggle, then these. Scrolls horizontally on phones without
 * a visible bar; centered and wrapping from md. No hooks, so it renders from server and client trees alike.
 */
export default function HistoriaSubnav({ active, className = '' }: Props) {
  return (
    <nav aria-label="Historia del BSN" className={`no-scrollbar -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_0%,#000_calc(100%-28px),transparent_100%)] md:mx-0 md:overflow-visible md:px-0 md:[mask-image:none] ${className}`}>
      <ul className="flex min-w-max gap-[8px] md:min-w-0 md:flex-wrap md:justify-center">
        {HISTORIA_SECTIONS.map((s) => {
          const isActive = s.key === active;
          return (
            <li key={s.key} className="shrink-0">
              <Link href={s.href} aria-current={isActive ? 'page' : undefined} className={`${PILL} ${isActive ? PILL_ACTIVE : PILL_IDLE}`}>
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
