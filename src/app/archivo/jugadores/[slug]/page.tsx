import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, HeroEyebrow, HeroTitle, PaperCard, SectionTitle, StatBlock } from '@/archivo/components/ui';
import { getFranchiseMap, getPlayerBySlug, getSimilarPlayers } from '@/archivo/lib/data';
import { fmt, fmtInt, fmtPct, yearsLabel } from '@/archivo/lib/format';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import PlayerSeasonTabs from './PlayerSeasonTabs';

export const dynamic = 'force-static';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getPlayerBySlug(slug);
  if (!p) return { title: 'Jugador · Archivo BSN' };
  const totals = p.career ?? p.computed.regular;
  return {
    title: `${p.name} · Archivo BSN`,
    description: `${p.name}, ${yearsLabel(p.fy, p.ly)}: ${fmtInt(totals.g)} juegos, ${fmt(totals.ppg)} puntos por juego en el BSN.`,
  };
}

export default async function PlayerPage({ params }: Params) {
  const { slug } = await params;
  const p = getPlayerBySlug(slug);
  if (!p) notFound();

  const franchiseMap = getFranchiseMap();
  const franchises = franchiseViewMap([...franchiseMap.values()]);
  const main = p.franchiseSlugs[0] ? franchiseMap.get(p.franchiseSlugs[0]) ?? null : null;
  const totals = p.career ?? p.computed.regular;
  const similar = getSimilarPlayers(p.id).slice(0, 3);
  const preEra = p.fy < 1975;

  return (
    <ArchivoShell
      hero={
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <PlayerAvatar name={p.name} color={main?.colors.primary} size="hero" className="ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <HeroEyebrow>{yearsLabel(p.fy, p.ly)} · {p.seasons} temporada{p.seasons === 1 ? '' : 's'}</HeroEyebrow>
            <HeroTitle>{p.name}</HeroTitle>
            <div className="mt-[12px] flex flex-wrap items-center gap-[8px]">
              {p.franchiseSlugs.map((s) => {
                const f = franchiseMap.get(s);
                return f ? (
                  <Link key={s} href={`/archivo/franquicias/${s}`} className="inline-flex items-center gap-[6px] rounded-full border border-white/20 py-[3px] pl-[3px] pr-[10px] transition-colors duration-150 hover:border-white/40">
                    <FranchiseLogo franchise={f} size="chip" />
                    <span className="font-barlow text-[12px] font-medium text-white/85">{f.nickname}</span>
                  </Link>
                ) : null;
              })}
            </div>
            <div className="mt-[12px] flex flex-wrap gap-[6px]">
              {p.mvpYears.length ? <Badge tone="gold">MVP {p.mvpYears.join(', ')}</Badge> : null}
              {p.championships.length ? (
                <Badge tone="red">
                  {p.championships.length === 1 ? 'Campeón' : `${p.championships.length} campeonatos`} · {p.championships.map((c) => c.year).join(', ')}
                </Badge>
              ) : null}
            </div>
          </div>
          <Link
            href={`/archivo/comparar?a=${p.slug}`}
            className="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[16px] py-[7px] text-[17px] text-white/85 transition-colors duration-150 hover:border-white/40 hover:text-white"
          >
            Comparar
          </Link>
        </div>
      }
    >
      <section className="mb-10">
        <PaperCard className="grid grid-cols-2 gap-x-4 gap-y-6 p-[16px] sm:grid-cols-4 md:p-[24px] lg:grid-cols-8">
          <StatBlock value={fmtInt(totals.g)} label="Juegos" />
          <StatBlock value={fmtInt(totals.pts)} label="Puntos" />
          <StatBlock value={fmt(totals.ppg)} label="PPJ" />
          <StatBlock value={fmt(totals.rpg)} label="RPJ" />
          <StatBlock value={fmt(totals.apg)} label="APJ" />
          <StatBlock value={fmtPct(p.computed.regular.fgPct ?? totals.fgPct)} label="TC%" />
          <StatBlock value={fmtPct(p.computed.regular.fg3Pct ?? totals.fg3Pct)} label="3P%" />
          <StatBlock value={fmtPct(p.computed.regular.ftPct ?? totals.ftPct)} label="TL%" />
        </PaperCard>
        <p className="mt-[8px] font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">
          Totales de Serie Regular{p.career ? ' publicados por la liga' : ' sumados de sus temporadas'}.
          {preEra ? ' Rebotes, asistencias y triples no se registraban de forma consistente antes de 1975. Los guiones indican data no disponible.' : ''}
        </p>
      </section>

      <section className="mb-10" id="temporadas">
        <SectionTitle>Temporada por temporada</SectionTitle>
        <PlayerSeasonTabs lines={{ regular: p.lines.regular, playoffs: p.lines.playoffs, other: [...p.lines.allstar, ...p.lines.other].sort((a, b) => a.year - b.year) }} totals={p.computed} franchises={franchises} />
      </section>

      {similar.length ? (
        <section>
          <SectionTitle right="Según su perfil estadístico de carrera">Jugadores parecidos</SectionTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {similar.map((s) => (
              <PaperCard key={s.playerId} className="flex items-center justify-between gap-3 p-[14px]">
                <Link href={`/archivo/jugadores/${s.slug}`} className="min-w-0">
                  <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{s.name}</span>
                  <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">Similitud {s.score.toFixed(0)}</span>
                </Link>
                <Link href={`/archivo/comparar?a=${p.slug}&b=${s.slug}`} className="shrink-0 rounded-[100px] border border-[#D5D5D5] px-[12px] py-[4px] text-[14px] text-[rgba(0,0,0,0.65)] transition-colors duration-150 hover:border-[rgba(47,47,47,1)]">
                  Comparar
                </Link>
              </PaperCard>
            ))}
          </div>
        </section>
      ) : null}
    </ArchivoShell>
  );
}
