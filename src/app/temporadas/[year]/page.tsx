import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { getFranchises, getSeason, getSeasonYears } from '@/archivo/lib/data';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { cls } from '@/archivo/lib/tokens';
import Callout from '@/historia/components/Callout';
import EraNotes from '@/historia/components/EraNotes';
import SeasonSelector from '@/historia/components/SeasonSelector';
import { LeadersPanel, SectionHead, SeriesPanel, StandingsPanel } from '@/historia/components/season/SeasonPanels';
import SeasonTabs from '@/historia/components/season/SeasonTabs';
import SeasonTeams from '@/historia/components/season/SeasonTeams';
import { NO_SEASON_DATA } from '@/historia/lib/copy';
import { CURRENT_SEASON } from '@/historia/lib/data';
import { leadersView, seriesView, standingsView, teamsView } from '@/historia/lib/season-view';

export const dynamic = 'force-static';

type Params = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return getSeasonYears().map((y) => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year } = await params;
  const s = getSeason(Number(year));
  if (!s) return { title: `Temporada ${year} · BSN` };
  const bits = [s.champion ? `Campeón: ${s.champion.fullName}` : null, s.mvp ? `MVP: ${s.mvp.name}` : null].filter(Boolean).join('. ');
  return { title: `Temporada ${year} · BSN`, description: bits ? `${bits}.` : `La temporada ${year} del Baloncesto Superior Nacional.` };
}

