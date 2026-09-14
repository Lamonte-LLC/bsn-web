import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import LeaderCard from '@/archivo/components/LeaderCard';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Chevron, HeroEyebrow, Label, Note, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { getFranchiseMap, getSeason, getSeasonYears } from '@/archivo/lib/data';
import { fmt, fmtInt, fmtPct } from '@/archivo/lib/format';
import { cls } from '@/archivo/lib/tokens';
import type { LeaderCategory, RosterEntry, SeasonStanding } from '@/archivo/lib/types';
import EraNotes from '@/historia/components/EraNotes';
import SeasonSelector from '@/historia/components/SeasonSelector';
import { NO_SEASON_DATA } from '@/historia/lib/copy';
import { CURRENT_SEASON } from '@/historia/lib/data';

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

const LEADER_LABELS: Record<LeaderCategory, string> = { ppg: 'Puntos por juego', rpg: 'Rebotes por juego', apg: 'Asistencias por juego', spg: 'Robos por juego', bpg: 'Bloqueos por juego', fgPct: 'Tiros de campo', fg3Pct: 'Triples', ftPct: 'Tiros libres' };
const PCT: LeaderCategory[] = ['fgPct', 'fg3Pct', 'ftPct'];

/** Season page: everything the archive knows about one year, laid out so 1968 and 2026 both look complete. */
export default async function TemporadaPage({ params }: Params) {
  const year = Number((await params).year);
  const season = getSeason(year);
  if (!season) notFound();
  const years = getSeasonYears();
  const idx = years.indexOf(year);
  const prev = idx > 0 ? years[idx - 1] : null;
  const next = idx < years.length - 1 ? years[idx + 1] : null;
  const franchises = getFranchiseMap();
  const fOf = (slug: string | null) => (slug ? franchises.get(slug) ?? null : null);
  const { champion, mvp, results } = season;
  const realResults = results && results.source === 'bsn-graphql' ? results : null;
  const standings = realResults && !realResults.fpo.standings ? realResults.standings : [];
  const series = realResults && !realResults.fpo.series ? realResults.series : [];
  const leaders = season.leaders ? (Object.keys(LEADER_LABELS) as LeaderCategory[]).filter((c) => season.leaders![c].length) : [];
  const nothing = !champion && !mvp && !leaders.length && !season.rosters.length && !standings.length;
  const linkFor = (y: number) => (y === CURRENT_SEASON ? '/calendario' : `/temporadas/${y}`);

  const standingsCols: StatsColumn<SeasonStanding>[] = [
    {
      key: 'team',
      label: 'Equipo',
      sticky: true,
      render: (s) => (
        <span className="inline-flex items-center gap-[8px] font-medium">
          <span className={`w-[18px] text-right font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`}>{s.positionInGroup ?? s.position ?? ''}</span>
          <FranchiseLogo franchise={fOf(s.franchiseSlug)} fallbackName={s.name} size="chip" />
          {s.franchiseSlug && fOf(s.franchiseSlug)?.code ? (
            <Link href={`/equipos/${fOf(s.franchiseSlug)!.code}`} className="transition-colors duration-150 hover:text-[rgba(0,0,0,0.65)]">
              {s.name}
            </Link>
          ) : (
            <span>{s.name}</span>
          )}
        </span>
      ),
    },
    { key: 'w', label: 'G', title: 'Ganados', align: 'right', strong: true, sortValue: (s) => s.won, render: (s) => String(s.won) },
    { key: 'l', label: 'P', title: 'Perdidos', align: 'right', sortValue: (s) => s.lost, render: (s) => String(s.lost) },
    { key: 'pct', label: '%', align: 'right', sortValue: (s) => (s.won + s.lost ? s.won / (s.won + s.lost) : null), render: (s) => (s.won + s.lost ? (s.won / (s.won + s.lost)).toFixed(3).replace(/^0/, '') : '–') },
  ];
  const rosterCols: StatsColumn<RosterEntry>[] = [
    {
      key: 'name',
      label: 'Jugador',
      sticky: true,
      render: (r) => (
        <Link href={`/jugadores/${r.slug}`} className={`font-semibold ${cls.dataLink}`}>
          {r.name}
        </Link>
      ),
    },
    { key: 'g', label: 'J', title: 'Juegos', align: 'right', sortValue: (r) => r.regular?.g ?? null, render: (r) => fmtInt(r.regular?.g ?? null) },
    { key: 'ppg', label: 'PPJ', align: 'right', strong: true, sortValue: (r) => r.regular?.ppg ?? null, initialSort: 'desc', render: (r) => fmt(r.regular?.ppg) },
    { key: 'rpg', label: 'RPJ', align: 'right', sortValue: (r) => r.regular?.rpg ?? null, render: (r) => fmt(r.regular?.rpg) },
    { key: 'apg', label: 'APJ', align: 'right', sortValue: (r) => r.regular?.apg ?? null, render: (r) => fmt(r.regular?.apg) },
  ];
  const groups = [...new Set(standings.map((s) => s.group ?? ''))];

  return (
    <FullWidthLayout
      divider
      subheader={
        <div className="container pb-[28px] pt-[20px] lg:pb-[36px] lg:pt-[28px]">
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <div className={`flex items-center gap-[14px] font-barlow text-[13px] font-medium text-white/60 ${cls.tabular}`}>
              {prev ? (
                <Link href={linkFor(prev)} className={`inline-flex items-center gap-[4px] rounded-[4px] transition-colors duration-150 hover:text-white ${cls.focusOnDark}`}>
                  <Chevron size={12} className="rotate-180" /> {prev}
                </Link>
              ) : null}
              {next ? (
                <Link href={linkFor(next)} className={`inline-flex items-center gap-[4px] rounded-[4px] transition-colors duration-150 hover:text-white ${cls.focusOnDark}`}>
                  {next} <Chevron size={12} />
                </Link>
              ) : null}
            </div>
            <SeasonSelector years={years} current={CURRENT_SEASON} selected={year} currentHref="/calendario" onDark />
          </div>
          <HeroEyebrow className="mt-[18px]">Temporada</HeroEyebrow>
          <h1 className={`text-[64px] leading-[0.95] text-white lg:text-[88px] ${cls.tabular}`}>{year}</h1>
          {champion || mvp ? (
            <div className="mt-[20px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
              {champion ? (
                <div className="flex items-center gap-[14px]">
                  <FranchiseLogo franchise={fOf(champion.franchiseSlug)} fallbackName={champion.fullName} sizePx={64} />
                  <div className="min-w-0">
                    <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50">Campeón</p>
                    {champion.franchiseSlug ? (
                      <Link href={fOf(champion.franchiseSlug)?.code ? `/equipos/${fOf(champion.franchiseSlug)!.code}?tab=historia` : `/equipos/historicos/${champion.franchiseSlug}`} className={`block text-[24px] leading-[1.1] text-white rounded-[4px] ${cls.focusOnDark}`}>
                        {champion.fullName}
                      </Link>
                    ) : (
                      <p className="text-[24px] leading-[1.1] text-white">{champion.fullName}</p>
                    )}
                    <p className="mt-[3px] font-barlow text-[13px] text-white/65">
                      {champion.coach ? `Dirigente: ${champion.coach}` : ''}
                      {champion.series ? `${champion.coach ? ' · ' : ''}Final ${champion.series}` : ''}
                    </p>
                  </div>
                </div>
              ) : null}
              {mvp ? (
                <div className="flex items-center gap-[14px]">
                  <PlayerAvatar name={mvp.name} color={fOf(mvp.franchiseSlugs[0] ?? null)?.colors.primary} sizePx={64} onDark />
                  <div className="min-w-0">
                    <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50">MVP</p>
                    <Link href={mvp.slug ? `/jugadores/${mvp.slug}` : '#'} className={`block text-[24px] leading-[1.1] text-white rounded-[4px] ${cls.focusOnDark}`}>
                      {mvp.name}
                    </Link>
                    <p className="mt-[3px] font-barlow text-[13px] text-white/65">
                      {mvp.teamName}
                      {mvp.position ? ` · ${mvp.position}` : ''}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      }
    >
      <div className="bg-[#FDFDFD]">
        <div className="container pb-[48px] pt-[24px] lg:pb-[64px] lg:pt-[32px]">
          {nothing ? <Note>{NO_SEASON_DATA}</Note> : null}

          {leaders.length ? (
            <section className="mb-[36px] lg:mb-[44px]" id="lideres">
              <SectionTitle right={<span className={cls.meta}>Serie Regular, mínimo 10 juegos</span>}>Líderes de la temporada</SectionTitle>
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:grid-cols-4">
                {leaders.map((cat) => {
                  const list = season.leaders![cat].slice(0, 4);
                  const top = list[0];
                  const f = (v: number) => (PCT.includes(cat) ? fmtPct(v) : fmt(v));
                  return (
                    <LeaderCard
                      key={cat}
                      variant="leader"
                      label={LEADER_LABELS[cat]}
                      href={`/jugadores/${top.slug}`}
                      avatar={<PlayerAvatar name={top.name} color={fOf(top.franchiseSlug)?.colors.primary} sizePx={44} />}
                      value={f(top.value)}
                      name={top.name}
                      context={fOf(top.franchiseSlug)?.nickname ?? top.teamName}
                      runners={list.slice(1).map((l) => ({ key: l.playerId + l.teamName, href: `/jugadores/${l.slug}`, label: l.name, value: f(l.value) }))}
                    />
                  );
                })}
              </div>
              <EraNotes debutYears={[year]} className="mt-[12px]" />
            </section>
          ) : null}

          {standings.length ? (
            <section className="mb-[36px] lg:mb-[44px]" id="standings">
              <SectionTitle>Standings finales</SectionTitle>
              <div className={`grid grid-cols-1 gap-[16px] ${groups.length > 1 ? 'lg:grid-cols-2' : ''}`}>
                {groups.map((g) => (
                  <div key={g || 'all'}>
                    {g ? <Label className="mb-[8px]">Grupo {g}</Label> : null}
                    <StatsTable columns={standingsCols} rows={standings.filter((s) => (s.group ?? '') === g)} rowKey={(s) => s.code + s.name} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {series.length ? (
            <section className="mb-[36px] lg:mb-[44px]" id="playoffs">
              <SectionTitle>Playoffs</SectionTitle>
              <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px] lg:grid-cols-3">
                {series.map((s) => (
                  <PaperCard key={s.id} className="px-[16px] py-[14px]">
                    <Label>{s.name}</Label>
                    <ul className="mt-[10px] flex flex-col gap-[6px]">
                      {s.competitors.map((c) => {
                        const won = s.winnerSlug !== null && s.winnerSlug === c.franchiseSlug;
                        return (
                          <li key={c.code} className={`flex items-center justify-between gap-2 font-barlow text-[14px] ${won || s.winnerSlug === null ? 'font-semibold text-[#0F171F]' : 'font-medium text-[rgba(0,0,0,0.45)]'}`}>
                            <span className="inline-flex items-center gap-[8px]">
                              <FranchiseLogo franchise={fOf(c.franchiseSlug)} fallbackName={c.code} size="chip" />
                              <span>{c.seed ? `(${c.seed}) ` : ''}{fOf(c.franchiseSlug)?.nickname ?? c.code}</span>
                            </span>
                            <span className={cls.tabular}>{c.won}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </PaperCard>
                ))}
              </div>
            </section>
          ) : null}

          {season.rosters.length ? (
            <section id="rosters">
              <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{season.rosters.length} equipos</span>}>Rosters</SectionTitle>
              <div className="flex flex-col gap-[10px]">
                {season.rosters.map((r) => {
                  const f = fOf(r.franchiseSlug);
                  return (
                    <details key={r.franchiseSlug} className={`group ${cls.card}`}>
                      <summary className={`flex min-h-[56px] cursor-pointer list-none items-center gap-[12px] px-[16px] py-[10px] ${cls.focus} rounded-[12px] focus-visible:outline-offset-[-2px] [&::-webkit-details-marker]:hidden`}>
                        <FranchiseLogo franchise={f} fallbackName={r.teamName} sizePx={32} />
                        <span className="flex-1 font-barlow text-[15px] font-semibold text-[#0F171F]">{r.teamName}</span>
                        <span className={`${cls.meta} !text-[12px] ${cls.tabular}`}>{r.players.length} jugadores</span>
                        <Chevron direction="down" className="text-[rgba(0,0,0,0.45)] transition-transform duration-150 group-open:rotate-180" />
                      </summary>
                      <div className="px-[16px] pb-[16px]">
                        <StatsTable columns={rosterCols} rows={r.players} rowKey={(p) => p.playerId} maxHeight="60vh" />
                        {f ? (
                          <Link href={f.status === 'active' && f.code ? `/equipos/${f.code}?tab=historia` : `/equipos/historicos/${f.slug}`} className={`mt-[10px] inline-block ${cls.textLink}`}>
                            Historia de {f.fullName}
                          </Link>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
              <EraNotes debutYears={[year]} className="mt-[12px]" />
            </section>
          ) : null}
        </div>
      </div>
    </FullWidthLayout>
  );
}
