import Link from 'next/link';
import { cls } from '@/archivo/lib/tokens';
import { franchiseContextLine, franchiseContextLineShort } from '../lib/copy';
import { CURRENT_SEASON, franchiseContextByCode, franchiseContextBySlug } from '../lib/data';

interface Props {
  /** Live team code (BAY) or archive slug; one of the two. */
  code?: string | null;
  slug?: string | null;
  season?: number;
  /** On the ink band (team hero, match header) or on paper. */
  onDark?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * One line of historical context for a franchise, linked to its history. Renders nothing when there is no
 * trustworthy data: never a placeholder, never "cargando". On 375px the middle segment is dropped.
 */
export default function FranchiseContextRibbon({ code, slug, season = CURRENT_SEASON, onDark = false, align = 'left', className = '' }: Props) {
  const ctx = code ? franchiseContextByCode(code) : slug ? franchiseContextBySlug(slug) : null;
  const full = franchiseContextLine(ctx, season);
  if (!ctx || !full) return null;
  const short = franchiseContextLineShort(ctx, season) ?? full;
  const href = ctx.franchise.status === 'active' && code ? `/equipos/${code.toUpperCase()}?tab=historia` : `/equipos/historicos/${ctx.franchise.slug}`;
  const color = onDark ? 'text-white/60 hover:text-white' : 'text-[rgba(0,0,0,0.55)] hover:text-[#0F171F]';
  const alignCls = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  return (
    <Link
      href={href}
      className={`block font-barlow text-[12.5px] font-medium leading-[1.3] transition-colors duration-150 md:text-[13px] ${cls.tabular} ${color} ${alignCls} rounded-[4px] ${onDark ? cls.focusOnDark : cls.focus} ${className}`}
      title={`Historia de ${ctx.franchise.fullName}`}
    >
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </Link>
  );
}
