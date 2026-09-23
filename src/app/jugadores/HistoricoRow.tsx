'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { usePlayerComparison } from '@/historia/hooks/usePlayerComparison';
import { CAREER_SCOPE } from '@/historia/lib/compare-players';
import { nationalityLabel } from '@/historia/lib/copy';

export type HistoricoItem = { providerId: string; name: string; nickname: string | null; avatarUrl: string | null; nationality: string | null };

/** Grid of the historical table: player, clubs, seasons, games, points, PPJ, RPJ, APJ (phones: player, points, PPJ). */
export const HIST_COLS = 'grid-cols-[minmax(0,1fr)_72px_64px] md:grid-cols-[minmax(0,1fr)_120px_120px_56px_72px_64px_64px_64px]';

function Shimmer({ className }: { className: string }) {
  return <span aria-hidden className={cx('inline-block animate-pulse rounded-[4px] bg-[rgba(15,23,31,0.07)]', className)} />;
}

/**
 * One historical player. The career line (clubs, seasons, totals) comes from the comparison query, one request
 * per player, so it is only asked for once the row scrolls into view; until then the cells shimmer.
 */
export default function HistoricoRow({ p, first }: { p: HistoricoItem; first: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const cmp = usePlayerComparison(seen ? p.providerId : null);
  const ready = seen && !cmp.loading && cmp.seasons.length > 0;
  const years = cmp.seasons.map((s) => s.year);
  const span = years.length ? (Math.min(...years) === Math.max(...years) ? String(years[0]) : `${Math.min(...years)}–${Math.max(...years)}`) : '';
  // Distinct clubs in order of appearance (most recent first), capped so the stack stays legible.
  const clubs = cmp.seasons.flatMap((s) => cmp.teamsFor(s.providerId)).filter((t, i, all) => all.findIndex((x) => x.code === t.code) === i).slice(0, 4);
  const v = cmp.valuesFor(CAREER_SCOPE);
  const num = (n: number | null | undefined, d = 1) => (n === null || n === undefined ? '–' : d === 0 ? fmtInt(n) : fmt(n, d));
  const cell = (content: React.ReactNode, w: string, extra = '') => <span className={cx('text-center font-barlow text-[14px] tabular-nums', extra)}>{ready ? content : seen && !cmp.loading && !cmp.seasons.length ? <span className="text-[rgba(15,23,31,0.3)]">–</span> : <Shimmer className={cx('h-[14px]', w)} />}</span>;

  return (
    <Link
      ref={ref}
      href={`/jugadores/${p.providerId}`}
      className={cx('grid h-[56px] items-center gap-x-[8px] px-[14px] transition-colors duration-150 hover:bg-[#FAFAFA] active:bg-[#F3F3F3] motion-reduce:transition-none md:gap-x-[10px] md:px-[24px]', HIST_COLS, !first && 'border-t border-[rgba(15,23,31,0.05)]', cls.focus, 'focus-visible:outline-offset-[-2px]')}
    >
      <span className="flex min-w-0 items-center gap-[12px]">
        <PlayerAvatar name={p.name} photoUrl={p.avatarUrl ? `${p.avatarUrl}?size=200` : null} color={cmp.mainColor} sizePx={34} />
        <span className="min-w-0">
          <span className="block truncate text-[16px] leading-[1.1] text-[#0F171F]">
            {p.name}
            {p.nickname ? <span className="text-[rgba(15,23,31,0.5)]"> “{p.nickname}”</span> : null}
          </span>
          <span className="mt-[2px] block truncate font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">
            <span className="md:hidden">{ready ? `${span} · ${cmp.seasons.length} temp.` : (nationalityLabel(p.nationality) ?? ' ')}</span>
            <span className="hidden md:inline">{nationalityLabel(p.nationality) ?? ' '}</span>
          </span>
        </span>
      </span>
      <span className="hidden items-center md:flex">
        {ready ? (
          <span className="inline-flex items-center">
            {clubs.map((t, i) => (
              <span key={t.code} className="relative inline-flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[rgba(15,23,31,0.1)] bg-white ring-2 ring-white" style={{ marginLeft: i ? -8 : 0, zIndex: clubs.length - i }} title={t.name}>
                <TeamLogoAvatar teamCode={t.code} size={18} />
              </span>
            ))}
          </span>
        ) : (
          <Shimmer className="h-[24px] w-[64px] rounded-full" />
        )}
      </span>
      <span className="hidden text-center font-barlow text-[13px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{ready ? <>{span} <span className="text-[rgba(15,23,31,0.45)]">· {cmp.seasons.length}</span></> : <Shimmer className="h-[13px] w-[72px]" />}</span>
      <span className="hidden md:block">{cell(num(v.g, 0), 'w-[28px]', 'text-[rgba(15,23,31,0.7)]')}</span>
      {cell(num(v.pts, 0), 'w-[40px]', 'font-semibold text-[#0F171F]')}
      {cell(num(v.ppg), 'w-[28px]', 'text-[rgba(15,23,31,0.7)]')}
      <span className="hidden md:block">{cell(num(v.rpg), 'w-[28px]', 'text-[rgba(15,23,31,0.7)]')}</span>
      <span className="hidden md:block">{cell(num(v.apg), 'w-[28px]', 'text-[rgba(15,23,31,0.7)]')}</span>
    </Link>
  );
}
