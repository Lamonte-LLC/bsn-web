import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FpoBadge from '@/archivo/components/FpoBadge';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Chip, ContainerTitle, HeroEyebrow, HeroTitle, PaperCard, SectionTitle, StatBlock, YearChip } from '@/archivo/components/ui';
import { getFranchiseFile, getFranchises } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { FranchiseLeaderEntry, FranchiseSeasonRecord } from '@/archivo/lib/types';

export const dynamic = 'force-static';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getFranchises().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = getFranchiseFile((await params).slug);
  if (!f) return { title: 'Franquicia · Archivo BSN' };
  return { title: `${f.fullName} · Archivo BSN`, description: `${f.fullName}: ${f.titles.length} títulos, ${f.mvps.length} MVPs y ${f.players.length} jugadores en el BSN.` };
}

export default async function FranchisePage({ params }: Params) {
  const raw = getFranchiseFile((await params).slug);
  if (!raw) notFound();
  // The provisional palette lives in getFranchises(); the per-franchise file keeps the source color.
  const listed = getFranchises().find((x) => x.slug === raw.slug);
  const f = listed ? { ...raw, colors: listed.colors } : raw;

  type Ranked = FranchiseLeaderEntry & { rank: number };
  const leaderCols = (label: string): StatsColumn<Ranked>[] => [
    { key: 'rank', label: '#', width: 28, render: (l) => <span className="font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)]">{l.rank}</span> },
    {
      key: 'name',
      label: 'Jugador',
      render: (l) => (
        <Link href={`/archivo/jugadores/${l.slug}`} title={l.name} className={`inline-block max-w-[150px] truncate align-bottom font-semibold ${cls.dataLink} lg:max-w-[140px] xl:max-w-[170px]`}>
          {l.name}
        </Link>
      ),
    },
    { key: 'seasons', label: 'Temp.', title: 'Temporadas', align: 'right', sortValue: (l) => l.seasons, render: (l) => String(l.seasons) },
    { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: (l) => l.g, render: (l) => fmtInt(l.g) },
    { key: 'value', label, align: 'right', strong: true, sortValue: (l) => l.value, initialSort: 'desc', render: (l) => fmtInt(l.value) },
  ];
  const withRank = (list: FranchiseLeaderEntry[]): Ranked[] => list.map((l, i) => ({ ...l, rank: i + 1 }));

  const recordCols: StatsColumn<FranchiseSeasonRecord>[] = [
    {
      key: 'year',
      label: 'Temporada',
      sticky: true,
      sortValue: (r) => r.year,
      initialSort: 'desc',
      render: (r) => (
        <span className="inline-flex items-center gap-[8px]">
          <Link href={`/archivo/temporadas/${r.year}`} className={`font-semibold ${cls.dataLink}`}>
            {r.year}
          </Link>
          <FpoBadge show={r.fpo} />
        </span>
      ),
    },
    { key: 'w', label: 'G', title: 'Ganados', align: 'right', sortValue: (r) => r.won, render: (r) => String(r.won) },
    { key: 'l', label: 'P', title: 'Perdidos', align: 'right', sortValue: (r) => r.lost, render: (r) => String(r.lost) },
    { key: 'pct', label: '%', align: 'right', sortValue: (r) => (r.won + r.lost ? r.won / (r.won + r.lost) : null), render: (r) => (r.won + r.lost ? (r.won / (r.won + r.lost)).toFixed(3).replace(/^0/, '') : '–') },
    { key: 'pos', label: 'Posición', align: 'right', sortValue: (r) => r.position, render: (r) => (r.position ? `${r.position}${r.group ? ` (Grupo ${r.group})` : ''}` : '–') },
  ];

  return (
    <ArchivoShell
      overlap
      hero={
        <div className="flex flex-col gap-[18px] md:flex-row md:items-center md:gap-[28px]">
          <FranchiseLogo franchise={f} sizePx={96} className="md:!h-[120px] md:!w-[120px]" />
          <div className="min-w-0">
            <HeroEyebrow>
              {f.city ?? 'Ciudad por confirmar'} · {f.status === 'active' ? 'Activa' : 'Extinta'}
              {f.firstYear && f.lastYear ? ` · ${f.firstYear} a ${f.lastYear}` : ''}
            </HeroEyebrow>
            <HeroTitle>{f.fullName}</HeroTitle>
            {f.notes ? <p className="mt-[10px] max-w-[62ch] font-barlow text-[14px] leading-[1.5] text-white/65">{f.notes}</p> : null}
            {f.logo === null ? <p className="mt-[6px] font-barlow text-[12.5px] text-white/45">Logo original pendiente de la liga{f.colorSource === 'prototype' ? '; color provisional' : ''}.</p> : null}
          </div>
        </div>
      }
    >
      <section className="mb-[36px] lg:mb-[44px]">
        <PaperCard className="grid grid-cols-3 gap-x-4 px-[18px] py-[20px] md:px-[30px] md:py-[24px]">
          <StatBlock value={String(f.titles.length)} label="Títulos" />
          <StatBlock value={String(f.mvps.length)} label="MVPs" />
          <StatBlock value={String(f.activeYears.length)} label="Temporadas" />
        </PaperCard>
      </section>

      {f.titles.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle>Campeonatos</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {f.titles.map((t) => (
              <YearChip key={t.year} href={`/archivo/temporadas/${t.year}`}>
                {t.year}
                {t.series ? <span className="font-medium text-[rgba(0,0,0,0.45)]">{t.series}</span> : null}
              </YearChip>
            ))}
          </div>
        </section>
      ) : null}

      {f.mvps.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle>MVPs</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {f.mvps.map((m) => (
              <Chip key={m.year} href={m.slug ? `/archivo/jugadores/${m.slug}` : `/archivo/temporadas/${m.year}`} className="!pl-[13px]">
                <span className={`font-medium text-[rgba(0,0,0,0.45)] ${cls.tabular}`}>{m.year}</span>
                {m.name}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {f.leaders.pts.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={cls.meta}>Serie Regular con la franquicia</span>}>Líderes históricos</SectionTitle>
          <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
            {(
              [
                ['Puntos', f.leaders.pts],
                ['Rebotes', f.leaders.reb],
                ['Asistencias', f.leaders.ast],
              ] as const
            ).map(([label, list]) =>
              list.length ? (
                <div key={label}>
                  <ContainerTitle className="mb-[10px]">{label}</ContainerTitle>
                  <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {f.seasonRecords.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<FpoBadge show={f.seasonRecords.some((r) => r.fpo)} label="Algunas temporadas" />}>Récord por temporada</SectionTitle>
          <StatsTable columns={recordCols} rows={f.seasonRecords} rowKey={(r) => String(r.year)} footnote={f.seasonRecords.some((r) => r.fpo) ? 'Las temporadas marcadas FPO usan data de relleno hasta que la liga publique los resultados históricos.' : undefined} />
        </section>
      ) : null}

      {f.players.length ? (
        <section>
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{f.players.length}</span>}>Todos sus jugadores</SectionTitle>
          <PaperCard className="px-[16px] py-[8px] md:px-[24px]">
            <ul className="columns-1 gap-x-[32px] sm:columns-2 lg:columns-3">
              {f.players.map((p) => (
                <li key={p.id} className="break-inside-avoid border-b border-[rgba(0,0,0,0.05)] py-[7px]">
                  <Link href={`/archivo/jugadores/${p.slug}`} className={`flex items-baseline justify-between gap-[8px] rounded-[4px] ${cls.focus}`}>
                    <span className="truncate font-barlow text-[14px] font-medium text-[#0F171F]">{p.name}</span>
                    <span className={`shrink-0 ${cls.meta} !text-[12px] ${cls.tabular}`}>{p.fy === p.ly ? p.fy : `${p.fy} a ${p.ly}`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </PaperCard>
        </section>
      ) : null}
    </ArchivoShell>
  );
}
