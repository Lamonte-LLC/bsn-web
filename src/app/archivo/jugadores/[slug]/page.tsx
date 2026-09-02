import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import CareerArcChart from '@/archivo/components/CareerArcChart';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, Button, HeroEyebrow, HeroTitle, Note, PaperCard, SectionTitle, StatBlock } from '@/archivo/components/ui';
import { getCareerArc, getFranchiseMap, getPlayerBySlug, getPlayerIndexById, getSimilarPlayers } from '@/archivo/lib/data';
import { fmt, fmtInt, fmtPct, yearsLabel } from '@/archivo/lib/format';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { cls, RED } from '@/archivo/lib/tokens';
import PlayerSeasonTabs from './PlayerSeasonTabs';

export const dynamic = 'force-static';

/** The similarity index is precomputed in data/archivo/insights/similarity.json. Flip off to hide the block. */
const SHOW_SIMILAR = true;
const ERA_NOTE = 'Rebotes, asistencias y triples no se registraban de forma consistente antes de 1975. Los guiones indican data no disponible.';

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

function joinYears(years: number[]): string {
  return years.join(' · ');
}

export default async function PlayerPage({ params }: Params) {
  const { slug } = await params;
  const p = getPlayerBySlug(slug);
  if (!p) notFound();

  const franchiseMap = getFranchiseMap();
  const franchises = franchiseViewMap([...franchiseMap.values()]);
  const main = p.franchiseSlugs[0] ? franchiseMap.get(p.franchiseSlugs[0]) ?? null : null;
  const totals = p.career ?? p.computed.regular;
  const preEra = p.fy < 1975;
  const arc = getCareerArc(p.id);
  const similar = SHOW_SIMILAR
    ? getSimilarPlayers(p.id)
        .slice(0, 3)
        .map((s) => ({ ...s, index: getPlayerIndexById(s.playerId) }))
    : [];
  const titles = p.championships.map((c) => c.year);

  return (
    <ArchivoShell
      overlap
      hero={
        <div className="flex flex-col gap-[18px] md:flex-row md:items-start md:gap-[28px]">
          <PlayerAvatar name={p.name} color={main?.colors.primary} size="hero" onDark className="h-[96px] w-[96px] md:h-[120px] md:w-[120px]" />
          <div className="min-w-0 flex-1">
            <HeroEyebrow>
              {yearsLabel(p.fy, p.ly)} · {p.seasons} temporada{p.seasons === 1 ? '' : 's'}
            </HeroEyebrow>
            <HeroTitle>{p.name}</HeroTitle>
            <div className="mt-[14px] flex flex-wrap items-center gap-[6px]">
              {p.franchiseSlugs.map((s) => {
                const f = franchiseMap.get(s);
                return f ? (
                  <Link key={s} href={`/archivo/franquicias/${s}`} className={`inline-flex h-[28px] items-center gap-[6px] rounded-[99px] border border-white/16 py-[3px] pl-[4px] pr-[11px] transition-colors duration-150 hover:border-white/40 ${cls.focusOnDark}`}>
                    <FranchiseLogo franchise={f} sizePx={18} />
                    <span className="font-barlow text-[13px] font-medium text-white/85">{f.nickname}</span>
                  </Link>
                ) : null;
              })}
            </div>
            {p.mvpYears.length || titles.length ? (
              <div className="mt-[10px] flex flex-wrap gap-[6px]">
                {p.mvpYears.length ? (
                  <Badge tone="gold" onDark>
                    MVP {joinYears(p.mvpYears)}
                  </Badge>
                ) : null}
                {titles.length ? (
                  <Badge tone="ink" onDark>
                    {titles.length}× Campeón · {titles.join(', ')}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
          <Button href={`/archivo/comparar?a=${p.slug}`} onDark className="md:self-start">
            Comparar
          </Button>
        </div>
      }
    >
      <section className="mb-[36px] md:mb-[44px]">
        <PaperCard className="grid grid-cols-2 gap-x-4 gap-y-[22px] px-[18px] py-[20px] sm:grid-cols-4 md:px-[30px] md:py-[24px] lg:grid-cols-8">
          <StatBlock value={fmtInt(totals.g)} label="Juegos" />
          <StatBlock value={fmtInt(totals.pts)} label="Puntos" />
          <StatBlock value={fmt(totals.ppg)} label="PPJ" />
          <StatBlock value={fmt(totals.rpg)} label="RPJ" />
          <StatBlock value={fmt(totals.apg)} label="APJ" />
          <StatBlock value={fmtPct(p.computed.regular.fgPct ?? totals.fgPct)} label="TC%" />
          <StatBlock value={fmtPct(p.computed.regular.fg3Pct ?? totals.fg3Pct)} label="3P%" />
          <StatBlock value={fmtPct(p.computed.regular.ftPct ?? totals.ftPct)} label="TL%" />
        </PaperCard>
        <Note className="mt-[10px] !max-w-none">
          Totales de Serie Regular{p.career ? ' publicados por la liga' : ' sumados de sus temporadas'}.{preEra ? ` ${ERA_NOTE}` : ''}
        </Note>
      </section>

      {arc && arc.arc.length >= 3 ? (
        <section className="mb-[36px] md:mb-[44px]">
          <CareerArcChart players={[{ id: p.id, name: p.name, color: RED, arc: arc.arc, peakSeason: arc.peakSeason }]} franchises={franchises} />
        </section>
      ) : null}

      <section className="mb-[36px] md:mb-[44px]" id="temporadas">
        <PlayerSeasonTabs
          lines={{ regular: p.lines.regular, playoffs: p.lines.playoffs, other: [...p.lines.allstar, ...p.lines.other].sort((a, b) => a.year - b.year) }}
          totals={p.computed}
          franchises={franchises}
          footnote={preEra ? `Nota de era: la liga no registró rebotes, asistencias ni triples de forma consistente antes de 1975. Los promedios de ${p.name} se muestran tal como sobreviven en el archivo.` : undefined}
        />
      </section>

      {similar.length ? (
        <section>
          <SectionTitle>Jugadores parecidos</SectionTitle>
          <div className="grid grid-cols-1 gap-[12px] md:grid-cols-3">
            {similar.map((s) => {
              const f = s.index?.franchiseSlugs[0] ? franchiseMap.get(s.index.franchiseSlugs[0]) ?? null : null;
              return (
                <PaperCard key={s.playerId} className="flex items-center gap-[12px] px-[16px] py-[14px]">
                  <Link href={`/archivo/jugadores/${s.slug}`} className={`flex min-w-0 flex-1 items-center gap-[12px] ${cls.focus} rounded-[6px]`}>
                    <PlayerAvatar name={s.name} color={f?.colors.primary} size="avatar" />
                    <span className="min-w-0">
                      <span className="block truncate font-barlow text-[14px] font-semibold text-[#0F171F]">{s.name}</span>
                      <span className={`block truncate ${cls.meta}`}>
                        {f?.nickname ?? ''}
                        {s.index ? `${f ? ' · ' : ''}${yearsLabel(s.index.fy, s.index.ly)}` : ''}
                      </span>
                    </span>
                  </Link>
                  <span className="shrink-0 text-center">
                    <span className={`block text-[24px] leading-[1] text-[#0F171F] ${cls.tabular}`}>{s.score.toFixed(0)}</span>
                    <span className="block font-barlow text-[9px] font-semibold uppercase tracking-[1px] text-[rgba(0,0,0,0.45)]">Similitud</span>
                  </span>
                  <Button variant="secondary" href={`/archivo/comparar?a=${p.slug}&b=${s.slug}`} className="!h-[32px] !px-[12px] !text-[13px]">
                    Comparar
                  </Button>
                </PaperCard>
              );
            })}
          </div>
          <Note className="mt-[10px]">Según el perfil estadístico de carrera. La similitud se calcula sobre promedios por juego y longitud de carrera.</Note>
        </section>
      ) : null}
    </ArchivoShell>
  );
}
