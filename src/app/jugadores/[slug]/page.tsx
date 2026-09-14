import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import numeral from 'numeral';
import { getClient } from '@/apollo-client';
import { PLAYER_PROFILE } from '@/graphql/player';
import { CURRENT_SEASON } from '@/graphql/season';
import { PlayerType } from '@/player/types';
import { SeasonType } from '@/season/types';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import PlayerMatchesWidget from '@/player/client/widgets/PlayerMatchesWidget';
import { centimeterToInches, kilogramToPounds } from '@/utils/unit-converter';
import { formatInches } from '@/utils/unit-formater';
import { PLAYER_BIRTHDAY_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import { getFirstWord } from '@/utils/text';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Badge, Button, Note, PaperCard } from '@/archivo/components/ui';
import { getFranchiseMap } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { careerStats, playoffStats, statsFromLines } from '@/archivo/lib/stats';
import { cls } from '@/archivo/lib/tokens';
import CareerSeasonTable, { type SeasonRow } from '@/historia/components/CareerSeasonTable';
import CareerSummary from '@/historia/components/CareerSummary';
import { countBadge, eraNotes, hasReboundsGapIn2000s, UNLINKED_CAREER, yearsActive } from '@/historia/lib/copy';
import { CURRENT_SEASON as HISTORY_SEASON } from '@/historia/lib/data';
import { liveRoster, resolveUnifiedPlayer } from '@/historia/lib/identity';
import { liveSeasonLines } from '@/historia/lib/live';

type PlayerPageResponse = { player: PlayerType };
type CurrentSeasonResponse = { currentSeason?: SeasonType };

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s);