function StripCell({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-[20px] py-[12px] md:py-[14px] ${className}`}>
      <p className="font-barlow text-[10px] font-semibold uppercase tracking-[1.3px] text-white/50">{label}</p>
      <div className="mt-[6px] flex items-center gap-[10px]">{children}</div>
    </div>
  );
}

/**
 * Season page: the band says what the season was (champion, MVP), one control moves between years, and the
 * white area holds one panel at a time behind design-system pill tabs. Only the tabs with data exist, so
 * 1968 and 2026 share one skeleton.
 */
export default async function TemporadaPage({ params }: Params) {
  const year = Number((await params).year);
  const season = getSeason(year);
  if (!season) notFound();
  const years = getSeasonYears();
  const idx = years.indexOf(year);
  const prev = idx > 0 ? years[idx - 1] : null;
  const next = idx < years.length - 1 ? years[idx + 1] : null;
  const franchises = franchiseViewMap(getFranchises());
  const fOf = (slug: string | null | undefined) => (slug ? (franchises[slug] ?? null) : null);
  const { champion, mvp } = season;

  const standings = standingsView(season, franchises);
  const series = seriesView(season, franchises, { includeFpo: true });
  const seriesFpo = Boolean(season.results?.fpo.series) && series.length > 0;
  const leaders = leadersView(season, franchises);
  const teams = teamsView(season, franchises);
  const nothing = !champion && !mvp && !leaders.length && !teams.length && !standings.length;
  const isCurrent = year === CURRENT_SEASON;
  const gamesPerTeam = standings[0]?.rows[0] ? standings[0].rows[0].won + standings[0].rows[0].lost : null;
  const championRow = champion ? standings.flatMap((g) => g.rows).find((r) => r.slug === champion.franchiseSlug) : null;
  const playoffRecord = champion ? series.filter((s) => s.winner.slug === champion.franchiseSlug).reduce((acc, s) => ({ w: acc.w + s.wins, l: acc.l + s.losses }), { w: 0, l: 0 }) : null;

  const tabs = [
    standings.length
      ? {
          label: 'Posiciones',
          panel: (
            <section>
              <SectionHead title="Posiciones" right={`Serie regular${gamesPerTeam ? ` · ${gamesPerTeam} juegos por equipo` : ''} · los primeros cuatro de cada grupo clasifican`} />
              <StandingsPanel groups={standings} franchises={franchises} />
            </section>
          ),
        }
      : null,
    series.length
      ? {
          label: 'Playoffs',
          panel: (
            <section>
              <SectionHead title="Playoffs" right={champion && playoffRecord?.w ? `${champion.name} campeones · ${playoffRecord.w}-${playoffRecord.l} en la postemporada` : `${series.length} series`} />
              <SeriesPanel series={series} franchises={franchises} />
              {seriesFpo ? (
                <Callout icon="info" title="Series de ejemplo" className="mt-[20px]">
                  El backend aún no sirve las series de {year}; estas filas son un relleno marcado FPO hasta que la liga las publique.
                </Callout>
              ) : null}
            </section>
          ),
        }
      : null,
    leaders.length
      ? {
          label: 'Líderes',
          panel: (
            <section>
              <SectionHead title="Líderes" right="Serie regular · mínimo 10 juegos" />
              <LeadersPanel leaders={leaders} franchises={franchises} year={year} />
              <EraNotes debutYears={[year]} className="mt-[20px]" />
            </section>
          ),
        }
      : null,
    teams.length
      ? {
          label: 'Equipos',
          panel: (
            <section>
              <SectionHead title="Equipos" right={`${teams.length} equipos · toca uno para ver su roster`} />
              <SeasonTeams year={year} teams={teams} franchises={franchises} />
              {!standings.length ? (
                <Callout icon="info" title="Sin posiciones ni playoffs registrados" className="mt-[20px]">
                  La liga no conserva la tabla de posiciones ni las series de {year}. Los rosters traen juegos, puntos, rebotes y asistencias por jugador.
                </Callout>
              ) : null}
            </section>
          ),
        }
      : null,
  ].filter((t) => t !== null);

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pt-[18px] md:pt-[30px]">
          <div className="container">
            <div className="flex items-start justify-between gap-[16px]">
              <div>
                <p className="font-barlow text-[10.5px] font-semibold uppercase tracking-[1.3px] text-white/50">Baloncesto Superior Nacional</p>
                <h1 className={`mt-[6px] text-[34px] leading-[1] text-white md:text-[48px] ${cls.tabular}`}>Temporada {year}</h1>
              </div>
              <div className="hidden md:block">
                <SeasonSelector years={years} current={CURRENT_SEASON} selected={year} currentHref={`/temporadas/${CURRENT_SEASON}`} onDark group={{ prev, next }} />
              </div>
            </div>
          </div>

          <div className="mt-[16px] border-t border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] md:mt-[22px]">
            <div className="container flex flex-col md:flex-row">
              <StripCell label="Campeón" className="border-b border-[rgba(255,255,255,0.12)] md:flex-1 md:border-b-0 md:border-r">
                {champion ? (
                  <>
                    <FranchiseLogo franchise={fOf(champion.franchiseSlug)} fallbackName={champion.fullName} sizePx={28} />
                    <div className="min-w-0">
                      {champion.franchiseSlug ? (
                        <Link href={fOf(champion.franchiseSlug)?.status === 'active' && fOf(champion.franchiseSlug)?.code ? `/equipos/${fOf(champion.franchiseSlug)!.code}?tab=historia` : `/equipos/historicos/${champion.franchiseSlug}`} className={`block font-barlow text-[15px] font-semibold text-white rounded-[4px] ${cls.focusOnDark}`}>
                          {champion.fullName}
                        </Link>
                      ) : (
                        <p className="font-barlow text-[15px] font-semibold text-white">{champion.fullName}</p>
                      )}
                      <p className={`mt-[1px] font-barlow text-[12.5px] font-medium text-white/60 ${cls.tabular}`}>
                        {[champion.series ? `Final ${champion.series}${series[0]?.final ? ` vs ${series[0].loser.nickname}` : ''}` : null, champion.coach ? `Dirigente ${champion.coach}` : null, championRow ? `${championRow.won}-${championRow.lost} en serie regular` : null].filter(Boolean).join(' · ') || 'Título registrado por la liga'}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="font-barlow text-[14px] font-medium text-white/60">{isCurrent ? 'Por definirse' : 'No registrado'}</p>
                )}
              </StripCell>
              <StripCell label="Jugador más valioso" className="md:flex-1">
                {mvp ? (
                  <>
                    <PlayerAvatar name={mvp.name} color={fOf(mvp.franchiseSlugs[0] ?? null)?.colors.primary} sizePx={28} onDark />
                    <div className="min-w-0">
                      <Link href={mvp.slug ? `/jugadores/${mvp.slug}` : '#'} className={`block font-barlow text-[15px] font-semibold text-white rounded-[4px] ${cls.focusOnDark}`}>
                        {mvp.name}
                      </Link>
                      <p className="mt-[1px] font-barlow text-[12.5px] font-medium text-white/60">
                        {mvp.teamName}
                        {mvp.position ? ` · ${mvp.position}` : ''}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="font-barlow text-[14px] font-medium text-white/60">{isCurrent ? 'Por definirse' : 'No registrado'}</p>
                )}
              </StripCell>
            </div>
            <div className="container flex justify-center border-t border-[rgba(255,255,255,0.12)] py-[14px] md:hidden">
              <SeasonSelector years={years} current={CURRENT_SEASON} selected={year} currentHref={`/temporadas/${CURRENT_SEASON}`} onDark group={{ prev, next }} />
            </div>
          </div>
        </section>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          {nothing ? (
            <Callout icon="info" title="Temporada sin data estadística">
              {NO_SEASON_DATA}
            </Callout>
          ) : tabs.length ? (
            <Suspense fallback={null}>
              <SeasonTabs tabs={tabs} />
            </Suspense>
          ) : (
            <Callout icon="info" title="Solo campeón y MVP">
              La liga conserva el campeón y el jugador más valioso de {year}, pero no las posiciones, los líderes ni los rosters.
            </Callout>
          )}
        </div>
      </div>
    </FullWidthLayout>
  );
}
