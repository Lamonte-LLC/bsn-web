import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient } from '@/apollo-client';
import { PLAYER_PROFILE } from '@/graphql/player';
import { PlayerType } from '@/player/types';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import PlayerMatchesWidget from '@/player/client/widgets/PlayerMatchesWidget';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import { Button, Note } from '@/archivo/components/ui';
import { getFranchiseMap } from '@/archivo/lib/data';
import { fmt, fmtInt } from '@/archivo/lib/format';
import { franchiseViewMap } from '@/archivo/lib/franchise-view';
import { careerStats, statsFromLines } from '@/archivo/lib/stats';
import { cls } from '@/archivo/lib/tokens';
import Callout from '@/historia/components/Callout';
import EraNotes from '@/historia/components/EraNotes';
import PlayerSeasonTable, { type CareerRow, type SeasonRow } from '@/historia/components/PlayerSeasonTable';
import { totalsFromLines } from '@/historia/lib/compare';
import { birthShort, hasReboundsGapIn2000s, nationalityLabel, positionLabel, UNLINKED_CAREER, yearsActive } from '@/historia/lib/copy';
import { centimeterToInches } from '@/utils/unit-converter';
import { formatInches } from '@/utils/unit-formater';
import { bestSeason, CURRENT_SEASON as HISTORY_SEASON } from '@/historia/lib/data';
import { liveRoster, resolveUnifiedPlayer } from '@/historia/lib/identity';
import { liveMinutesByYear, liveSeasonLines } from '@/historia/lib/live';

type PlayerPageResponse = { player: PlayerType };

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

/** Height in feet and inches, as the live hero shows it (e.g. 6'10"), plus the metric value. */
function heightFt(cm: number | null | undefined): string | null {
  if (!cm || cm <= 0) return null;
  const inches = centimeterToInches(cm);
  return inches > 0 ? formatInches(inches) : null;
}

type Published = { pts: number | null; reb: number | null; ast: number | null; fgm: number | null; fga: number | null; fg3m: number | null; fg3a: number | null; ftm: number | null; fta: number | null } | null;

/** Career row with the same rules as the season lines: weighted averages, sums only when every line has them. */
function careerRow(lines: SeasonRow[], published: Published): CareerRow | null {
  if (!lines.length) return null;
  const s = statsFromLines(lines);
  const t = totalsFromLines(lines);
  const g = s.g ?? 0;
  const withMin = lines.filter((l) => typeof l.min === 'number');
  const min = withMin.length === lines.length && g ? Math.round((withMin.reduce((acc, l) => acc + (l.min as number) * l.g, 0) / g) * 10) / 10 : null;
  return {
    g: s.g,
    seasons: new Set(lines.map((l) => l.year)).size,
    min,
    ppg: s.ppg,
    rpg: s.rpg,
    apg: s.apg,
    spg: s.spg,
    bpg: s.bpg,
    topg: s.topg,
    fgPct: s.fgPct,
    fg3Pct: s.fg3Pct,
    ftPct: s.ftPct,
    pts: published?.pts ?? s.pts,
    reb: published?.reb ?? t.reb,
    ast: published?.ast ?? t.ast,
    fgm: published?.fgm ?? t.fgm,
    fga: published?.fga ?? t.fga,
    fg3m: published?.fg3m ?? t.fg3m,
    fg3a: published?.fg3a ?? t.fg3a,
    ftm: published?.ftm ?? t.ftm,
    fta: published?.fta ?? t.fta,
  };
}

/**
 * One profile for active and retired players, on the nba.com model: the band carries identity, three numbers
 * of the current season (or the career) and the facts; the white area carries the full table by season and,
 * for actives, the game log. No controls in the band.
 */