/** Live profile from the API. Returns null (never throws) so the archive can still render the page. */
async function fetchPlayer(providerId: string): Promise<PlayerType | null> {
  try {
    const { data } = await getClient().query<PlayerPageResponse>({ query: PLAYER_PROFILE, variables: { geniusId: 0, providerId } });
    return data?.player ?? null;
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

async function fetchCurrentSeason(): Promise<SeasonType | null> {
  try {
    const { data } = await getClient().query<CurrentSeasonResponse>({ query: CURRENT_SEASON });
    return data?.currentSeason ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const u = resolveUnifiedPlayer(slug);
  if (!u) return { title: 'Jugador · BSN' };
  const a = u.archive;
  const totals = a ? careerStats(a) : null;
  const years = a ? yearsActive(a.fy, u.providerId ? HISTORY_SEASON : a.ly) : String(HISTORY_SEASON);
  const bit = totals?.pts ? `${fmtInt(totals.pts)} puntos y ${fmt(totals.ppg)} por juego en el BSN.` : 'Perfil en el Baloncesto Superior Nacional.';
  return { title: `${u.name} · Jugador · BSN`, description: `${u.name}, ${years}. ${bit}` };
}

/**
 * One profile for active and retired players. The live hero, the current-season block and the game log stay
 * as they were; the career (archive plus the live seasons) comes right after the hero for everyone.
 */
export default async function DetalleJugadorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unified = resolveUnifiedPlayer(slug);
  if (!unified) notFound();
  const live = unified.providerId ? await fetchPlayer(unified.providerId) : null;
  const roster = unified.providerId ? liveRoster(unified.providerId) : null;
  const currentSeason = unified.providerId ? await fetchCurrentSeason() : null;
  const isActive = unified.providerId !== null;
  if (isUuid(slug) && !live && !roster) notFound();

  const franchiseMap = getFranchiseMap();
  const franchises = franchiseViewMap([...franchiseMap.values()]);
  const archive = unified.archive;
  const liveLines = liveSeasonLines({ providerId: unified.providerId, archiveId: archive?.id ?? null });
  const regularLines: SeasonRow[] = [...(archive?.lines.regular ?? []), ...liveLines];
  const playoffLines: SeasonRow[] = archive?.lines.playoffs ?? [];
  const others: SeasonRow[] = [...(archive?.lines.allstar ?? []), ...(archive?.lines.other ?? [])];
  const hasCareer = regularLines.length > 0 || playoffLines.length > 0;

  const career = archive ? careerStats(archive) : statsFromLines(liveLines);
  const regular = archive ? statsFromLines([...archive.lines.regular.filter((l) => l.franchiseSlug !== null), ...liveLines]) : statsFromLines(liveLines);
  const playoffs = archive ? playoffStats(archive) : statsFromLines([]);

  const fy = archive?.fy ?? HISTORY_SEASON;
  const ly = isActive ? HISTORY_SEASON : (archive?.ly ?? HISTORY_SEASON);
  const franchiseSlugs = [...new Set([...(archive?.franchiseSlugs ?? []), ...liveLines.map((l) => l.franchiseSlug).filter((s): s is string => Boolean(s))])];
  const mainColor = (roster?.franchiseSlug ? franchiseMap.get(roster.franchiseSlug) : franchiseSlugs[0] ? franchiseMap.get(franchiseSlugs[0]) : null)?.colors.primary ?? null;
  const mvpYears = archive?.mvpYears ?? [];
  const titles = archive?.championships.map((c) => c.year) ?? [];
  const notes = eraNotes({ debutYears: [fy], reboundsGapIn2000s: archive ? hasReboundsGapIn2000s(archive.lines.regular) : false });
  const avatarUrl = live?.avatarUrl ? `${live.avatarUrl}?size=400` : roster?.avatarUrl ?? '';
  const teamCode = live?.seasonRoster?.team?.code ?? roster?.code ?? '';
  const teamNickname = live?.seasonRoster?.team?.nickname ?? (roster?.franchiseSlug ? franchiseMap.get(roster.franchiseSlug)?.nickname : '') ?? '';
  const jersey = live?.seasonRoster?.jerseyNumber ?? roster?.jerseyNumber ?? null;
  const position = live?.seasonRoster?.playingPosition ?? roster?.position ?? null;
  const borderColor = live?.seasonRoster?.team?.colorPrimary || mainColor || '#ccc';
  const compareHref = `/jugadores/comparar?a=${archive?.slug ?? unified.providerId}`;

  const badges = (
    <div className="mt-[12px] flex flex-wrap items-center gap-[6px]">
      {franchiseSlugs.map((s) => {
        const f = franchiseMap.get(s);
        return f ? (
          <Link key={s} href={f.status === 'active' && f.code ? `/equipos/${f.code}?tab=historia` : `/equipos/historicos/${s}`} className={`inline-flex h-[28px] items-center gap-[6px] rounded-[99px] border border-white/16 py-[3px] pl-[4px] pr-[11px] transition-colors duration-150 hover:border-white/40 ${cls.focusOnDark}`} title={f.fullName}>
            <FranchiseLogo franchise={f} sizePx={18} />
            <span className="font-barlow text-[13px] font-medium text-white/85">{f.nickname}</span>
          </Link>
        ) : null;
      })}
      {mvpYears.length ? (
        <Badge tone="gold" onDark>
          {countBadge('MVP', mvpYears.length)}
        </Badge>
      ) : null}
      {titles.length ? (
        <Badge tone="ink" onDark>
          {countBadge('Campeón', titles.length)}
        </Badge>
      ) : null}
    </div>
  );

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pt-[25px] md:pt-[30px] lg:pt-[50px]">
          <div className="container">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
              <div className={`col-span-1 mb-[20px] md:col-span-12 md:mb-0 ${isActive ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
                <div className="flex flex-row items-start gap-4 md:items-center">
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <>
                        <figure className="hidden h-[190px] w-[190px] overflow-hidden rounded-full border border-2 md:block" style={{ borderColor }}>
                          <PlayerPhotoAvatar photoUrl={avatarUrl} size={190} name={unified.name} />
                        </figure>
                        <figure className="h-[125px] w-[125px] overflow-hidden rounded-full border border-2 md:hidden" style={{ borderColor }}>
                          <PlayerPhotoAvatar photoUrl={avatarUrl} size={125} name={unified.name} />
                        </figure>
                      </>
                    ) : (
                      <>
                        <div className="hidden md:block">
                          <PlayerAvatar name={unified.name} color={mainColor} sizePx={190} onDark />
                        </div>
                        <div className="md:hidden">
                          <PlayerAvatar name={unified.name} color={mainColor} sizePx={125} onDark />
                        </div>
                      </>
                    )}
                    {jersey ? (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <p className="inline min-w-[32px] rounded-[100px] border border-[rgba(125,125,125,0.23)] bg-[#232323] px-2 md:min-w-auto md:py-0.5">
                          <span className="font-barlow text-xs font-semibold text-white md:text-[15px]">#{jersey}</span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50 ${cls.tabular}`}>
                      {yearsActive(fy, ly)}
                      {archive ? ` · ${archive.seasons + (liveLines.length ? liveLines.filter((l) => l.year > archive.ly).length : 0)} temporadas` : ''}
                    </p>
                    <h1 className="mt-[4px] text-[26px] leading-[1.05] text-white md:text-[36px]">{unified.name}</h1>
                    {isActive ? (
                      <div className="mt-[6px] flex flex-row items-center gap-2">
                        {teamCode ? (
                          <>
                            <div className="hidden md:block">
                              <TeamLogoAvatar teamCode={teamCode} size={24} />
                            </div>
                            <div className="md:hidden">
                              <TeamLogoAvatar teamCode={teamCode} size={20} />
                            </div>
                          </>
                        ) : null}
                        <span className="font-barlow text-[13px] font-medium text-[rgba(255,255,255,0.7)] md:text-[15px]">
                          {getFirstWord(teamNickname)}
                          {position ? ` · ${position}` : ''}
                        </span>
                      </div>
                    ) : null}
                    {badges}
                    <Button href={compareHref} onDark className="mt-[14px]">
                      Comparar
                    </Button>
                  </div>
                </div>
              </div>

              {isActive ? (
                <div className="col-span-1 md:col-span-12 lg:col-span-7">
                  <div className="mb-3">
                    <h4 className="text-[14px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)] md:text-[16px]">{currentSeason?.name ?? `Temporada ${HISTORY_SEASON}`}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-2 md:grid-cols-4">
                    {(
                      [
                        ['Puntos por juego', live ? numeral(live.seasonStats?.pointsAvg ?? 0).format('0.0') : fmt(liveLines.find((l) => l.current)?.ppg ?? null)],
                        ['Rebotes por juego', live ? numeral(live.seasonStats?.reboundsTotalAvg ?? 0).format('0.0') : fmt(liveLines.find((l) => l.current)?.rpg ?? null)],
                        ['Asistencias por juego', live ? numeral(live.seasonStats?.assistsAvg ?? 0).format('0.0') : fmt(liveLines.find((l) => l.current)?.apg ?? null)],
                        ['% Tiros de campo', live ? numeral(live.seasonStats?.fieldGoalsPercentage ?? 0).format('0.0%') : `${fmt(liveLines.find((l) => l.current)?.fgPct ?? null)}%`],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="rounded-[12px] border border-[rgba(255,255,255,0.2)] px-[14px] py-[12px]">
                        <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">{label}</h5>
                        <p className={`text-[22px] text-white md:text-[27px] ${cls.tabular}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {isActive && live ? (
              <>
                <div className="md:mt-[40px]">
                  <div className="border-b border-transparent md:border-[rgba(255,255,255,0.07)]" />
                </div>
                <div className="py-[24px] md:py-[40px] lg:w-7/12">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-[24px] md:grid-cols-5">
                    {(
                      [
                        ['Posición', live.seasonRoster?.playingPosition || 'N/A'],
                        ['Altura', centimeterToInches(live.height) > 0 ? formatInches(centimeterToInches(live.height)) : 'N/A'],
                        ['Peso', kilogramToPounds(live.weight) > 0 ? `${numeral(kilogramToPounds(live.weight)).format('0.0')} lbs` : 'N/A'],
                        ['Fecha de nacimiento', live.dob ? formatDate(live.dob, PLAYER_BIRTHDAY_FORMAT) : 'N/A'],
                        ['Lugar de origen', live.nationality || 'N/A'],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label}>
                        <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">{label}</h5>
                        <p className="text-base text-white md:text-[18px]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="pb-[28px] md:pb-[36px]" />
            )}
          </div>
        </section>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          {hasCareer ? (
            <>
              <section className="mb-[36px] lg:mb-[44px]">
                <CareerSummary
                  career={career}
                  regular={regular}
                  playoffs={playoffs}
                  source={archive?.career ? `Totales de carrera publicados por la liga hasta ${archive.ly}${liveLines.length ? `; las temporadas ${liveLines.map((l) => l.year).join(' y ')} se suman de la data en vivo` : ''}.` : archive ? 'Totales sumados de las temporadas disponibles.' : `${UNLINKED_CAREER} Se muestran solo sus temporadas en vivo.`}
                />
              </section>
              <section className="mb-[36px] lg:mb-[44px]" id="temporadas">
                <CareerSeasonTable lines={[...regularLines, ...playoffLines]} others={others} franchises={franchises} footnote={notes} />
              </section>
            </>
          ) : (
            <section className="mb-[36px] lg:mb-[44px]">
              <h2 className="mb-[14px] text-[22px] leading-[1.1] text-[#0F171F]">Carrera</h2>
              <PaperCard className="px-[18px] py-[20px] md:px-[30px] md:py-[24px]">
                <Note className="!max-w-none">{UNLINKED_CAREER}</Note>
              </PaperCard>
            </section>
          )}

          {/* Reservado: "Jugadores parecidos" (backlog 8) y "Arco de carrera" (backlog 9) van aquí. */}

          {isActive && unified.providerId ? (
            <section id="juego-por-juego">
              <h2 className="mb-[14px] text-[22px] leading-[1.1] text-[#0F171F]">Juego por juego</h2>
              <PlayerMatchesWidget playerProviderId={unified.providerId} />
            </section>
          ) : null}
        </div>
      </div>
    </FullWidthLayout>
  );
}
