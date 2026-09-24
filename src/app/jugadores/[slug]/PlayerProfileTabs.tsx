'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
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
const TAB = `relative cursor-pointer whitespace-nowrap pb-[13px] pt-[16px] text-[rgba(15,23,31,0.4)] transition-colors duration-150 after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-[#0F171F] after:opacity-0 after:content-[''] hover:text-[rgba(15,23,31,0.7)] data-selected:text-[#0F171F] data-selected:after:opacity-100 lg:text-[18px] ${cls.focus} focus-visible:outline-offset-[-2px]`;
const COMPARE = `cursor-pointer items-center justify-center gap-[8px] rounded-full border border-[rgba(15,23,31,0.2)] font-barlow font-semibold text-[#0F171F] transition-colors duration-150 hover:border-[#0F171F] hover:bg-[#FAFAFA] active:bg-[#F3F3F3] ${cls.focus}`;

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13V7M8 13V3M13 13V9" />
    </svg>
  );
}

/** What the panel covers, under the tab that names it: chips, a line, or the career figures. No repeated title. */
function PanelHead({ meta, chips, children }: { meta?: string | null; chips?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div>
      {meta ? <p className="font-barlow text-[13px] text-[rgba(15,23,31,0.5)] tabular-nums">{meta}</p> : null}
      {chips ? <div className="flex flex-wrap items-center justify-center gap-[6px] lg:justify-start">{chips}</div> : null}
      {children}
    </div>
  );
}

