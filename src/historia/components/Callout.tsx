import type { ReactNode } from 'react';

type Icon = 'clock' | 'table' | 'info';

const STROKE = { fill: 'none', stroke: '#0F171F', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function IconGlyph({ icon }: { icon: Icon }) {
  if (icon === 'clock') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" {...STROKE} aria-hidden>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
    );
  }
  if (icon === 'table') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" {...STROKE} aria-hidden>
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
        <path d="M2 7h12M6 3v10" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" {...STROKE} aria-hidden>
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
 * A caveat as a friendly box: soft ground, an icon in a white disc, a short title and the text. Replaces the
 * loose grey lines under tables (era notes, data coverage, missing records). No colored borders.
 */
export default function Callout({ icon = 'info', title, children, className = '' }: Props) {
  return (
    <div className={`flex items-start gap-[12px] rounded-[10px] border border-[rgba(15,23,31,0.06)] bg-[#F4F6F8] px-[14px] py-[12px] ${className}`}>
      <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,31,0.08)] bg-white">
        <IconGlyph icon={icon} />
      </span>
      <div className="min-w-0">
        <p className="font-barlow text-[13px] font-semibold text-[#0F171F]">{title}</p>
        <div className="mt-[2px] font-barlow text-[13px] leading-[1.45] text-[rgba(15,23,31,0.65)]">{children}</div>
      </div>
    </div>
  );
}
