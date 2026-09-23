'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import cx from 'classnames';
import { fmtInt } from '@/archivo/lib/format';
import { isJugadoresTab, setJugadoresTab, useJugadoresTab, type JugadoresTab } from './useJugadoresTab';

type Props = {
  /** Players on this season's rosters. */
  activeCount: number;
  /** Every player in the league's history. */
  historicCount: number;
};

/**
 * Title and the two tabs, centered on the band like /estadisticas, with each tab's count beside it. The card
 * with the list overlaps the bottom of the band, so the band keeps extra room under the tabs.
 */
export default function JugadoresHero({ activeCount, historicCount }: Props) {
  const tab = useJugadoresTab();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = params.get('tab');

  useEffect(() => {
    if (isJugadoresTab(fromUrl)) setJugadoresTab(fromUrl);
  }, [fromUrl]);

  const pick = (next: JugadoresTab) => {
    setJugadoresTab(next);
    router.replace(next === 'activos' ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  };

  const tabs: Array<[JugadoresTab, string, number]> = [
    ['activos', 'Activos', activeCount],
    ['historicos', 'Históricos', historicCount],
  ];

  return (
    <section className="pb-[56px] pt-8 text-center lg:pb-[84px] lg:pt-[50px]">
      <div className="container">
        <h1 className="text-[38px] tracking-[0.4px] text-white lg:text-[42px]">Jugadores</h1>
        <div role="tablist" aria-label="Jugadores activos o históricos" className="mt-4 flex justify-center gap-[24px] lg:mt-5 lg:gap-[28px]">
          {tabs.map(([id, label, count]) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(id)}
                className={cx('relative inline-flex cursor-pointer items-baseline gap-[7px] pb-2 text-[20px] tracking-[0.3px] transition-colors before:absolute before:inset-x-0 before:-inset-y-[6px] before:content-[""] lg:text-[22px]', on ? 'text-white' : 'text-white/50 hover:text-white/75 active:text-white/60')}
              >
                {label}
                <span className={cx('font-barlow text-[12px] font-semibold tabular-nums', on ? 'text-white/60' : 'text-white/30')}>{fmtInt(count)}</span>
                {on ? <span className="absolute bottom-0 left-0 h-[1.5px] w-full rounded-full bg-white" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
