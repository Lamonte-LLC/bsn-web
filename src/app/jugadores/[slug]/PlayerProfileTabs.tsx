'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { cls } from '@/archivo/lib/tokens';
import ClubMark from '@/historia/components/ClubMark';
import { compareHref } from '@/historia/lib/compare-players';
import { eraNotes } from '@/historia/lib/copy';
import PlayerMatchesWidget from '@/player/client/widgets/PlayerMatchesWidget';
import { f0, f1, pct, signed, type LineStats, type PlayerProfileData, type SeasonLine } from './profile-data';

type Props = {
  profile: PlayerProfileData;
  /** Year of the league's current season, for the first tab when the player has no line in it yet. */
  currentYear: number | null;
};

const CARD = 'rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white shadow-[0_12px_32px_rgba(15,23,31,0.08)]';
const PANEL_CARD = 'rounded-[12px] border border-[rgba(15,23,31,0.08)] bg-white';
const TAB = `relative cursor-pointer whitespace-nowrap pb-[13px] pt-[16px] text-[15px] text-[rgba(15,23,31,0.4)] transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-[#0F171F] after:opacity-0 after:content-[''] hover:text-[rgba(15,23,31,0.7)] data-selected:text-[#0F171F] data-selected:after:opacity-100 lg:text-[18px] ${cls.focus} focus-visible:outline-offset-[-2px]`;
const COMPARE = `cursor-pointer items-center justify-center gap-[8px] rounded-full border border-[rgba(15,23,31,0.2)] font-barlow font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] ${cls.focus}`;

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13V7M8 13V3M13 13V9" />
    </svg>
  );
}

