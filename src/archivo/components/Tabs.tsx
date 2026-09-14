'use client';

import type { ReactNode } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

/** Pill tab or segmented option in the display face. Selected = solid ink. Disabled = no lines to show. */
export const TAB_PILL =
  'cursor-pointer rounded-[99px] border border-[#D5D5D5] bg-white px-[17px] py-[6px] text-[15px] leading-[1.2] text-[rgba(0,0,0,0.6)] transition-colors duration-150 hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0F171F] data-selected:bg-[#0F171F] data-selected:text-white data-selected:hover:bg-[#0F171F] disabled:cursor-not-allowed disabled:border-[rgba(0,0,0,0.07)] disabled:text-[rgba(0,0,0,0.35)] disabled:hover:bg-white data-disabled:cursor-not-allowed data-disabled:border-[rgba(0,0,0,0.07)] data-disabled:text-[rgba(0,0,0,0.35)] data-disabled:hover:bg-white';

/** Pill tabs (Headless UI). Panels can be server-rendered nodes passed in as props. */
export default function Tabs({ tabs, className = '', right, title, small = false }: { tabs: Array<{ label: string; panel: ReactNode; disabled?: boolean }>; className?: string; right?: ReactNode; title?: ReactNode; small?: boolean }) {
  return (
    <TabGroup className={className}>
      <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[10px]">
        {title}
        <TabList className={`flex flex-wrap gap-[8px] ${small ? '[&>button]:px-[13px] [&>button]:py-[5px] [&>button]:text-[13px]' : ''}`}>
          {tabs.map((t) => (
            <Tab key={t.label} className={TAB_PILL} disabled={t.disabled}>
              {t.label}
            </Tab>
          ))}
        </TabList>
        {right}
      </div>
      <TabPanels>
        {tabs.map((t) => (
          <TabPanel key={t.label}>{t.panel}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
