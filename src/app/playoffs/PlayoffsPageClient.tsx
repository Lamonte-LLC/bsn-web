'use client';

import Link from 'next/link';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { SERIES_DATA, TEAM_COLOR, type Series } from './data';

// ─── Líderes data ─────────────────────────────────────────────────────────────
const LEADER_DATA = {
  PTS: {
    label: 'Puntos totales',
    leader: { name: 'Tremont Waters', team: 'Vaqueros de Bayamón', code: 'BAY', value: 217 },
    rest: [
      { rank: 2, name: 'Ismael Romero', team: 'Cangrejeros de Santurce', code: 'SCE', value: 196 },
      { rank: 3, name: 'José Berríos',  team: 'Criollos de Caguas',     code: 'CAG', value: 188 },
      { rank: 4, name: 'Manuel Suárez', team: 'Atléticos de San Germán', code: 'SGE', value: 184 },
      { rank: 5, name: 'Renaldo Balkman', team: 'Vaqueros de Bayamón', code: 'BAY', value: 171 },
    ],
  },
  REB: {
    label: 'Rebotes por juego',
    leader: { name: 'Devin Robinson', team: 'Gigantes de Carolina', code: 'CAR', value: 13.4 },
    rest: [
      { rank: 2, name: 'Renaldo Balkman', team: 'Vaqueros de Bayamón', code: 'BAY', value: 11.8 },
      { rank: 3, name: 'Manuel Suárez',   team: 'Atléticos de San Germán', code: 'SGE', value: 10.9 },
      { rank: 4, name: 'Alex Abreu',      team: 'Osos de Manatí',     code: 'MAN', value: 10.2 },
      { rank: 5, name: 'Walter Hodge Jr.', team: 'Leones de Ponce',   code: 'PON', value: 9.6 },
    ],
  },
  AST: {
    label: 'Asistencias por juego',
    leader: { name: 'Tremont Waters', team: 'Vaqueros de Bayamón', code: 'BAY', value: 9.7 },
    rest: [
      { rank: 2, name: 'Walter Hodge',    team: 'Capitanes de Arecibo',     code: 'ARE', value: 8.3 },
      { rank: 3, name: 'Gary Browne',     team: 'Criollos de Caguas',       code: 'CAG', value: 7.2 },
      { rank: 4, name: 'Ángel Rodríguez', team: 'Atléticos de San Germán',  code: 'SGE', value: 6.8 },
      { rank: 5, name: 'Carlos Arroyo II', team: 'Leones de Ponce',         code: 'PON', value: 6.4 },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function seriesLeaderText(s: Series): { text: string; tone: 'final' | 'progress' | 'tied' | 'upcoming' } {
  if (s.status === 'UPCOMING') return { text: 'Por jugar', tone: 'upcoming' };
  const w1 = s.team1.wins;
  const w2 = s.team2.wins;
  if (s.status === 'COMPLETED') {
    const winner = w1 > w2 ? s.team1 : s.team2;
    const loserWins = Math.min(w1, w2);
    return { text: `${winner.name} gana ${winner.wins}-${loserWins}`, tone: 'final' };
  }
  if (w1 === w2) return { text: `Serie empatada ${w1}-${w2}`, tone: 'tied' };
  const leader = w1 > w2 ? s.team1 : s.team2;
  const trailer = w1 > w2 ? s.team2 : s.team1;
  return { text: `${leader.name} lidera ${leader.wins}-${trailer.wins}`, tone: 'progress' };
}

// ─── Estado de las series — card with concentric logos + J# game pips ──────────
function SeriesCard({ series, fullWidth = false }: { series: Series; fullWidth?: boolean }) {
  const status = seriesLeaderText(series);
  const isFinal = series.round === 'FINAL';
  const isFinalPending = isFinal && series.status === 'UPCOMING';
  const isCompleted = series.status === 'COMPLETED';
  // Only show empty future J# slots while series is still in progress.
  const totalSlots = isCompleted ? series.games.length : 7;

  return (
    <div
      className={`border border-[rgba(14,20,32,0.06)] rounded-[16px] shadow-[0px_2px_10px_rgba(14,20,32,0.04)] overflow-hidden ${
        isCompleted ? 'bg-[#fafbfc]' : 'bg-white'
      } ${fullWidth ? 'text-center' : ''}`}
    >
      <div className={`px-5 pt-4 pb-4 lg:px-6 lg:pt-5 lg:pb-5 ${fullWidth ? 'lg:px-10 lg:pt-9 lg:pb-8' : ''}`}>
        {/* Row 1: conference eyebrow on left, status on right — gives team
         * names the entire next row to breathe (no truncation). */}
        {!fullWidth && !isFinalPending && (
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-barlow font-semibold text-[10px] text-[rgba(15,23,31,0.5)] uppercase tracking-[0.10em] truncate">
              {series.conferenceLabel}
            </p>
            <p className="font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.7)] shrink-0">
              <span className="text-[rgba(15,23,31,0.4)] uppercase tracking-[0.08em] mr-1.5">
                {status.tone === 'final' ? 'Resultado' : 'Estado'}
              </span>
              <span className="text-[#0F171F] font-semibold">{status.text}</span>
            </p>
          </div>
        )}

        {/* Row 2: logos on left, team names on right (full width, no truncation) */}
        {!fullWidth && (
          <div className="flex items-center gap-3">
            {!isFinalPending && (
              <div className="relative shrink-0" style={{ width: 70, height: 40 }}>
                <div
                  className="absolute left-0 top-0 flex items-center justify-center bg-white rounded-full"
                  style={{
                    width: 40, height: 40,
                    border: '1.5px solid rgba(15,23,31,0.15)',
                  }}
                >
                  <TeamLogoAvatar teamCode={series.team1.code} size={28} />
                </div>
                <div
                  className="absolute top-0 flex items-center justify-center bg-white rounded-full"
                  style={{
                    left: 30,
                    width: 40, height: 40,
                    border: '1.5px solid rgba(15,23,31,0.15)',
                  }}
                >
                  <TeamLogoAvatar teamCode={series.team2.code} size={28} />
                </div>
              </div>
            )}

            <p className="font-special-gothic-condensed-one text-[20px] sm:text-[22px] text-[#0F171F] leading-tight tracking-[0.02em] flex-1 min-w-0">
              {series.team1.name}{' '}
              <span className="text-[rgba(15,23,31,0.4)] text-[15px] sm:text-[16px]">vs</span>{' '}
              {series.team2.name}
            </p>
          </div>
        )}

        {/* Final BSN — fully centered layout */}
        {fullWidth && !isFinalPending && (
          <>
            <p className="font-barlow font-semibold text-[10px] text-[rgba(15,23,31,0.5)] uppercase tracking-[0.10em] text-center mb-3">
              {series.conferenceLabel}
            </p>
            <div className="flex justify-center mb-3">
              <div className="relative" style={{ width: 96, height: 52 }}>
                <div
                  className="absolute left-0 top-0 flex items-center justify-center bg-white rounded-full"
                  style={{ width: 52, height: 52, border: '1.5px solid rgba(15,23,31,0.15)' }}
                >
                  <TeamLogoAvatar teamCode={series.team1.code} size={36} />
                </div>
                <div
                  className="absolute top-0 flex items-center justify-center bg-white rounded-full"
                  style={{ left: 44, width: 52, height: 52, border: '1.5px solid rgba(15,23,31,0.15)' }}
                >
                  <TeamLogoAvatar teamCode={series.team2.code} size={36} />
                </div>
              </div>
            </div>
            <p className="font-special-gothic-condensed-one text-[26px] lg:text-[34px] text-[#0F171F] leading-tight tracking-[0.02em] text-center">
              {series.team1.name}{' '}
              <span className="text-[rgba(15,23,31,0.4)] text-[18px] lg:text-[24px]">vs</span>{' '}
              {series.team2.name}
            </p>
            <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.7)] text-center mt-3">
              <span className="text-[rgba(15,23,31,0.4)] uppercase tracking-[0.08em] mr-1.5">
                {status.tone === 'final' ? 'Resultado' : 'Estado'}
              </span>
              <span className="text-[#0F171F] font-semibold">{status.text}</span>
            </p>
          </>
        )}

        {/* Final BSN pending state — early return path */}
        {isFinalPending && (
          <p className={`font-barlow text-[13px] text-[rgba(15,23,31,0.55)] ${fullWidth ? 'mt-2 text-center' : 'mt-3'}`}>
            {series.nextGame ? `Comienza ${series.nextGame.date} · ${series.nextGame.venue}` : 'Por definir'}
          </p>
        )}

        {/* Game pips — bigger, divided from main content */}
        {!isFinalPending && series.games.length > 0 && (
          <div className={`mt-4 lg:mt-5 pt-3 border-t border-[rgba(15,23,31,0.07)] ${fullWidth ? 'flex flex-col items-center' : ''}`}>
            <p className="font-barlow font-semibold text-[9px] text-[rgba(15,23,31,0.45)] uppercase tracking-[0.12em] mb-[8px]">
              Resumen de los juegos
            </p>
            <div className={`flex flex-wrap items-center gap-[5px] ${fullWidth ? 'justify-center' : ''}`}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const g = series.games[i];
                if (!g) {
                  return (
                    <span
                      key={i}
                      className="inline-flex h-[26px] min-w-[40px] px-[7px] items-center justify-center rounded-full border border-dashed border-[rgba(15,23,31,0.12)] font-barlow font-semibold text-[10px] text-[rgba(15,23,31,0.3)]"
                    >
                      J{i + 1}
                    </span>
                  );
                }
                const winnerCode =
                  g.homeScore != null && g.visitorScore != null
                    ? g.homeScore > g.visitorScore ? g.homeCode : g.visitorCode
                    : null;
                const winnerColor = winnerCode ? TEAM_COLOR[winnerCode] || '#0F171F' : '#cccccc';
                const inner = (
                  <span
                    className="inline-flex h-[26px] items-center gap-[5px] pl-[3px] pr-[9px] rounded-full bg-white border border-[rgba(15,23,31,0.12)] font-barlow font-semibold text-[11px] text-[#0F171F] tabular-nums hover:border-[#0F171F]/55 transition-colors"
                  >
                    <span
                      className="inline-flex w-[20px] h-[20px] items-center justify-center rounded-full text-white font-barlow font-bold text-[9px]"
                      style={{ backgroundColor: winnerColor }}
                    >
                      J{g.gameNumber}
                    </span>
                    {g.homeScore}-{g.visitorScore}
                  </span>
                );
                return g.matchId ? (
                  <Link key={i} href={`/partidos/${g.matchId}`} className="inline-flex">
                    {inner}
                  </Link>
                ) : (
                  <span key={i} className="inline-flex">{inner}</span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat widget (Líderes section) ────────────────────────────────────────────
function StatLeaderCard({
  category,
  data,
}: {
  category: 'PTS' | 'REB' | 'AST';
  data: typeof LEADER_DATA.PTS;
}) {
  const fmt = (v: number) => (category === 'PTS' ? String(v) : v.toFixed(1));
  return (
    <div className="bg-white border border-[rgba(14,20,32,0.08)] rounded-[14px] shadow-[0_1px_2px_rgba(14,20,32,0.04),0_8px_22px_rgba(14,20,32,0.05)] overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.55)] mb-3">
          {data.label}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-special-gothic-condensed-one text-[20px] text-[#0F171F] leading-none">
              <span className="text-[rgba(15,23,31,0.45)] mr-2">1.</span>
              {data.leader.name}
            </p>
            <div className="flex items-center gap-[6px] mt-2">
              <TeamLogoAvatar teamCode={data.leader.code} size={16} />
              <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.6)]">
                {data.leader.team}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center"
              style={{ width: 48, height: 48, outline: `2px solid ${TEAM_COLOR[data.leader.code] || '#0F171F'}` }}
            >
              <TeamLogoAvatar teamCode={data.leader.code} size={32} />
            </div>
            <span
              className="font-special-gothic-condensed-one text-white text-[20px] px-3 py-1 rounded-[8px] tabular-nums"
              style={{ backgroundColor: '#E51F1F' }}
            >
              {fmt(data.leader.value)}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(15,23,31,0.06)]">
        {data.rest.map((row, i) => (
          <div
            key={row.rank}
            className={`flex items-center gap-3 px-5 py-[10px] ${i !== data.rest.length - 1 ? 'border-b border-[rgba(15,23,31,0.05)]' : ''}`}
          >
            <span className="font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] w-[14px] tabular-nums">
              {row.rank}
            </span>
            <div
              className="rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center shrink-0"
              style={{ width: 28, height: 28, outline: `1.5px solid ${TEAM_COLOR[row.code] || '#0F171F'}` }}
            >
              <TeamLogoAvatar teamCode={row.code} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-special-gothic-condensed-one text-[14px] text-[#0F171F] leading-tight truncate">
                {row.name}
              </p>
              <p className="font-barlow text-[11px] text-[rgba(15,23,31,0.55)] truncate">
                {row.team}
              </p>
            </div>
            <span className="font-special-gothic-condensed-one text-[18px] text-[#0F171F] tabular-nums shrink-0">
              {fmt(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayoffsPageClient() {
  const finalSeries = SERIES_DATA.find((s) => s.round === 'FINAL')!;
  const allSeriesOrdered = [
    ...SERIES_DATA.filter((s) => s.round === 'GRUPO_FINAL'),
    ...SERIES_DATA.filter((s) => s.round === 'CUARTOS'),
    finalSeries,
  ];

  return (
    <>
      {/* ── Estado de las series — white blade ───────────────────────────── */}
      <section className="bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="container py-10 lg:py-14">
          <h2 className="font-special-gothic-condensed-one text-[28px] lg:text-[36px] text-[#0F171F] text-center tracking-[-0.3px]">
            Estado de las series
          </h2>

          {/* 1 col mobile / 3 col desktop — 2 rows of 3 cards, then full-width Final BSN below */}
          <div className="mt-7 lg:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            {allSeriesOrdered.filter((s) => s.round !== 'FINAL').map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
          <div className="mt-3 lg:mt-4">
            <SeriesCard series={finalSeries} fullWidth />
          </div>
        </div>
      </section>

      {/* ── Líderes de Playoffs 2026 ─────────────────────────────────────── */}
      <section className="bg-[#f2f2f3] border-t border-[rgba(15,23,31,0.06)]">
        <div className="container py-12 lg:py-16">
          <h2 className="font-special-gothic-condensed-one text-[#0F171F] text-[28px] lg:text-[36px] tracking-[-0.3px]">
            Líderes de Playoffs 2026
          </h2>
          <p className="font-barlow text-[14px] lg:text-[15px] text-[rgba(15,23,31,0.6)] mt-2">
            Los más productivos en la postemporada hasta el momento.
          </p>

          <div className="mt-6 lg:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-5">
            <StatLeaderCard category="PTS" data={LEADER_DATA.PTS} />
            <StatLeaderCard category="REB" data={LEADER_DATA.REB} />
            <StatLeaderCard category="AST" data={LEADER_DATA.AST} />
          </div>
        </div>
      </section>
    </>
  );
}
