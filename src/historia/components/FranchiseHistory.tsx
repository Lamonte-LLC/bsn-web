import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import Tabs from '@/archivo/components/Tabs';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchiseLeaderEntry, FranchiseTitle } from '@/archivo/lib/types';
import { getMvps } from '@/archivo/lib/data';
import { CURRENT_SEASON, franchiseFileWithColors } from '../lib/data';
import Callout from './Callout';
import EraNotes from './EraNotes';
import FranchisePlayersList from './FranchisePlayersList';
import HistorySubnav from './HistorySubnav';

/* Table typography shared by every block, so all columns read the same. */
const TH = 'whitespace-nowrap px-[10px] pb-[9px] pt-[10px] font-barlow text-[12.5px] font-normal uppercase text-[rgba(0,0,0,0.6)]';
const TD = 'h-[48px] whitespace-nowrap px-[10px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.9)]';
/* Numeric columns share one width so gaps between them stay identical from table to table. */
const NUM_COL = 'w-[78px] md:w-[110px]';

const RUN_WORDS: Record<number, string> = { 2: 'Bicampeones', 3: 'Tricampeones', 4: 'Cuatro seguidos', 5: 'Cinco seguidos', 6: 'Seis seguidos', 7: 'Siete seguidos' };

/** Back-to-back titles (two or more in a row). */
function consecutiveRuns(years: number[]): Array<[number, number]> {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  let start = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] !== sorted[i - 1] + 1) {
      if (sorted[i - 1] > start) out.push([start, sorted[i - 1]]);
      start = sorted[i];
    }
  }
  return out;
}

/** Centered title between hairlines, as the comparator names its sections; the id anchors the sub-nav. */
/** Centered title between hairlines, as the comparator names its sections; the id anchors the sub-nav. */
function SectionHead({ id, title }: { id: string; title: string }) {
  return (
    <div id={id} className="flex scroll-mt-[72px] items-center gap-[12px] pb-[12px] pt-[22px] md:gap-[14px] md:pb-[14px] md:pt-[30px]">
      <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
      <h2 className="text-center text-[19px] leading-[1.1] tracking-[0.3px] text-[#0F171F] md:text-[22px]">{title}</h2>
      <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
    </div>
  );
}

/** Every table in the panel shares one width and sits centered, so columns keep the same rhythm block after block. */
const TABLE_W = 'mx-auto w-full max-w-[760px]';

function Footline({ children }: { children: React.ReactNode }) {
  return <p className={`${TABLE_W} mt-[10px] px-[10px] ${cls.meta} ${cls.tabular}`}>{children}</p>;
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <div className={`${TABLE_W} ${cls.card} px-[18px] py-[16px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.6)]`}>{children}</div>;
}