/** The career in three figures: seasons, games and the years, side by side with hairlines between them. */
function CareerFigures({ seasons, games }: { seasons: number; games: number | null }) {
  const items: Array<[string, string]> = [];
  if (seasons) items.push([String(seasons), seasons === 1 ? 'Temporada' : 'Temporadas']);
  if (games) items.push([f0(games), 'Juegos']);
  return (
    <div className="flex justify-end gap-[16px] lg:gap-[26px]">
      {items.map(([v, l]) => (
        <div key={l} className="min-w-0 text-right">
          <div className="text-[20px] leading-none text-[#0F171F] tabular-nums lg:text-[24px]">{v}</div>
          <div className={`mt-[2px] text-[9.5px] lg:text-[11px] ${cls.label}`}>{l}</div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal scroll with a fading edge and a chevron while there is more table to the right. */
function ScrollHint({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);
  return (
    <div className="relative">
      <div ref={ref} className="overflow-x-auto overflow-y-hidden overscroll-x-contain">{children}</div>
      <div aria-hidden className={cx('pointer-events-none absolute inset-y-0 right-0 flex w-[72px] items-center justify-end bg-gradient-to-l from-white via-white/85 to-transparent pr-[10px] transition-opacity duration-200', more ? 'opacity-100' : 'opacity-0')}>
        <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(15,23,31,0.12)] bg-white text-[#0F171F] shadow-[0_2px_8px_rgba(15,23,31,0.1)]">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5L8 6l-3.5 3.5" /></svg>
        </span>
      </div>
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
function Pills<T extends string>({ options, value, onChange, label, inline = false }: { options: Array<[T, string]>; value: T; onChange: (v: T) => void; label: string; /** Shares its row with the figures: stays left on phones too. */ inline?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex flex-wrap gap-[8px]', inline ? 'justify-start' : 'justify-center lg:justify-start')}>
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

/* ---------- Season by season ---------- */

type Mode = 'avg' | 'tot';
type Col = { code: string; title?: string; get: (s: LineStats) => number | null; render: (s: LineStats) => string };

function columns(mode: Mode): Col[] {
  if (mode === 'avg') {
    return [
      { code: 'MIN', title: 'Minutos por juego', get: (s) => s.minutesAvg, render: (s) => f1(s.minutesAvg) },
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
    { code: 'MIN', title: 'Minutos', get: (s) => s.minutes, render: (s) => f0(s.minutes) },
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
  const num = (v: string, strong = false) => <td className={cx(TD, 'text-center', strong ? 'font-semibold text-[#0F171F]' : 'text-[rgba(15,23,31,0.75)]')}>{v}</td>;
  return (
    <div className={`${PANEL_CARD} overflow-hidden`}>
      <ScrollHint>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${TH} ${STICKY} text-left`}>Año</th>
              <th className={`${TH} pl-[6px] text-left lg:pl-[10px]`}>Equipo</th>
              <th className={`${TH} text-center`} title="Juegos">J</th>
              {cols.map((c) => (
                <th key={c.code} className={`${TH} text-center`} title={c.title}>{c.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.providerId}>
                <td className={`${TD} ${STICKY} font-semibold text-[#0F171F]`}>{l.year}</td>
                <td className={`${TD} pl-[6px] text-[rgba(15,23,31,0.75)] lg:pl-[10px]`}>
                  <span className="flex items-center gap-[6px] leading-none">
                    {l.teams.map((t) => <ClubMark key={t.code} code={t.code} color={t.color} size={18} />)}
                    <span className="lg:hidden">{l.teams.map((t) => t.code).join('/')}</span>
                    <span className="hidden lg:inline">{l.teams.map((t) => t.nickname).join(' / ')}</span>
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


function EraNotes({ debutYear }: { debutYear: number | null }) {
  const notes = debutYear === null ? [] : eraNotes({ debutYears: [debutYear] });
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
  const chips = (
    <>
      {teams.map((t) => <Chip key={t.code} club={t}>{t.name}</Chip>)}
      <Chip>{view === 'po' ? 'Postemporada' : 'Serie regular'}</Chip>
      {line?.stats.games ? <Chip>{f0(line.stats.games)} juegos</Chip> : null}
    </>
  );
  return (
    <div>
      <PanelHead chips={chips} />
      <div className="mt-[16px]"><Pills label="Vista de la temporada" value={view} onChange={setView} options={[['avg', 'Promedios'], ['tot', 'Totales'], ['po', 'Playoffs']]} /></div>
      <div className="mt-[16px]">
        {view === 'po' ? (po ? <StatGrid cells={avgCells(po.stats, { games: true })} /> : <Empty text={`Sin juegos de postemporada en ${year ?? 'esta temporada'}.`} />) : s ? <StatGrid cells={view === 'avg' ? avgCells(s.stats) : totalCells(s.stats)} /> : <Empty text="Todavía sin juegos esta temporada." />}
      </div>
    </div>
  );
}

function CareerGridPanel({ profile }: { profile: PlayerProfileData }) {
  const [mode, setMode] = useState<Mode>('avg');
  const c = profile.career;
  return (
    <div>
      <div className="flex items-center justify-between gap-[12px]">
        <Pills inline label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} />
        <CareerFigures seasons={profile.seasonsCount} games={c?.games ?? null} />
      </div>
      <div className="mt-[16px]">{c ? <StatGrid cells={mode === 'avg' ? avgCells(c) : totalCells(c)} /> : <Empty text="Sin estadísticas de carrera." />}</div>
      <EraNotes debutYear={profile.firstYear} />
    </div>
  );
}

function SeasonsPanel({ profile }: { profile: PlayerProfileData }) {
  const [mode, setMode] = useState<Mode>('avg');
  const pills = <Pills inline={!profile.active} label="Promedios o totales" value={mode} onChange={setMode} options={[['avg', 'Promedios'], ['tot', 'Totales']]} />;
  return (
    <div>
      {profile.active ? (
        pills
      ) : (
        <div className="flex items-center justify-between gap-[12px]">
          {pills}
          <CareerFigures seasons={profile.seasonsCount} games={profile.career?.games ?? null} />
        </div>
      )}
      <div className="mt-[16px]">{profile.lines.length ? <SeasonsTable lines={profile.lines} career={profile.career} mode={mode} seasonsCount={profile.seasonsCount} /> : <Empty text="Sin temporadas registradas." />}</div>
      {!profile.active ? <EraNotes debutYear={profile.firstYear} /> : null}
    </div>
  );
}

function GamesPanel({ profile, year }: { profile: PlayerProfileData; year: number | null }) {
  return (
    <div>
      {year ? <h2 className="text-center text-[22px] leading-none text-[#0F171F] lg:text-left lg:text-[24px]">Temporada {year}</h2> : null}
      <div className={`mt-[16px] ${PANEL_CARD} px-[16px] py-[6px]`}>
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
        ['Por temporada', <SeasonsPanel key="seasons" profile={profile} />],
        ['Juego por juego', <GamesPanel key="games" profile={profile} year={year} />],
      ]
    : [
        ['Carrera', <CareerGridPanel key="career" profile={profile} />],
        ['Por temporada', <SeasonsPanel key="seasons" profile={profile} />],
      ];

  return (
    <section className="container -mt-[20px] mb-[28px] lg:-mt-[28px] lg:mb-[40px]">
      <div className={`${CARD} overflow-hidden`}>
        <TabGroup>
          <div className="relative flex items-center border-b border-[rgba(15,23,31,0.08)] px-[16px] lg:px-[24px]">
            <TabList className={cx('flex w-full justify-center lg:gap-[28px]', tabs.length > 2 ? 'gap-[16px]' : 'gap-[22px]')}>
              {tabs.map(([label]) => <Tab key={label} className={cx(TAB, tabs.length > 2 ? 'text-[15px] lg:text-[18px]' : 'text-[18px]')}>{label}</Tab>)}
            </TabList>
            <Link href={compare} className={`${COMPARE} absolute right-[24px] top-1/2 hidden h-[34px] -translate-y-1/2 px-[14px] text-[13px] lg:inline-flex`}>
              <CompareIcon />
              Comparar
            </Link>
          </div>
          <TabPanels className="bg-[#FBFBFB] px-[16px] pb-[18px] pt-[16px] lg:px-[24px] lg:pb-[24px] lg:pt-[22px]">
            {tabs.map(([label, panel]) => <TabPanel key={label} className={cls.focus}>{panel}</TabPanel>)}
          </TabPanels>
        </TabGroup>
      </div>
      <Link href={compare} className={`${COMPARE} mt-[14px] flex h-[48px] w-full border-[#0F171F] bg-white text-[14px] shadow-[0_6px_18px_rgba(15,23,31,0.10)] lg:hidden`}>
        <CompareIcon />
        Comparar con otros jugadores
      </Link>
    </section>
  );
}
