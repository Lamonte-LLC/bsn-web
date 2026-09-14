import type { ReactNode } from 'react';
import { cls } from '@/archivo/lib/tokens';

type Icon = 'clock' | 'table' | 'info';

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function IconGlyph({ icon }: { icon: Icon }) {
  if (icon === 'clock') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" {...STROKE} aria-hidden>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
    );
  }
  if (icon === 'table') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" {...STROKE} aria-hidden>
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
        <path d="M2 7h12M6 3v10" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...STROKE} aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7v4M8 5.2v.2" />
    </svg>
  );
}

interface Props {
  icon?: Icon;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A caveat on the same card as every other block of the site (white, 12px radius, hairline border): an icon
 * in a neutral square, a title in the display face and the text in Barlow. No tinted ground, no colored borders.
 */
export default function Callout({ icon = 'info', title, children, className = '' }: Props) {
  return (
    <div className={`${cls.card} flex items-start gap-[14px] px-[18px] py-[14px] md:px-[20px] md:py-[16px] ${className}`}>
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[#F4F4F4] text-[#0F171F]">
        <IconGlyph icon={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] leading-[1.2] text-[#0F171F] md:text-[17px]">{title}</p>
        <div className="mt-[4px] max-w-[72ch] font-barlow text-[14px] leading-[1.5] text-[rgba(0,0,0,0.65)]">{children}</div>
      </div>
    </div>
  );
}
