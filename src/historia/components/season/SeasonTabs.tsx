'use client';

import type { ReactNode } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useSearchParams } from 'next/navigation';

/** Design-system secondary pill tab, as the team page uses it. */
export const SECONDARY_TAB = 'flex h-[35px] min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white px-[10px] font-special-gothic-condensed-one text-[14px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white md:flex-none md:min-w-[150px] md:px-[18px] md:text-[15px]';

interface Props {
  tabs: Array<{ label: string; panel: ReactNode }>;
  className?: string;
}

/**
 * Secondary pill tabs with server-rendered panels; only the tabs with data are passed in. A `?equipo=` in the
 * URL (a team link from a player's season table) opens the Equipos tab directly.
 */
export default function SeasonTabs({ tabs, className = '' }: Props) {
  const params = useSearchParams();
  const equipos = tabs.findIndex((t) => t.label === 'Equipos');
  const defaultIndex = params.get('equipo') && equipos >= 0 ? equipos : 0;
  return (
    <TabGroup className={className} defaultIndex={defaultIndex}>
      <TabList className="flex gap-[8px]">
        {tabs.map((t) => (
          <Tab key={t.label} className={SECONDARY_TAB}>
            {t.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className="mt-[28px] md:mt-[32px]">
        {tabs.map((t) => (
          <TabPanel key={t.label}>{t.panel}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
