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
type StatusTone = 'final' | 'progress' | 'tied' | 'upcoming';
function seriesLeaderText(s: Series): { text: string; tone: StatusTone; accentCode?: string } {
  if (s.status === 'UPCOMING') return { text: 'Por jugar', tone: 'upcoming' };
  const w1 = s.team1.wins;
  const w2 = s.team2.wins;
  if (s.status === 'COMPLETED') {
    const winner = w1 > w2 ? s.team1 : s.team2;
    const loserWins = Math.min(w1, w2);
    return { text: `${winner.code} avanza ${winner.wins}–${loserWins}`, tone: 'final', accentCode: winner.code };
  }
  if (w1 === w2) return { text: `Serie empatada ${w1}–${w2}`, tone: 'tied' };
  const leader = w1 > w2 ? s.team1 : s.team2;
  const trailer = w1 > w2 ? s.team2 : s.team1;
  return { text: `${leader.code} lidera ${leader.wins}–${trailer.wins}`, tone: 'progress', accentCode: leader.code };
}

// ─── Estado de las series — TopLabel + CardHeader + Game rows ─────────────────
function SeriesCard({ series, fullWidth = false }: { series: Series; fullWidth?: boolean }) {
  const status = seriesLeaderText(series);
  const isFinal = series.round === 'FINAL';
  const isFinalPending = isFinal && series.status === 'UPCOMING';
  const isCompleted = series.status === 'COMPLETED';

  const w1 = series.team1.wins;
  const w2 = series.team2.wins;
  const team1Loser = isCompleted && w1 < w2;
  const team2Loser = isCompleted && w2 < w1;

  // Final card uses ivory + gold trim, no longer pitch-black
  const cardBg = isFinal ? '#FFF8E1' : '#FFFFFF';
  const headerBg = isFinal ? '#FFF8E1' : '#FFFFFF';

  // Round-coded top label bar — subtle tint + matching label text
  const roundTheme: { bg: string; text: string } = isFinal
    ? { bg: '#FEC200', text: '#0F171F' }
    : series.round === 'GRUPO_FINAL'
      ? { bg: 'rgba(110,63,163,0.10)', text: '#6E3FA3' }
      : { bg: 'rgba(21,101,192,0.10)', text: '#1565C0' };

  // Status pill tone — completed series read as "done" via green
  const pillTheme: { bg: string; text: string; muted: string } = isCompleted
    ? { bg: 'rgba(16,128,61,0.10)', text: '#10803D', muted: 'rgba(16,128,61,0.65)' }
    : { bg: 'rgba(15,23,31,0.06)', text: '#0F171F', muted: 'rgba(15,23,31,0.55)' };

  // Build out future game rows — only for in-progress series.
  // Best-of-7: continue until one team has 4 wins. Skip empty entries when complete.
  const futureGames: { gameNumber: number; date?: string; time?: string }[] = [];
  if (!isCompleted && !isFinalPending) {
    const remaining = (4 - w1) + (4 - w2); // worst-case games left
    const minRemaining = Math.max(4 - w1, 4 - w2); // best-case (clinch sweep)
    const slotsToShow = Math.min(remaining, Math.max(minRemaining, 1));
    for (let i = 0; i < slotsToShow; i += 1) {
      const gameNumber = series.games.length + i + 1;
      if (i === 0 && series.nextGame) {
        futureGames.push({ gameNumber, date: series.nextGame.date, time: series.nextGame.time });
      } else {
        futureGames.push({ gameNumber });
      }
    }
  }

  return (
    <div
      className={`rounded-[12px] overflow-hidden ${fullWidth ? 'lg:col-span-3' : ''}`}
      style={{
        backgroundColor: cardBg,
        // Stripe/Linear-style stack: hairline ring, tight ambient, soft long cast
        boxShadow: isFinal
          ? [
              '0 0 0 0.5px rgba(15,23,31,0.06)',
              '0 1px 1px rgba(15,23,31,0.04)',
              '0 4px 8px -2px rgba(15,23,31,0.04)',
              '0 18px 32px -12px rgba(254,194,0,0.18)',
            ].join(', ')
          : [
              '0 0 0 0.5px rgba(15,23,31,0.06)',
              '0 1px 1px rgba(15,23,31,0.03)',
              '0 4px 8px -2px rgba(15,23,31,0.03)',
              '0 12px 24px -10px rgba(15,23,31,0.06)',
            ].join(', '),
        ...(isFinal ? { borderTop: '2px solid #FEC200' } : null),
      }}
    >
      {/* TopLabel bar */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-[10px]"
        style={{ backgroundColor: roundTheme.bg }}
      >
        <span
          className="font-barlow font-semibold text-[11px] uppercase truncate"
          style={{ letterSpacing: '0.14em', color: roundTheme.text }}
        >
          {series.conferenceLabel}
        </span>
        {isFinal ? (
          <span
            className="inline-flex items-center gap-[4px] font-barlow font-bold text-[10px] text-[#FEC200] px-[8px] py-[4px] tabular-nums shrink-0"
            style={{ backgroundColor: '#0F171F', borderRadius: 3, letterSpacing: '0.06em' }}
          >
            <span aria-hidden>★</span>
            FINAL BSN
          </span>
        ) : isCompleted ? (
          <span
            className="font-barlow font-semibold text-[10px] uppercase text-[rgba(15,23,31,0.65)] px-[8px] py-[3px] shrink-0"
            style={{
              letterSpacing: '0.10em',
              backgroundColor: 'rgba(15,23,31,0.07)',
              borderRadius: 3,
            }}
          >
            Concluida
          </span>
        ) : null}
      </div>

      {/* CardHeader */}
      <div
        className="px-5 py-5"
        style={{ backgroundColor: headerBg }}
      >
        {isFinalPending ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <span aria-hidden className="text-[#FEC200] text-[24px] leading-none">★</span>
            <p
              className="font-special-gothic-condensed-one text-[32px] text-center text-[#0F171F]"
              style={{ fontWeight: 400, letterSpacing: '0.3px' }}
            >
              Por definir
            </p>
            <p className="font-barlow text-[13px] text-center text-[rgba(15,23,31,0.55)]">
              {series.nextGame
                ? `Comienza ${series.nextGame.date} · ${series.nextGame.venue}`
                : 'A la espera de los finalistas'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {/* Team 1 — code + city */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden"
                  style={{
                    width: isFinal ? 52 : 44,
                    height: isFinal ? 52 : 44,
                    border: `2px solid ${TEAM_COLOR[series.team1.code] || '#0F171F'}`,
                  }}
                >
                  <TeamLogoAvatar teamCode={series.team1.code} size={isFinal ? 36 : 30} />
                </div>
                <p
                  className={`font-special-gothic-condensed-one leading-none ${
                    team1Loser ? 'text-[rgba(15,23,31,0.30)]' : 'text-[#0F171F]'
                  }`}
                  style={{
                    fontWeight: 400,
                    fontSize: isFinal ? 32 : 28,
                    letterSpacing: '0.5px',
                  }}
                >
                  {series.team1.code}
                </p>
              </div>

              {/* Center score */}
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span
                  className={`font-special-gothic-condensed-one ${
                    team1Loser ? 'text-[rgba(15,23,31,0.30)]' : 'text-[#0F171F]'
                  }`}
                  style={{ fontWeight: 400, fontSize: isFinal ? 56 : 48, lineHeight: 1 }}
                >
                  {w1}
                </span>
                <span
                  className="font-barlow text-[rgba(15,23,31,0.18)]"
                  style={{ fontSize: isFinal ? 36 : 30, lineHeight: 1 }}
                >
                  –
                </span>
                <span
                  className={`font-special-gothic-condensed-one ${
                    team2Loser ? 'text-[rgba(15,23,31,0.30)]' : 'text-[#0F171F]'
                  }`}
                  style={{ fontWeight: 400, fontSize: isFinal ? 56 : 48, lineHeight: 1 }}
                >
                  {w2}
                </span>
              </div>

              {/* Team 2 — mirrored */}
              <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                <p
                  className={`font-special-gothic-condensed-one leading-none text-right ${
                    team2Loser ? 'text-[rgba(15,23,31,0.30)]' : 'text-[#0F171F]'
                  }`}
                  style={{
                    fontWeight: 400,
                    fontSize: isFinal ? 32 : 28,
                    letterSpacing: '0.5px',
                  }}
                >
                  {series.team2.code}
                </p>
                <div
                  className="shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden"
                  style={{
                    width: isFinal ? 52 : 44,
                    height: isFinal ? 52 : 44,
                    border: `2px solid ${TEAM_COLOR[series.team2.code] || '#0F171F'}`,
                  }}
                >
                  <TeamLogoAvatar teamCode={series.team2.code} size={isFinal ? 36 : 30} />
                </div>
              </div>
            </div>

            {/* Status pill */}
            <div className="flex justify-center mt-4">
              <span
                className="inline-flex items-center font-barlow font-semibold text-[13px] px-[12px] py-[6px] tabular-nums"
                style={{
                  backgroundColor: pillTheme.bg,
                  color: pillTheme.text,
                  borderRadius: 999,
                  letterSpacing: '0.01em',
                }}
              >
                {status.text}
                {(status.tone === 'progress' || status.tone === 'tied') && series.nextGame && (
                  <span className="ml-2 font-medium" style={{ color: pillTheme.muted }}>
                    · Próx. {series.nextGame.date}
                  </span>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Game rows */}
      {!isFinalPending && (series.games.length > 0 || futureGames.length > 0) && (
        <div className="border-t border-[rgba(15,23,31,0.08)] bg-white">
          {series.games.map((g, idx) => {
            const winnerCode =
              g.homeScore != null && g.visitorScore != null
                ? g.homeScore > g.visitorScore
                  ? g.homeCode
                  : g.visitorCode
                : null;
            const t1Code = series.team1.code;
            const t2Code = series.team2.code;
            const t1Score = g.homeCode === t1Code ? g.homeScore : g.visitorScore;
            const t2Score = g.homeCode === t2Code ? g.homeScore : g.visitorScore;
            const t1Win = winnerCode === t1Code;
            const t2Win = winnerCode === t2Code;

            return (
              <div
                key={`${g.gameNumber}-${idx}`}
                className="grid items-center px-5 py-[14px] transition-colors duration-100 hover:bg-[rgba(15,23,31,0.025)] border-b border-[rgba(15,23,31,0.05)] last:border-b-0"
                style={{ gridTemplateColumns: '72px 1fr auto 1fr 28px', columnGap: 12 }}
              >
                {/* Col 1: Juego N + date — right aligned for visual balance */}
                <div className="text-right">
                  <p className="font-barlow font-semibold text-[12px] text-[#0F171F]">
                    Juego {g.gameNumber}
                  </p>
                  <p className="font-barlow text-[11px] text-[rgba(15,23,31,0.55)]">
                    {g.date}
                  </p>
                </div>

                {/* Col 2: team1 code + score, right-aligned */}
                <div className="flex items-center justify-end gap-3 min-w-0">
                  <span
                    className={`font-barlow font-bold ${
                      t1Win ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.40)]'
                    }`}
                    style={{ fontSize: 13, letterSpacing: '0.05em' }}
                  >
                    {t1Code}
                  </span>
                  <span
                    className={`font-special-gothic-condensed-one tabular-nums ${
                      t1Win ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.40)]'
                    }`}
                    style={{ fontWeight: 400, fontSize: 24 }}
                  >
                    {t1Score ?? '–'}
                  </span>
                </div>

                {/* Col 3: FINAL chip — the only pill in the row */}
                <div className="text-center" style={{ minWidth: 64 }}>
                  <span
                    className="inline-flex font-barlow font-semibold text-[10px] uppercase text-[rgba(15,23,31,0.70)] px-[8px] py-[3px]"
                    style={{
                      letterSpacing: '0.12em',
                      backgroundColor: 'rgba(15,23,31,0.06)',
                      borderRadius: 3,
                    }}
                  >
                    FINAL
                  </span>
                </div>

                {/* Col 4: team2 score + code, left-aligned (mirror) */}
                <div className="flex items-center justify-start gap-3 min-w-0">
                  <span
                    className={`font-special-gothic-condensed-one tabular-nums ${
                      t2Win ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.40)]'
                    }`}
                    style={{ fontWeight: 400, fontSize: 24 }}
                  >
                    {t2Score ?? '–'}
                  </span>
                  <span
                    className={`font-barlow font-bold ${
                      t2Win ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.40)]'
                    }`}
                    style={{ fontSize: 13, letterSpacing: '0.05em' }}
                  >
                    {t2Code}
                  </span>
                </div>

                {/* Col 5: chevron link — thin SVG */}
                <div className="flex justify-end">
                  {g.matchId ? (
                    <Link
                      href={`/partidos/${g.matchId}`}
                      aria-label={`Ver resultados Juego ${g.gameNumber}`}
                      className="inline-flex items-center justify-center text-[rgba(15,23,31,0.35)] hover:text-[#0F171F] transition-colors"
                      style={{ width: 20, height: 20 }}
                    >
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
                        <path d="M1.5 1.5L8 7L1.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Future game rows */}
          {futureGames.map((fg) => (
            <div
              key={`future-${fg.gameNumber}`}
              className="grid items-center px-5 py-[14px] border-b border-[rgba(15,23,31,0.05)] last:border-b-0 bg-[rgba(15,23,31,0.015)]"
              style={{ gridTemplateColumns: '72px 1fr auto 1fr 28px', columnGap: 12 }}
            >
              <div className="text-right">
                <p className="font-barlow font-semibold text-[12px] text-[rgba(15,23,31,0.55)]">
                  Juego {fg.gameNumber}
                </p>
                <p className="font-barlow text-[11px] text-[rgba(15,23,31,0.40)]">
                  {fg.date || 'Por confirmar'}
                </p>
              </div>
              <div className="flex items-center justify-end min-w-0">
                <span
                  className="font-barlow font-bold text-[rgba(15,23,31,0.45)]"
                  style={{ fontSize: 13, letterSpacing: '0.05em' }}
                >
                  {series.team1.code}
                </span>
              </div>
              <div className="text-center" style={{ minWidth: 64 }}>
                <span
                  className="inline-flex font-barlow font-semibold text-[10px] uppercase text-[#1565C0] px-[8px] py-[3px]"
                  style={{
                    letterSpacing: '0.10em',
                    backgroundColor: 'rgba(21,101,192,0.08)',
                    borderRadius: 3,
                  }}
                >
                  {fg.time || 'Por jugar'}
                </span>
              </div>
              <div className="flex items-center justify-start min-w-0">
                <span
                  className="font-barlow font-bold text-[rgba(15,23,31,0.45)]"
                  style={{ fontSize: 13, letterSpacing: '0.05em' }}
                >
                  {series.team2.code}
                </span>
              </div>
              <div className="flex justify-end">
                <span
                  aria-label={`Ver previa Juego ${fg.gameNumber}`}
                  className="inline-flex items-center justify-center text-[rgba(21,101,192,0.55)]"
                  style={{ width: 20, height: 20 }}
                >
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
                    <path d="M1.5 1.5L8 7L1.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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

  return (
    <>
      {/* ── Estado de las series — light blade ───────────────────────────── */}
      <section className="bg-[#f4f5f7] border-b border-[rgba(0,0,0,0.06)]" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="mx-auto px-4 lg:px-6" style={{ maxWidth: 1180 }}>
          <h2 className="font-special-gothic-condensed-one text-[28px] lg:text-[36px] text-[#0F171F] text-center tracking-[-0.3px]">
            Estado de las series
          </h2>

          {/* Final first (full width via lg:col-span-3), then conference finals, then quarterfinals */}
          <div
            className="mt-7 lg:mt-10 grid grid-cols-1 lg:grid-cols-3"
            style={{ columnGap: 20, rowGap: 24 }}
          >
            <SeriesCard series={finalSeries} fullWidth />
            {SERIES_DATA.filter((s) => s.round === 'GRUPO_FINAL').map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
            {SERIES_DATA.filter((s) => s.round === 'CUARTOS').map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
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
