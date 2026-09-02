import type { ReactNode } from 'react';
import Link from 'next/link';

/** White card on paper, per DESIGN_SYSTEM.md rule 4. */
export function PaperCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)] ${className}`}>{children}</div>;
}

export function SectionTitle({ children, right, className = '' }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 flex flex-row items-end justify-between gap-4 md:mb-[22px] ${className}`}>
      <h2 className="text-[22px] text-black md:text-[24px]">{children}</h2>
      {right ? <div className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">{right}</div> : null}
    </div>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-barlow text-[12px] font-semibold uppercase tracking-[1.6px] text-[rgba(15,23,31,0.6)] ${className}`}>{children}</p>;
}

/** Hero title on the ink band. */
export function HeroTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[38px] leading-[1] tracking-[0.4px] text-white lg:text-[42px] ${className}`}>{children}</h1>;
}

export function HeroEyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-[8px] font-barlow text-[12px] font-semibold uppercase tracking-[1.6px] text-white/60">{children}</p>;
}

export function HeroMeta({ children }: { children: ReactNode }) {
  return <p className="mt-[8px] font-barlow text-[14px] font-medium text-white/70">{children}</p>;
}

/** Big numeral with a label underneath (career summary, counters). */
export function StatBlock({ value, label, hint }: { value: ReactNode; label: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[32px] leading-[1] text-black [font-variant-numeric:tabular-nums] md:text-[38px]">{value}</div>
      <div className="mt-[6px] font-barlow text-[12px] font-medium uppercase tracking-[1px] text-[rgba(15,23,31,0.6)]">{label}</div>
      {hint ? <div className="mt-[2px] font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{hint}</div> : null}
    </div>
  );
}

/** Pill chip; pass href to make it a link. */
export function Chip({ children, href, active = false, className = '' }: { children: ReactNode; href?: string; active?: boolean; className?: string }) {
  const cls = `inline-flex items-center gap-[6px] rounded-[100px] border px-[12px] py-[4px] font-barlow text-[13px] font-medium transition-colors duration-150 ${
    active ? 'border-[#0F171F] bg-[#0F171F] text-white' : 'border-[#D5D5D5] bg-white text-[rgba(0,0,0,0.65)] hover:border-[rgba(47,47,47,1)]'
  } ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

/** Badge for MVPs / championships. */
export function Badge({ children, tone = 'gold', className = '' }: { children: ReactNode; tone?: 'gold' | 'red' | 'ink'; className?: string }) {
  const tones = {
    gold: 'bg-[rgba(254,194,0,0.16)] text-[rgba(15,23,31,0.9)] border-[rgba(254,194,0,0.5)]',
    red: 'bg-[rgba(229,31,31,0.10)] text-[rgba(15,23,31,0.9)] border-[rgba(229,31,31,0.4)]',
    ink: 'bg-[#0F171F] text-white border-[#0F171F]',
  } as const;
  return <span className={`inline-flex items-center gap-[5px] rounded-[6px] border px-[8px] py-[3px] font-barlow text-[12px] font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-[12px] border border-dashed border-[#D5D5D5] px-4 py-8 text-center font-barlow text-[13px] text-[rgba(0,0,0,0.5)]">{children}</p>;
}

/** Inline text link in the brand blue. */
export function TextLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`font-barlow text-[13px] font-medium text-[#1772D9] transition-colors duration-150 hover:text-[#1257A8] ${className}`}>
      {children}
    </Link>
  );
}
