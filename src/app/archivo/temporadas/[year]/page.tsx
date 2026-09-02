import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArchivoShell from '@/archivo/components/ArchivoShell';
import FpoBadge from '@/archivo/components/FpoBadge';
import FranchiseLogo from '@/archivo/components/FranchiseLogo';
import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import StatsTable, { type StatsColumn } from '@/archivo/components/StatsTable';
import { Eyebrow, HeroEyebrow, HeroTitle, PaperCard, SectionTitle } from '@/archivo/components/ui';
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
        <span className="inline-flex items-center gap-[8px]">
          <span className="w-[18px] text-right font-barlow text-[12px] text-[rgba(0,0,0,0.5)]">{s.positionInGroup ?? s.position ?? ''}</span>
          <FranchiseLogo franchise={fOf(s.franchiseSlug)} fallbackName={s.name} size="chip" />
          {s.franchiseSlug ? (
            <Link href={`/archivo/franquicias/${s.franchiseSlug}`} className="text-[15px] hover:underline">
              {s.name}
            </Link>
          ) : (
            <span className="text-[15px]">{s.name}</span>
          )}
        </span>
      ),
    },
    { key: 'w', label: 'G', align: 'right', sortValue: (s) => s.won, render: (s) => s.won },
    { key: 'l', label: 'P', align: 'right', sortValue: (s) => s.lost, render: (s) => s.lost },
    { key: 'pct', label: '%', align: 'right', sortValue: (s) => (s.won + s.lost ? s.won / (s.won + s.lost) : null), render: (s) => (s.won + s.lost ? (s.won / (s.won + s.lost)).toFixed(3).replace(/^0/, '') : '–') },
    { key: 'pts', label: 'PPJ', align: 'right', sortValue: (s) => s.pointsAverage, render: (s) => fmt(s.pointsAverage) },
  ];

  const gameCols: StatsColumn<SeasonGame>[] = [
    { key: 'date', label: 'Fecha', sticky: true, render: (g) => <span className="font-barlow">{formatGameDate(g.date)}</span> },
    {
      key: 'match',
      label: 'Juego',
      render: (g) => {
        const homeWon = (g.home.score ?? 0) > (g.visitor.score ?? 0);
        return (
          <span className="inline-flex items-center gap-[6px]">
            <FranchiseLogo franchise={fOf(g.visitor.franchiseSlug)} fallbackName={g.visitor.name} size="chip" />
            <span className={homeWon ? 'text-[rgba(15,23,31,0.5)]' : ''}>{g.visitor.code}</span>
            <span className="font-barlow text-[11px] text-[rgba(15,23,31,0.4)]">en</span>
            <FranchiseLogo franchise={fOf(g.home.franchiseSlug)} fallbackName={g.home.name} size="chip" />
            <span className={homeWon ? '' : 'text-[rgba(15,23,31,0.5)]'}>{g.home.code}</span>
          </span>
        );
      },
    },
    { key: 'score', label: 'Marcador', align: 'right', render: (g) => `${g.visitor.score ?? '–'} - ${g.home.score ?? '–'}` },
    { key: 'phase', label: 'Fase', render: (g) => <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.6)]">{g.phase === 'playoffs' ? 'Playoffs' : g.phase === 'regular' ? 'Serie Regular' : 'Evento'}</span> },
  ];

  const rosterCols: StatsColumn<RosterEntry>[] = [
    {
      key: 'name',
      label: 'Jugador',
      sticky: true,
      render: (r) => (
        <Link href={`/archivo/jugadores/${r.slug}`} className="text-[15px] hover:underline">
          {r.name}
        </Link>
      ),
    },
    { key: 'g', label: 'J', align: 'right', sortValue: (r) => r.regular?.g ?? null, render: (r) => fmtInt(r.regular?.g ?? null) },
    { key: 'ppg', label: 'PPJ', align: 'right', sortValue: (r) => r.regular?.ppg ?? null, render: (r) => fmt(r.regular?.ppg) },
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
          <div className="mb-[14px] flex items-center justify-between font-barlow text-[13px] font-medium text-white/60">
            {prev ? <Link href={`/archivo/temporadas/${prev}`} className="hover:text-white">← {prev}</Link> : <span />}
            {next ? <Link href={`/archivo/temporadas/${next}`} className="hover:text-white">{next} →</Link> : <span />}
          </div>
          <HeroEyebrow>Temporada</HeroEyebrow>
          <HeroTitle className="!text-[64px] lg:!text-[88px]">{year}</HeroTitle>
          <div className="mt-[20px] grid grid-cols-1 gap-4 md:grid-cols-2">
            {champion ? (
              <div className="flex items-center gap-[14px]">
                <FranchiseLogo franchise={fOf(champion.franchiseSlug)} fallbackName={champion.fullName} sizePx={64} />
                <div className="min-w-0">
                  <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-white/60">Campeón</p>
                  <Link href={champion.franchiseSlug ? `/archivo/franquicias/${champion.franchiseSlug}` : '#'} className="block text-[24px] leading-[1.1] text-white">
                    {champion.fullName}
                  </Link>
                  <p className="font-barlow text-[13px] text-white/70">
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
                  <p className="font-barlow text-[11px] font-semibold uppercase tracking-[1px] text-white/60">MVP{mvp.mvpNumber ? ` · #${mvp.mvpNumber}` : ''}</p>
                  <Link href={mvp.slug ? `/archivo/jugadores/${mvp.slug}` : '/archivo/mvps'} className="block text-[24px] leading-[1.1] text-white">
                    {mvp.name}
                  </Link>
                  <p className="font-barlow text-[13px] text-white/70">
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
        <section className="mb-10">
          <SectionTitle right={<FpoBadge show={results.fpo.standings} label="Standings" />}>Standings</SectionTitle>
          <div className={`grid grid-cols-1 gap-4 ${groups.length > 1 ? 'lg:grid-cols-2' : ''}`}>
            {groups.map((g) => (
              <div key={g || 'all'}>
                {g ? <Eyebrow className="mb-2">Grupo {g}</Eyebrow> : null}
                <StatsTable columns={standingsCols} rows={results.standings.filter((s) => (s.group ?? '') === g)} rowKey={(s) => s.code + s.name} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {results?.series.length ? (
        <section className="mb-10">
          <SectionTitle right={<FpoBadge show={results.fpo.series} label="Playoffs" />}>Playoffs</SectionTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.series.map((s) => (
              <PaperCard key={s.id} className="p-[14px]">
                <Eyebrow>{s.name}</Eyebrow>
                <ul className="mt-[8px] flex flex-col gap-[6px]">
                  {s.competitors.map((c) => {
                    const won = s.winnerSlug === c.franchiseSlug && s.winnerSlug !== null;
                    return (
                      <li key={c.code} className={`flex items-center justify-between gap-2 ${won ? '' : 'text-[rgba(15,23,31,0.5)]'}`}>
                        <span className="inline-flex items-center gap-[8px]">
                          <FranchiseLogo franchise={fOf(c.franchiseSlug)} fallbackName={c.code} size="chip" />
                          <span className="text-[16px]">{fOf(c.franchiseSlug)?.nickname ?? c.code}</span>
                          {c.seed ? <span className="font-barlow text-[11px] text-[rgba(15,23,31,0.45)]">#{c.seed}</span> : null}
                        </span>
                        <span className="text-[20px] [font-variant-numeric:tabular-nums]">{c.won}</span>
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
        <section className="mb-10">
          <SectionTitle right={<FpoBadge show={results.fpo.games} label="Juegos" />}>Resultados</SectionTitle>
          {playoffGames.length ? (
            <div className="mb-4">
              <Eyebrow className="mb-2">Playoffs · {playoffGames.length} juegos</Eyebrow>
              <StatsTable columns={gameCols} rows={playoffGames} rowKey={(g) => g.id} />
            </div>
          ) : null}
          {regularGames.length ? (
            <details className="group">
              <summary className="cursor-pointer list-none font-barlow text-[13px] font-medium text-[#1772D9] hover:text-[#1257A8]">
                <span className="group-open:hidden">Ver los {regularGames.length} juegos de Serie Regular</span>
                <span className="hidden group-open:inline">Ocultar Serie Regular</span>
              </summary>
              <div className="mt-3">
                <StatsTable columns={gameCols} rows={regularGames} rowKey={(g) => g.id} maxHeight="70vh" />
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      {season.leaders ? (
        <section className="mb-10">
          <SectionTitle right="Serie Regular, mínimo 10 juegos">Líderes</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(LEADER_LABELS) as LeaderCategory[]).map((cat) => {
              const list = season.leaders![cat].slice(0, 5);
              if (!list.length) return null;
              const top = list[0];
              return (
                <PaperCard key={cat} className="p-[14px]">
                  <Eyebrow>{LEADER_LABELS[cat]}</Eyebrow>
                  <Link href={`/archivo/jugadores/${top.slug}`} className="mt-[8px] flex items-center gap-[10px]">
                    <PlayerAvatar name={top.name} color={fOf(top.franchiseSlug)?.colors.primary} size="avatar" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] text-[rgba(15,23,31,0.9)]">{top.name}</span>
                      <span className="block font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{fOf(top.franchiseSlug)?.nickname ?? top.teamName}</span>
                    </span>
                    <span className="text-[26px] [font-variant-numeric:tabular-nums]">{PCT.includes(cat) ? fmtPct(top.value) : fmt(top.value)}</span>
                  </Link>
                  <ol className="mt-[10px] divide-y divide-[rgba(0,0,0,0.05)]">
                    {list.slice(1).map((l, i) => (
                      <li key={l.playerId + l.teamName} className="flex items-center justify-between gap-2 py-[5px]">
                        <Link href={`/archivo/jugadores/${l.slug}`} className="flex min-w-0 items-center gap-[8px]">
                          <span className="w-[14px] font-barlow-condensed text-[13px] text-[rgba(0,0,0,0.6)]">{i + 2}</span>
                          <span className="truncate text-[15px] text-[rgba(15,23,31,0.9)]">{l.name}</span>
                        </Link>
                        <span className="text-[16px] [font-variant-numeric:tabular-nums]">{PCT.includes(cat) ? fmtPct(l.value) : fmt(l.value)}</span>
                      </li>
                    ))}
                  </ol>
                </PaperCard>
              );
            })}
          </div>
        </section>
      ) : null}

      {season.rosters.length ? (
        <section>
          <SectionTitle right={`${season.rosters.length} equipos`}>Rosters</SectionTitle>
          <div className="flex flex-col gap-2">
            {season.rosters.map((r) => (
              <details key={r.franchiseSlug} className="group rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
                <summary className="flex cursor-pointer list-none items-center gap-[10px] px-[14px] py-[12px]">
                  <FranchiseLogo franchise={fOf(r.franchiseSlug)} fallbackName={r.teamName} sizePx={32} />
                  <span className="flex-1 text-[18px] text-[rgba(15,23,31,0.9)]">{r.teamName}</span>
                  <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.5)]">{r.players.length} jugadores</span>
                  <span aria-hidden className="font-barlow text-[12px] text-[rgba(15,23,31,0.5)] transition-transform duration-150 group-open:rotate-180">▾</span>
                </summary>
                <div className="px-[14px] pb-[14px]">
                  <StatsTable columns={rosterCols} rows={r.players} rowKey={(p) => p.playerId} maxHeight="60vh" />
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : !results && !champion ? (
        <p className="font-barlow text-[13px] text-[rgba(0,0,0,0.6)]">No hay datos disponibles para esta temporada.</p>
      ) : null}
    </ArchivoShell>
  );
}
