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
import { birthLine, hasReboundsGapIn2000s, nationalityLabel, positionLabel, UNLINKED_CAREER, yearsActive } from '@/historia/lib/copy';
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
  return inches > 0 ? `${formatInches(inches)} · ${(cm / 100).toFixed(2)} m` : null;
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

  // Strip: the current season for actives, the career for everyone else.
  const current = liveLines.find((l) => l.current) ?? null;
  const strip = isActive && current
    ? { title: `Temporada ${current.year}`, sub: `Serie regular · ${fmtInt(current.g)} juegos`, ppg: current.ppg, rpg: current.rpg, apg: current.apg, fg: current.fgPct }
    : { title: 'Carrera', sub: `Serie regular · ${fmtInt(career?.g ?? null)} juegos · ${yearsActive(fy, ly)}`, ppg: career?.ppg ?? null, rpg: career?.rpg ?? null, apg: career?.apg ?? null, fg: career?.fgPct ?? null };

  const best = archive ? bestSeason(archive) : null;
  const bestLine = best?.line ?? [...liveLines].filter((l) => l.g >= 10).sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0))[0] ?? null;
  const facts: Array<[string, string | null]> = isActive
    ? [
        ['Altura', heightFt(live?.height ?? roster?.height ?? null)],
        ['País', nationalityLabel(live?.nationality ?? roster?.nationality ?? null)],
        ['Nacimiento', birthLine(live?.dob ?? roster?.dob ?? null)],
        ['Debut BSN', firstLine ? `${firstLine.year} · ${nicknameOf(firstLine.franchiseSlug, firstLine.teamName)}` : null],
        ['Temporadas', career ? String(career.seasons) : null],
        ['Mejor temporada', bestLine ? `${bestLine.year} · ${fmt(bestLine.ppg)} PPJ` : null],
      ]
    : [
        ['Debut BSN', firstLine ? `${firstLine.year} · ${nicknameOf(firstLine.franchiseSlug, firstLine.teamName)}` : null],
        ['Última temporada', lastLine ? `${lastLine.year} · ${nicknameOf(lastLine.franchiseSlug, lastLine.teamName)}` : null],
        ['Temporadas', career ? String(career.seasons) : null],
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
        <section className="pt-[20px] md:pt-[36px]">
          <div className="container">
            <div className="flex items-center gap-[14px] md:gap-[24px]">
              <div className="shrink-0">
                <div className="hidden overflow-hidden rounded-full md:block" style={{ width: 140, height: 140 }}>
                  {avatarUrl ? <PlayerPhotoAvatar photoUrl={avatarUrl} size={140} name={unified.name} /> : <PlayerAvatar name={unified.name} color={mainColor} sizePx={140} onDark />}
                </div>
                <div className="overflow-hidden rounded-full md:hidden" style={{ width: 96, height: 96 }}>
                  {avatarUrl ? <PlayerPhotoAvatar photoUrl={avatarUrl} size={96} name={unified.name} /> : <PlayerAvatar name={unified.name} color={mainColor} sizePx={96} onDark />}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[30px] leading-[1] text-white md:text-[48px]">{unified.name}</h1>
                <div className={`mt-[7px] flex flex-wrap items-center gap-x-[8px] gap-y-[4px] font-barlow text-[12.5px] font-medium text-white/75 md:mt-[10px] md:text-[14px] ${cls.tabular}`}>
                  {isActive && teamCode ? (
                    <Link href={`/equipos/${teamCode}`} className={`inline-flex items-center gap-[6px] rounded-[4px] ${cls.focusOnDark}`}>
                      <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white md:h-[22px] md:w-[22px]">
                        <TeamLogoAvatar teamCode={teamCode} size={16} />
                      </span>
                      {teamName}
                    </Link>
                  ) : mainFranchise ? (
                    <Link href={mainFranchise.status === 'active' && mainFranchise.code ? `/equipos/${mainFranchise.code}?tab=historia` : `/equipos/historicos/${mainFranchise.slug}`} className={`inline-flex items-center gap-[6px] rounded-[4px] ${cls.focusOnDark}`}>
                      <FranchiseLogo franchise={mainFranchise} sizePx={20} />
                      {yearsActive(fy, ly)}
                    </Link>
                  ) : (
                    <span>{yearsActive(fy, ly)}</span>
                  )}
                  {isActive ? (
                    <>
                      {jersey ? (
                        <>
                          <span className="text-white/35">|</span>
                          <span>#{jersey}</span>
                        </>
                      ) : null}
                      {position ? (
                        <>
                          <span className="text-white/35">|</span>
                          <span>{position}</span>
                        </>
                      ) : null}
                    </>
                  ) : teams.length ? (
                    <>
                      <span className="text-white/35">|</span>
                      <span>
                        {teams.slice(0, 4).join(', ')}
                        {teams.length > 4 ? ` y ${teams.length - 4} más` : ''}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
              <Button href={compareHref} onDark className="hidden shrink-0 md:inline-flex">
                Comparar
              </Button>
            </div>
          </div>

          {/* Production-style stat boxes for the season (or career) and the facts in a lined grid. */}
          <div className="container mt-[22px] grid grid-cols-1 items-start gap-[22px] pb-[28px] md:mt-[32px] md:grid-cols-[7fr_5fr] md:gap-[48px] md:pb-[40px]">
            <div>
              <h4 className={`mb-[12px] text-[14px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)] md:text-[16px] ${cls.tabular}`}>
                {strip.title} · {strip.sub}
              </h4>
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
            {shownFacts.length ? (
              <div>
                <h4 className="mb-[12px] text-[14px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)] md:text-[16px]">Ficha</h4>
                <div className="grid grid-cols-2 border-l border-t border-[rgba(255,255,255,0.14)] md:grid-cols-3">
                  {shownFacts.map(([l, v]) => (
                    <div key={l} className="border-b border-r border-[rgba(255,255,255,0.14)] px-[14px] py-[10px]">
                      <h5 className="font-barlow-condensed text-sm text-[rgba(255,255,255,0.7)] md:text-[15px]">{l}</h5>
                      <p className={`mt-[2px] font-barlow text-[15px] text-white md:text-[17px] ${cls.tabular}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="container pb-[20px] md:hidden">
            <Button href={compareHref} onDark className="w-full">
              Comparar
            </Button>
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
              <PlayerMatchesWidget playerProviderId={unified.providerId} />
            </section>
          ) : null}
          <Note className="sr-only">Perfil de jugador del BSN.</Note>
        </div>
      </div>
    </FullWidthLayout>
  );
}
