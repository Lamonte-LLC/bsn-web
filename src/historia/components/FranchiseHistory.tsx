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

/* Table typography shared by every block, so all columns read the same. */
const TH = 'whitespace-nowrap px-[10px] pb-[9px] pt-[10px] font-barlow text-[12.5px] font-normal uppercase text-[rgba(0,0,0,0.6)]';
const TD = 'h-[48px] whitespace-nowrap px-[10px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.9)]';
/* Numeric columns share one width so gaps between them stay identical from table to table. */
const NUM_COL = 'w-[96px] md:w-[110px]';

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

function SectionHead({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-[14px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
      <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">{title}</h2>
      {right ? <span className={`${cls.meta} ${cls.tabular}`}>{right}</span> : null}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <div className={`${cls.card} px-[18px] py-[16px] font-barlow text-[14px] font-medium text-[rgba(15,23,31,0.6)]`}>{children}</div>;
}

/** Championships as a table, newest first; back-to-back titles get a small group row above their years. */
function ChampionshipsTable({ titles }: { titles: FranchiseTitle[] }) {
  const runs = consecutiveRuns(titles.map((t) => t.year));
  const sorted = [...titles].sort((a, b) => b.year - a.year);
  const started = new Set<number>();
  return (
    <div className={`${cls.card} overflow-hidden px-[4px] md:px-[12px]`}>
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
export default function FranchiseHistory({ slug }: { slug: string }) {
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
    { key: 'seasons', label: 'Temporadas', title: 'Temporadas con la franquicia', align: 'right', width: 110, sortValue: (l) => l.seasons, render: (l) => String(l.seasons) },
    { key: 'g', label: 'Juegos', align: 'right', width: 110, sortValue: (l) => l.g, render: (l) => fmtInt(l.g) },
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

  return (
    <div>
      {/* Counters: plain typography, all ink. */}
      <div className="mb-[28px] grid grid-cols-2 gap-x-[12px] gap-y-[16px] border-b border-[rgba(0,0,0,0.08)] pb-[22px] md:mb-[36px] md:grid-cols-4 md:pb-[28px]">
        {(
          [
            [String(f.titles.length), 'Campeonatos'],
            [String(f.mvps.length), 'Jugadores más valiosos'],
            [String(f.activeYears.length), `Temporadas · desde ${debut}`],
            [fmtInt(f.players.length), 'Jugadores en su historia'],
          ] as const
        ).map(([v, l]) => (
          <div key={l}>
            <p className={`text-[30px] leading-[1] text-[#0F171F] md:text-[36px] ${cls.tabular}`}>{v}</p>
            <p className={`mt-[6px] ${cls.label}`}>{l}</p>
          </div>
        ))}
      </div>
      {f.notes ? (
        <Callout icon="info" title="Sobre esta franquicia" className="mb-[28px] md:mb-[36px]">
          {f.notes}
        </Callout>
      ) : null}

      <section className="mb-[32px] md:mb-[40px]">
        <SectionHead title="Campeonatos" right={lastTitle ? `Último título ${lastTitle.year}${lastTitle.series ? ` · Final ${lastTitle.series}` : ''}` : undefined} />
        {f.titles.length ? <ChampionshipsTable titles={f.titles} /> : <EmptyLine>Sin campeonatos en su historia. En la liga desde {debut}.</EmptyLine>}
      </section>

      {leaderTabs.length ? (
        <section className="mb-[32px] md:mb-[40px]">
          <SectionHead title="Líderes históricos" right="Serie regular con la franquicia" />
          <Tabs small tabs={leaderTabs.map(([label, list]) => ({ label, panel: <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} /> }))} />
          <EraNotes debutYears={[debut]} className="mt-[20px]" />
        </section>
      ) : null}

      <section className="mb-[32px] md:mb-[40px]">
        <SectionHead title="Jugadores más valiosos" right={mvps.length ? `${mvps.length} en total` : undefined} />
        {mvps.length ? (
          <div className={`${cls.card} overflow-hidden px-[4px] md:px-[12px]`}>
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

      <section className="mb-[32px] md:mb-[40px]">
        <SectionHead title="Temporadas" right={`${f.activeYears.length} · ${f.activeYears[0]} a ${f.activeYears[f.activeYears.length - 1]}`} />
        <div className={`${cls.card} overflow-hidden px-[4px] md:px-[12px]`}>
          <table className={`w-full border-collapse ${cls.tabular}`}>
            <caption className="sr-only">Temporadas por década</caption>
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.08)]">
                <th scope="col" className={`${TH} text-left`}>Década</th>
                <th scope="col" className={`${TH} ${NUM_COL} text-right`}>Temporadas</th>
                <th scope="col" className={`${TH} ${NUM_COL} text-right`}>Campeonatos</th>
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
          <p className={`mt-[10px] ${cls.meta} ${cls.tabular}`}>
            Última temporada {latest.year} · {latest.won}-{latest.lost}
            {latest.position ? ` · ${latest.position}º${latest.group ? ` del Grupo ${latest.group}` : ''}` : ''}
            {latest.year === CURRENT_SEASON ? ' · en curso' : ''}
          </p>
        ) : null}
      </section>

      {f.players.length ? (
        <section>
          <SectionHead title="Todos los que vistieron la camiseta" right={`${fmtInt(f.players.length)} jugadores`} />
          <FranchisePlayersList players={f.players} currentSeason={CURRENT_SEASON} />
        </section>
      ) : null}
      <span className="sr-only">
        <FranchiseLogo franchise={f} sizePx={1} />
      </span>
    </div>
  );
}
