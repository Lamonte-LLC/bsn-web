'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { key: 'temporada', label: 'Esta temporada' },
  { key: 'historico', label: 'Todos los tiempos' },
] as const;

/** Season vs all-time toggle in the Estadísticas hero. Persists as ?vista=historico; no param = this season. */
export default function VistaToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const vista = searchParams.get('vista') === 'historico' ? 'historico' : 'temporada';

  const go = (key: (typeof OPTIONS)[number]['key']) => {
    const next = new URLSearchParams(searchParams.toString());
    if (key === 'historico') next.set('vista', 'historico');
    else next.delete('vista');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div role="radiogroup" aria-label="Vista" className="inline-flex h-[36px] overflow-hidden rounded-[99px] border border-white/25">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={vista === o.key}
          onClick={() => go(o.key)}
          className={`px-[14px] font-special-gothic-condensed-one text-[14px] transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/40 md:px-[16px] md:text-[15px] ${vista === o.key ? 'bg-white text-[#0F171F]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
