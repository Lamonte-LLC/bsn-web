import Link from 'next/link';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { NumberFact } from '@/historia/lib/home';
import { HOME_CARD } from './styles';

type Props = { facts: NumberFact[] };

/**
 * Row C of the home section: three numbers of the league, each a tile that links deeper into the archive.
 * The tiles rotate daily (lib/home.ts); the row only renders what it is given.
 */
export default function NumberTiles({ facts }: Props) {
  if (!facts.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {facts.map((fact) => (
        <li key={fact.href + fact.subject} className="min-w-0">
          <Link href={fact.href} className={`${HOME_CARD} group flex h-full flex-col gap-[10px] px-[18px] py-[16px] transition-shadow duration-150 hover:shadow-[0_2px_14px_rgba(14,20,32,0.08)] md:px-[24px] md:py-[20px] ${cls.focus}`}>
            <p className={`text-[36px] leading-[1] text-[#0F171F] md:text-[44px] ${cls.tabular}`}>{fmtInt(fact.value)}</p>
            <p className="font-barlow text-[14px] leading-[1.4] text-[rgba(0,0,0,0.6)]">
              {fact.lead} <b className="font-semibold text-[#0F171F]">{fact.subject}</b>
              {fact.tail}
            </p>
            <span className={`mt-auto inline-flex items-center gap-[6px] pt-[4px] font-barlow text-[13px] font-medium text-[#0F171F]`}>
              {fact.linkLabel}
              <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 ease-out group-hover:translate-x-[2px] motion-reduce:transition-none">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
