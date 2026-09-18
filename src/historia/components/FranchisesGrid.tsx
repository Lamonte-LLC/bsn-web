'use client';

import { useState } from 'react';
import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { alpha } from '@/archivo/lib/color';
import type { FranchiseView } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';

export interface FranchiseCard extends FranchiseView {
  city: string | null;
  firstYear: number | null;
  lastYear: number | null;
  titles: number;
}

type Filter = 'todas' | 'activas' | 'extintas' | 'titulos';
const FILTERS: Array<[Filter, string]> = [
  ['todas', 'Todas'],
  ['activas', 'Activas'],
  ['extintas', 'Extintas'],
  ['titulos', 'Con títulos'],
];
const PILL = 'inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[100px] border border-[#d5d5d5] bg-white px-[18px] font-special-gothic-condensed-one text-[15px] leading-[1.4] tracking-[0.3px] text-[rgba(0,0,0,0.65)] outline-none transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none hover:border-[rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(23,114,217,0.5)] data-selected:border-[#0f171f] data-selected:bg-[#0f171f] data-selected:text-white md:h-[35px] md:min-w-[110px]';

const hrefOf = (f: FranchiseCard) => (f.status === 'active' && f.code ? `/equipos/${f.code}?tab=historia` : `/equipos/historicos/${f.slug}`);
const yearsOf = (f: FranchiseCard) => (f.firstYear ? `${f.firstYear} a ${f.status === 'active' ? 'hoy' : (f.lastYear ?? 'hoy')}` : 'Años por confirmar');

/**
 * Every franchise of the league as one grid of cards: the mark (real logo for the active ones, colored
 * disc for the extinct), a titles badge tinted with the club's color, nickname, city and years. Four pills
 * filter the grid; each card opens the club's history.
 */
export default function FranchisesGrid({ franchises }: { franchises: FranchiseCard[] }) {
  const [filter, setFilter] = useState<Filter>('todas');
  const list = franchises.filter((f) => (filter === 'todas' ? true : filter === 'activas' ? f.status === 'active' : filter === 'extintas' ? f.status !== 'active' : f.titles > 0));

  return (
    <div>
      <div role="radiogroup" aria-label="Filtrar franquicias" className="mb-[20px] flex flex-wrap gap-[8px] md:mb-[28px]">
        {FILTERS.map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={filter === k} data-selected={filter === k ? '' : undefined} onClick={() => setFilter(k)} className={PILL}>
            {label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:grid-cols-4">
        {list.map((f) => {
          const color = f.colors.primary ?? '#6B7280';
          return (
            <li key={f.slug} className="min-w-0">
              <Link href={hrefOf(f)} className={`flex h-full flex-col px-[22px] pb-[22px] pt-[22px] md:px-[28px] md:pb-[28px] md:pt-[26px] ${cls.cardTap} ${cls.focus} active:scale-[0.99] motion-reduce:active:scale-100`}>
                <span className="flex items-start justify-between gap-[12px]">
                  {f.status === 'active' ? (
                    <span className="inline-flex h-[64px] w-[64px] items-center justify-center rounded-full border-[3px] bg-white" style={{ borderColor: color }}>
                      <FranchiseLogo franchise={f} sizePx={40} />
                    </span>
                  ) : (
                    <FranchiseLogo franchise={f} sizePx={64} />
                  )}
                  {f.titles ? (
                    <span className={`inline-flex h-[30px] items-center gap-[6px] rounded-[100px] px-[12px] ${cls.tabular}`} style={{ backgroundColor: alpha(color, 0.1) }}>
                      <span className="text-[18px] leading-none text-[#0F171F]">{f.titles}</span>
                      <span className={`${cls.label} !text-[10px]`}>{f.titles === 1 ? 'Título' : 'Títulos'}</span>
                    </span>
                  ) : null}
                </span>
                <span className="mt-[24px] block text-[26px] leading-[1] text-[#0F171F] md:mt-[34px] md:text-[28px]">{f.nickname}</span>
                <span className="mt-[8px] block font-barlow text-[15px] text-[rgba(15,23,31,0.6)]">{f.city ?? 'Ciudad por confirmar'}</span>
                <span className={`mt-[10px] block font-barlow text-[14px] text-[rgba(15,23,31,0.6)] ${cls.tabular}`}>{yearsOf(f)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
