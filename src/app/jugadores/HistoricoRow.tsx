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

export type HistoricoItem = { providerId: string; name: string; nickname: string | null; avatarUrl: string | null };

/** Grid of the historical table: player, clubs, seasons, games (phones: player with the seasons under the name, clubs, games, chevron). */
export const HIST_COLS = 'grid-cols-[minmax(0,1fr)_92px_40px_14px] md:grid-cols-[minmax(0,1fr)_180px_150px_72px]';

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
          <span className="block truncate text-[17px] leading-[1.1] text-[#0F171F]">
            {p.name}
            {p.nickname ? <span className="text-[rgba(15,23,31,0.5)]"> “{p.nickname}”</span> : null}
          </span>
          {/* Phones only: the seasons line under the name (the column is hidden there). */}
          <span className="mt-[2px] block h-[15px] truncate font-barlow text-[12px] text-[rgba(15,23,31,0.5)] md:hidden">
            {ready ? `${span} · ${cmp.seasons.length} temp.` : <Shimmer className="h-[12px] w-[96px]" />}
          </span>
        </span>
      </span>
      <span className="flex items-center">
        {ready ? (
          <span className="inline-flex items-center">
            {clubs.map((t, i) => (
              <span key={t.code} className="relative inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[rgba(15,23,31,0.1)] bg-white ring-2 ring-white" style={{ marginLeft: i ? -10 : 0, zIndex: clubs.length - i }} title={t.name}>
                <TeamLogoAvatar teamCode={t.code} size={24} />
              </span>
            ))}
          </span>
        ) : (
          <Shimmer className="h-[30px] w-[80px] rounded-full" />
        )}
      </span>
      <span className="hidden text-center font-barlow text-[13px] tabular-nums text-[rgba(15,23,31,0.7)] md:block">{ready ? <>{span} <span className="text-[rgba(15,23,31,0.45)]">· {cmp.seasons.length}</span></> : <Shimmer className="h-[13px] w-[72px]" />}</span>
      {cell(num(v.g, 0), 'w-[28px]', 'text-[rgba(15,23,31,0.7)]')}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(15,23,31,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="justify-self-end md:hidden"><path d="M4.5 2.5L8 6l-3.5 3.5" /></svg>
    </Link>
  );
}
