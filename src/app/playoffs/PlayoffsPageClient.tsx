'use client';

import Link from 'next/link';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { SERIES_DATA, TEAM_COLOR, type Series, type Game } from './data';

const SERIES_LENGTH = 7;

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

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  ink: '#0F171F',
  ink70: 'rgba(15,23,31,0.70)',
  ink55: 'rgba(15,23,31,0.55)',
  ink40: 'rgba(15,23,31,0.40)',
  ink25: 'rgba(15,23,31,0.25)',
  ink10: 'rgba(15,23,31,0.10)',
  ink06: 'rgba(15,23,31,0.06)',
  // Used for game-row bottom borders (subtle, repeats per row).
  hairline: 'rgba(15,23,31,0.07)',
  // Used for the structural break between sections of a card (header→hero,
  // hero→log, finals vertical split). Set to .132 — strong enough to read
  // as a deliberate separator without darkening the card surface.
  divider: 'rgba(15,23,31,0.132)',
};

const HATCH = 'repeating-linear-gradient(135deg, rgba(15,23,31,0.028) 0 1px, transparent 1px 9px)';

function canReachGameSeven(s: Series) {
  return s.team1.wins < 4 && s.team2.wins < 4;
}

// ─── Card top header bar ──────────────────────────────────────────────────────
function CardHeaderBar({ s, isFinal }: { s: Series; isFinal: boolean }) {
  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-white/[0.05]"
      style={{
        padding: '12px 18px',
        background: 'linear-gradient(180deg, #1F2A36 0%, #0F171F 100%)',
      }}
    >
      {isFinal && (
        <span aria-hidden style={{ color: '#FEC200', fontSize: 13, lineHeight: 1 }}>
          ★
        </span>
      )}
      <span
        className="font-barlow font-bold text-white uppercase whitespace-nowrap"
        style={{ fontSize: 11, letterSpacing: 1.6 }}
      >
        {s.conferenceLabel || (isFinal ? 'Final BSN' : 'Serie')}
      </span>
      {s.group && (
        <span
          className="font-barlow font-bold text-white/55 uppercase whitespace-nowrap"
          style={{ fontSize: 10.5, letterSpacing: 1.6 }}
        >
          · Grupo {s.group}
        </span>
      )}
    </div>
  );
}

// ─── Status pill (shared by hero + final hero) ────────────────────────────────
// `mobileSmall` shrinks the pill on narrow viewports for the in-card hero.
function StatusPill({
  children,
  size = 11,
  mobileSmall = false,
}: {
  children: React.ReactNode;
  size?: number;
  mobileSmall?: boolean;
}) {
  const sizeCls = mobileSmall ? 'text-[9.5px] lg:text-[11px] px-[9px] py-[3px] lg:px-[12px] lg:py-[5px]' : '';
  return (
    <span
      className={`inline-flex items-center font-barlow font-bold uppercase whitespace-nowrap tabular-nums ${sizeCls}`}
      style={{
        borderRadius: 999,
        background: 'rgba(15,23,31,0.06)',
        border: '1px solid rgba(15,23,31,0.10)',
        color: C.ink,
        letterSpacing: 1.4,
        ...(mobileSmall ? null : { padding: '5px 12px', fontSize: size }),
      }}
    >
      {children}
    </span>
  );
}

function statusPillText(s: Series): string {
  if (s.status === 'COMPLETED') {
    const w1 = s.team1.wins;
    const w2 = s.team2.wins;
    const winner = w1 > w2 ? s.team1 : s.team2;
    const loser = w1 > w2 ? s.team2 : s.team1;
    return `${winner.name.toUpperCase()} GANA ${winner.wins}-${loser.wins}`;
  }
  if (s.team1.wins === s.team2.wins) {
    return `EMPATE ${s.team1.wins}-${s.team2.wins}`;
  }
  const lead = s.team1.wins > s.team2.wins ? s.team1 : s.team2;
  const trail = lead.code === s.team1.code ? s.team2 : s.team1;
  return `${lead.code} LIDERA ${lead.wins}-${trail.wins}`;
}

