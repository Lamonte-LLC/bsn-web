'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { usePlayerComparison, type SeasonTeam } from '@/historia/hooks/usePlayerComparison';
import { EMPTY_VALUES, formatCompareValue, PLAYER_COMPARE_SECTIONS, scopeFor, scopeLabel, visibleStats, winningIndexes, type ComparePlayerData, type CompareScope, type CompareValues, type PlayerCompareStat } from '@/historia/lib/compare-players';
import { eraNotes } from '@/historia/lib/copy';
import { initialName } from '@/archivo/lib/names';
import { cls } from '@/archivo/lib/tokens';
import { useCompareState } from './useCompareState';

type Props = { players: ComparePlayerData[] };
type TabId = 'promedio' | 'totales';

/* Same grids as CompareStatsPanel (/comparar-equipos); the label column is narrower (260 instead of 340) so
 * the values sit close to the stat, per the approved design. */
const ROW_DIVIDER = 'border-b border-[rgba(15,23,31,0.035)]';
const GRID_TWO = 'grid-cols-[1fr_140px_1fr] lg:grid-cols-[1fr_260px_1fr]';
const GRID_LEFT_3 = 'grid-cols-[96px_repeat(3,1fr)] lg:grid-cols-[240px_repeat(3,1fr)]';
const GRID_FOUR = 'grid-cols-[1fr_1fr_92px_1fr_1fr] lg:grid-cols-[1fr_1fr_200px_1fr_1fr]';
const SECTION_STICKY_TOP = 'top-[46px] lg:top-[56px]';
/* Two views: averages and totals. Shooting splits stay in the season tables. */
const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'promedio', label: 'Promedio' },
  { id: 'totales', label: 'Totales' },
];
const TABS_LABEL_CLASS = 'font-barlow text-[9px] font-semibold tracking-[1.2px] text-[rgba(15,23,31,0.4)] lg:text-[11px] lg:tracking-[1.6px]';

function gridFor(count: number): string {
  if (count === 2) return GRID_TWO;
  if (count === 3) return GRID_LEFT_3;
  return GRID_FOUR;
}

function WinnerDot({ color, side }: { color: string; side: 'left' | 'right' }) {
  return <span className={cx('absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full lg:h-[7px] lg:w-[7px]', side === 'left' ? '-left-[14px] lg:-left-[16px]' : '-right-[12px] lg:-right-[15px]')} style={{ backgroundColor: color }} aria-hidden />;
}

function StatLabel({ stat, align }: { stat: PlayerCompareStat; align: 'center' | 'left' }) {
  return (
    <div className={cx('font-barlow', align === 'center' ? 'px-[6px] text-center lg:px-[10px]' : 'pr-[8px] text-left lg:pr-[16px]')}>
      <div className="text-[11px] font-semibold text-[rgba(15,23,31,0.65)] lg:text-[13px]">{stat.code}</div>
      <div className="mt-[1px] text-[9px] leading-[1.3] text-[rgba(15,23,31,0.45)] lg:text-[11px]">{stat.label}</div>
    </div>
  );
}

function Value({ text, winner, color, side, size }: { text: string; winner: boolean; color: string; side: 'left' | 'right'; size: string }) {
  return (
    <span className={cx('relative leading-none tabular-nums', size, winner ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.25)]')}>
      {text}
      {winner ? <WinnerDot color={color} side={side} /> : null}
    </span>
  );
}

type ScopeOf = (p: ComparePlayerData) => CompareScope;
type ScopeNameOf = (p: ComparePlayerData) => string;
type ValuesOf = (p: ComparePlayerData) => CompareValues;

/** A player as PlayerTab renders it: the equipo(s) of the currently selected season, and a color derived
 * from the first of those (instead of the fixed color of the player's current team). */
type DisplayPlayer = ComparePlayerData & { teams: SeasonTeam[]; colors: string[] };

function useRow(stat: PlayerCompareStat, players: ComparePlayerData[], valuesOf: ValuesOf) {
  const values = players.map((p) => valuesOf(p)[stat.key]);
  const winners = winningIndexes(values, stat.higherIsBetter);
  return { texts: values.map((v) => formatCompareValue(v, stat.format)), winners };
}

/** Mirror row (2 players): value · centered label · value. */
function RowTwo({ stat, players, valuesOf }: { stat: PlayerCompareStat; players: ComparePlayerData[]; valuesOf: ValuesOf }) {
  const { texts, winners } = useRow(stat, players, valuesOf);
  return (
    <div className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[13px]', GRID_TWO, ROW_DIVIDER)}>
      <div className="text-right">
        <Value text={texts[0]} winner={winners.includes(0)} color={players[0].color} side="left" size="text-[22px] lg:text-[30px]" />
      </div>
      <StatLabel stat={stat} align="center" />
      <div>
        <Value text={texts[1]} winner={winners.includes(1)} color={players[1].color} side="right" size="text-[22px] lg:text-[30px]" />
      </div>
    </div>
  );
}

