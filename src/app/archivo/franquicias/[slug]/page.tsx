import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FpoBadge from '@/archivo/components/FpoBadge';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Badge, Chip, Eyebrow, HeroEyebrow, HeroTitle, PaperCard, SectionTitle, StatBlock } from '@/archivo/components/ui';
import { getFranchiseFile, getFranchises } from '@/archivo/lib/data';
import { fmtInt } from '@/archivo/lib/format';
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
  const f = getFranchiseFile((await params).slug);
  if (!f) notFound();

  type Ranked = FranchiseLeaderEntry & { rank: number };
  const leaderCols = (label: string): StatsColumn<Ranked>[] => [
    { key: 'rank', label: '#', width: 32, render: (l) => <span className="font-barlow-condensed text-[rgba(0,0,0,0.6)]">{l.rank}</span> },
    {
      key: 'name',
      label: 'Jugador',
      render: (l) => (
        <Link href={`/archivo/jugadores/${l.slug}`} className="text-[15px] hover:underline">
          {l.name}
        </Link>
      ),
    },
    { key: 'seasons', label: 'Temp.', align: 'right', sortValue: (l) => l.seasons, render: (l) => l.seasons },
    { key: 'g', label: 'J', align: 'right', sortValue: (l) => l.g, render: (l) => fmtInt(l.g) },
    { key: 'value', label, align: 'right', sortValue: (l) => l.value, render: (l) => <span className="font-semibold">{fmtInt(l.value)}</span> },
  ];
  const withRank = (list: FranchiseLeaderEntry[]): Ranked[] => list.map((l, i) => ({ ...l, rank: i + 1 }));

  const recordCols: StatsColumn<FranchiseSeasonRecord>[] = [
    {
      key: 'year',
      label: 'Temporada',
      sticky: true,
      sortValue: (r) => r.year,
      render: (r) => (
        <span className="inline-flex items-center gap-[8px]">
          <Link href={`/archivo/temporadas/${r.year}`} className="text-[15px] hover:underline">
            {r.year}
          </Link>
          <FpoBadge show={r.fpo} label="" />
        </span>
      ),
    },
    { key: 'w', label: 'G', align: 'right', sortValue: (r) => r.won, render: (r) => r.won },
    { key: 'l', label: 'P', align: 'right', sortValue: (r) => r.lost, render: (r) => r.lost },
    { key: 'pct', label: '%', align: 'right', sortValue: (r) => (r.won + r.lost ? r.won / (r.won + r.lost) : null), render: (r) => (r.won + r.lost ? (r.won / (r.won + r.lost)).toFixed(3).replace(/^0/, '') : '–') },
    { key: 'pos', label: 'Posición', align: 'right', sortValue: (r) => r.position, render: (r) => (r.position ? `${r.position}${r.group ? ` (Grupo ${r.group})` : ''}` : '–') },
  ];

  return (
    <ArchivoShell
      hero={
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <FranchiseLogo franchise={f} size="hero" className="ring-2 ring-white/20" />
          <div className="min-w-0">
            <HeroEyebrow>
              {f.city ?? 'Ciudad por confirmar'} · {f.status === 'active' ? 'Activa' : 'Extinta'}
              {f.firstYear && f.lastYear ? ` · ${f.firstYear} a ${f.lastYear}` : ''}
            </HeroEyebrow>
            <HeroTitle>{f.fullName}</HeroTitle>
            {f.notes ? <p className="mt-[8px] max-w-[640px] font-barlow text-[13px] text-white/60">{f.notes}</p> : null}
            {f.logo === null ? <p className="mt-[6px] font-barlow text-[12px] text-white/45">Logo original pendiente de la liga{f.colorSource === 'prototype' ? '; color provisional' : ''}.</p> : null}
          </div>
        </div>
      }
    >
      <section className="mb-10">
        <PaperCard className="grid grid-cols-3 gap-4 p-[16px] md:p-[24px]">
          <StatBlock value={f.titles.length} label="Títulos" />
          <StatBlock value={f.mvps.length} label="MVPs" />
          <StatBlock value={f.activeYears.length} label="Temporadas" />
        </PaperCard>
      </section>

      {f.titles.length ? (
        <section className="mb-10">
          <SectionTitle>Campeonatos</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {f.titles.map((t) => (
              <Chip key={t.year} href={`/archivo/temporadas/${t.year}`}>
                <span className="text-[15px]">{t.year}</span>
                {t.series ? <span className="text-[rgba(0,0,0,0.45)]">{t.series}</span> : null}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {f.mvps.length ? (
        <section className="mb-10">
          <SectionTitle>MVPs</SectionTitle>
          <div className="flex flex-wrap gap-[8px]">
            {f.mvps.map((m) => (
              <Chip key={m.year} href={m.slug ? `/archivo/jugadores/${m.slug}` : `/archivo/temporadas/${m.year}`}>
                <Badge className="!px-[5px] !py-0">{m.year}</Badge>
                {m.name}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {f.leaders.pts.length ? (
        <section className="mb-10">
          <SectionTitle right="Serie Regular con la franquicia">Líderes históricos</SectionTitle>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(
              [
                ['Puntos', f.leaders.pts],
                ['Rebotes', f.leaders.reb],
                ['Asistencias', f.leaders.ast],
              ] as const
            ).map(([label, list]) =>
              list.length ? (
                <div key={label}>
                  <Eyebrow className="mb-2">{label}</Eyebrow>
                  <StatsTable columns={leaderCols(label)} rows={withRank(list)} rowKey={(l) => l.playerId} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {f.seasonRecords.length ? (
        <section className="mb-10">
          <SectionTitle right={<FpoBadge show={f.seasonRecords.some((r) => r.fpo)} label="Algunas temporadas" />}>Récord por temporada</SectionTitle>
          <StatsTable columns={recordCols} rows={f.seasonRecords} rowKey={(r) => String(r.year)} />
        </section>
      ) : null}

      {f.players.length ? (
        <section>
          <SectionTitle right={`${f.players.length}`}>Todos sus jugadores</SectionTitle>
          <ul className="columns-1 gap-x-6 sm:columns-2 lg:columns-3">
            {f.players.map((p) => (
              <li key={p.id} className="break-inside-avoid border-b border-[rgba(0,0,0,0.05)] py-[5px]">
                <Link href={`/archivo/jugadores/${p.slug}`} className="flex items-baseline justify-between gap-2 hover:underline">
                  <span className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{p.name}</span>
                  <span className="shrink-0 font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{p.fy === p.ly ? p.fy : `${p.fy}–${p.ly}`}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </ArchivoShell>
  );
}