// ─── Side block (logo + name) — no ring, just the logo ───────────────────────
// Logo shrinks 30% on mobile (<lg) — kept as two TeamLogoAvatar instances
// since the avatar's size is inline-styled and isn't easily overridden via
// responsive utilities.
function SideBlock({
  team,
  dim,
  logoSize,
  nameSize,
}: {
  team: Series['team1'];
  dim: boolean;
  logoSize: number;
  nameSize: number;
}) {
  const mobileLogoSize = Math.round(logoSize * 0.7);
  return (
    <div
      className="flex flex-col items-center min-w-0"
      style={{ opacity: dim ? 0.4 : 1, filter: dim ? 'grayscale(0.6)' : 'none', rowGap: 23 }}
    >
      <div className="lg:hidden">
        <TeamLogoAvatar teamCode={team.code} size={mobileLogoSize} />
      </div>
      <div className="hidden lg:block">
        <TeamLogoAvatar teamCode={team.code} size={logoSize} />
      </div>
      <div
        className="font-special-gothic-condensed-one text-center"
        style={{
          fontSize: nameSize,
          color: dim ? C.ink40 : C.ink,
          letterSpacing: 0.2,
          lineHeight: 1.05,
        }}
      >
        {team.name}
      </div>
    </div>
  );
}