/** Three players: label on the left, one column per player. */
function RowLeft({ stat, players, valuesOf }: { stat: PlayerCompareStat; players: ComparePlayerData[]; valuesOf: ValuesOf }) {
  const { texts, winners } = useRow(stat, players, valuesOf);
  return (
    <div className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[14px]', GRID_LEFT_3, ROW_DIVIDER)}>
      <StatLabel stat={stat} align="left" />
      {players.map((p, i) => (
        <div key={p.key} className="text-center">
          <Value text={texts[i]} winner={winners.includes(i)} color={p.color} side="right" size="text-[18px] lg:text-[28px]" />
        </div>
      ))}
    </div>
  );
}

/** Four players: two values · centered label · two values. */
function RowFour({ stat, players, valuesOf }: { stat: PlayerCompareStat; players: ComparePlayerData[]; valuesOf: ValuesOf }) {
  const { texts, winners } = useRow(stat, players, valuesOf);
  const cell = (i: number) => (
    <div key={players[i].key} className="text-center">
      <Value text={texts[i]} winner={winners.includes(i)} color={players[i].color} side="right" size="text-[16px] lg:text-[26px]" />
    </div>
  );
  return (
    <div className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[14px]', GRID_FOUR, ROW_DIVIDER)}>
      {cell(0)}
      {cell(1)}
      <StatLabel stat={stat} align="center" />
      {cell(2)}
      {cell(3)}
    </div>
  );
}

