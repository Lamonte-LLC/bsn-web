import Link from 'next/link';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import Tabs from '@/archivo/components/Tabs';
import { Chip, ContainerTitle, Note, PaperCard, SectionTitle, StatBlock, YearChip } from '@/archivo/components/ui';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchiseLeaderEntry } from '@/archivo/lib/types';
import { dynasties } from '../lib/copy';
import { franchiseFileWithColors } from '../lib/data';
import EraNotes from './EraNotes';
import FranchisePlayersList from './FranchisePlayersList';

/**
 * History of one franchise: counters, championships (dynasties grouped), MVPs, all-time leaders and every
 * player who wore the jersey. Mounted as the Historia tab of an active team and as the page of an extinct one.
 * The relocation timeline is omitted: the data has no structured relocation dates (see HISTORIA-BACKLOG.md).
 */
export default function FranchiseHistory({ slug }: { slug: string }) {
  const f = franchiseFileWithColors(slug);
  if (!f) return null;
  const titleYears = f.titles.map((t) => t.year);
  const runs = dynasties(titleYears);
  const inDynasty = (y: number) => runs.find(([a, b]) => y >= a && y <= b);
  const debut = f.firstYear ?? 1956;

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

  return (
    <div>
      <section className="mb-[36px] lg:mb-[44px]">
        <PaperCard className="grid grid-cols-3 gap-x-4 px-[18px] py-[20px] md:px-[30px] md:py-[24px]">
          <StatBlock value={String(f.titles.length)} label="Títulos" />
          <StatBlock value={String(f.mvps.length)} label="MVPs" />
          <StatBlock value={String(f.activeYears.length)} label="Temporadas" />
        </PaperCard>
        {f.notes ? <Note className="mt-[10px] !max-w-none">{f.notes}</Note> : null}
      </section>

      {f.titles.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={runs.length ? <span className={cls.meta}>Dinastías agrupadas</span> : undefined}>Campeonatos</SectionTitle>
          <PaperCard className="overflow-hidden">
            <div className="hidden grid-cols-[80px_1fr_220px_100px] gap-x-[12px] border-b border-[rgba(0,0,0,0.12)] px-[20px] pb-[9px] pt-[12px] md:grid">
              <span className={cls.label}>Año</span>
              <span className={cls.label}>Dirigente</span>
              <span className={cls.label}>Serie final</span>
              <span className={`text-right ${cls.label}`}>Racha</span>
            </div>
            <ol>
              {[...f.titles]
                .sort((a, b) => b.year - a.year)
                .map((t, i) => {
                  const run = inDynasty(t.year);
                  return (
                    <li key={t.year} className={`grid min-h-[52px] grid-cols-[64px_1fr] items-center gap-x-[10px] px-[14px] py-[8px] md:grid-cols-[80px_1fr_220px_100px] md:gap-x-[12px] md:px-[20px] ${i ? 'border-t border-[rgba(0,0,0,0.06)]' : ''} ${run ? 'bg-[#FAFAFA]' : ''}`}>
                      <Link href={`/temporadas/${t.year}`} className={`text-[22px] leading-[1] text-[#0F171F] ${cls.tabular} rounded-[4px] ${cls.focus}`}>
                        {t.year}
                      </Link>
                      <span className="min-w-0">
                        <span className="block truncate font-barlow text-[14px] font-medium text-[#0F171F]">{t.coach ?? 'Dirigente por confirmar'}</span>
                        <span className={`block ${cls.meta} !text-[12px] md:hidden`}>
                          {t.series ? `Final ${t.series}` : ''}
                          {run ? `${t.series ? ' · ' : ''}${run[1] - run[0] + 1} al hilo` : ''}
                        </span>
                      </span>
                      <span className={`hidden font-barlow text-[13.5px] text-[rgba(0,0,0,0.65)] md:block ${cls.tabular}`}>{t.series ? `Final ${t.series}` : '–'}</span>
                      <span className={`hidden text-right ${cls.meta} md:block ${cls.tabular}`}>{run ? `${run[1] - run[0] + 1} al hilo (${run[0]} a ${run[1]})` : ''}</span>
                    </li>
                  );
                })}
            </ol>
          </PaperCard>
        </section>
      ) : null}

      {f.mvps.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle>MVPs de la franquicia</SectionTitle>
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
          <SectionTitle right={<span className={cls.meta}>Serie Regular con la franquicia</span>}>Líderes históricos</SectionTitle>
          <Tabs small tabs={leaderTabs.map(([label, list]) => ({ label, panel: <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} /> }))} />
          <EraNotes debutYears={[debut]} className="mt-[12px]" />
        </section>
      ) : null}

      {f.seasonRecords.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <ContainerTitle className="mb-[10px]">Temporadas recientes</ContainerTitle>
          <div className="flex flex-wrap gap-[8px]">
            {f.seasonRecords
              .filter((r) => !r.fpo)
              .sort((a, b) => b.year - a.year)
              .map((r) => (
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
