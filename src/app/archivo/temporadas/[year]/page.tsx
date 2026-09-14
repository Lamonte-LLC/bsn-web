import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FpoBadge from '@/archivo/components/FpoBadge';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import LeaderCard from '@/archivo/components/LeaderCard';
import { Chevron, EmptyState, HeroEyebrow, HeroTitle, Label, PaperCard, SectionTitle } from '@/archivo/components/ui';
import { cls } from '@/archivo/lib/tokens';
import { getFranchiseMap, getSeason, getSeasonYears } from '@/archivo/lib/data';
import { fmt, fmtInt, fmtPct, formatGameDate } from '@/archivo/lib/format';
import type { LeaderCategory, RosterEntry, SeasonGame, SeasonStanding } from '@/archivo/lib/types';

export const dynamic = 'force-static';

type Params = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return getSeasonYears().map((y) => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year } = await params;
  const s = getSeason(Number(year));
  if (!s) return { title: 'Temporada · Archivo BSN' };
  const bits = [s.champion ? `Campeón: ${s.champion.fullName}` : null, s.mvp ? `MVP: ${s.mvp.name}` : null].filter(Boolean).join('. ');
  return { title: `Temporada ${year} · Archivo BSN`, description: bits || `La temporada ${year} del BSN.` };
}

const LEADER_LABELS: Record<LeaderCategory, string> = { ppg: 'Puntos', rpg: 'Rebotes', apg: 'Asistencias', spg: 'Robos', bpg: 'Bloqueos', fgPct: 'Tiros de campo', fg3Pct: 'Triples', ftPct: 'Tiros libres' };
const PCT: LeaderCategory[] = ['fgPct', 'fg3Pct', 'ftPct'];