function SectionTitle({ title, align = 'center' }: { title: string; align?: 'center' | 'left' }) {
  return (
    <div className={cx('sticky z-[2] flex items-center gap-[12px] bg-white pb-[4px] pt-[16px] lg:gap-[14px] lg:pb-[8px] lg:pt-[26px]', SECTION_STICKY_TOP)}>
      {align === 'center' ? <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" /> : null}
      <span className="text-[17px] tracking-[0.3px] text-[#0F171F] lg:text-[20px]">{title}</span>
      <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" />
    </div>
  );
}

/**
 * The club(s) of the scope. A season with more than one club (a mid-season trade) stacks the logos: each one on a
 * white disc with a hairline and a white ring so they read apart, overlapping left to right, and the latest club
 * (the last of the season's list) on top and fully visible.
 */
function PlayerLogo({ p, size, stack = true }: { p: DisplayPlayer; size: number; /** Two clubs as stacked logos; on phones (false) the player's own photo stands in, there's no room for the pair. */ stack?: boolean }) {
  if (p.teams.length > 1 && !stack) return <PlayerPhoto p={p} size={size} />;
  if (p.teams.length > 1) {
    const disc = size + 4;
    return (
      <span className="inline-flex items-center" style={{ paddingRight: 2 }} aria-hidden>
        {p.teams.map((team, i) => (
          <span
            key={team.providerId}
            className="relative inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,31,0.1)] bg-white ring-2 ring-white"
            style={{ width: disc, height: disc, marginLeft: i ? -Math.round(disc * 0.36) : 0, zIndex: i + 1 }}
          >
            <TeamLogoAvatar teamCode={team.code} size={size - 2} />
          </span>
        ))}
      </span>
    );
  }
  if (p.teams.length) return <TeamLogoAvatar teamCode={p.teams[0].code} size={size} />;
  // Career scope belongs to no club: the player's own photo, or the initials placeholder.
  return <PlayerPhoto p={p} size={size} />;
}

function PlayerPhoto({ p, size }: { p: DisplayPlayer; size: number }) {
  return <PlayerAvatar name={p.name} photoUrl={p.avatarUrl ? `${p.avatarUrl}?size=200` : null} color={p.color} sizePx={size} />;
}

/**
 * Player tab: logo(s) + name with a 2.5px underline in the player's team color, exactly as wide as the logo and
 * the name (the abbreviated name on phones), sitting on the row's rule.
 */
function PlayerTab({ p, scopeName, justify, compact = false, hideLogoOnMobile = false }: { p: DisplayPlayer; scopeName: string; justify: 'start' | 'center' | 'end'; compact?: boolean; hideLogoOnMobile?: boolean }) {
  return (
    <div className={cx('flex min-w-0 items-stretch self-stretch', { 'justify-start': justify === 'start', 'justify-center': justify === 'center', 'justify-end': justify === 'end' })}>
      <span className="relative flex min-w-0 items-center gap-[6px] py-[8px] lg:gap-[7px]">
        {/* The mark is as tall as the two text lines; the career photo runs a step larger than a club logo. */}
        <span className={cx('shrink-0', hideLogoOnMobile ? 'hidden lg:inline-flex' : 'inline-flex')}>
          <span className="lg:hidden">
            <PlayerLogo p={p} size={p.teams.length === 1 ? 24 : 28} stack={false} />
          </span>
          <span className="hidden lg:inline-flex">
            <PlayerLogo p={p} size={p.teams.length ? (compact ? 24 : 28) : compact ? 28 : 32} />
          </span>
        </span>
        <span className="min-w-0">
          <span className={cx('block truncate leading-[1] text-[rgba(15,23,31,0.9)]', compact ? 'text-[14px] lg:text-[16px]' : 'text-[15px] lg:text-[17px]')} title={p.name}>
            <span className="lg:hidden">{initialName(p.name)}</span>
            <span className="hidden lg:inline">{p.name}</span>
          </span>
          {/* Barlow's ink sits ~0.5px to the right of the display face's at these sizes; nudge so both lines start on the same pixel. */}
          <span className="-ml-[0.5px] mt-[3px] block truncate font-barlow text-[11px] font-medium leading-[1] text-[rgba(15,23,31,0.5)] lg:mt-[5px] lg:text-[13px]">{scopeName}</span>
        </span>
        {/* One color per club of the scope: a season with two clubs splits the rule 50/50. */}
        <span className="absolute -bottom-[1px] left-0 right-0 flex h-[2.5px] overflow-hidden" aria-hidden>
          {p.colors.map((c, i) => (
            <span key={`${c}-${i}`} className="h-full flex-1" style={{ backgroundColor: c }} />
          ))}
        </span>
      </span>
    </div>
  );
}

/** Sticky row of the selected players; a subtle shadow appears once it sticks. */
function PlayerTabsRow({ players, scopeName }: { players: DisplayPlayer[]; scopeName: ScopeNameOf }) {
  const count = players.length;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const row = cx('sticky top-0 z-[3] grid min-h-[46px] items-center border-b border-[rgba(15,23,31,0.08)] bg-white transition-shadow lg:min-h-[56px]', gridFor(count), stuck && 'shadow-[0_10px_14px_-10px_rgba(15,23,31,0.15)]');
  const label = <div className={cx('self-center pb-[12px] pt-[10px] text-center', TABS_LABEL_CLASS)}>ESTADÍSTICA</div>;

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="mt-[14px] h-px lg:mt-[22px]" />
      {count === 2 ? (
        <div className={row}>
          <PlayerTab p={players[0]} scopeName={scopeName(players[0])} justify="end" />
          {label}
          <PlayerTab p={players[1]} scopeName={scopeName(players[1])} justify="start" />
        </div>
      ) : count === 4 ? (
        <div className={row}>
          <PlayerTab p={players[0]} scopeName={scopeName(players[0])} justify="center" compact hideLogoOnMobile />
          <PlayerTab p={players[1]} scopeName={scopeName(players[1])} justify="center" compact hideLogoOnMobile />
          {label}
          <PlayerTab p={players[2]} scopeName={scopeName(players[2])} justify="center" compact hideLogoOnMobile />
          <PlayerTab p={players[3]} scopeName={scopeName(players[3])} justify="center" compact hideLogoOnMobile />
        </div>
      ) : (
        <div className={row}>
          <div className={cx('self-center text-left', TABS_LABEL_CLASS)}>ESTADÍSTICA</div>
          {players.map((p) => (
            <PlayerTab key={p.key} p={p} scopeName={scopeName(p)} justify="center" compact hideLogoOnMobile />
          ))}
        </div>
      )}
    </>
  );
}

