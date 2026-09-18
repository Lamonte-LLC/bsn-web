import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import { alpha } from '@/archivo/lib/color';
import { fmtInt, initials } from '@/archivo/lib/format';
import { cls, INK } from '@/archivo/lib/tokens';
import type { Franchise } from '@/archivo/lib/types';
import type { NumberFact } from '@/historia/lib/home';
import { HOME_CARD } from './styles';

/** The mark next to a tile's number: a player's tinted initials, or one to three franchise logos. */
export interface TileMark {
  avatar?: { name: string; color: string | null };
  franchises?: Franchise[];
}

type Props = { facts: NumberFact[]; marks: Partial<Record<NumberFact['key'], TileMark>> };

function Mark({ mark }: { mark: TileMark | undefined }) {
  if (mark?.avatar) {
    const tint = mark.avatar.color ?? INK;
    return (
      <span aria-hidden className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full text-[15px] leading-none md:h-[52px] md:w-[52px]" style={{ backgroundColor: alpha(tint, 0.12), color: tint }}>
        {initials(mark.avatar.name)}
      </span>
    );
  }
  if (mark?.franchises?.length) {
    return (
      <span className="inline-flex items-center" aria-hidden>
        {mark.franchises.slice(0, 3).map((f, i) => (
          <span key={f.slug} className={`inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border-2 bg-white md:h-[52px] md:w-[52px] ${i ? '-ml-[10px]' : ''}`} style={{ borderColor: f.colors.primary ?? 'rgba(0,0,0,0.12)' }}>
            <FranchiseLogo franchise={f} sizePx={32} />
          </span>
        ))}
      </span>
    );
  }
  return null;
}

/**
 * Row C of the home section: three numbers of the league, each a tile with its mark and a link deeper into
 * the archive. The tiles rotate daily (lib/home.ts); the row only renders what it is given.
 */
export default function NumberTiles({ facts, marks }: Props) {
  if (!facts.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {facts.map((fact) => (
        <li key={fact.key} className="min-w-0">
          <div className={`${HOME_CARD} flex h-full flex-col px-[18px] pb-[18px] pt-[20px] md:px-[28px] md:pb-[24px] md:pt-[26px] lg:px-[36px] lg:pt-[30px]`}>
            <div className="flex items-center gap-[14px]">
              <p className={`text-[44px] leading-[1] text-[#0F171F] md:text-[56px] ${cls.tabular}`}>{fmtInt(fact.value)}</p>
              <Mark mark={marks[fact.key]} />
            </div>
            <p className="mt-[16px] font-barlow text-[15px] leading-[1.45] text-[rgba(15,23,31,0.6)] md:text-[16px]">
              {fact.lead} <b className="font-semibold text-[#0F171F]">{fact.subject}</b>
              {fact.tail}
            </p>
            <Link href={fact.href} className={`mt-auto inline-flex items-center gap-[6px] pt-[16px] font-barlow text-[15px] font-medium text-[#1772D9] transition-colors duration-150 hover:text-[#1257A8] ${cls.focus} rounded-[3px] self-start`}>
              {fact.linkLabel} →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