/** Championships as a table, newest first; back-to-back titles get a small group row above their years. */
function ChampionshipsTable({ titles }: { titles: FranchiseTitle[] }) {
  const runs = consecutiveRuns(titles.map((t) => t.year));
  const sorted = [...titles].sort((a, b) => b.year - a.year);
  const started = new Set<number>();
  return (
    <div className={`${TABLE_W} overflow-hidden`}>
      <table className={`w-full border-collapse ${cls.tabular}`}>
        <caption className="sr-only">Campeonatos de la franquicia</caption>
        <thead>
          <tr className="border-b border-[rgba(0,0,0,0.08)]">
            <th scope="col" className={`${TH} w-[72px] text-left`}>Año</th>
            <th scope="col" className={`${TH} text-left`}>Dirigente</th>
            <th scope="col" className={`${TH} ${NUM_COL} text-right`}>Final</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const run = runs.find(([a, b]) => t.year >= a && t.year <= b);
            const group = run && !started.has(run[0]);
            if (run) started.add(run[0]);
            return (
              <FragmentRow key={t.year} group={group ? `${RUN_WORDS[run![1] - run![0] + 1] ?? `${run![1] - run![0] + 1} seguidos`} · ${run![0]} a ${run![1]}` : null}>
                <td className={`${TD} text-left font-bold`}>
                  <Link href={`/temporadas/${t.year}`} className={`rounded-[4px] ${cls.focus}`} title={`Temporada ${t.year}`}>
                    {t.year}
                  </Link>
                </td>
                <td className={`${TD} whitespace-normal text-left`}>{t.coach ?? <span className="text-[rgba(0,0,0,0.35)]">Dirigente por confirmar</span>}</td>
                <td className={`${TD} text-right`}>{t.series ?? <span className="text-[rgba(0,0,0,0.3)]">–</span>}</td>
              </FragmentRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A table row, optionally preceded by a group-label row (a dynasty). */
function FragmentRow({ group, children }: { group: string | null; children: React.ReactNode }) {
  return (
    <>
      {group ? (
        <tr>
          <td colSpan={3} className={`border-t border-[rgba(0,0,0,0.06)] px-[10px] pb-[4px] pt-[12px] ${cls.label}`}>
            {group}
          </td>
        </tr>
      ) : null}
      <tr className="border-t border-[rgba(0,0,0,0.06)] transition-colors duration-150 hover:bg-[#FAFAFA]">{children}</tr>
    </>
  );
}

/**
 * History of one franchise, stacked: a typographic row of counters, then championships, all-time leaders,
 * MVPs, seasons by decade and every player, each as one table with the same column rhythm. All ink; the
 * team color never carries text, since weak primaries would not contrast.
 */
const SECTIONS = [
  { id: 'campeonatos', label: 'Campeonatos' },
  { id: 'lideres', label: 'Líderes históricos' },
  { id: 'mvps', label: 'Más valiosos' },
  { id: 'temporadas', label: 'Temporadas' },
  { id: 'jugadores', label: 'Jugadores' },
];

/**
 * @param band  Paint the ink strip the panel overlaps (team page: the tab row ends flat). The extinct
 *              franchise page pads its own hero instead and passes false.
 */
export default function FranchiseHistory({ slug, band = true }: { slug: string; band?: boolean }) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titleYears = f.titles.map((t) => t.year).sort((a, b) => a - b);
  const last = titleYears[titleYears.length - 1] ?? null;
  const lastTitle = last !== null ? f.titles.find((t) => t.year === last) : null;
  const debut = f.firstYear ?? 1956;
  const mvpPosition = new Map(getMvps().map((m) => [m.year, m.position]));
  const mvps = [...f.mvps].sort((a, b) => b.year - a.year);
  const latest = f.seasonRecords.filter((r) => !r.fpo).sort((a, b) => b.year - a.year)[0] ?? null;

  type Ranked = FranchiseLeaderEntry & { rank: number };
  const leaderCols = (label: string): StatsColumn<Ranked>[] => [
    { key: 'rank', label: '#', width: 36, render: (l) => <span className="text-[rgba(0,0,0,0.45)]">{l.rank}</span> },
    {
      key: 'name',
      label: 'Jugador',
      render: (l) => (
        <Link href={`/jugadores/${l.slug}`} title={l.name} className={`inline-flex items-center gap-[10px] rounded-[4px] font-semibold ${cls.focus}`}>
          <PlayerAvatar name={l.name} sizePx={30} />
          <span className="max-w-[160px] truncate md:max-w-none">{l.name}</span>
        </Link>
      ),
    },
    { key: 'seasons', label: 'Temporadas', title: 'Temporadas con la franquicia', align: 'right', width: 110, hideBelowMd: true, sortValue: (l) => l.seasons, render: (l) => String(l.seasons) },
    { key: 'g', label: 'Juegos', align: 'right', width: 110, hideBelowMd: true, sortValue: (l) => l.g, render: (l) => fmtInt(l.g) },
    { key: 'value', label, align: 'right', width: 110, sortValue: (l) => l.value, initialSort: 'desc', render: (l) => <span className="text-[22px] leading-none md:text-[24px]">{fmtInt(l.value)}</span> },
  ];
  const withRank = (list: FranchiseLeaderEntry[]): Ranked[] => list.map((l, i) => ({ ...l, rank: i + 1 }));
  const leaderTabs = (
    [
      ['Puntos', f.leaders.pts],
      ['Rebotes', f.leaders.reb],
      ['Asistencias', f.leaders.ast],
    ] as const
  ).filter(([, list]) => list.length);

  // Seasons summarized by decade: seasons played, titles and MVPs.
  const decades = [...new Set(f.activeYears.map((y) => Math.floor(y / 10) * 10))]
    .sort((a, b) => b - a)
    .map((d) => ({
      label: `${d}s`,
      seasons: f.activeYears.filter((y) => Math.floor(y / 10) * 10 === d).length,
      titles: titleYears.filter((y) => Math.floor(y / 10) * 10 === d).length,
      mvps: f.mvps.filter((m) => Math.floor(m.year / 10) * 10 === d).length,
    }));
  const dash = <span className="text-[rgba(0,0,0,0.3)]">–</span>;

  const counters = [
    [String(f.titles.length), lastTitle ? `Campeonatos · último ${lastTitle.year}` : 'Campeonatos'],
    [String(f.mvps.length), 'Jugadores más valiosos'],
    [String(f.activeYears.length), `Temporadas · ${f.activeYears[0]} a ${f.activeYears[f.activeYears.length - 1]}`],
    [fmtInt(f.players.length), 'Jugadores en su historia'],
  ] as const;
  const sections = SECTIONS.filter((sct) => (sct.id === 'lideres' ? leaderTabs.length > 0 : sct.id === 'jugadores' ? f.players.length > 0 : true));

  return (
    <div>
      {band ? <div className="h-[62px] bg-[#0F171F] lg:h-[86px]" aria-hidden /> : null}
      <div className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
        <div className="mx-auto max-w-[1040px] rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[18px] pt-[6px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[34px] lg:pt-[10px]">
          {/* Counters: the panel opens with the franchise in four numbers, all ink. */}
          <div className="grid grid-cols-2 gap-x-[12px] gap-y-[16px] px-[4px] pb-[16px] pt-[16px] md:flex md:flex-wrap md:justify-center md:gap-x-[64px] md:pb-[18px] md:pt-[20px]">
            {counters.map(([v, l]) => (
              <div key={l} className="text-center">
                <p className={`text-[30px] leading-[1] text-[#0F171F] md:text-[36px] ${cls.tabular}`}>{v}</p>
                <p className={`mt-[6px] ${cls.label}`}>{l}</p>
              </div>
            ))}
          </div>
          <HistorySubnav items={sections} />
          {f.notes ? (
            <Callout icon="info" title="Sobre esta franquicia" className="mt-[20px]">
              {f.notes}
            </Callout>
          ) : null}

          <section>
            <SectionHead id="campeonatos" title="Campeonatos" />
            {f.titles.length ? <ChampionshipsTable titles={f.titles} /> : <EmptyLine>Sin campeonatos en su historia. En la liga desde {debut}.</EmptyLine>}
            {lastTitle ? <Footline>Último título {lastTitle.year}{lastTitle.series ? ` · Final ${lastTitle.series}` : ''}{lastTitle.coach ? ` · ${lastTitle.coach}` : ''}</Footline> : null}
          </section>

          {leaderTabs.length ? (
            <section>
              <SectionHead id="lideres" title="Líderes históricos" />
              <Tabs small className="[&>div:first-child]:mb-[10px] [&>div:first-child]:justify-center" tabs={leaderTabs.map(([label, list]) => ({ label, panel: <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} className={`${TABLE_W} !rounded-none !border-0`} /> }))} />
              <Footline>Serie regular con la franquicia · líderes por totales</Footline>
              <EraNotes debutYears={[debut]} className={`${TABLE_W} mt-[16px]`} />
            </section>
          ) : null}

          <section>
            <SectionHead id="mvps" title="Jugadores más valiosos" />
            {mvps.length ? (
              <div className={`${TABLE_W} overflow-hidden`}>
                <table className={`w-full border-collapse ${cls.tabular}`}>
                  <caption className="sr-only">Jugadores más valiosos de la franquicia</caption>
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.08)]">
                      <th scope="col" className={`${TH} w-[72px] text-left`}>Año</th>
                      <th scope="col" className={`${TH} text-left`}>Jugador</th>
                      <th scope="col" className={`${TH} ${NUM_COL} text-right`}>Posición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mvps.map((m) => (
                      <tr key={m.year} className="border-t border-[rgba(0,0,0,0.06)] transition-colors duration-150 hover:bg-[#FAFAFA]">
                        <td className={`${TD} text-left font-bold`}>
                          <Link href={`/temporadas/${m.year}`} className={`rounded-[4px] ${cls.focus}`} title={`Temporada ${m.year}`}>
                            {m.year}
                          </Link>
                        </td>
                        <td className={`${TD} text-left`}>
                          {m.slug ? (
                            <Link href={`/jugadores/${m.slug}`} className={`inline-flex items-center gap-[10px] rounded-[4px] font-semibold ${cls.focus}`}>
                              <PlayerAvatar name={m.name} sizePx={30} />
                              {m.name}
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-[10px] font-semibold">
                              <PlayerAvatar name={m.name} sizePx={30} />
                              {m.name}
                            </span>
                          )}
                        </td>
                        <td className={`${TD} text-right text-[rgba(0,0,0,0.55)]`}>{mvpPosition.get(m.year) ?? dash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyLine>Ningún jugador de la franquicia ha sido nombrado jugador más valioso.</EmptyLine>
            )}
          </section>

          <section>
            <SectionHead id="temporadas" title="Temporadas" />
            <div className={`${TABLE_W} overflow-hidden`}>
              <table className={`w-full border-collapse ${cls.tabular}`}>
                <caption className="sr-only">Temporadas por década</caption>
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.08)]">
                    <th scope="col" className={`${TH} text-left`}>Década</th>
                    <th scope="col" className={`${TH} ${NUM_COL} text-right`}>
                      <span className="md:hidden">Temp.</span>
                      <span className="hidden md:inline">Temporadas</span>
                    </th>
                    <th scope="col" className={`${TH} ${NUM_COL} text-right`}>
                      <span className="md:hidden">Títulos</span>
                      <span className="hidden md:inline">Campeonatos</span>
                    </th>
                    <th scope="col" className={`${TH} ${NUM_COL} text-right`}>MVPs</th>
                  </tr>
                </thead>
                <tbody>
                  {decades.map((d) => (
                    <tr key={d.label} className="border-t border-[rgba(0,0,0,0.06)]">
                      <td className={`${TD} text-left font-bold`}>{d.label}</td>
                      <td className={`${TD} text-right`}>{d.seasons}</td>
                      <td className={`${TD} text-right ${d.titles ? 'font-bold' : ''}`}>{d.titles || dash}</td>
                      <td className={`${TD} text-right`}>{d.mvps || dash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {latest ? (
              <Footline>
                Última temporada {latest.year} · {latest.won}-{latest.lost}
                {latest.position ? ` · ${latest.position}º${latest.group ? ` del Grupo ${latest.group}` : ''}` : ''}
                {latest.year === CURRENT_SEASON ? ' · en curso' : ''}
              </Footline>
            ) : null}
          </section>

          {f.players.length ? (
            <section>
              <SectionHead id="jugadores" title="Todos los que vistieron la camiseta" />
              <div className={TABLE_W}>
                <FranchisePlayersList players={f.players} currentSeason={CURRENT_SEASON} bare />
              </div>
            </section>
          ) : null}

          <div className="mt-[22px] flex flex-col items-center gap-[6px] border-t border-[rgba(15,23,31,0.06)] pt-[16px] text-center font-barlow text-[12px] text-[rgba(15,23,31,0.5)] lg:mt-[30px] lg:text-[13px]">
            <p>Archivo histórico del BSN · serie regular desde 1930 · campeones desde 1930</p>
            <Link href="/equipos/historicos" className={cls.textLink}>
              Ver las franquicias que ya no compiten
            </Link>
          </div>
          <span className="sr-only">
            <FranchiseLogo franchise={f} sizePx={1} />
          </span>
        </div>
      </div>
    </div>
  );
}