// ─── Hero block (non-final cards) ─────────────────────────────────────────────
function CardHero({ s }: { s: Series }) {
  const completed = s.status === 'COMPLETED';
  const w1 = s.team1.wins;
  const w2 = s.team2.wins;
  const t1Loser = completed && w1 < w2;
  const t2Loser = completed && w2 < w1;

  // Logos stay the same; SCORES are smaller per user direction.
  // Was 60 desktop / 50 mobile → now 44 desktop / 38 mobile.
  const scoreCls = 'text-[38px] lg:text-[44px]';
  const dashCls = 'text-[24px] lg:text-[28px]';

  return (
    <div className="px-[18px] pt-[26px] pb-[16px]" style={{ backgroundImage: HATCH }}>
      <div className="grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr', columnGap: 14 }}>
        <div className="flex justify-end" style={{ transform: 'translateX(-18px)' }}>
          <SideBlock team={s.team1} dim={t1Loser} logoSize={70} nameSize={19} />
        </div>
        <div className="flex flex-col items-center shrink-0" style={{ rowGap: 13 }}>
          <div className="flex items-center gap-[6px] tabular-nums">
            <span
              className={`font-special-gothic-condensed-one ${scoreCls}`}
              style={{
                color: t1Loser ? C.ink25 : C.ink,
                letterSpacing: 0.2,
                lineHeight: 0.9,
              }}
            >
              {w1}
            </span>
            <span
              className={`font-barlow ${dashCls}`}
              style={{ fontWeight: 200, color: C.ink25, lineHeight: 1, padding: '0 2px' }}
            >
              –
            </span>
            <span
              className={`font-special-gothic-condensed-one ${scoreCls}`}
              style={{
                color: t2Loser ? C.ink25 : C.ink,
                letterSpacing: 0.2,
                lineHeight: 0.9,
              }}
            >
              {w2}
            </span>
          </div>
          <StatusPill mobileSmall>{statusPillText(s)}</StatusPill>
        </div>
        <div className="flex justify-start" style={{ transform: 'translateX(18px)' }}>
          <SideBlock team={s.team2} dim={t2Loser} logoSize={70} nameSize={19} />
        </div>
      </div>

      {/* Next-game / status line */}
      <div className="mt-[14px] text-center">
        {!completed && s.nextGame ? (
          <span className="font-barlow font-semibold" style={{ fontSize: 12, color: C.ink70 }}>
            Juego {s.games.length + 1}: {s.nextGame.date} · {s.nextGame.time}
          </span>
        ) : !completed ? (
          <span className="font-barlow" style={{ fontSize: 12, color: C.ink55 }}>
            Próximo partido por anunciar
          </span>
        ) : (
          <span className="font-barlow" style={{ fontSize: 12, color: C.ink70 }}>
            Avanza a la siguiente ronda
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Final BSN hero (left column of the 60/40 split) ──────────────────────────
function FinalHeader({ s }: { s: Series }) {
  const completed = s.status === 'COMPLETED';
  const w1 = s.team1.wins;
  const w2 = s.team2.wins;
  const t1Loser = completed && w1 < w2;
  const t2Loser = completed && w2 < w1;
  const isPending = s.status === 'UPCOMING' && (!s.team1.code || s.team1.seed === 0);

  if (isPending) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 px-6 py-10"
        style={{ backgroundImage: HATCH, height: '100%' }}
      >
        <span aria-hidden className="text-[#FEC200] text-[28px] leading-none">★</span>
        <p
          className="font-special-gothic-condensed-one text-center text-[#0F171F]"
          style={{ fontSize: 36, letterSpacing: 0.3, lineHeight: 1.05 }}
        >
          Por definir
        </p>
        <p className="font-barlow text-center" style={{ fontSize: 13, color: C.ink55 }}>
          {s.nextGame ? `Comienza ${s.nextGame.date} · ${s.nextGame.venue}` : 'A la espera de los finalistas'}
        </p>
      </div>
    );
  }

  // Final BSN: scores reduced from 60/50 → 52/44.
  const scoreCls = 'text-[44px] lg:text-[52px]';
  const dashCls = 'text-[28px] lg:text-[32px]';

  return (
    <div
      className="flex flex-col items-center justify-center px-[22px] py-[28px] h-full"
      style={{ backgroundImage: HATCH, rowGap: 21 }}
    >
      <div className="grid items-center w-full" style={{ gridTemplateColumns: '1fr auto 1fr', columnGap: 14 }}>
        <div className="flex justify-end" style={{ transform: 'translateX(-18px)' }}>
          <SideBlock team={s.team1} dim={t2Loser} logoSize={88} nameSize={20} />
        </div>
        <div className="flex items-center gap-[6px] shrink-0 tabular-nums" style={{ paddingBottom: 22 }}>
          <span
            className={`font-special-gothic-condensed-one ${scoreCls}`}
            style={{
              color: t2Loser ? C.ink25 : C.ink,
              letterSpacing: 0.2,
              lineHeight: 0.9,
            }}
          >
            {w1}
          </span>
          <span
            className={`font-barlow ${dashCls}`}
            style={{ fontWeight: 200, color: C.ink25, lineHeight: 1, padding: '0 2px' }}
          >
            –
          </span>
          <span
            className={`font-special-gothic-condensed-one ${scoreCls}`}
            style={{
              color: t1Loser ? C.ink25 : C.ink,
              letterSpacing: 0.2,
              lineHeight: 0.9,
            }}
          >
            {w2}
          </span>
        </div>
        <div className="flex justify-start" style={{ transform: 'translateX(18px)' }}>
          <SideBlock team={s.team2} dim={t1Loser} logoSize={88} nameSize={20} />
        </div>
      </div>

      <StatusPill>{statusPillText(s)}</StatusPill>

      {completed ? (
        <div className="font-barlow uppercase" style={{ fontSize: 12, color: C.ink55, letterSpacing: 1.2 }}>
          Avanza a la siguiente ronda
        </div>
      ) : s.nextGame ? (
        <div className="flex flex-col items-center gap-1">
          <div className="font-barlow font-semibold" style={{ fontSize: 12, color: C.ink70 }}>
            Juego {s.games.length + 1}: {s.nextGame.date}
            {s.nextGame.time ? `, ${s.nextGame.time}` : ''}
          </div>
        </div>
      ) : (
        <div className="font-barlow" style={{ fontSize: 12, color: C.ink55 }}>
          Próximo partido por anunciar
        </div>
      )}
    </div>
  );
}

// ─── Game row ─────────────────────────────────────────────────────────────────
function GameRow({
  s,
  game,
  n,
  last,
}: {
  s: Series;
  game?: Game;
  n: number;
  last: boolean;
}) {
  const played = !!game && game.status === 'COMPLETED';
  const t1Code = s.team1.code;
  const t2Code = s.team2.code;

  let t1Score: number | null = null;
  let t2Score: number | null = null;
  let t1Won = false;
  if (played && game) {
    t1Score = game.homeCode === t1Code ? game.homeScore : game.visitorScore;
    t2Score = game.homeCode === t2Code ? game.homeScore : game.visitorScore;
    if (game.homeScore != null && game.visitorScore != null) {
      const winnerCode = game.homeScore > game.visitorScore ? game.homeCode : game.visitorCode;
      t1Won = winnerCode === t1Code;
    }
  }

  const nextUp = !played && n === s.games.length + 1;
  const willHappen = played || nextUp || canReachGameSeven(s);
  const interactive = played || nextUp;
  const href = played && game?.matchId ? `/partidos/${game.matchId}` : nextUp ? `/partidos/proximo/${s.id}-j${n}` : null;

  // Center cell content
  let centerEl: React.ReactNode;
  if (played) {
    centerEl = (
      <span
        className="font-barlow font-bold uppercase whitespace-nowrap"
        style={{ fontSize: 11, color: C.ink70, letterSpacing: 1.4 }}
      >
        FINAL
      </span>
    );
  } else if (nextUp && s.nextGame) {
    centerEl = (
      <span
        className="font-special-gothic-condensed-one tabular-nums whitespace-nowrap"
        style={{ fontSize: 13, color: C.ink, letterSpacing: 0.4, lineHeight: 1 }}
      >
        {s.nextGame.time || s.nextGame.date}
      </span>
    );
  } else if (!canReachGameSeven(s)) {
    centerEl = (
      <span
        className="font-barlow uppercase whitespace-nowrap"
        style={{ fontSize: 9.5, color: C.ink40, letterSpacing: 1.2 }}
      >
        Si necesario
      </span>
    );
  } else {
    centerEl = (
      <span
        className="font-barlow uppercase"
        style={{ fontSize: 9.5, color: C.ink40, letterSpacing: 1.2 }}
      >
        TBD
      </span>
    );
  }

  // Tighter layout per user direction: codes + scores cluster around the
  // center cell. Outer columns (Juego pill, action) stay anchored to the
  // edges; the middle [T1 code · T1 score · CENTER · T2 score · T2 code]
  // forms a centered group with small gaps.
  // Outer columns are the SAME width on both sides so the inner cluster
  // (T1 code · T1 score · CENTER · T2 score · T2 code) sits at exact
  // horizontal center of the row. Use the wider of the two anchors per
  // breakpoint so neither pill nor "Ver resultado" link gets clipped.
  const rowInner = (
    <div
      className="grid items-center pl-[14px] pr-[18px] lg:pl-[18px] lg:pr-[24px] py-[14px] transition-colors duration-100 grid-cols-[40px_1fr_auto_1fr_40px] lg:grid-cols-[96px_1fr_auto_1fr_96px]"
      style={{
        columnGap: 10,
        borderBottom: last ? 'none' : `1px solid ${C.hairline}`,
        background: '#fff',
        opacity: !willHappen ? 0.4 : 1,
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {/* Juego N pill (anchored left). Compact JN on mobile. */}
      <span
        className="inline-flex items-center justify-center font-barlow font-bold uppercase whitespace-nowrap tabular-nums justify-self-start"
        style={{
          padding: '4px 8px',
          borderRadius: 999,
          background: '#F7F7F5',
          border: `1px solid ${C.hairline}`,
          color: C.ink55,
          letterSpacing: 1.2,
          fontSize: 10.5,
          lineHeight: 1,
        }}
      >
        <span className="lg:hidden">J{n}</span>
        <span className="hidden lg:inline">Juego {n}</span>
      </span>

      {/* Spacer (1fr) — pushes the cluster toward center */}
      <span aria-hidden />

      {/* Center cluster: T1 code | T1 score | center | T2 score | T2 code */}
      <div className="flex items-center" style={{ columnGap: 10 }}>
        <span
          className="font-special-gothic-condensed-one"
          style={{
            fontSize: 14,
            color: played ? (t1Won ? C.ink : C.ink40) : C.ink55,
            letterSpacing: 0.6,
            lineHeight: 1,
          }}
        >
          {t1Code}
        </span>
        <span
          className="font-special-gothic-condensed-one tabular-nums"
          style={{
            fontSize: 22,
            color: played ? (t1Won ? C.ink : C.ink40) : C.ink25,
            letterSpacing: 0.3,
            lineHeight: 1,
            minWidth: 26,
            textAlign: 'right',
          }}
        >
          {played ? t1Score : '—'}
        </span>

        <div className="flex items-center justify-center" style={{ minWidth: 60, padding: '0 8px' }}>
          {centerEl}
        </div>

        <span
          className="font-special-gothic-condensed-one tabular-nums"
          style={{
            fontSize: 22,
            color: played ? (!t1Won ? C.ink : C.ink40) : C.ink25,
            letterSpacing: 0.3,
            lineHeight: 1,
            minWidth: 26,
            textAlign: 'left',
          }}
        >
          {played ? t2Score : '—'}
        </span>
        <span
          className="font-special-gothic-condensed-one"
          style={{
            fontSize: 14,
            color: played ? (!t1Won ? C.ink : C.ink40) : C.ink55,
            letterSpacing: 0.6,
            lineHeight: 1,
          }}
        >
          {t2Code}
        </span>
      </div>

      {/* Spacer (1fr) */}
      <span aria-hidden />

      {/* Action: chevron mobile, "Ver resultado"/"Ver previa" link desktop */}
      <div className="justify-self-end flex items-center">
        {interactive ? (
          <>
            {/* Mobile: chevron */}
            <span
              className="lg:hidden inline-flex items-center justify-center"
              style={{ width: 20, height: 20, color: C.ink55 }}
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
                <path
                  d="M1.5 1.5L8 7L1.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {/* Desktop: text link */}
            <span
              className="hidden lg:inline-block font-barlow font-semibold whitespace-nowrap transition-[color,transform] duration-100 group-hover/row:translate-x-[2px] group-hover/row:text-[#1257A8]"
              style={{ fontSize: 12, color: '#1772D9', letterSpacing: 0.3 }}
            >
              {played ? 'Ver resultado' : 'Ver previa'}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );

  if (interactive && href) {
    return (
      <Link href={href} aria-label={played ? `Ver resultado Juego ${n}` : `Ver previa Juego ${n}`} className="block group/row hover:bg-[#FAFAFA]">
        {rowInner}
      </Link>
    );
  }
  return rowInner;
}

// ─── Series card ──────────────────────────────────────────────────────────────
function SeriesCard({ series, fullWidth = false }: { series: Series; fullWidth?: boolean }) {
  const isFinal = series.round === 'FINAL';
  const isFinalPending = isFinal && series.status === 'UPCOMING' && (!series.team1.code || series.team1.seed === 0);
  const completed = series.status === 'COMPLETED';
  const playedCount = series.games.length;
  const rowsToShow = completed ? playedCount : SERIES_LENGTH;

  const rows: { n: number; game?: Game }[] = [];
  for (let i = 0; i < rowsToShow; i += 1) {
    rows.push({ n: i + 1, game: series.games[i] });
  }

  // Game-log fills available vertical space so cards in the same row equalize
  // on desktop (lg+); on mobile we stay content-sized.
  const rowsBlock = (
    <div className="bg-white lg:flex-1">
      {rows.length === 0 ? (
        <div
          className="font-barlow text-center"
          style={{ fontSize: 12, color: C.ink55, padding: '18px 14px' }}
        >
          Calendario por confirmar
        </div>
      ) : (
        rows.map((r, i) => (
          <GameRow key={r.n} s={series} n={r.n} game={r.game} last={i === rows.length - 1} />
        ))
      )}
    </div>
  );

  const cardOuter: React.CSSProperties = {
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${C.ink10}`,
    background: '#fff',
    boxShadow: isFinal
      ? '0 6px 16px rgba(15,23,31,0.05), 0 1px 2px rgba(15,23,31,0.03)'
      : '0 2px 6px rgba(15,23,31,0.03), 0 1px 1px rgba(15,23,31,0.02)',
  };

  return (
    <div
      className={`${fullWidth ? 'lg:col-span-2' : ''} lg:flex lg:flex-col lg:h-full`}
      style={cardOuter}
    >
      <CardHeaderBar s={series} isFinal={isFinal} />

      {isFinal && fullWidth ? (
        // Desktop Final BSN: 50/50 split with vertical hairline divider.
        // Mobile collapses to stacked (hero on top, rows below) automatically.
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:flex-1">
          <div className="lg:border-r" style={{ borderRightColor: C.divider }}>
            <FinalHeader s={series} />
          </div>
          <div className="flex flex-col justify-center border-t lg:border-t-0" style={{ borderTopColor: C.divider }}>
            {!isFinalPending && rowsBlock}
          </div>
        </div>
      ) : (
        <>
          {isFinal ? <FinalHeader s={series} /> : <CardHero s={series} />}
          {!isFinalPending && (
            <>
              <div className="h-px" style={{ background: C.divider }} />
              {rowsBlock}
            </>
          )}
        </>
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
  const grupoFinals = SERIES_DATA.filter((s) => s.round === 'GRUPO_FINAL');
  const cuartos = SERIES_DATA.filter((s) => s.round === 'CUARTOS');

  return (
    <>
      {/* ── Estado de las series — light blade ───────────────────────────── */}
      <section className="bg-[#F4F5F7] border-b border-[rgba(0,0,0,0.06)]" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="mx-auto px-4 lg:px-6" style={{ maxWidth: 1156 }}>
          <h2 className="font-special-gothic-condensed-one text-[28px] lg:text-[36px] text-[#0F171F] text-center tracking-[-0.3px]">
            Estado de las series
          </h2>

          {/* 2-col grid; Final BSN spans both columns at the top */}
          <div
            className="mt-7 lg:mt-10 grid grid-cols-1 lg:grid-cols-2"
            style={{ columnGap: 20, rowGap: 24 }}
          >
            <SeriesCard series={finalSeries} fullWidth />
            {grupoFinals.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
            {cuartos.map((s) => (
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
