import Link from 'next/link';

export const HISTORIA_SECTIONS = [
  { key: 'todos', label: 'Todos los tiempos', href: '/estadisticas?vista=historico' },
  { key: 'records', label: 'Récords', href: '/estadisticas/records' },
  { key: 'mvps', label: 'MVPs', href: '/estadisticas/mvps' },
  { key: 'campeones', label: 'Campeones', href: '/estadisticas/campeones' },
  { key: 'en-numeros', label: 'En números', href: '/estadisticas/en-numeros' },
] as const;

export type HistoriaSubnavKey = (typeof HISTORIA_SECTIONS)[number]['key'];

/** Design-system secondary pill: small on mobile, regular from md. Active = solid ink. */
const PILL =
  'inline-flex h-[32px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[100px] border px-[14px] font-special-gothic-condensed-one text-[14px] leading-[1.4] tracking-[0.3px] outline-none transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] md:h-[35px] md:px-[18px] md:text-[15px]';
const PILL_IDLE = 'border-[#d5d5d5] bg-white text-[rgba(0,0,0,0.65)] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA]';
const PILL_ACTIVE = 'border-[#0f171f] bg-[#0f171f] text-white';

interface Props {
  active: HistoriaSubnavKey;
  className?: string;
}

/**
 * Row of the historical sections of Estadísticas, under the hero of each one. Scrolls horizontally on mobile
 * without a visible bar; wraps from md. No hooks, so it renders from server and client trees alike.
 */
export default function HistoriaSubnav({ active, className = '' }: Props) {
  return (
    <nav aria-label="Historia del BSN" className={`no-scrollbar -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_0%,#000_calc(100%-28px),transparent_100%)] md:mx-0 md:overflow-visible md:px-0 md:[mask-image:none] ${className}`}>
      <ul className="flex min-w-max gap-[8px] md:min-w-0 md:flex-wrap">
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
