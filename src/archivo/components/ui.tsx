import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cls } from '../lib/tokens';

/* ---------- Surfaces ---------- */

/** White card on paper. `tap` = the whole card is a target: hover raises the system shadow, no lift. */
export function PaperCard({ children, className = '', tap = false }: { children: ReactNode; className?: string; tap?: boolean }) {
  return <div className={`${tap ? cls.cardTap : cls.card} ${className}`}>{children}</div>;
}

/** Card that is a link in its entirety. */
export function CardLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`block ${cls.cardTap} ${cls.focus} ${className}`}>
      {children}
    </Link>
  );
}

/* ---------- Typography ---------- */

/** Section title in the display face, with an optional right-hand slot (tabs, badges, a count). */
export function SectionTitle({ children, right, className = '' }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`mb-[14px] flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-[10px] md:mb-[16px] ${className}`}>
      <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">{children}</h2>
      {right ? <div className="flex items-center gap-[8px]">{right}</div> : null}
    </div>
  );
}

/** Container title inside a card: Barlow 700, full ink, never caps. */
export function ContainerTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`${cls.title} ${className}`}>{children}</h3>;
}

/** Unit or column label: small caps at 45%. Use sparingly, one per group. */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`block ${cls.label} ${className}`}>{children}</span>;
}

/** Eyebrow above a page title on paper. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`${cls.eyebrow} ${className}`}>{children}</p>;
}

/** Source or footnote line under a visual. */
export function Note({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p id={id} className={`max-w-[68ch] ${cls.note} ${className}`}>
      {children}
    </p>
  );
}

/** Era note: a quiet gray block, never a left border. */
export function EraNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`max-w-[68ch] rounded-[8px] bg-[#F6F6F6] px-[18px] py-[14px] font-barlow text-[13px] leading-[1.5] text-[rgba(0,0,0,0.65)] ${className}`}>{children}</p>;
}

/* ---------- Hero (ink band) ---------- */

export function HeroTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[34px] leading-[1] text-white lg:text-[42px] ${className}`}>{children}</h1>;
}

export function HeroEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mb-[6px] font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50 ${className}`}>{children}</p>;
}

export function HeroMeta({ children }: { children: ReactNode }) {
  return <p className="mt-[8px] font-barlow text-[14px] font-medium text-white/70">{children}</p>;
}

/* ---------- Numbers ---------- */

/** Big numeral with a label underneath (career summary, counters). Nulls render quieter, never as zero. */
export function StatBlock({ value, label, hint, size = 'md' }: { value: ReactNode; label: ReactNode; hint?: ReactNode; size?: 'md' | 'lg' }) {
  const empty = value === '–' || value === null || value === undefined;
  return (
    <div className="min-w-0">
      <div className={`leading-[1] ${cls.tabular} ${size === 'lg' ? 'text-[38px] md:text-[44px]' : 'text-[30px] md:text-[34px]'} ${empty ? 'text-[rgba(0,0,0,0.3)]' : 'text-[#0F171F]'}`}>{empty ? '–' : value}</div>
      <div className="mt-[7px] font-barlow text-[10.5px] font-semibold uppercase tracking-[1.5px] text-[rgba(0,0,0,0.45)]">{label}</div>
      {hint ? <div className={`mt-[2px] ${cls.meta}`}>{hint}</div> : null}
    </div>
  );
}

/* ---------- Chips ---------- */

const CHIP_BASE = `inline-flex items-center gap-[7px] font-barlow text-[13.5px] font-semibold leading-[1.2] transition-colors duration-150 ${cls.focus}`;
const CHIP_STATE = {
  idle: 'border border-[rgba(0,0,0,0.14)] bg-white text-[#0F171F] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA]',
  active: 'border border-[#0F171F] bg-[#0F171F] text-white',
} as const;

/** Year chip: square-ish, tabular. Pass href to make it a link. */
export function YearChip({ children, href, active = false, className = '' }: { children: ReactNode; href?: string; active?: boolean; className?: string }) {
  const c = `${CHIP_BASE} rounded-[8px] px-[13px] py-[6px] ${cls.tabular} ${active ? CHIP_STATE.active : CHIP_STATE.idle} ${className}`;
  return href ? (
    <Link href={href} className={c} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  ) : (
    <span className={c}>{children}</span>
  );
}

/** Franchise chip: pill with a 20px logo chip on the left. Pass href to make it a link. */
export function Chip({ children, href, active = false, className = '' }: { children: ReactNode; href?: string; active?: boolean; className?: string }) {
  const c = `${CHIP_BASE} rounded-[99px] py-[5px] pl-[6px] pr-[13px] ${active ? CHIP_STATE.active : CHIP_STATE.idle} ${className}`;
  return href ? (
    <Link href={href} className={c} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  ) : (
    <span className={c}>{children}</span>
  );
}

