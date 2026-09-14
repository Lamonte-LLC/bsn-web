import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import Tabs from '@/archivo/components/Tabs';
import { Chip, PaperCard, SectionTitle, YearChip } from '@/archivo/components/ui';
import { textOn } from '@/archivo/lib/color';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchiseLeaderEntry, FranchiseTitle } from '@/archivo/lib/types';
import { dynasties } from '../lib/copy';
import { CURRENT_SEASON, franchiseFileWithColors } from '../lib/data';
import Callout from './Callout';
import EraNotes from './EraNotes';
import FranchisePlayersList from './FranchisePlayersList';

const WORDS: Record<number, string> = { 2: 'bicampeones', 3: 'tricampeones', 4: 'cuatro seguidos', 5: 'cinco seguidos', 6: 'seis seguidos', 7: 'siete seguidos' };
const shortCoach = (c: string | null) => (c ? c.split(/\s+y\s+/).map((n) => n.trim().split(' ').slice(-1)[0]).join(', ') : null);

/** Back-to-back titles (two or more in a row), unlike `dynasties()` which needs three. */
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

/** One tile per title, or one wide ink tile per dynasty, grouped by decade. Team primary as the fill. */
function ChampionshipMosaic({ titles, primary }: { titles: FranchiseTitle[]; primary: string }) {
  const years = titles.map((t) => t.year);
  const runs = consecutiveRuns(years);
  const byYear = new Map(titles.map((t) => [t.year, t]));
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => b - a);
  const ink = textOn(primary);
  const tile = 'flex h-[72px] flex-col justify-between rounded-[10px] px-[12px] py-[10px] transition-opacity hover:opacity-90';

  return (
    <div className="grid grid-cols-[52px_1fr] items-center gap-x-[14px] gap-y-[8px] md:grid-cols-[56px_1fr] md:gap-x-[18px]">
      {decades.map((d) => {
        const inDecade = years.filter((y) => Math.floor(y / 10) * 10 === d).sort((a, b) => b - a);
        const items: React.ReactNode[] = [];
        const seen = new Set<number>();
        for (const y of inDecade) {
          if (seen.has(y)) continue;
          const run = runs.find(([a, b]) => y >= a && y <= b);
          if (run && run[1] === y) {
            const span = run[1] - run[0] + 1;
            for (let k = run[0]; k <= run[1]; k++) seen.add(k);
            const coaches = [...new Set(Array.from({ length: span }, (_, i) => shortCoach(byYear.get(run[0] + i)?.coach ?? null)).filter(Boolean))];
            items.push(
              <Link key={`run-${run[0]}`} href={`/temporadas/${run[1]}`} title={`${span} campeonatos seguidos, ${run[0]} a ${run[1]}`} className={`${tile} bg-[#0F171F] text-white ${cls.focus}`} style={{ width: Math.min(span, 5) * 92 + (Math.min(span, 5) - 1) * 6 }}>
                <span className={`text-[26px] leading-[1] ${cls.tabular}`}>
                  {run[0]} a {run[1]} <span className="text-[14px] opacity-65">· {WORDS[span] ?? `${span} seguidos`}</span>
                </span>
                <span className="truncate font-barlow text-[11px] font-medium opacity-85">{coaches.join(' · ') || 'Dirigentes por confirmar'}</span>
              </Link>,
            );
          } else if (!run) {
            seen.add(y);
            const t = byYear.get(y)!;
            items.push(
              <Link key={y} href={`/temporadas/${y}`} title={`Campeonato ${y}${t.coach ? ` · ${t.coach}` : ''}${t.series ? ` · Final ${t.series}` : ''}`} className={`${tile} w-[92px] ${cls.focus}`} style={{ background: primary, color: ink }}>
                <span className={`text-[26px] leading-[1] ${cls.tabular}`}>{y}</span>
                <span className="truncate font-barlow text-[11px] font-medium opacity-85">{[shortCoach(t.coach), t.series].filter(Boolean).join(' · ') || 'Título'}</span>
              </Link>,
            );
          }
        }
        return (
          <div key={d} className="contents">
            <span className={`${cls.label} ${cls.tabular}`}>{d}s</span>
            <div className="flex flex-wrap gap-[6px]">{items}</div>
          </div>
        );
      })}
    </div>
  );
}

function Counter({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className={`${cls.card} px-[16px] py-[14px] md:px-[20px] md:py-[18px]`}>
      <p className={`text-[32px] leading-[1] md:text-[38px] ${cls.tabular}`} style={{ color: color ?? '#0F171F' }}>
        {value}
      </p>
      <p className={`mt-[6px] ${cls.label}`}>{label}</p>
    </div>
  );
}

/**
 * History of one franchise: counters, the championship mosaic (team color, dynasties merged), MVPs, all-time
 * leaders, recent seasons and every player who wore the jersey. Mounted as the Historia tab of an active team
 * and as the page of an extinct one. The relocation timeline is omitted (no structured dates in the data).
 */
