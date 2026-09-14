'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { formatCompareValue, PLAYER_COMPARE_SECTIONS, scopeFor, scopeLabel, valuesFor, visibleStats, winningIndexes, type ComparePlayerData, type CompareScope, type PlayerCompareStat } from '@/historia/lib/compare-players';
import { eraNotes } from '@/historia/lib/copy';
import { useCompareState } from './useCompareState';

type Props = { players: ComparePlayerData[] };
type TabId = 'todos' | string;

/* Same grids as CompareStatsPanel (/comparar-equipos); the label column is narrower (260 instead of 340) so
 * the values sit close to the stat, per the approved design. */
const ROW_DIVIDER = 'border-b border-[rgba(15,23,31,0.035)]';
const GRID_TWO = 'grid-cols-[1fr_140px_1fr] lg:grid-cols-[1fr_260px_1fr]';
const GRID_LEFT_3 = 'grid-cols-[96px_repeat(3,1fr)] lg:grid-cols-[240px_repeat(3,1fr)]';
const GRID_FOUR = 'grid-cols-[1fr_1fr_92px_1fr_1fr] lg:grid-cols-[1fr_1fr_200px_1fr_1fr]';
const SECTION_STICKY_TOP = 'top-[50px] lg:top-[58px]';
const TABS_LABEL_CLASS = 'font-barlow text-[8px] font-semibold tracking-[1.2px] text-[rgba(15,23,31,0.4)] lg:text-[10px] lg:tracking-[1.6px]';

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

function useRow(stat: PlayerCompareStat, players: ComparePlayerData[], scope: ScopeOf) {
  const values = players.map((p) => valuesFor(p, scope(p))[stat.key]);
  const winners = winningIndexes(values, stat.higherIsBetter);
  return { texts: values.map((v) => formatCompareValue(v, stat.format)), winners };
}

