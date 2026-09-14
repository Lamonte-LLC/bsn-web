'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { TAB_PILL } from '@/archivo/components/Tabs';
import { StatBlock } from '@/archivo/components/ui';
import { fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import type { ComparableStats } from '@/archivo/lib/stats';
import { cls } from '@/archivo/lib/tokens';

interface Props {
  career: ComparableStats;
  regular: ComparableStats;
  playoffs: ComparableStats;
  /** Source line under the numbers. */
  source: string;
}

const PHASES = [
  { key: 'career', label: 'Carrera' },
  { key: 'regular', label: 'Serie Regular' },
  { key: 'playoffs', label: 'Postemporada' },
] as const;

/** Career block: five hero numbers that follow the phase tab, plus a quieter second row. Nulls stay as dashes. */
export default function CareerSummary({ career, regular, playoffs, source }: Props) {
  const stats = { career, regular, playoffs };
  return (
    <TabGroup>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-x-4 gap-y-[10px] md:mb-[16px]">
        <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">Carrera</h2>
        <TabList className="flex flex-wrap gap-[8px]">
          {PHASES.map((p) => (
            <Tab key={p.key} className={TAB_PILL} disabled={!stats[p.key].g}>
              {p.label}
            </Tab>
          ))}
        </TabList>
      </div>
      <TabPanels>
        {PHASES.map((p) => {
          const s = stats[p.key];
          return (
            <TabPanel key={p.key}>
              <div className={`${cls.card} px-[18px] py-[20px] md:px-[30px] md:py-[24px]`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-[22px] sm:grid-cols-3 lg:grid-cols-5">
                  <StatBlock value={fmtInt(s.g)} label="Juegos" />
                  <StatBlock value={fmtInt(s.pts)} label="Puntos" />
                  <StatBlock value={fmt(s.ppg)} label="PPJ" />
                  <StatBlock value={fmt(s.rpg)} label="RPJ" />
                  <StatBlock value={fmt(s.apg)} label="APJ" />
                </div>
                <div className={`mt-[18px] grid grid-cols-3 gap-x-4 gap-y-[12px] border-t border-[rgba(0,0,0,0.06)] pt-[14px] sm:grid-cols-5 ${cls.tabular}`}>
                  {(
                    [
                      ['ROB', fmt(s.spg)],
                      ['BLQ', fmt(s.bpg)],
                      ['TC%', fmtPct(s.fgPct)],
                      ['3P%', fmtPct(s.fg3Pct)],
                      ['TL%', fmtPct(s.ftPct)],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <span className={`block font-barlow text-[16px] font-semibold leading-[1] ${value === '–' ? 'text-[rgba(0,0,0,0.3)]' : 'text-[#0F171F]'}`}>{value}</span>
                      <span className={`mt-[5px] block ${cls.label} !text-[10px]`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>
          );
        })}
      </TabPanels>
      <p className={`mt-[10px] ${cls.note}`}>{source}</p>
    </TabGroup>
  );
}