export default function PlayerComparePanel({ players }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('promedio');
  const { scopes } = useCompareState();

  // Fixed slots (MAX_COMPARE_PLAYERS): hooks must run the same number of times every render.
  const slots = [players[0] ?? null, players[1] ?? null, players[2] ?? null, players[3] ?? null];
  const comparisons = [
    usePlayerComparison(slots[0]?.providerId ?? null),
    usePlayerComparison(slots[1]?.providerId ?? null),
    usePlayerComparison(slots[2]?.providerId ?? null),
    usePlayerComparison(slots[3]?.providerId ?? null),
  ];
  // Matched by key (not object identity/indexOf): displayPlayers below are spread copies of `players`.
  const comparisonOf = (p: ComparePlayerData) => comparisons[players.findIndex((pl) => pl.key === p.key)];

  const scope: ScopeOf = (p) => scopeFor(p, scopes, comparisonOf(p)?.currentSeasonProviderId ?? '');
  const scopeName: ScopeNameOf = (p) => scopeLabel(comparisonOf(p)?.nameFor(scope(p)) ?? '');
  const valuesOf: ValuesOf = (p) => comparisonOf(p)?.valuesFor(scope(p)) ?? EMPTY_VALUES;
  const displayPlayers: DisplayPlayer[] = players.map((p) => {
    const cmp = comparisonOf(p);
    const teams = cmp?.teamsFor(scope(p)) ?? [];
    // Career: the club the player is identified with (most seasons; latest on a tie). A season: its club(s).
    const colors = cmp?.colorsFor(scope(p), p.color) ?? [p.color];
    return { ...p, teams, colors, color: colors[0] };
  });

  const count = players.length;
  const sections = PLAYER_COMPARE_SECTIONS.filter((s) => s.id === activeTab)
    .map((s) => ({ ...s, stats: visibleStats(s, players, valuesOf) }))
    .filter((s) => s.stats.length);
  // Era caveats: the selected season's year, or the debut year when the whole career is on the table.
  const notes = eraNotes({
    debutYears: players
      .map((p) => {
        const cmp = comparisonOf(p);
        const sel = cmp?.seasonFor(scope(p))?.year;
        return sel ?? cmp?.seasons.reduce<number | undefined>((m, s) => (m === undefined || s.year < m ? s.year : m), undefined);
      })
      .filter((y): y is number => y !== undefined),
  });

  const renderRow = (stat: PlayerCompareStat) => {
    const key = stat.code + stat.label;
    if (count === 2) return <RowTwo key={key} stat={stat} players={displayPlayers} valuesOf={valuesOf} />;
    if (count === 4) return <RowFour key={key} stat={stat} players={displayPlayers} valuesOf={valuesOf} />;
    return <RowLeft key={key} stat={stat} players={displayPlayers} valuesOf={valuesOf} />;
  };

  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[18px] pt-[6px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[34px] lg:pt-[10px]">
      <div className="mt-[14px] flex flex-wrap justify-center gap-x-[14px] gap-y-[6px] lg:mt-[20px] lg:gap-x-[30px]">
        {TABS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cx(`cursor-pointer pb-[5px] text-[17px] transition-colors duration-200 ease-out ${cls.focus} lg:pb-[6px] lg:text-[19px]`, activeTab === tab.id ? 'border-b-2 border-[#0F171F] text-[#0F171F]' : 'text-[rgba(15,23,31,0.4)] hover:text-[rgba(15,23,31,0.65)]')}>
            {tab.label}
          </button>
        ))}
      </div>

      <PlayerTabsRow players={displayPlayers} scopeName={scopeName} />

      {sections.length ? (
        sections.map((section) => (
          <div key={section.id}>
            <SectionTitle title={section.title} align={count === 3 ? 'left' : 'center'} />
            {section.stats.map(renderRow)}
          </div>
        ))
      ) : (
        <p className="py-[26px] text-center font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.55)]">No hay datos para esta vista con los alcances elegidos.</p>
      )}

      {/* Fine print: only the caveats of the data, never a repeat of what is being compared, plus a quiet way to report a discrepancy. */}
      <div className="mt-[22px] flex flex-col items-center gap-[4px] border-t border-[rgba(15,23,31,0.06)] pt-[14px] text-center font-barlow text-[11.5px] italic leading-[1.5] text-[rgba(15,23,31,0.45)] lg:mt-[30px] lg:text-[12.5px]">
        {/* 300px keeps a two-line note breaking evenly even where text-wrap: balance isn't supported (no lone
            "de 2010."); on phones the mail link takes its own line. */}
        {notes.map((n) => (
          <p key={n} className="max-w-[300px] [text-wrap:balance] lg:max-w-none">
            {n}
          </p>
        ))}
        <p className="max-w-[300px] [text-wrap:balance] lg:max-w-none">
          ¿Ves una discrepancia o falta algún dato?{' '}
          <a href="mailto:media@bsnpr.com?subject=Corrección%20de%20datos%20·%20Comparación%20de%20jugadores" className={`mt-[2px] block not-italic font-medium lg:ml-[4px] lg:mt-0 lg:inline text-[rgba(15,23,31,0.6)] underline decoration-[rgba(15,23,31,0.25)] underline-offset-[3px] transition-colors duration-150 hover:text-[#0F171F] hover:decoration-[rgba(15,23,31,0.5)] ${cls.focus} rounded-[3px]`}>
            Escríbenos a media@bsnpr.com
          </a>
        </p>
      </div>
    </div>
  );
}