export default async function SeasonPage({ params }: Params) {
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

  const standingsCols: StatsColumn<SeasonStanding>[] = [
    {
      key: 'team',
      label: 'Equipo',
      sticky: true,
      render: (s) => (
        <span className="inline-flex items-center gap-[8px] font-medium">
          <span className={`w-[18px] text-right font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.45)] ${cls.tabular}`}>{s.positionInGroup ?? s.position ?? ''}</span>
          <FranchiseLogo franchise={fOf(s.franchiseSlug)} fallbackName={s.name} size="chip" />
          {s.franchiseSlug ? (
            <Link href={`/archivo/franquicias/${s.franchiseSlug}`} className="transition-colors duration-150 hover:text-[rgba(0,0,0,0.65)]">
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
    { key: 'pts', label: 'PPJ', align: 'right', sortValue: (s) => s.pointsAverage, render: (s) => fmt(s.pointsAverage) },
  ];

  const gameCols: StatsColumn<SeasonGame>[] = [
    { key: 'date', label: 'Fecha', sticky: true, render: (g) => <span className="font-medium text-[rgba(0,0,0,0.55)]">{formatGameDate(g.date)}</span> },
    {
      key: 'match',
      label: 'Juego',
      render: (g) => {
        const homeWon = (g.home.score ?? 0) > (g.visitor.score ?? 0);
        return (
          <span className="inline-flex items-center gap-[6px] font-medium">
            <FranchiseLogo franchise={fOf(g.visitor.franchiseSlug)} fallbackName={g.visitor.name} size="chip" />
            <span className={homeWon ? 'text-[rgba(0,0,0,0.45)]' : 'font-semibold'}>{g.visitor.code}</span>
            <span className="text-[11px] text-[rgba(0,0,0,0.4)]">en</span>
            <FranchiseLogo franchise={fOf(g.home.franchiseSlug)} fallbackName={g.home.name} size="chip" />
            <span className={homeWon ? 'font-semibold' : 'text-[rgba(0,0,0,0.45)]'}>{g.home.code}</span>
          </span>
        );
      },
    },
    { key: 'score', label: 'Marcador', align: 'right', strong: true, render: (g) => `${g.visitor.score ?? '–'} - ${g.home.score ?? '–'}` },
    { key: 'phase', label: 'Fase', render: (g) => <span className="text-[12.5px] text-[rgba(0,0,0,0.55)]">{g.phase === 'playoffs' ? 'Playoffs' : g.phase === 'regular' ? 'Serie Regular' : 'Evento'}</span> },
  ];

  const rosterCols: StatsColumn<RosterEntry>[] = [
    {
      key: 'name',
      label: 'Jugador',
      sticky: true,
      render: (r) => (
        <Link href={`/archivo/jugadores/${r.slug}`} className={`font-semibold ${cls.dataLink}`}>
          {r.name}
        </Link>
      ),
    },
    { key: 'g', label: 'J', align: 'right', sortValue: (r) => r.regular?.g ?? null, render: (r) => fmtInt(r.regular?.g ?? null) },
    { key: 'ppg', label: 'PPJ', align: 'right', strong: true, sortValue: (r) => r.regular?.ppg ?? null, initialSort: 'desc', render: (r) => fmt(r.regular?.ppg) },
    { key: 'rpg', label: 'RPJ', align: 'right', sortValue: (r) => r.regular?.rpg ?? null, render: (r) => fmt(r.regular?.rpg) },
    { key: 'apg', label: 'APJ', align: 'right', sortValue: (r) => r.regular?.apg ?? null, render: (r) => fmt(r.regular?.apg) },
    { key: 'pg', label: 'J post.', align: 'right', sortValue: (r) => r.playoffs?.g ?? null, render: (r) => fmtInt(r.playoffs?.g ?? null) },
    { key: 'pppg', label: 'PPJ post.', align: 'right', sortValue: (r) => r.playoffs?.ppg ?? null, render: (r) => fmt(r.playoffs?.ppg) },
  ];

  const groups = results ? [...new Set(results.standings.map((s) => s.group ?? ''))] : [];
  const regularGames = results?.games.filter((g) => g.phase === 'regular') ?? [];
  const playoffGames = results?.games.filter((g) => g.phase === 'playoffs') ?? [];

  return (
    <ArchivoShell
      hero={
        <div>
          <div className={`mb-[14px] flex items-center justify-between font-barlow text-[13px] font-medium text-white/60 ${cls.tabular}`}>
            {prev ? (
              <Link href={`/archivo/temporadas/${prev}`} className={`rounded-[4px] transition-colors duration-150 hover:text-white ${cls.focusOnDark}`}>
                Temporada {prev}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/archivo/temporadas/${next}`} className={`rounded-[4px] transition-colors duration-150 hover:text-white ${cls.focusOnDark}`}>
                Temporada {next}
              </Link>
            ) : (
              <span />
            )}
          </div>
          <HeroEyebrow>Temporada</HeroEyebrow>
          <HeroTitle className={`!text-[64px] lg:!text-[88px] ${cls.tabular}`}>{year}</HeroTitle>
          <div className="mt-[20px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
            {champion ? (
              <div className="flex items-center gap-[14px]">
                <FranchiseLogo franchise={fOf(champion.franchiseSlug)} fallbackName={champion.fullName} sizePx={64} />
                <div className="min-w-0">
                  <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50">Campeón</p>
                  {champion.franchiseSlug ? (
                    <Link href={`/archivo/franquicias/${champion.franchiseSlug}`} className={`block text-[24px] leading-[1.1] text-white rounded-[4px] ${cls.focusOnDark}`}>
                      {champion.fullName}
                    </Link>
                  ) : (
                    <p className="text-[24px] leading-[1.1] text-white">{champion.fullName}</p>
                  )}
                  <p className="mt-[3px] font-barlow text-[13px] text-white/65">
                    {champion.coach ? `Dirigente: ${champion.coach}` : ''}
                    {champion.series ? ` · Final ${champion.series}` : ''}
                  </p>
                </div>
              </div>
            ) : null}
            {mvp ? (
              <div className="flex items-center gap-[14px]">
                <PlayerAvatar name={mvp.name} color={fOf(mvp.franchiseSlugs[0] ?? null)?.colors.primary} sizePx={64} onDark />
                <div className="min-w-0">
                  <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1.6px] text-white/50">MVP{mvp.mvpNumber ? ` · #${mvp.mvpNumber}` : ''}</p>
                  <Link href={mvp.slug ? `/archivo/jugadores/${mvp.slug}` : '/archivo/mvps'} className={`block text-[24px] leading-[1.1] text-white rounded-[4px] ${cls.focusOnDark}`}>
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
        </div>
      }
    >
      {results ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<FpoBadge show={results.fpo.standings} label="Standings" />}>Standings</SectionTitle>
          <div className={`grid grid-cols-1 gap-[16px] ${groups.length > 1 ? 'lg:grid-cols-2' : ''}`}>
            {groups.map((g) => (
              <div key={g || 'all'}>
                {g ? <Label className="mb-[8px]">Grupo {g}</Label> : null}
                <StatsTable columns={standingsCols} rows={results.standings.filter((s) => (s.group ?? '') === g)} rowKey={(s) => s.code + s.name} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {results?.series.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<FpoBadge show={results.fpo.series} label="Playoffs" />}>Playoffs</SectionTitle>
          <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px] lg:grid-cols-3">
            {results.series.map((s) => (
              <PaperCard key={s.id} className="px-[16px] py-[14px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <Label>{s.name}</Label>
                  <FpoBadge show={results.fpo.series} />
                </div>
                <ul className="mt-[10px] flex flex-col gap-[6px]">
                  {s.competitors.map((c) => {
                    const won = s.winnerSlug === c.franchiseSlug && s.winnerSlug !== null;
                    const decided = s.winnerSlug !== null;
                    return (
                      <li key={c.code} className={`flex items-center justify-between gap-2 font-barlow text-[14px] ${won || !decided ? 'font-semibold text-[#0F171F]' : 'font-medium text-[rgba(0,0,0,0.45)]'}`}>
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

      {results?.games.length ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<FpoBadge show={results.fpo.games} label="Juegos" />}>Resultados</SectionTitle>
          {playoffGames.length ? (
            <div className="mb-[16px]">
              <Label className="mb-[8px]">Playoffs · {playoffGames.length} juegos</Label>
              <StatsTable columns={gameCols} rows={playoffGames} rowKey={(g) => g.id} />
            </div>
          ) : null}
          {regularGames.length ? (
            <details className="group">
              <summary className={`inline-block cursor-pointer list-none rounded-[4px] ${cls.textLink} ${cls.focus} [&::-webkit-details-marker]:hidden`}>
                <span className="group-open:hidden">Ver los {regularGames.length} juegos de Serie Regular</span>
                <span className="hidden group-open:inline">Ocultar Serie Regular</span>
              </summary>
              <div className="mt-[12px]">
                <StatsTable columns={gameCols} rows={regularGames} rowKey={(g) => g.id} maxHeight="70vh" />
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      {season.leaders ? (
        <section className="mb-[36px] lg:mb-[44px]">
          <SectionTitle right={<span className={cls.meta}>Serie Regular, mínimo 10 juegos</span>}>Líderes</SectionTitle>
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:grid-cols-4">
            {(Object.keys(LEADER_LABELS) as LeaderCategory[]).map((cat) => {
              const list = season.leaders![cat].slice(0, 5);
              if (!list.length) return null;
              const top = list[0];
              const f = (v: number) => (PCT.includes(cat) ? fmtPct(v) : fmt(v));
              return (
                <LeaderCard
                  key={cat}
                  variant="leader"
                  label={LEADER_LABELS[cat]}
                  href={`/archivo/jugadores/${top.slug}`}
                  avatar={<PlayerAvatar name={top.name} color={fOf(top.franchiseSlug)?.colors.primary} sizePx={44} />}
                  value={f(top.value)}
                  name={top.name}
                  context={fOf(top.franchiseSlug)?.nickname ?? top.teamName}
                  runners={list.slice(1, 4).map((l) => ({ key: l.playerId + l.teamName, href: `/archivo/jugadores/${l.slug}`, label: l.name, value: f(l.value) }))}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {season.rosters.length ? (
        <section>
          <SectionTitle right={<span className={`${cls.meta} ${cls.tabular}`}>{season.rosters.length} equipos</span>}>Rosters</SectionTitle>
          <div className="flex flex-col gap-[10px]">
            {season.rosters.map((r) => (
              <details key={r.franchiseSlug} className={`group ${cls.card}`}>
                <summary className={`flex min-h-[56px] cursor-pointer list-none items-center gap-[12px] px-[16px] py-[10px] ${cls.focus} rounded-[12px] focus-visible:outline-offset-[-2px] [&::-webkit-details-marker]:hidden`}>
                  <FranchiseLogo franchise={fOf(r.franchiseSlug)} fallbackName={r.teamName} sizePx={32} />
                  <span className="flex-1 font-barlow text-[15px] font-semibold text-[#0F171F]">{r.teamName}</span>
                  <span className={`${cls.meta} !text-[12px] ${cls.tabular}`}>{r.players.length} jugadores</span>
                  <Chevron direction="down" className="text-[rgba(0,0,0,0.45)] transition-transform duration-150 group-open:rotate-180" />
                </summary>
                <div className="px-[16px] pb-[16px]">
                  <StatsTable columns={rosterCols} rows={r.players} rowKey={(p) => p.playerId} maxHeight="60vh" />
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : !results && !champion ? (
        <EmptyState href="/archivo/temporadas" linkLabel="Ver todas las temporadas">No hay datos disponibles para esta temporada.</EmptyState>
      ) : null}
    </ArchivoShell>
  );
}
