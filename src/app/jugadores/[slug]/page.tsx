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
import { birthLine, hasReboundsGapIn2000s, heightLine, nationalityLabel, positionLabel, UNLINKED_CAREER, yearsActive } from '@/historia/lib/copy';
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-[rgba(255,255,255,0.12)] px-[20px] py-[10px] [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(n+4)]:border-b-0">
      <p className="font-barlow text-[9.5px] font-semibold uppercase tracking-[1.3px] text-white/50">{label}</p>
      <p className="mt-[3px] font-barlow text-[14px] font-semibold text-white">{value}</p>
    </div>
  );
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
    ? { label: `Temporada ${current.year} · serie regular · ${fmtInt(current.g)} juegos`, ppg: current.ppg, rpg: current.rpg, apg: current.apg }
    : { label: `Carrera · serie regular · ${fmtInt(career?.g ?? null)} juegos · ${yearsActive(fy, ly)}`, ppg: career?.ppg ?? null, rpg: career?.rpg ?? null, apg: career?.apg ?? null };

  const best = archive ? bestSeason(archive) : null;
  const bestLine = best?.line ?? [...liveLines].filter((l) => l.g >= 10).sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0))[0] ?? null;
  const facts: Array<[string, string | null]> = isActive
    ? [
        ['Altura', heightLine(live?.height ?? roster?.height ?? null)],
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
              <div className="shrink-0 overflow-hidden rounded-full" style={{ width: 72, height: 72 }}>
                {avatarUrl ? <PlayerPhotoAvatar photoUrl={avatarUrl} size={72} name={unified.name} /> : <PlayerAvatar name={unified.name} color={mainColor} sizePx={72} onDark />}
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

          {/* Strip: three numbers and the facts, one row on desktop, stacked on mobile. */}
          <div className="mt-[18px] border-t border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] md:mt-[28px]">
            <div className="container flex flex-col md:flex-row md:items-stretch">
              <div className="grid grid-cols-3 md:flex md:shrink-0">
                {(
                  [
                    ['PPJ', strip.ppg],
                    ['RPJ', strip.rpg],
                    ['APJ', strip.apg],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="border-r border-[rgba(255,255,255,0.12)] px-[14px] py-[12px] text-center last:border-r-0 md:w-[130px] md:border-r md:px-[20px] md:py-[14px] md:text-left md:last:border-r">
                    <p className="font-barlow text-[10px] font-semibold uppercase tracking-[1.3px] text-white/50">{label}</p>
                    <p className={`mt-[6px] text-[28px] leading-[1] text-white md:text-[32px] ${cls.tabular}`}>{value === null ? '–' : fmt(value)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[rgba(255,255,255,0.12)] px-[20px] py-[6px] font-barlow text-[9px] font-semibold uppercase tracking-[1.3px] text-white/40 md:hidden">{strip.label}</div>
              {shownFacts.length ? (
                <div className="grid grid-cols-2 border-t border-[rgba(255,255,255,0.12)] md:flex-1 md:grid-cols-3 md:border-t-0">
                  {shownFacts.map(([l, v]) => (
                    <Fact key={l} label={l} value={v} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="container hidden py-[8px] font-barlow text-[9.5px] font-semibold uppercase tracking-[1.3px] text-white/40 md:block">{strip.label}</div>
          </div>
          <div className="container py-[12px] md:hidden">
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
            <section id="juego-por-juego" className="mt-[36px] lg:mt-[44px]">
              <div className="mb-[12px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-[6px]">
                <h2 className="text-[22px] leading-[1.1] text-[#0F171F]">Juego por juego</h2>
                <span className={`${cls.meta} ${cls.tabular}`}>{current ? `Temporada ${current.year} · ${fmtInt(current.g)} juegos` : `Temporada ${HISTORY_SEASON}`}</span>
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