/** Title of a panel with its subtitle under it, never beside it. */
function PanelHead({ title, meta, chips }: { title: string; meta?: string | null; chips?: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[20px] leading-[1.1] text-[#0F171F] lg:text-[22px]">{title}</h2>
      {meta ? <p className="mt-[5px] font-barlow text-[13px] text-[rgba(15,23,31,0.5)] tabular-nums">{meta}</p> : null}
      {chips ? <div className="mt-[10px] flex flex-wrap items-center gap-[6px]">{chips}</div> : null}
    </div>
  );
}

/** A fact of the panel as a chip: the club with its mark, the phase, the games played. */
function Chip({ children, club }: { children: React.ReactNode; club?: { code: string; color: string } | null }) {
  return (
    <span className="inline-flex h-[28px] items-center gap-[7px] rounded-full bg-[#EEF0F3] pl-[6px] pr-[11px] font-barlow text-[13px] font-semibold text-[rgba(15,23,31,0.85)] tabular-nums">
      {club ? <ClubMark code={club.code} color={club.color} size={18} /> : <span className="w-[4px]" aria-hidden />}
      {children}
    </span>
  );
}

/** Secondary choice inside a panel: pills, the chosen one in ink. */
function Pills<T extends string>({ options, value, onChange, label }: { options: Array<[T, string]>; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-[8px]">
      {options.map(([k, l]) => {
        const on = k === value;
        return (
          <button key={k} type="button" role="radio" aria-checked={on} onClick={() => onChange(k)} className={cx('inline-flex h-[34px] cursor-pointer items-center rounded-full border px-[16px] text-[15px] transition-colors duration-150', on ? 'border-[#0F171F] bg-[#0F171F] text-white' : 'border-[#D5D5D5] bg-white text-[rgba(15,23,31,0.7)] hover:border-[rgba(15,23,31,0.45)] hover:text-[#0F171F]', cls.focus)}>
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
            <div className={cx('leading-none text-[#0F171F] tabular-nums', c.strong ? 'text-[26px]' : 'text-[24px]')}>{c.value}</div>
            <div className={`mt-[6px] leading-[1.3] ${cls.label}`}>{c.label}</div>
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
  if (rec(s.fieldGoalsAttempted)) cells.push({ label: 'Tiros de campo', value: `${f0(s.fieldGoalsMade)}–${f0(s.fieldGoalsAttempted)}` });
  if (rec(s.threePointersAttempted)) cells.push({ label: 'Triples', value: `${f0(s.threePointersMade)}–${f0(s.threePointersAttempted)}` });
  if (rec(s.freeThrowsAttempted)) cells.push({ label: 'Tiros libres', value: `${f0(s.freeThrowsMade)}–${f0(s.freeThrowsAttempted)}` });
  return cells;
}

/* ---------- Season by season ---------- */

type Mode = 'avg' | 'tot';
type Col = { code: string; title?: string; get: (s: LineStats) => number | null; render: (s: LineStats) => string; phone?: boolean };

function columns(mode: Mode): Col[] {
  if (mode === 'avg') {
    return [
      { code: 'MIN', title: 'Minutos por juego', get: (s) => s.minutesAvg, render: (s) => f1(s.minutesAvg) },
      { code: 'PTS', title: 'Puntos por juego', get: (s) => s.pointsAvg, render: (s) => f1(s.pointsAvg), phone: true },
      { code: 'REB', title: 'Rebotes por juego', get: (s) => s.reboundsTotalAvg, render: (s) => f1(s.reboundsTotalAvg), phone: true },
      { code: 'AST', title: 'Asistencias por juego', get: (s) => s.assistsAvg, render: (s) => f1(s.assistsAvg), phone: true },
      { code: 'ROB', title: 'Robos por juego', get: (s) => s.stealsAvg, render: (s) => f1(s.stealsAvg) },
      { code: 'BLQ', title: 'Bloqueos por juego', get: (s) => s.blocksAvg, render: (s) => f1(s.blocksAvg) },
      { code: 'PÉR', title: 'Pérdidas por juego', get: (s) => s.turnoversAvg, render: (s) => f1(s.turnoversAvg) },
      { code: 'TC%', title: 'Tiros de campo', get: (s) => s.fieldGoalsPercentage, render: (s) => pct(s.fieldGoalsPercentage) },
      { code: '3P%', title: 'Triples', get: (s) => s.threePointersPercentage, render: (s) => pct(s.threePointersPercentage) },
      { code: 'TL%', title: 'Tiros libres', get: (s) => s.freeThrowsPercentage, render: (s) => pct(s.freeThrowsPercentage) },
    ];
  }
  return [
    { code: 'MIN', title: 'Minutos', get: (s) => s.minutes, render: (s) => f0(s.minutes) },
    { code: 'PTS', title: 'Puntos', get: (s) => s.points, render: (s) => f0(s.points), phone: true },
    { code: 'REB', title: 'Rebotes', get: (s) => s.reboundsTotal, render: (s) => f0(s.reboundsTotal), phone: true },
    { code: 'AST', title: 'Asistencias', get: (s) => s.assists, render: (s) => f0(s.assists), phone: true },
    { code: 'ROB', title: 'Robos', get: (s) => s.steals, render: (s) => f0(s.steals) },
    { code: 'BLQ', title: 'Bloqueos', get: (s) => s.blocks, render: (s) => f0(s.blocks) },
    { code: 'PÉR', title: 'Pérdidas', get: (s) => s.turnovers, render: (s) => f0(s.turnovers) },
    { code: 'TC', title: 'Tiros de campo (convertidos–intentados)', get: (s) => s.fieldGoalsMade, render: (s) => `${f0(s.fieldGoalsMade)}–${f0(s.fieldGoalsAttempted)}` },
    { code: '3P', title: 'Triples (convertidos–intentados)', get: (s) => s.threePointersMade, render: (s) => `${f0(s.threePointersMade)}–${f0(s.threePointersAttempted)}` },
    { code: 'TL', title: 'Tiros libres (convertidos–intentados)', get: (s) => s.freeThrowsMade, render: (s) => `${f0(s.freeThrowsMade)}–${f0(s.freeThrowsAttempted)}` },
  ];
}

const TH = `px-[10px] py-[10px] ${cls.label}`;
const TD = 'h-[44px] whitespace-nowrap border-t border-[rgba(15,23,31,0.06)] px-[10px] font-barlow text-[14px] tabular-nums';

function SeasonsTable({ lines, career, mode, seasonsCount }: { lines: SeasonLine[]; career: LineStats | null; mode: Mode; seasonsCount: number }) {
  // A column nobody recorded (steals before 2010, minutes in the archive) is left out rather than shown as dashes.
  const cols = columns(mode).filter((c) => lines.some((l) => rec(c.get(l.stats))) || (career ? rec(c.get(career)) : false));
  const num = (v: string, strong = false, phone = false) => <td className={cx(TD, 'text-center', strong ? 'font-semibold text-[#0F171F]' : 'text-[rgba(15,23,31,0.75)]', !phone && 'hidden md:table-cell')}>{v}</td>;
  return (
    <div className={`${PANEL_CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${TH} text-left`}>Año</th>
              <th className={`${TH} text-left`}>
                <span className="md:hidden">Eq</span>
                <span className="hidden md:inline">Equipo</span>
              </th>
              <th className={`${TH} text-center`} title="Juegos">J</th>
              {cols.map((c) => (
                <th key={c.code} className={cx(TH, 'text-center', !c.phone && 'hidden md:table-cell')} title={c.title}>{c.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.providerId}>
                <td className={`${TD} font-semibold text-[#0F171F]`}>{l.year}</td>
                <td className={`${TD} text-[rgba(15,23,31,0.75)]`}>
                  <span className="inline-flex items-center gap-[7px]">
                    {l.teams.map((t) => <ClubMark key={t.code} code={t.code} color={t.color} size={20} />)}
                    <span className="hidden md:inline">{l.teams.map((t) => t.nickname).join(' / ')}</span>
                  </span>
                </td>
                {num(f0(l.stats.games), false, true)}
                {cols.map((c) => <Fragment key={c.code}>{num(c.render(l.stats), c.code === 'PTS', Boolean(c.phone))}</Fragment>)}
              </tr>
            ))}
            {career ? (
              <tr className="bg-[#FAFAFA]">
                <td className={`${TD} font-semibold text-[#0F171F]`}>Carrera</td>
                <td className={`${TD} text-[rgba(15,23,31,0.75)]`}>{seasonsCount} temp.</td>
                {num(f0(career.games), true, true)}
                {cols.map((c) => <Fragment key={c.code}>{num(c.render(career), true, Boolean(c.phone))}</Fragment>)}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function EraNotes({ debutYear }: { debutYear: number | null }) {
  const notes = debutYear === null ? [] : eraNotes({ debutYears: [debutYear] });
  if (!notes.length) return null;
  return (
    <ul className="mt-[12px] space-y-[4px]">
      {notes.map((n) => (
        <li key={n} className="flex items-start gap-[8px] font-barlow text-[13px] leading-[1.5] text-[rgba(15,23,31,0.6)]">
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
  const chips = (
    <>
      {teams.map((t) => <Chip key={t.code} club={t}>{t.name}</Chip>)}
      <Chip>{view === 'po' ? 'Postemporada' : 'Serie regular'}</Chip>
      {line?.stats.games ? <Chip>{f0(line.stats.games)} juegos</Chip> : null}
    </>
  );
  return (
    <div>
      <PanelHead title={`Temporada ${year ?? ''}`.trim()} chips={chips} />
      <div className="mt-[18px]"><Pills label="Vista de la temporada" value={view} onChange={setView} options={[['avg', 'Promedios'], ['tot', 'Totales'], ['po', 'Playoffs']]} /></div>
      <div className="mt-[16px]">
        {view === 'po' ? (po ? <StatGrid cells={avgCells(po.stats, { games: true })} /> : <Empty text={`Sin juegos de postemporada en ${year ?? 'esta temporada'}.`} />) : s ? <StatGrid cells={view === 'avg' ? avgCells(s.stats) : totalCells(s.stats)} /> : <Empty text="Todavía sin juegos esta temporada." />}
      </div>
    </div>
  );
}

function CareerGridPanel({ profile }: { profile: PlayerProfileData }) {
  const [mode, setMode] = useState<Mode>('avg');
  const c = profile.career;
  const meta = ['Serie regular', profile.seasonsCount ? `${profile.seasonsCount} temporadas` : null, c?.games ? `${f0(c.games)} juegos` : null, profile.firstYear !== null && profile.lastYear !== null ? `${profile.firstYear}–${profile.lastYear}` : null].filter(Boolean).join(' · ');
  return (
    <div>
      <PanelHead title="Carrera" meta={meta} />
      <div className="mt-[18px]"><Pills label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} /></div>
      <div className="mt-[16px]">{c ? <StatGrid cells={mode === 'avg' ? avgCells(c) : totalCells(c)} /> : <Empty text="Sin estadísticas de carrera." />}</div>
      <EraNotes debutYear={profile.firstYear} />
    </div>
  );
}

function SeasonsPanel({ profile, title }: { profile: PlayerProfileData; title: string }) {
  const [mode, setMode] = useState<Mode>('avg');
  const meta = ['Serie regular', profile.seasonsCount ? `${profile.seasonsCount} temporadas` : null, profile.firstYear !== null && profile.lastYear !== null ? `${profile.firstYear}–${profile.lastYear}` : null].filter(Boolean).join(' · ');
  return (
    <div>
      <PanelHead title={title} meta={meta} />
      <div className="mt-[18px]"><Pills label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} /></div>
      <div className="mt-[16px]">{profile.lines.length ? <SeasonsTable lines={profile.lines} career={profile.career} mode={mode} seasonsCount={profile.seasonsCount} /> : <Empty text="Sin temporadas registradas." />}</div>
      {!profile.active ? <EraNotes debutYear={profile.firstYear} /> : null}
    </div>
  );
}

function GamesPanel({ profile, year }: { profile: PlayerProfileData; year: number | null }) {
  return (
    <div>
      <PanelHead title="Juego por juego" meta={year ? `Temporada ${year}` : null} />
      <div className={`mt-[18px] ${PANEL_CARD} px-[16px] py-[6px]`}>
        <PlayerMatchesWidget playerProviderId={profile.providerId} />
      </div>
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
        [`Temporada ${year ?? ''}`.trim(), <SeasonPanel key="season" profile={profile} year={year} />],
        ['Carrera', <SeasonsPanel key="seasons" profile={profile} title="Carrera" />],
        ['Juego por juego', <GamesPanel key="games" profile={profile} year={year} />],
      ]
    : [
        ['Carrera', <CareerGridPanel key="career" profile={profile} />],
        ['Temporada por temporada', <SeasonsPanel key="seasons" profile={profile} title="Temporada por temporada" />],
      ];

  return (
    <section className="container -mt-[20px] mb-[28px] lg:-mt-[28px] lg:mb-[40px]">
      <div className={`${CARD} overflow-hidden`}>
        <TabGroup>
          <div className="flex items-center border-b border-[rgba(15,23,31,0.08)] px-[16px] lg:px-[24px]">
            <TabList className="flex gap-[18px] overflow-x-auto lg:gap-[28px]">
              {tabs.map(([label]) => <Tab key={label} className={TAB}>{label}</Tab>)}
            </TabList>
            <Link href={compare} className={`${COMPARE} ml-auto hidden h-[34px] px-[14px] text-[13px] lg:inline-flex`}>
              <CompareIcon />
              Comparar
            </Link>
          </div>
          <TabPanels className="bg-[#FBFBFB] px-[16px] pb-[18px] pt-[16px] lg:px-[24px] lg:pb-[24px] lg:pt-[22px]">
            {tabs.map(([label, panel]) => <TabPanel key={label} className={cls.focus}>{panel}</TabPanel>)}
          </TabPanels>
        </TabGroup>
      </div>
      <Link href={compare} className={`${COMPARE} mt-[14px] flex h-[44px] w-full text-[15px] lg:hidden`}>
        <CompareIcon />
        Comparar con otros jugadores
      </Link>
    </section>
  );
}
