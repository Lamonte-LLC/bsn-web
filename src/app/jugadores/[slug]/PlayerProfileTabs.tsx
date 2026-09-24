'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { cls } from '@/archivo/lib/tokens';
import ClubMark from '@/historia/components/ClubMark';
import { compareHref } from '@/historia/lib/compare-players';
import { eraNotes } from '@/historia/lib/copy';
import ScrollHint from '@/shared/client/components/ui/ScrollHint';
import PlayerMatchesWidget from '@/player/client/widgets/PlayerMatchesWidget';
import GameInsights from './GameInsights';
import SeasonTrend from './SeasonTrend';
import { DASH, f0, f1, pct, signed, type LineStats, type PlayerProfileData, type SeasonLine } from './profile-data';

type Props = {
  profile: PlayerProfileData;
  /** Year of the league's current season, for the first tab when the player has no line in it yet. */
  currentYear: number | null;
};

const CARD = 'rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white shadow-[0_1px_2px_rgba(15,23,31,0.04),0_6px_16px_rgba(15,23,31,0.05)]';
const PANEL_CARD = 'rounded-[12px] border border-[rgba(15,23,31,0.08)] bg-white';
const TAB = `relative cursor-pointer whitespace-nowrap pb-[13px] pt-[16px] text-[rgba(15,23,31,0.4)] transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-[#0F171F] after:opacity-0 after:content-[''] hover:text-[rgba(15,23,31,0.7)] data-selected:text-[#0F171F] data-selected:after:opacity-100 lg:text-[18px] ${cls.focus} focus-visible:outline-offset-[-2px]`;
const COMPARE = `cursor-pointer items-center justify-center gap-[8px] rounded-full border border-[rgba(15,23,31,0.2)] font-barlow font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] ${cls.focus}`;

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13V7M8 13V3M13 13V9" />
    </svg>
  );
}

