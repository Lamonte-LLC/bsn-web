'use client';

import type { ReactNode } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

export const TAB_PILL = 'cursor-pointer rounded-[100px] border border-[#D5D5D5] bg-white px-[16px] py-[5px] text-[15px] text-[rgba(0,0,0,0.65)] outline-none transition-colors duration-150 hover:border-[rgba(47,47,47,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F171F] data-selected:border-[#0F171F] data-selected:bg-[#0F171F] data-selected:text-white';

/** Pill tabs (Headless UI). Panels can be server-rendered nodes passed in as props. */
export default function Tabs({ tabs, className = '' }: { tabs: Array<{ label: string; panel: ReactNode }>; className?: string }) {
  return (
    <TabGroup className={className}>
      <TabList className="mb-[16px] flex flex-wrap gap-[8px]">
        {tabs.map((t) => (
          <Tab key={t.label} className={TAB_PILL}>
            {t.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((t) => (
          <TabPanel key={t.label}>{t.panel}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