export default async function DetalleJugadorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unified = resolveUnifiedPlayer(slug);
  if (!unified) notFound();
  const live = unified.providerId ? await fetchPlayer(unified.providerId) : null;
  const roster = unified.providerId ? liveRoster(unified.providerId) : null;
  const isActive = unified.providerId !== null;
  if (isUuid(slug) && !live && !roster) notFound();

  const franchiseMap = getFranchiseMap();
  const franchises = franchiseViewMap([...franchiseMap.values()]);
  const archive = unified.archive;
  const minutes = liveMinutesByYear({ providerId: unified.providerId, archiveId: archive?.id ?? null });
  const liveLines: SeasonRow[] = liveSeasonLines({ providerId: unified.providerId, archiveId: archive?.id ?? null }).map((l) => ({ ...l, min: minutes[l.year] ?? null }));
  const regularLines: SeasonRow[] = [...(archive?.lines.regular ?? []), ...liveLines];
  const playoffLines: SeasonRow[] = archive?.lines.playoffs ?? [];
  const others: SeasonRow[] = [...(archive?.lines.allstar ?? []), ...(archive?.lines.other ?? [])];
  const hasCareer = regularLines.length > 0 || playoffLines.length > 0;
  const career = careerRow(regularLines.filter((l) => l.franchiseSlug !== null || l.live), archive?.career ?? null);
  const careerPlayoffs = careerRow(playoffLines.filter((l) => l.franchiseSlug !== null), archive?.careerPlayoffs ?? null);

  const fy = archive?.fy ?? liveLines[0]?.year ?? HISTORY_SEASON;
  const ly = isActive ? HISTORY_SEASON : (archive?.ly ?? HISTORY_SEASON);
  const nicknameOf = (franchiseSlug: string | null, fallback: string) => (franchiseSlug ? (franchiseMap.get(franchiseSlug)?.nickname ?? fallback) : fallback);
  const firstLine = regularLines[0];
  const lastLine = regularLines[regularLines.length - 1];
  const mainFranchise = roster?.franchiseSlug ? franchiseMap.get(roster.franchiseSlug) : lastLine?.franchiseSlug ? franchiseMap.get(lastLine.franchiseSlug) : null;
  const mainColor = mainFranchise?.colors.primary ?? null;
  const avatarUrl = live?.avatarUrl ? `${live.avatarUrl}?size=400` : (roster?.avatarUrl ?? '');
  const teamCode = live?.seasonRoster?.team?.code ?? roster?.code ?? '';
  const teamName = mainFranchise?.fullName ?? live?.seasonRoster?.team?.nickname ?? '';
  const jersey = live?.seasonRoster?.jerseyNumber ?? roster?.jerseyNumber ?? null;
  const position = positionLabel(live?.seasonRoster?.playingPosition ?? roster?.position ?? null);
  const teams = [...new Set(regularLines.map((l) => nicknameOf(l.franchiseSlug, l.teamName)))];
  const compareHref = `/jugadores/comparar?p=${archive?.slug ?? unified.providerId}`;
  const longName = unified.name.length > 20;
  const teamNickname = live?.seasonRoster?.team?.nickname ?? mainFranchise?.nickname ?? teamName;
  const ringColor = live?.seasonRoster?.team?.colorPrimary || mainColor || 'rgba(255,255,255,0.5)';

  // Strip: the current season for actives, the career for everyone else.
  const current = liveLines.find((l) => l.current) ?? null;
  const strip = isActive && current
    ? { title: `Temporada ${current.year}`, sub: `${fmtInt(current.g)} juegos`, ppg: current.ppg, rpg: current.rpg, apg: current.apg, fg: current.fgPct }
    : { title: 'Carrera', sub: `${career?.seasons ?? 0} temporadas · ${fmtInt(career?.g ?? null)} juegos`, ppg: career?.ppg ?? null, rpg: career?.rpg ?? null, apg: career?.apg ?? null, fg: career?.fgPct ?? null };

  const best = archive ? bestSeason(archive) : null;
  const bestLine = best?.line ?? [...liveLines].filter((l) => l.g >= 10).sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0))[0] ?? null;
  const seasonsFact = career ? `${career.seasons} · ${yearsActive(fy, ly)}` : null;
  const facts: Array<[string, string | null]> = isActive
    ? [
        ['Posición', position],
        ['Altura', heightFt(live?.height ?? roster?.height ?? null)],
        ['Nacimiento', birthShort(live?.dob ?? roster?.dob ?? null)],
        ['Lugar de origen', nationalityLabel(live?.nationality ?? roster?.nationality ?? null)],
        ['Debut BSN', firstLine ? `${firstLine.year} · ${nicknameOf(firstLine.franchiseSlug, firstLine.teamName)}` : null],
        ['Temporadas', seasonsFact],
      ]
    : [
        ['Debut BSN', firstLine ? `${firstLine.year} · ${nicknameOf(firstLine.franchiseSlug, firstLine.teamName)}` : null],
        ['Última temporada', lastLine ? `${lastLine.year} · ${nicknameOf(lastLine.franchiseSlug, lastLine.teamName)}` : null],
        ['Temporadas', seasonsFact],
        ['Mejor temporada', bestLine ? `${bestLine.year} · ${fmt(bestLine.ppg)} PPJ` : null],
        ['Campeonatos', archive?.championships.length ? `${archive.championships.length} · ${archive.championships.map((c) => c.year).join(', ')}` : null],
        ['Jugador más valioso', archive?.mvpYears.length ? `${archive.mvpYears.length} · ${archive.mvpYears.join(', ')}` : null],
      ];
  const shownFacts = facts.filter((f): f is [string, string] => f[1] !== null).slice(0, 6);

  const liveYears = liveLines.map((l) => l.year);
  const archiveYears = archive ? archive.lines.regular.map((l) => l.year) : [];
  const dataNote = liveYears.length && archiveYears.length ? (
    <Callout icon="table" title="Datos por temporada">
      Desde {Math.min(...liveYears)} la liga publica minutos, robos, bloqueos y pérdidas por juego. Las temporadas anteriores vienen del archivo histórico, que guarda juegos, puntos, rebotes, asistencias y porcentajes; las celdas sin dato muestran un guion, no un cero.
    </Callout>
  ) : null;

  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pt-[25px] md:pt-[30px] lg:pt-[50px]">
          <div className="container">
            <div className="grid grid-cols-1 items-center gap-[24px] md:grid-cols-12 md:gap-[32px]">
              <div className="col-span-1 min-w-0 md:col-span-12 lg:col-span-5">
                <div className="flex flex-row items-start gap-[16px] md:items-center md:gap-[20px]">
                  <div className="relative shrink-0">
                    <figure className="hidden h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full border-4 md:flex" style={{ borderColor: ringColor }}>
                      {avatarUrl ? <PlayerPhotoAvatar photoUrl={avatarUrl} size={182} name={unified.name} /> : <PlayerAvatar name={unified.name} color={mainColor} sizePx={182} onDark />}
                    </figure>
                    <figure className="flex h-[125px] w-[125px] items-center justify-center overflow-hidden rounded-full border-[3px] md:hidden" style={{ borderColor: ringColor }}>
                      {avatarUrl ? <PlayerPhotoAvatar photoUrl={avatarUrl} size={119} name={unified.name} /> : <PlayerAvatar name={unified.name} color={mainColor} sizePx={119} onDark />}
                    </figure>
                    {jersey ? (
                      <div className="absolute -bottom-2 left-0 right-0 text-center">
                        <p className="inline min-w-[32px] rounded-[100px] border border-[rgba(125,125,125,0.23)] bg-[#232323] px-2 md:min-w-auto md:py-0.5">
                          <span className={`font-barlow text-xs font-semibold text-white md:text-[15px] ${cls.tabular}`}>#{jersey}</span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className={`text-white ${longName ? 'text-[22px] md:text-[30px]' : 'text-[26px] md:text-[36px]'} leading-[1.05] [overflow-wrap:anywhere]`}>{unified.name}</h1>
                    <div className="mt-[8px] flex min-w-0 items-center gap-[8px]">
                      {isActive && teamCode ? (
                        <>
                          <span className="hidden shrink-0 md:block">
                            <TeamLogoAvatar teamCode={teamCode} size={24} />
                          </span>
                          <span className="shrink-0 md:hidden">
                            <TeamLogoAvatar teamCode={teamCode} size={20} />
                          </span>
                          <Link href={`/equipos/${teamCode}`} className={`truncate font-barlow text-[13px] font-medium text-[rgba(255,255,255,0.7)] rounded-[4px] md:text-[15px] ${cls.focusOnDark}`}>
                            {teamNickname}
                            {position ? ` · ${position}` : ''}
                          </Link>
                        </>
                      ) : mainFranchise ? (
                        <>
                          <FranchiseLogo franchise={mainFranchise} sizePx={22} className="shrink-0" />
                          <Link href={mainFranchise.status === 'active' && mainFranchise.code ? `/equipos/${mainFranchise.code}?tab=historia` : `/equipos/historicos/${mainFranchise.slug}`} className={`truncate font-barlow text-[13px] font-medium text-[rgba(255,255,255,0.7)] rounded-[4px] md:text-[15px] ${cls.focusOnDark}`} title={teams.join(', ')}>
                            {teams.slice(0, 3).join(', ')}
                            {teams.length > 3 ? ` y ${teams.length - 3} más` : ''}
                          </Link>
                        </>
                      ) : (
                        <span className="font-barlow text-[13px] font-medium text-[rgba(255,255,255,0.7)] md:text-[15px]">{yearsActive(fy, ly)}</span>
                      )}
                    </div>
                    <Button href={compareHref} onDark className="mt-[14px]">
                      Comparar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-12 lg:col-span-7">
                <h4 className={`mb-3 text-[14px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)] md:text-[16px] ${cls.tabular}`}>{strip.title} · {strip.sub}</h4>
                <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
                  {(
                    [
                      ['Puntos por juego', strip.ppg, 'avg'],
                      ['Rebotes por juego', strip.rpg, 'avg'],
                      ['Asistencias por juego', strip.apg, 'avg'],
                      ['% Tiros de campo', strip.fg, 'pct'],
                    ] as const
                  ).map(([label, value, kind]) => (
                    <div key={label} className="rounded-[12px] border border-[rgba(255,255,255,0.2)] px-[14px] py-[12px]">
                      <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">{label}</h5>
                      <p className={`text-[22px] text-white md:text-[27px] ${cls.tabular}`}>{value === null ? '–' : kind === 'pct' ? `${fmt(value)}%` : fmt(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {shownFacts.length ? (
              <>
                <div className="md:mt-[40px]">
                  <div className="border-b border-transparent md:border-[rgba(255,255,255,0.07)]" />
                </div>
                <div className="py-[24px] md:py-[40px] lg:w-7/12">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-[24px] md:grid-cols-6">
                    {shownFacts.map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-base">{label}</h5>
                        <p className={`truncate text-base text-white md:text-[18px] ${cls.tabular}`} title={value}>{value}</p>
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
          {hasCareer && career ? (
            <PlayerSeasonTable
              regular={regularLines}
              playoffs={playoffLines}
              others={others}
              career={career}
              careerPlayoffs={careerPlayoffs}
              franchises={franchises}
              notes={
                <>
                  {dataNote}
                  <EraNotes debutYears={[fy]} reboundsGapIn2000s={archive ? hasReboundsGapIn2000s(archive.lines.regular) : false} />
                  {!archive && isActive ? (
                    <Callout icon="info" title="Carrera en proceso de vinculación">
                      {UNLINKED_CAREER} Se muestran solo sus temporadas en vivo.
                    </Callout>
                  ) : null}
                </>
              }
            />
          ) : (
            <section>
              <h2 className="mb-[14px] text-[22px] leading-[1.1] text-[#0F171F]">Temporada por temporada</h2>
              <Callout icon="info" title="Sin temporadas registradas">
                {UNLINKED_CAREER}
              </Callout>
            </section>
          )}

          {/* Reservado: "Jugadores parecidos" (backlog 8) y "Arco de carrera" (backlog 9) van aquí. */}

          {isActive && unified.providerId ? (
            <section id="juego-por-juego" className="mt-[44px] lg:mt-[56px]">
              <div className="mb-[16px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
                <h2 className={`text-[22px] leading-[1.1] text-[#0F171F] ${cls.tabular}`}>Juego por juego · Temporada {current?.year ?? HISTORY_SEASON}</h2>
                <span className={`${cls.meta} ${cls.tabular}`}>{current ? `Temporada en curso · serie regular · ${fmtInt(current.g)} juegos` : 'Temporada en curso'}</span>
              </div>
              <div className={`${cls.card} overflow-hidden px-[6px] md:px-[14px] [&_.player-stats-table]:!mx-0 [&_table]:text-[13.5px] [&_td]:!px-[10px] [&_td]:!py-[10px] [&_th]:!px-[10px] [&_th]:!py-[9px] [&_th_span]:!text-[10.5px] [&_th_span]:!font-semibold [&_th_span]:!tracking-[0.8px] [&_th_span]:!text-[rgba(0,0,0,0.45)] md:[&_th_span]:!text-[11px]`}>
                <PlayerMatchesWidget playerProviderId={unified.providerId} />
              </div>
            </section>
          ) : null}
          <Note className="sr-only">Perfil de jugador del BSN.</Note>
        </div>
      </div>
    </FullWidthLayout>
  );
}
