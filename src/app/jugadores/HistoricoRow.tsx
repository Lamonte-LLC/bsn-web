'use client';

import Link from 'next/link';
import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { fmtInt } from '@/archivo/lib/format';
import { cls, EXTINCT_CODE_COLORS } from '@/archivo/lib/tokens';
import ClubMark from '@/historia/components/ClubMark';
import { yearsSpan, type HistoricoClub, type HistoricoEntry } from './historicos-index';

/** Grid of the historical table: player, clubs, seasons, years, games (phones: player with the years under the name, clubs, games, chevron). */
export const HIST_COLS = 'grid-cols-[minmax(0,1fr)_84px_44px_16px] md:grid-cols-[minmax(0,1fr)_190px_110px_120px_110px]';

/** Numeric cell, same face and tone in every column so the three figures read as one row. */
export const HIST_NUM = 'block text-center font-barlow text-[14px] tabular-nums text-[rgba(15,23,31,0.7)]';

const clubColor = (code: string, club: HistoricoClub | undefined) => club?.color || EXTINCT_CODE_COLORS[code] || '#4A5560';

/** One historical player, everything from the static index: no request per row. */
export default function HistoricoRow({ p, clubs, first }: { p: HistoricoEntry; clubs: Record<string, HistoricoClub>; first: boolean }) {
  const stack = p.t.slice(0, 5);
  const span = yearsSpan(p.fy, p.ly);
  return (
    <Link href={`/jugadores/${p.id}`} className={cx('grid h-[56px] items-center gap-x-[8px] px-[14px] transition-colors duration-150 hover:bg-[#FAFAFA] active:bg-[#F3F3F3] motion-reduce:transition-none md:gap-x-[12px] md:px-[24px]', HIST_COLS, !first && 'border-t border-[rgba(15,23,31,0.05)]', cls.focus, 'focus-visible:outline-offset-[-2px]')}>
      <span className="flex min-w-0 items-center gap-[12px]">
        <PlayerAvatar name={p.n} photoUrl={p.a ? `${p.a}?size=200` : null} color={p.t[0] ? clubColor(p.t[0], clubs[p.t[0]]) : null} sizePx={34} />
        <span className="min-w-0">
          <span className="block truncate text-[17px] leading-[1.1] text-[#0F171F]">
            {p.n}
            {p.k ? <span className="text-[rgba(15,23,31,0.5)]"> “{p.k}”</span> : null}
          </span>
          {/* Phones only: the years line under the name (those columns are hidden there). */}
          <span className="mt-[2px] block truncate font-barlow text-[12px] tabular-nums text-[rgba(15,23,31,0.5)] md:hidden">{p.s ? `${span} · ${p.s} temp.` : 'Sin temporadas registradas'}</span>
        </span>
      </span>
      <span className="flex items-center">
        <span className="inline-flex items-center">
          {stack.map((code, i) => (
            <span key={code} className="relative inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(15,23,31,0.1)] bg-white ring-2 ring-white md:h-[30px] md:w-[30px]" style={{ marginLeft: i ? -9 : 0, zIndex: stack.length - i }} title={clubs[code]?.name ?? code}>
              <span className="flex md:hidden"><ClubMark code={code} color={clubColor(code, clubs[code])} size={20} /></span>
              <span className="hidden md:flex"><ClubMark code={code} color={clubColor(code, clubs[code])} size={24} /></span>
            </span>
          ))}
        </span>
      </span>
      <span className={cx(HIST_NUM, 'hidden md:block')}>{p.s || '–'}</span>
      <span className={cx(HIST_NUM, 'hidden md:block')}>{span}</span>
      <span className={HIST_NUM}>{p.g ? fmtInt(p.g) : '–'}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(15,23,31,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="justify-self-end md:hidden"><path d="M4.5 2.5L8 6l-3.5 3.5" /></svg>
    </Link>
  );
}