export default function FranchiseHistory({ slug }: { slug: string }) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titleYears = f.titles.map((t) => t.year).sort((a, b) => a - b);
  const runs = dynasties(titleYears);
  const longest = runs.reduce((m, [a, b]) => Math.max(m, b - a + 1), 0);
  const last = titleYears[titleYears.length - 1] ?? null;
  const debut = f.firstYear ?? 1956;
  const primary = f.colors.primary ?? '#0F171F';
  const reigning = last !== null && last >= CURRENT_SEASON - 1;

  type Ranked = FranchiseLeaderEntry & { rank: number };
  const leaderCols = (label: string): StatsColumn<Ranked>[] => [
    { key: 'rank', label: '#', width: 28, render: (l) => <span className="font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)]">{l.rank}</span> },
    {
      key: 'name',
      label: 'Jugador',
      render: (l) => (
        <Link href={`/jugadores/${l.slug}`} title={l.name} className={`inline-block max-w-[150px] truncate align-bottom font-semibold ${cls.dataLink} lg:max-w-[140px] xl:max-w-[170px]`}>
          {l.name}
        </Link>
      ),
    },
    { key: 'seasons', label: 'Temp.', title: 'Temporadas', align: 'right', sortValue: (l) => l.seasons, render: (l) => String(l.seasons) },
    { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: (l) => l.g, render: (l) => fmtInt(l.g) },
    { key: 'value', label, align: 'right', strong: true, sortValue: (l) => l.value, initialSort: 'desc', render: (l) => fmtInt(l.value) },
  ];
  const withRank = (list: FranchiseLeaderEntry[]): Ranked[] => list.map((l, i) => ({ ...l, rank: i + 1 }));
  const leaderTabs = (
    [
      ['Puntos', f.leaders.pts],
      ['Rebotes', f.leaders.reb],
      ['Asistencias', f.leaders.ast],
    ] as const
  ).filter(([, list]) => list.length);
  const recent = f.seasonRecords.filter((r) => !r.fpo).sort((a, b) => b.year - a.year);

  return (
    <div>
      <section className="mb-[36px] lg:mb-[44px]">
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-[12px]">
          <Counter value={String(f.titles.length)} label="Campeonatos" color={f.titles.length ? primary : undefined} />
          <Counter value={String(f.mvps.length)} label="Jugadores más valiosos" />
          <Counter value={String(f.activeYears.length)} label="Temporadas" />
          <Counter value={last !== null ? String(last) : '–'} label={last !== null ? 'Último título' : 'Sin títulos'} />
        </div>
        {f.notes ? (
          <Callout icon="info" title="Sobre esta franquicia" className="mt-[16px]">
            {f.notes}
          </Callout>
        ) : null}
      </section>

      <section className="mb-[36px] lg:mb-[44px]">
        <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{f.titles.length ? [reigning ? 'Campeones vigentes' : null, longest >= 2 ? `racha más larga ${longest}` : null, titleYears.length ? `${titleYears[0]} a ${last}` : null].filter(Boolean).join(' · ') : 'Sin campeonatos en su historia'}</span>}>Campeonatos</SectionTitle>
        {f.titles.length ? (
          <PaperCard className="px-[16px] py-[18px] md:px-[24px] md:py-[20px]">
            <ChampionshipMosaic titles={f.titles} primary={primary} />
          </PaperCard>
        ) : (
          <Callout icon="info" title="Sin campeonatos en su historia">
            {f.fullName} no ha ganado el título del BSN{f.firstYear ? ` desde su fundación en ${f.firstYear}` : ''}.
          </Callout>
        )}
      </section>

      {f.mvps.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{f.mvps.length} en total</span>}>Jugadores más valiosos</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {[...f.mvps]
              .sort((a, b) => b.year - a.year)
              .map((m) => (
                <Chip key={m.year} href={m.slug ? `/jugadores/${m.slug}` : `/temporadas/${m.year}`} className="!pl-[13px]">
                  <span className={`font-medium text-[rgba(0,0,0,0.45)] ${cls.tabular}`}>{m.year}</span>
                  {m.name}
                </Chip>
              ))}
          </div>
        </section>
      ) : null}

      {leaderTabs.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={cls.meta}>Serie regular con la franquicia</span>}>Líderes históricos</SectionTitle>
          <Tabs small tabs={leaderTabs.map(([label, list]) => ({ label, panel: <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} /> }))} />
          <EraNotes debutYears={[debut]} className="mt-[20px]" />
        </section>
      ) : null}

      {recent.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>Récord en serie regular</span>}>Temporadas recientes</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {recent.map((r) => (
              <YearChip key={r.year} href={`/temporadas/${r.year}`}>
                {r.year}
                <span className="font-medium text-[rgba(0,0,0,0.45)]">
                  {r.won}-{r.lost}
                </span>
              </YearChip>
            ))}
          </div>
        </section>
      ) : null}

      {f.players.length ? (
        <section>
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{f.players.length} jugadores</span>}>Todos los que vistieron la camiseta</SectionTitle>
          <PaperCard className="px-[16px] py-[16px] md:px-[24px]">
            <FranchisePlayersList players={f.players} />
          </PaperCard>
        </section>
      ) : null}
      <span className="sr-only">
        <FranchiseLogo franchise={f} sizePx={1} />
      </span>
    </div>
  );
}