/** Alphabet filter chip: the only chip that turns red when active (it is navigation inside the index). */
export function AlphaChip({ letter, active, disabled, onClick }: { letter: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[99px] border font-barlow text-[14px] font-semibold transition-colors duration-150 md:h-[34px] md:w-[34px] ${cls.focus} ${
        active
          ? 'border-[#E51F1F] bg-[#E51F1F] text-white'
          : disabled
            ? 'cursor-default border-[rgba(0,0,0,0.07)] text-[rgba(0,0,0,0.25)]'
            : 'border-[rgba(0,0,0,0.14)] bg-white text-[rgba(0,0,0,0.65)] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] hover:text-[#0F171F]'
      }`}
    >
      {letter}
    </button>
  );
}

/* ---------- Badges ---------- */

/** Outline pill for honors: MVP (gold) and titles (neutral). `onDark` for the ink band. */
export function Badge({ children, tone = 'gold', onDark = false, className = '' }: { children: ReactNode; tone?: 'gold' | 'ink'; onDark?: boolean; className?: string }) {
  const tones = onDark
    ? { gold: 'border-[rgba(254,194,0,0.5)] text-[#FEC200]', ink: 'border-white/25 text-white/90' }
    : { gold: 'border-[rgba(217,166,46,0.55)] text-[#9A7712]', ink: 'border-[rgba(0,0,0,0.16)] text-[rgba(0,0,0,0.65)]' };
  return <span className={`inline-flex items-center gap-[5px] rounded-[99px] border px-[11px] py-[3px] font-barlow text-[11.5px] font-semibold leading-[1.3] ${cls.tabular} ${tones[tone]} ${className}`}>{children}</span>;
}

/* ---------- Buttons ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary'; href?: string; onDark?: boolean; className?: string; children: ReactNode };

const BUTTON = {
  primary: 'h-[38px] rounded-[99px] border border-[#0F171F] bg-[#0F171F] px-[20px] text-[15px] text-white hover:bg-[#17222D] disabled:cursor-not-allowed disabled:opacity-40',
  secondary: 'h-[34px] rounded-[99px] border border-[rgba(0,0,0,0.16)] bg-white px-[15px] text-[14px] text-[rgba(0,0,0,0.65)] hover:border-[rgba(0,0,0,0.3)] hover:bg-[#FAFAFA] hover:text-[#0F171F] disabled:cursor-not-allowed disabled:opacity-40',
  onDark: 'h-[38px] rounded-[99px] border border-white/30 px-[18px] text-[15px] text-white hover:border-white/60 hover:bg-white/5',
} as const;

/** Pill button in the display face. Primary = solid ink; secondary = outline; onDark = outline on the band. */
export function Button({ variant = 'primary', href, onDark = false, className = '', children, ...rest }: ButtonProps) {
  const c = `inline-flex shrink-0 cursor-pointer items-center justify-center gap-[7px] leading-[1] transition-colors duration-150 active:translate-y-[1px] ${onDark ? BUTTON.onDark : BUTTON[variant]} ${onDark ? cls.focusOnDark : cls.focus} ${className}`;
  if (href) {
    return (
      <Link href={href} className={c}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={c} {...rest}>
      {children}
    </button>
  );
}

/* ---------- States ---------- */

/** Empty state: one line and, optionally, one link. No illustration. */
export function EmptyState({ children, href, linkLabel, className = '' }: { children: ReactNode; href?: string; linkLabel?: string; className?: string }) {
  return (
    <div className={`${cls.card} px-[16px] py-[24px] text-center ${className}`}>
      <p className="font-barlow text-[14px] font-medium text-[rgba(0,0,0,0.55)]">{children}</p>
      {href && linkLabel ? (
        <Link href={href} className={`mt-[6px] inline-block ${cls.textLink}`}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** Skeleton bars with the system pulse. `rows` controls how many lines. */
export function Skeleton({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  const widths = ['70%', '100%', '85%', '92%', '78%', '96%'];
  return (
    <div aria-hidden className={`flex flex-col gap-[12px] ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-[6px] ${i === 0 ? 'h-[11px] bg-[#E4E4E4]' : 'h-[15px] bg-[#ECECEC]'}`} style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  );
}

/** Inline text link in the brand blue. */
export function TextLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`${cls.textLink} ${className}`}>
      {children}
    </Link>
  );
}

/** "no registrado": a whole column absent in an era. Keeps the grid, never breaks it. */
export function NotRecorded() {
  return <span className="font-barlow text-[12px] font-normal text-[rgba(0,0,0,0.38)]">no registrado</span>;
}

/** Magnifier, the one icon the archive uses. */
export function SearchIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M14 14l-3.5-3.5" />
    </svg>
  );
}

/** Chevron used by scroll hints and disclosures. */
export function Chevron({ size = 14, className = '', direction = 'right' }: { size?: number; className?: string; direction?: 'right' | 'down' }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {direction === 'right' ? <path d="M6 3.5l5 4.5-5 4.5" /> : <path d="M3 5.5l5 5 5-5" />}
    </svg>
  );
}
