import type { ReactNode } from 'react';
import Link from 'next/link';
import { cls } from '../lib/tokens';

interface Runner {
  key: string;
  href: string;
  label: string;
  value: string;
}

interface Props {
  label: string;
  href: string;
  avatar: ReactNode;
  value: string;
  name: string;
  context?: string;
  runners?: Runner[];
  /** "record": hero number next to the avatar. "leader": name first, number on the right. */
  variant?: 'record' | 'leader';
  className?: string;
}

/**
 * Card of a record or a category leader: the number is the protagonist, context stays secondary, and the
 * whole top block is the tap target. Runners-up sit under a hairline.
 */
export default function LeaderCard({ label, href, avatar, value, name, context, runners = [], variant = 'record', className = '' }: Props) {
  return (
    <div className={`${cls.cardTap} px-[18px] pb-[14px] pt-[16px] md:px-[20px] md:pt-[18px] ${className}`}>
      <p className={`${cls.label} !text-[9.5px]`}>{label}</p>
      <Link href={href} className={`mt-[12px] flex items-center gap-[12px] rounded-[6px] md:gap-[14px] ${cls.focus}`}>
        {avatar}
        {variant === 'record' ? (
          <span className="min-w-0">
            <span className={`block text-[36px] leading-[1] text-[#0F171F] md:text-[40px] ${cls.tabular}`}>{value}</span>
            <span className="mt-[3px] block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{name}</span>
            {context ? <span className={`block truncate ${cls.meta}`}>{context}</span> : null}
          </span>
        ) : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{name}</span>
              {context ? <span className={`block truncate ${cls.meta} !text-[12px]`}>{context}</span> : null}
            </span>
            <span className={`shrink-0 text-[26px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{value}</span>
          </>
        )}
      </Link>
      {runners.length ? (
        <ol className={`mt-[14px] flex flex-col gap-[6px] border-t border-[rgba(0,0,0,0.06)] pt-[10px] ${cls.tabular}`}>
          {runners.map((r, i) => (
            <li key={r.key} className="flex items-center justify-between gap-[10px] font-barlow text-[13px] text-[rgba(0,0,0,0.65)]">
              <Link href={r.href} className={`min-w-0 truncate rounded-[4px] transition-colors duration-150 hover:text-[#0F171F] ${cls.focus}`}>
                {i + 2}. {r.label}
              </Link>
              <span className="shrink-0 font-semibold text-[#0F171F]">{r.value}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