/** Mirror row (2 players): value · centered label · value. */
function RowTwo({ stat, players, scope }: { stat: PlayerCompareStat; players: ComparePlayerData[]; scope: ScopeOf }) {
  const { texts, winners } = useRow(stat, players, scope);
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
function RowLeft({ stat, players, scope }: { stat: PlayerCompareStat; players: ComparePlayerData[]; scope: ScopeOf }) {
  const { texts, winners } = useRow(stat, players, scope);
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
function RowFour({ stat, players, scope }: { stat: PlayerCompareStat; players: ComparePlayerData[]; scope: ScopeOf }) {
  const { texts, winners } = useRow(stat, players, scope);
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

function PlayerLogo({ p, size }: { p: ComparePlayerData; size: number }) {
  if (p.teamCode) return <TeamLogoAvatar teamCode={p.teamCode} size={size} />;
  return <FranchiseLogo franchise={p.franchise} fallbackName={p.name} sizePx={size} />;
}

/** Player tab: logo + name with a 2.5px underline in the player's team color, over the row's rule. */
function PlayerTab({ p, scope, justify, compact = false, hideLogoOnMobile = false, insetUnderline = false }: { p: ComparePlayerData; scope: CompareScope; justify: 'start' | 'center' | 'end'; compact?: boolean; hideLogoOnMobile?: boolean; insetUnderline?: boolean }) {
  return (
    <div className={cx('relative flex min-w-0 items-center gap-[6px] self-stretch pb-[9px] pt-[10px] lg:gap-[8px]', { 'justify-start': justify === 'start', 'justify-center': justify === 'center', 'justify-end': justify === 'end' })}>
      <span className={cx('shrink-0', hideLogoOnMobile ? 'hidden lg:inline-flex' : 'inline-flex')}>
        <span className="lg:hidden">
          <PlayerLogo p={p} size={20} />
        </span>
        <span className="hidden lg:inline-flex">
          <PlayerLogo p={p} size={compact ? 20 : 24} />
        </span>
      </span>
      <span className="min-w-0">
        <span className={cx('block truncate text-[rgba(15,23,31,0.9)]', compact ? 'text-[13px] lg:text-[16px]' : 'text-[14px] lg:text-[17px]')}>{p.name}</span>
        <span className="block truncate font-barlow text-[10px] font-medium text-[rgba(15,23,31,0.5)] lg:text-[11px]">{scopeLabel(scope)}</span>
      </span>
      <span className={cx('absolute -bottom-[1px] h-[2.5px] rounded-full', insetUnderline ? 'left-[14px] right-[14px]' : 'left-0 right-0')} style={{ backgroundColor: p.color }} aria-hidden />
    </div>
  );
}

/** Sticky row of the selected players; a subtle shadow appears once it sticks. */
function PlayerTabsRow({ players, scope }: { players: ComparePlayerData[]; scope: ScopeOf }) {
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

  const row = cx('sticky top-0 z-[3] grid min-h-[50px] items-center border-b border-[rgba(15,23,31,0.08)] bg-white transition-shadow lg:min-h-[58px]', gridFor(count), stuck && 'shadow-[0_10px_14px_-10px_rgba(15,23,31,0.15)]');
  const label = <div className={cx('self-center pb-[12px] pt-[10px] text-center', TABS_LABEL_CLASS)}>ESTADÍSTICA</div>;

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="mt-[14px] h-px lg:mt-[22px]" />
      {count === 2 ? (
        <div className={row}>
          <PlayerTab p={players[0]} scope={scope(players[0])} justify="end" />
          {label}
          <PlayerTab p={players[1]} scope={scope(players[1])} justify="start" />
        </div>
      ) : count === 4 ? (
        <div className={row}>
          <PlayerTab p={players[0]} scope={scope(players[0])} justify="center" compact hideLogoOnMobile insetUnderline />
          <PlayerTab p={players[1]} scope={scope(players[1])} justify="center" compact hideLogoOnMobile insetUnderline />
          {label}
          <PlayerTab p={players[2]} scope={scope(players[2])} justify="center" compact hideLogoOnMobile insetUnderline />
          <PlayerTab p={players[3]} scope={scope(players[3])} justify="center" compact hideLogoOnMobile insetUnderline />
        </div>
      ) : (
        <div className={row}>
          <div className={cx('self-center text-left', TABS_LABEL_CLASS)}>ESTADÍSTICA</div>
          {players.map((p) => (
            <PlayerTab key={p.key} p={p} scope={scope(p)} justify="center" compact hideLogoOnMobile insetUnderline />
          ))}
        </div>
      )}
    </>
  );
}

export default function PlayerComparePanel({ players }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('todos');
  const { scopes } = useCompareState();
  const scope: ScopeOf = (p) => scopeFor(p, players, scopes);
  const count = players.length;
  const sections = (activeTab === 'todos' ? PLAYER_COMPARE_SECTIONS : PLAYER_COMPARE_SECTIONS.filter((s) => s.id === activeTab))
    .map((s) => ({ ...s, stats: visibleStats(s, players, scope) }))
    .filter((s) => s.stats.length);
  const notes = eraNotes({ debutYears: players.map((p) => (scope(p) === 'career' ? p.fy : (scope(p) as number))) });
  const unlinked = players.filter((p) => p.isActive && !p.slug);
  const scopeLine = players.map((p) => `${p.name.split(' ').slice(-1)[0]}: ${scopeLabel(scope(p)).toLowerCase()}`).join(' · ');

  const renderRow = (stat: PlayerCompareStat) => {
    const key = stat.code + stat.label;
    if (count === 2) return <RowTwo key={key} stat={stat} players={players} scope={scope} />;
    if (count === 4) return <RowFour key={key} stat={stat} players={players} scope={scope} />;
    return <RowLeft key={key} stat={stat} players={players} scope={scope} />;
  };

  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[18px] pt-[6px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[34px] lg:pt-[10px]">
      <div className="mt-[14px] flex flex-wrap justify-center gap-x-[14px] gap-y-[6px] lg:mt-[20px] lg:gap-x-[30px]">
        {[{ id: 'todos' as TabId, label: 'Todos', shortLabel: 'Todos' }, ...PLAYER_COMPARE_SECTIONS.map((s) => ({ id: s.id as TabId, label: s.title, shortLabel: s.shortTitle }))].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cx('cursor-pointer pb-[5px] text-[16px] transition-colors lg:pb-[6px] lg:text-[18px]', activeTab === tab.id ? 'border-b-2 border-[#0F171F] text-[#0F171F]' : 'text-[rgba(15,23,31,0.4)] hover:text-[rgba(15,23,31,0.65)]')}>
            <span className="lg:hidden">{tab.shortLabel}</span>
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <PlayerTabsRow players={players} scope={scope} />

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

      <div className="mt-[22px] flex flex-col items-center gap-[6px] border-t border-[rgba(15,23,31,0.06)] pt-[16px] text-center font-barlow text-[12px] text-[rgba(15,23,31,0.5)] lg:mt-[30px] lg:text-[13px]">
        <p>
          {scopeLine} · serie regular · mayor gana, salvo en pérdidas · empate no marca ganador
        </p>
        {notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
        {unlinked.map((p) => (
          <p key={p.key}>{p.name}: carrera histórica en proceso de vinculación; se comparan solo sus temporadas en vivo.</p>
        ))}
      </div>
    </div>
  );
}