/** Secondary choice inside a panel: pills, the chosen one in ink. */
function Pills<T extends string>({ options, value, onChange, label, inline = false }: { options: Array<[T, string]>; value: T; onChange: (v: T) => void; label: string; /** Shares its row with the figures: stays left on phones too. */ inline?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex flex-wrap gap-[8px]', inline ? 'justify-start lg:justify-center' : 'justify-center')}>
      {options.map(([k, l]) => {
        const on = k === value;
        return (
          <button key={k} type="button" role="radio" aria-checked={on} onClick={() => onChange(k)} className={cx('inline-flex h-[34px] cursor-pointer items-center rounded-full border px-[16px] text-[15px] transition-colors duration-150', on ? 'border-[#0F171F] bg-[#0F171F] text-white' : 'border-[rgba(15,23,31,0.12)] bg-white text-[rgba(15,23,31,0.7)] hover:border-[rgba(15,23,31,0.35)] hover:text-[#0F171F]', cls.focus)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

type Cell = { label: string; value: string; strong?: boolean };

/** Equal-width stat cells separated by hairlines, numbers in the display face and labels in Barlow. */
function StatGrid({ cells }: { cells: Cell[] }) {
  return (
    <div className={`${PANEL_CARD} overflow-hidden`}>
      <div className="-mb-px -mr-px grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cells.map((c) => (
          <div key={c.label} className="min-w-0 border-b border-r border-[rgba(15,23,31,0.06)] px-[12px] py-[14px] lg:px-[16px] lg:py-[15px]">
            <div className={cx('leading-none text-[#0F171F] tabular-nums', c.strong ? 'text-[24px] lg:text-[26px]' : 'text-[22px] lg:text-[24px]')}>{c.value}</div>
            <div className={`mt-[6px] text-[9px] leading-[1.3] lg:text-[11px] ${cls.label}`}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className={`${PANEL_CARD} px-[16px] py-[22px] text-center font-barlow text-[14px] text-[rgba(15,23,31,0.55)]`}>{text}</p>;
}

/* ---------- Cells of the grids ---------- */

const has = (v: number | null | undefined) => v !== null && v !== undefined && Number.isFinite(v);
/** The API sends 0, not null, for what an era never recorded (steals before 2010, minutes in the archive). */
const rec = (v: number | null | undefined) => has(v) && v !== 0;

function avgCells(s: LineStats, opts: { games?: boolean } = {}): Cell[] {
  const cells: Cell[] = [];
  if (opts.games) cells.push({ label: 'Juegos', value: f0(s.games) });
  if (rec(s.minutesAvg)) cells.push({ label: 'Minutos', value: f1(s.minutesAvg) });
  cells.push({ label: 'Puntos', value: f1(s.pointsAvg), strong: true });
  cells.push({ label: 'Rebotes', value: f1(s.reboundsTotalAvg) });
  cells.push({ label: 'Asistencias', value: f1(s.assistsAvg) });
  if (rec(s.stealsAvg)) cells.push({ label: 'Robos', value: f1(s.stealsAvg) });
  if (rec(s.blocksAvg)) cells.push({ label: 'Bloqueos', value: f1(s.blocksAvg) });
  if (rec(s.turnoversAvg)) cells.push({ label: 'Pérdidas', value: f1(s.turnoversAvg) });
  if (rec(s.foulsPersonalAvg)) cells.push({ label: 'Faltas', value: f1(s.foulsPersonalAvg) });
  if (rec(s.fieldGoalsPercentage)) cells.push({ label: 'Tiros de campo', value: pct(s.fieldGoalsPercentage) });
  if (rec(s.threePointersPercentage)) cells.push({ label: 'Triples', value: pct(s.threePointersPercentage) });
  if (rec(s.freeThrowsPercentage)) cells.push({ label: 'Tiros libres', value: pct(s.freeThrowsPercentage) });
  if (rec(s.plusMinusPointsAvg)) cells.push({ label: 'Más/menos', value: signed(s.plusMinusPointsAvg) });
  return cells;
}

function totalCells(s: LineStats): Cell[] {
  const cells: Cell[] = [{ label: 'Juegos', value: f0(s.games) }];
  if (rec(s.minutes)) cells.push({ label: 'Minutos', value: f0(s.minutes) });
  cells.push({ label: 'Puntos', value: f0(s.points), strong: true });
  cells.push({ label: 'Rebotes', value: f0(s.reboundsTotal) });
  cells.push({ label: 'Asistencias', value: f0(s.assists) });
  if (rec(s.steals)) cells.push({ label: 'Robos', value: f0(s.steals) });
  if (rec(s.blocks)) cells.push({ label: 'Bloqueos', value: f0(s.blocks) });
  if (rec(s.turnovers)) cells.push({ label: 'Pérdidas', value: f0(s.turnovers) });
  if (rec(s.foulsPersonal)) cells.push({ label: 'Faltas', value: f0(s.foulsPersonal) });
  if (rec(s.fieldGoalsMade)) cells.push({ label: 'Tiros de campo', value: f0(s.fieldGoalsMade) });
  if (rec(s.threePointersMade)) cells.push({ label: 'Triples', value: f0(s.threePointersMade) });
  if (rec(s.freeThrowsMade)) cells.push({ label: 'Tiros libres', value: f0(s.freeThrowsMade) });
  return cells;
}

/* ---------- Season modules: impact, scoring mix, shooting ---------- */

type Part = [string, string];

/** Title of a module inside a panel: display face, the meta beside it in Barlow. */
function ModuleTitle({ title, meta }: { title: string; /** Figures at the right of the title, e.g. [["580", "puntos"], ["29", "juegos"]]. */ meta?: Part[] | null }) {
  return (
    <div className="mb-[14px] flex items-baseline justify-between gap-[12px]">
      <span className="text-[21px] leading-[1.1] text-[#0F171F] lg:text-[22px]">{title}</span>
      {meta?.length ? (
        <span className="flex shrink-0 items-baseline gap-[10px] whitespace-nowrap">
          {meta.map(([n, t]) => (
            <span key={t} className="inline-flex items-baseline gap-[4px]">
              <span className="text-[16px] leading-none text-[#0F171F] tabular-nums">{n}</span>
              <span className="font-barlow text-[11.5px] font-medium text-[rgba(15,23,31,0.55)]">{t}</span>
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

/** A secondary line where the figures read in ink and the words step back, instead of one grey sentence. */
function Detail({ parts, className = '' }: { parts: Part[]; className?: string }) {
  return (
    <div className={cx('flex flex-wrap gap-[5px]', className)}>
      {parts.map(([n, t]) => (
        <span key={t} className="inline-flex h-[24px] items-baseline gap-[5px] rounded-[6px] bg-[#F1F2F4] px-[8px] leading-[24px] whitespace-nowrap">
          <span className="text-[14px] leading-[24px] text-[#0F171F] tabular-nums">{n}</span>
          <span className="font-barlow text-[11px] font-medium leading-[24px] text-[rgba(15,23,31,0.6)]">{t}</span>
        </span>
      ))}
    </div>
  );
}

/** What the averages don't show: efficiency, ball security, fouls drawn, where the points come from. All per game. */
function ImpactGrid({ s }: { s: LineStats }) {
  const g = s.games || 0;
  const per = (v: number | null | undefined) => (rec(v) && g ? v! / g : null);
  const cells: Array<{ value: string; label: string; short?: string; sub: Part[] | null }> = [];
  if (rec(s.pir) && g) cells.push({ value: f1(s.pir! / g), label: 'Eficiencia por juego', short: 'Eficiencia', sub: [[f0(s.pir), 'PIR'], [f0(g), 'juegos']] });
  if (rec(s.assistsTurnoverRatio)) cells.push({ value: f1(s.assistsTurnoverRatio), label: 'Asistencias por pérdida', sub: rec(s.assistsAvg) && rec(s.turnoversAvg) ? [[f1(s.assistsAvg), 'asistencias'], [f1(s.turnoversAvg), 'pérdidas']] : null });
  if (rec(s.foulsDrawnAvg)) cells.push({ value: f1(s.foulsDrawnAvg), label: 'Faltas recibidas por juego', short: 'Faltas recibidas', sub: rec(s.foulsDrawn) ? [[f0(s.foulsDrawn), 'en la temporada']] : null });
  if (per(s.pointsInThePaint) !== null) cells.push({ value: f1(per(s.pointsInThePaint)), label: 'Puntos en la pintura por juego', short: 'En la pintura', sub: [[f0(s.pointsInThePaint), 'en la temporada']] });
  if (per(s.pointsFastBreak) !== null) cells.push({ value: f1(per(s.pointsFastBreak)), label: 'Puntos en contraataque por juego', short: 'En contraataque', sub: [[f0(s.pointsFastBreak), 'en la temporada']] });
  if (rec(s.plusMinusPointsAvg) && g) cells.push({ value: signed(s.plusMinusPointsAvg! / g).replace(/^([+-])(\d+)$/, '$1$2'), label: 'Más/menos por juego', short: 'Más/menos', sub: [[signed(s.plusMinusPointsAvg), 'acumulado']] });
  if (cells.length < 3) return null;
  return (
    <div>
      <ModuleTitle title="Impacto en cancha" />
      <div className={`${PANEL_CARD} overflow-hidden`}>
        <div className="-mb-px -mr-px grid grid-cols-2 lg:grid-cols-3">
          {cells.map((c) => (
            <div key={c.label} className="min-w-0 border-b border-r border-[rgba(15,23,31,0.06)] px-[12px] py-[14px] lg:px-[18px] lg:py-[16px]">
              <div className="text-[22px] leading-none text-[#0F171F] tabular-nums lg:text-[26px]">{c.value}</div>
              <div className={`mt-[6px] text-[9px] leading-[1.3] lg:text-[11px] ${cls.label}`}>
                <span className="lg:hidden">{c.short ?? c.label}</span>
                <span className="hidden lg:inline">{c.label}</span>
              </div>
              {c.sub ? <Detail parts={c.sub} className="mt-[6px]" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Where the points come from (twos, threes, free throws) and the three shooting lines. */
function ScoringMix({ s, accent }: { s: LineStats; /** The club color the player is identified with: it paints the threes. */ accent: string }) {
  const g = s.games || 0;
  const twos = rec(s.twoPointsMade) ? s.twoPointsMade! * 2 : null;
  const threes = rec(s.threePointersMade) ? s.threePointersMade! * 3 : null;
  const fts = rec(s.freeThrowsMade) ? s.freeThrowsMade! : null;
  const segs = [
    { label: '2 puntos', pts: twos, color: '#0F171F' },
    { label: 'Triples', pts: threes, color: accent },
    { label: 'Tiros libres', pts: fts, color: 'rgba(15,23,31,0.35)' },
  ].filter((x): x is { label: string; pts: number; color: string } => x.pts !== null && x.pts > 0);
  const total = segs.reduce((a, x) => a + x.pts, 0);
  // Field goals per game come from twos and threes: the API's own fieldGoalsMadeAvg is 0 for this season.
  const fgm = rec(s.twoPointsMadeAvg) && rec(s.threePointersMadeAvg) ? s.twoPointsMadeAvg! + s.threePointersMadeAvg! : null;
  const fga = rec(s.twoPointsAttemptedAvg) && rec(s.threePointersAttemptedAvg) ? s.twoPointsAttemptedAvg! + s.threePointersAttemptedAvg! : null;
  const shots = [
    { label: 'Campo', pct: s.fieldGoalsPercentage, made: fgm, att: fga },
    { label: 'Triples', pct: s.threePointersPercentage, made: s.threePointersMadeAvg, att: s.threePointersAttemptedAvg },
    { label: 'Tiros libres', pct: s.freeThrowsPercentage, made: s.freeThrowsMadeAvg, att: s.freeThrowsAttemptedAvg },
  ].filter((x) => rec(x.pct));
  const pctNum = (v: number | null) => (v === null ? 0 : v <= 1 ? v * 100 : v);
  const notes: Part[] = [];
  if (rec(s.pointsInThePaint)) notes.push([f0(s.pointsInThePaint), 'en la pintura']);
  if (rec(s.pointsFastBreak)) notes.push([f0(s.pointsFastBreak), 'en contraataque']);
  if (rec(s.pointsSecondChance)) notes.push([f0(s.pointsSecondChance), 'de segunda oportunidad']);
  if (!segs.length && !shots.length) return null;
  return (
    <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[7fr_5fr] lg:items-stretch">
      {segs.length && total > 0 ? (
        <div className={`${PANEL_CARD} flex flex-col px-[14px] py-[14px] lg:px-[20px] lg:py-[18px]`}>
          <ModuleTitle title="Cómo anota" meta={g ? [[f0(total), 'puntos'], [f0(g), 'juegos']] : [[f0(total), 'puntos']]} />
          <div className="flex h-[12px] gap-[2px] overflow-hidden rounded-[6px] lg:h-[14px]" role="img" aria-label={segs.map((x) => `${x.label} ${Math.round((x.pts / total) * 100)}%`).join(', ')}>
            {segs.map((x) => <div key={x.label} style={{ width: `${(x.pts / total) * 100}%`, background: x.color }} />)}
          </div>
          <div className="mt-[14px] grid grid-cols-1 gap-[10px] lg:mb-[16px] lg:grid-cols-3 lg:gap-[12px]">
            {segs.map((x) => (
              <div key={x.label} className="flex items-center gap-[10px] lg:flex-col lg:items-start lg:gap-[6px]">
                <span className="inline-flex items-center gap-[7px]">
                  <span className="h-[10px] w-[10px] shrink-0 rounded-[3px]" style={{ background: x.color }} aria-hidden />
                  <span className="font-barlow text-[12.5px] font-medium text-[rgba(15,23,31,0.7)]">{x.label}</span>
                </span>
                <span className="inline-flex items-center gap-[8px]">
                  <span className="text-[22px] leading-none text-[#0F171F] tabular-nums">{Math.round((x.pts / total) * 100)}%</span>
                  <span className="inline-flex h-[22px] items-center rounded-[6px] bg-[#F1F2F4] px-[7px] text-[13px] leading-none text-[#0F171F] tabular-nums">{f0(x.pts)} <span className="ml-[4px] font-barlow text-[10.5px] font-medium text-[rgba(15,23,31,0.6)]">pts</span></span>
                </span>
              </div>
            ))}
          </div>
          {notes.length ? (
            <div className="mt-[16px] grid grid-cols-3 gap-[10px] border-t border-[rgba(15,23,31,0.08)] pt-[16px] lg:mt-auto">
              {notes.map(([n, t]) => (
                <div key={t} className="min-w-0">
                  <div className="text-[20px] leading-none text-[#0F171F] tabular-nums lg:text-[22px]">{n}</div>
                  <div className={`mt-[5px] text-[9px] leading-[1.3] lg:text-[11px] ${cls.label}`}>{t}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {shots.length ? (
        <div className={`${PANEL_CARD} flex flex-col px-[14px] py-[14px] lg:px-[20px] lg:py-[18px]`}>
          <ModuleTitle title="Tiros" />
          <div className="grid grid-cols-3 gap-[12px] lg:gap-[18px]">
            {shots.map((x) => (
              <div key={x.label} className="min-w-0">
                <div className={`mb-[8px] ${cls.label}`}>{x.label}</div>
                <div className="h-[8px] rounded-[4px] bg-[#EEF0F3] lg:h-[10px]">
                  <div className="h-full rounded-[4px]" style={{ width: `${Math.min(100, pctNum(x.pct))}%`, background: accent }} />
                </div>
                <div className="mt-[8px] text-[20px] leading-none text-[#0F171F] tabular-nums lg:text-[22px]">{pct(x.pct)}</div>
                {rec(x.made) && rec(x.att) ? (
                  <div className="mt-[7px] inline-flex h-[24px] items-baseline gap-[5px] rounded-[6px] bg-[#F1F2F4] px-[8px] whitespace-nowrap">
                    <span className="text-[14px] leading-[24px] text-[#0F171F] tabular-nums">{f1(x.made)}<span className="text-[rgba(15,23,31,0.35)]">/</span>{f1(x.att)}</span>
                    <span className="font-barlow text-[11px] font-medium leading-[24px] text-[rgba(15,23,31,0.6)]">por juego</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Season by season ---------- */

type Mode = 'avg' | 'tot';
type Col = { code: string; title?: string; get: (s: LineStats) => number | null; render: (s: LineStats) => string };

function columns(mode: Mode): Col[] {
  if (mode === 'avg') {
    return [
      // A season with no minutes on record reads as a dash, never as 0.0.
      { code: 'MIN', title: 'Minutos por juego', get: (s) => s.minutesAvg, render: (s) => (s.minutesAvg ? f1(s.minutesAvg) : DASH) },
      { code: 'PTS', title: 'Puntos por juego', get: (s) => s.pointsAvg, render: (s) => f1(s.pointsAvg) },
      { code: 'REB', title: 'Rebotes por juego', get: (s) => s.reboundsTotalAvg, render: (s) => f1(s.reboundsTotalAvg) },
      { code: 'AST', title: 'Asistencias por juego', get: (s) => s.assistsAvg, render: (s) => f1(s.assistsAvg) },
      { code: 'ROB', title: 'Robos por juego', get: (s) => s.stealsAvg, render: (s) => f1(s.stealsAvg) },
      { code: 'BLQ', title: 'Bloqueos por juego', get: (s) => s.blocksAvg, render: (s) => f1(s.blocksAvg) },
      { code: 'PÉR', title: 'Pérdidas por juego', get: (s) => s.turnoversAvg, render: (s) => f1(s.turnoversAvg) },
      { code: 'TC%', title: 'Tiros de campo', get: (s) => s.fieldGoalsPercentage, render: (s) => pct(s.fieldGoalsPercentage) },
      { code: '3P%', title: 'Triples', get: (s) => s.threePointersPercentage, render: (s) => pct(s.threePointersPercentage) },
      { code: 'TL%', title: 'Tiros libres', get: (s) => s.freeThrowsPercentage, render: (s) => pct(s.freeThrowsPercentage) },
    ];
  }
  return [
    { code: 'MIN', title: 'Minutos', get: (s) => s.minutes, render: (s) => (s.minutes ? f0(s.minutes) : DASH) },
    { code: 'PTS', title: 'Puntos', get: (s) => s.points, render: (s) => f0(s.points) },
    { code: 'REB', title: 'Rebotes', get: (s) => s.reboundsTotal, render: (s) => f0(s.reboundsTotal) },
    { code: 'AST', title: 'Asistencias', get: (s) => s.assists, render: (s) => f0(s.assists) },
    { code: 'ROB', title: 'Robos', get: (s) => s.steals, render: (s) => f0(s.steals) },
    { code: 'BLQ', title: 'Bloqueos', get: (s) => s.blocks, render: (s) => f0(s.blocks) },
    { code: 'PÉR', title: 'Pérdidas', get: (s) => s.turnovers, render: (s) => f0(s.turnovers) },
    { code: 'TC', title: 'Tiros de campo convertidos', get: (s) => s.fieldGoalsMade, render: (s) => f0(s.fieldGoalsMade) },
    { code: '3P', title: 'Triples convertidos', get: (s) => s.threePointersMade, render: (s) => f0(s.threePointersMade) },
    { code: 'TL', title: 'Tiros libres convertidos', get: (s) => s.freeThrowsMade, render: (s) => f0(s.freeThrowsMade) },
  ];
}

const TH = `whitespace-nowrap px-[10px] py-[10px] ${cls.label}`;
const TD = 'h-[44px] whitespace-nowrap border-t border-[rgba(15,23,31,0.06)] px-[10px] font-barlow text-[14px] tabular-nums';
/** The year column stays put while the rest scrolls on a phone. */
const STICKY = 'sticky left-0 z-[1] bg-white pl-[16px] pr-[4px] lg:pl-[20px] lg:pr-[12px]';

function SeasonsTable({ lines, career, mode, seasonsCount }: { lines: SeasonLine[]; career: LineStats | null; mode: Mode; seasonsCount: number }) {
  // A column nobody recorded (steals before 2010, minutes in the archive) is left out rather than shown as dashes.
  const cols = columns(mode).filter((c) => lines.some((l) => rec(c.get(l.stats))) || (career ? rec(c.get(career)) : false));
  // A season with two clubs shows two marks and "ARE/PON": the column widens so it never runs into J.
  const multiClub = lines.some((l) => l.teams.length > 1);
  const num = (v: string, strong = false) => <td className={cx(TD, 'text-center', strong ? 'font-semibold text-[#0F171F]' : 'text-[rgba(15,23,31,0.75)]')}>{v}</td>;
  return (
    <div className={`${PANEL_CARD} overflow-hidden`}>
      <ScrollHint>
        <table className="w-full border-collapse lg:table-fixed">
          <thead>
            <tr>
              <th className={`${TH} ${STICKY} w-[72px] text-left lg:w-[96px]`}>Año</th>
              {/* Desktop: fixed layout; Año, Equipo and J have set widths and the stat columns share the rest equally, so nothing shifts between Promedios and Totales. */}
              <th className={cx(TH, 'pl-[6px] text-left lg:w-[210px] lg:pl-[10px]', multiClub ? 'min-w-[128px]' : 'min-w-[88px]')}>Equipo</th>
              <th className={`${TH} w-[48px] text-center lg:w-[60px]`} title="Juegos">J</th>
              {cols.map((c) => (
                <th key={c.code} className={`${TH} min-w-[64px] text-center`} title={c.title}>{c.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.providerId}>
                <td className={`${TD} ${STICKY} font-semibold text-[#0F171F]`}>{l.year}</td>
                <td className={`${TD} pl-[6px] text-[rgba(15,23,31,0.75)] lg:pl-[10px]`}>
                  <span className="flex items-center gap-[5px] whitespace-nowrap leading-none lg:gap-[6px]">
                    {l.teams.map((t) => <ClubMark key={t.code} code={t.code} color={t.color} size={18} />)}
                    <span className="font-special-gothic-condensed-one text-[16px] tracking-[0.3px] text-[#0F171F] lg:hidden">{l.teams.map((t) => t.code).join('/')}</span>
                    <span className="hidden font-special-gothic-condensed-one text-[16px] tracking-[0.3px] text-[#0F171F] lg:inline">{l.teams.length > 2 ? l.teams.map((t) => t.code).join('/') : l.teams.map((t) => t.nickname).join(' / ')}</span>
                  </span>
                </td>
                {num(f0(l.stats.games))}
                {cols.map((c) => <Fragment key={c.code}>{num(c.render(l.stats))}</Fragment>)}
              </tr>
            ))}
            {career ? (
              <tr className="bg-[#FAFAFA]">
                <td className={`${TD} ${STICKY} bg-[#FAFAFA] font-semibold text-[#0F171F]`}>Carrera</td>
                <td className={`${TD} pl-[6px] text-[rgba(15,23,31,0.75)] lg:pl-[10px]`}>{seasonsCount} temp.</td>
                {num(f0(career.games), true)}
                {cols.map((c) => <Fragment key={c.code}>{num(c.render(career), true)}</Fragment>)}
              </tr>
            ) : null}
          </tbody>
        </table>
      </ScrollHint>
    </div>
  );
}


function EraNotes({ debutYear, minutesSince }: { debutYear: number | null; minutesSince?: number | null }) {
  const notes = debutYear === null ? [] : eraNotes({ debutYears: [debutYear] });
  if (minutesSince) notes.unshift(`Los minutos de este jugador se registran desde ${minutesSince}; el promedio de carrera usa solo esas temporadas.`);
  if (!notes.length) return null;
  return (
    <ul className="mt-[12px] space-y-[4px]">
      {notes.map((n) => (
        <li key={n} className="flex items-start gap-[8px] font-barlow text-[12px] leading-[1.5] text-[rgba(15,23,31,0.6)] lg:text-[13px]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" className="mt-[3px] shrink-0" aria-hidden><path d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 7.5v4M8 5h.01" /></svg>
          {n}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Panels ---------- */

type SeasonView = 'avg' | 'tot' | 'po';

function SeasonPanel({ profile, year }: { profile: PlayerProfileData; year: number | null }) {
  const [view, setView] = useState<SeasonView>('avg');
  const s = profile.season;
  const po = profile.playoffs;
  const teams = s?.teams.length ? s.teams : profile.club ? [profile.club] : [];
  const line = view === 'po' ? po : s;
  // One quiet line: the club with its mark, then the games played in the phase the pills select.
  const context = (
    <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px]">
      {/* Several clubs in one season (a player traded twice or more) read as marks with their three-letter codes. */}
      {teams.map((t) => (
        <span key={t.code} className="inline-flex items-center gap-[8px] font-barlow text-[14px] font-semibold text-[#0F171F]">
          <ClubMark code={t.code} color={t.color} size={22} />
          {teams.length > 1 ? (
            <span className="tabular-nums">{t.code}</span>
          ) : (
            <>
              <span className="lg:hidden">{t.nickname}</span>
              <span className="hidden lg:inline">{t.name}</span>
            </>
          )}
        </span>
      ))}
      {line?.stats.games ? (
        <>
          <span className="text-[rgba(15,23,31,0.3)]" aria-hidden>·</span>
          <span className="font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.8)] tabular-nums">{f0(line.stats.games)} juegos</span>
        </>
      ) : null}
    </div>
  );
  return (
    <div>
      {/* Desktop: pills centered with the club and games at the left, like the figures in Carrera; phones: pills, then the club line above the grid. */}
      <div className="relative flex justify-center">
        <Pills inline label="Vista de la temporada" value={view} onChange={setView} options={[['avg', 'Promedios'], ['tot', 'Totales'], ['po', 'Playoffs']]} />
        <div className="hidden lg:absolute lg:left-0 lg:top-1/2 lg:block lg:-translate-y-1/2">{context}</div>
      </div>
      <div className="mt-[31px] lg:hidden">{context}</div>
      <div className="mt-[12px] lg:mt-[16px]">
        {view === 'po' ? (po ? <StatGrid cells={avgCells(po.stats, { games: true })} /> : <Empty text={`Sin juegos de postemporada en ${year ?? 'esta temporada'}.`} />) : s ? <StatGrid cells={view === 'avg' ? avgCells(s.stats) : totalCells(s.stats)} /> : <Empty text="Todavía sin juegos esta temporada." />}
      </div>
      {line && view !== 'tot' ? (
        <>
          <div className="mt-[22px] lg:mt-[28px]"><ScoringMix s={line.stats} accent={profile.club?.color ?? profile.mainClub?.color ?? '#E51F1F'} /></div>
          <div className="mt-[22px] lg:mt-[28px]"><ImpactGrid s={line.stats} /></div>
        </>
      ) : null}
    </div>
  );
}

function CareerGridPanel({ profile }: { profile: PlayerProfileData }) {
  const [mode, setMode] = useState<Mode>('avg');
  const c = profile.career;
  const lead: Cell[] = profile.seasonsCount ? [{ label: profile.seasonsCount === 1 ? 'Temporada' : 'Temporadas', value: String(profile.seasonsCount) }] : [];
  return (
    <div>
      <Pills label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} />
      <div className="mt-[31px] lg:mt-[16px]">{c ? <StatGrid cells={mode === 'avg' ? avgCells(c) : [...lead, ...totalCells(c)]} /> : <Empty text="Sin estadísticas de carrera." />}</div>
      <EraNotes debutYear={profile.firstYear} minutesSince={profile.minutesSince} />
      {profile.lines.length >= 2 ? <div className="mt-[22px] lg:mt-[28px]"><SeasonTrend lines={profile.lines} accent={profile.club?.color ?? profile.mainClub?.color ?? '#E51F1F'} /></div> : null}
    </div>
  );
}

function SeasonsPanel({ profile }: { profile: PlayerProfileData }) {
  const [mode, setMode] = useState<Mode>('avg');
  const pills = <Pills label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} />;
  return (
    <div>
      {pills}
      <div className="mt-[31px] lg:mt-[16px]">{profile.lines.length ? <SeasonsTable lines={profile.lines} career={profile.career} mode={mode} seasonsCount={profile.seasonsCount} /> : <Empty text="Sin temporadas registradas." />}</div>
      {!profile.active ? <EraNotes debutYear={profile.firstYear} minutesSince={profile.minutesSince} /> : null}
    </div>
  );
}

function GamesPanel({ profile, year }: { profile: PlayerProfileData; year: number | null }) {
  return (
    <div>
      {year ? <h2 className="text-center text-[22px] leading-none text-[#0F171F] lg:text-left lg:text-[24px]">Temporada {year}</h2> : null}
      <div className={`mt-[16px] ${PANEL_CARD} px-[16px] py-[6px]`}>
        <PlayerMatchesWidget playerProviderId={profile.providerId} pageSize={5} />
      </div>
      <div className="mt-[22px] empty:hidden lg:mt-[28px]"><GameInsights playerProviderId={profile.providerId} /></div>
    </div>
  );
}

/**
 * The card that overlaps the band: a tab bar, "Comparar" at its right on desktop, and one panel per tab. An
 * active player opens on the current season (averages, totals, playoffs), then the career table and the game
 * log; a retired one opens on the career grid and keeps the season table.
 */
export default function PlayerProfileTabs({ profile, currentYear }: Props) {
  const year = profile.season?.year ?? currentYear;
  const compare = compareHref([profile.providerId]);
  const tabs: Array<[string, React.ReactNode]> = profile.active
    ? [
        [`BSN ${year ?? ''}`.trim(), <SeasonPanel key="season" profile={profile} year={year} />],
        ['Juego por juego', <GamesPanel key="games" profile={profile} year={year} />],
        ['Carrera', <CareerGridPanel key="career" profile={profile} />],
        ['Por temporada', <SeasonsPanel key="seasons" profile={profile} />],
      ]
    : [
        ['Carrera', <CareerGridPanel key="career" profile={profile} />],
        ['Por temporada', <SeasonsPanel key="seasons" profile={profile} />],
      ];

  return (
    <section className="container -mt-[20px] mb-[28px] lg:-mt-[28px] lg:mb-[40px]">
      <div className={`${CARD} overflow-hidden`}>
        <TabGroup>
          <div className="flex items-center border-b border-[rgba(15,23,31,0.08)] px-[16px] lg:px-[24px]">
            <TabList className={cx('flex w-full justify-center lg:gap-[28px]', tabs.length > 3 ? 'gap-[18px]' : tabs.length > 2 ? 'gap-[22px]' : 'gap-[28px]')}>
              {tabs.map(([label]) => <Tab key={label} className={cx(TAB, tabs.length > 3 ? 'text-[16px] lg:text-[18px]' : tabs.length > 2 ? 'text-[18px]' : 'text-[21px] lg:text-[18px]')}>{label}</Tab>)}
            </TabList>
          </div>
          <TabPanels className="bg-[#FBFBFB] px-[16px] pb-[18px] pt-[24px] lg:px-[24px] lg:pb-[24px] lg:pt-[32px]">
            {tabs.map(([label, panel]) => <TabPanel key={label} className={cls.focus}>{panel}</TabPanel>)}
          </TabPanels>
        </TabGroup>
      </div>
      <Link href={compare} className={`${COMPARE} mt-[14px] flex h-[48px] w-full border-[#0F171F] bg-white text-[14px] shadow-[0_2px_6px_rgba(15,23,31,0.06)] lg:hidden`}>
        <CompareIcon />
        Comparar con otros jugadores
      </Link>
    </section>
  );
}
