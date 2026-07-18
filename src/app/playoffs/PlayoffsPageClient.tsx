'use client';

import Link from 'next/link';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { TEAM_COLOR } from './data';
import {
  usePlayoffsSeries,
  type PlayoffsSeriesNode,
  type SeriesMatch,
} from '@/playoffs/hooks/usePlayoffsSeries';
import { type LeaderNode } from '@/playoffs/hooks/usePlayoffsLeaders';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import SportRadarPlayoffsLeadersWidget from '@/match/client/widgets/SportRadarPlayoffsLeadersWidget';
import { getMatchStatusLabel } from '@/utils/bsn';
import moment from 'moment';
import { MATCH_DATE_SHORT_FORMAT, MATCH_TIME_FORMAT } from '@/constants';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  ink: '#0F171F',
  ink70: 'rgba(15,23,31,0.70)',
  ink55: 'rgba(15,23,31,0.55)',
  ink40: 'rgba(15,23,31,0.40)',
  ink25: 'rgba(15,23,31,0.25)',
  ink10: 'rgba(15,23,31,0.10)',
  ink06: 'rgba(15,23,31,0.06)',
  hairline: 'rgba(15,23,31,0.07)',
  divider: 'rgba(15,23,31,0.132)',
};

const HATCH =
  'repeating-linear-gradient(135deg, rgba(15,23,31,0.028) 0 1px, transparent 1px 9px)';

function seriesLabel(round: number): string {
  if (round === 3) return 'Final BSN';
  if (round === 2) return 'Semifinal';
  return 'Cuartos';
}

function statusPillText(node: PlayoffsSeriesNode): string {
  const c1 = node.competitors[0];
  const c2 = node.competitors[1];
  if (!c1 || !c2) return '';
  const w1 = c1.won;
  const w2 = c2.won;
  if (node.status === 'COMPLETE') {
    if (w1 > w2) return `${c1.team.nickname.toUpperCase()} GANA ${w1}-${w2}`;
    return `${c2.team.nickname.toUpperCase()} GANA ${w2}-${w1}`;
  }
  if (w1 === w2) return `EMPATE ${w1}-${w2}`;
  const winner = w1 > w2 ? c1 : c2;
  const loser = w1 > w2 ? c2 : c1;
  const result = winner.won >= 4 ? 'GANÓ' : 'LIDERA';
  return `${winner.team.code} ${result} ${winner.won}-${loser.won}`;
}

// ─── Card top header bar ──────────────────────────────────────────────────────
function CardHeaderBar({
  node,
  isFinal,
}: {
  node: PlayoffsSeriesNode;
  isFinal: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-white/[0.05]"
      style={{
        padding: '12px 18px',
        background: 'linear-gradient(180deg, #1F2A36 0%, #0F171F 100%)',
      }}
    >
      {isFinal && (
        <span
          aria-hidden
          style={{ color: '#FEC200', fontSize: 13, lineHeight: 1 }}
        >
          ★
        </span>
      )}
      <span
        className="font-barlow font-bold text-white uppercase whitespace-nowrap"
        style={{ fontSize: 11, letterSpacing: 1.6 }}
      >
        {seriesLabel(node.round)}
      </span>
      {node.group && !isFinal && (
        <span
          className="font-barlow font-bold text-white/55 uppercase whitespace-nowrap"
          style={{ fontSize: 10.5, letterSpacing: 1.6 }}
        >
          · {node.group}
        </span>
      )}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({
  children,
  size = 11,
  mobileSmall = false,
}: {
  children: React.ReactNode;
  size?: number;
  mobileSmall?: boolean;
}) {
  const sizeCls = mobileSmall
    ? 'text-[9.5px] lg:text-[11px] px-[9px] py-[3px] lg:px-[12px] lg:py-[5px]'
    : '';
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

// ─── Side block (logo + name) ─────────────────────────────────────────────────
function SideBlock({
  team,
  dim,
  logoSize,
  nameSize,
}: {
  team: { code: string; name: string };
  dim: boolean;
  logoSize: number;
  nameSize: number;
}) {
  const mobileLogoSize = Math.round(logoSize * 0.7);
  return (
    <div
      className="flex flex-col items-center min-w-0"
      style={{
        opacity: dim ? 0.4 : 1,
        filter: dim ? 'grayscale(0.6)' : 'none',
        rowGap: 23,
      }}
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
function CardHero({ node }: { node: PlayoffsSeriesNode }) {
  const completed = node.status === 'COMPLETE';
  const c1 = node.competitors[0];
  const c2 = node.competitors[1];
  const w1 = c1?.won ?? 0;
  const w2 = c2?.won ?? 0;
  const t1Loser = completed && w1 < w2;
  const t2Loser = completed && w2 < w1;

  const scoreCls = 'text-[38px] lg:text-[44px]';
  const dashCls = 'text-[24px] lg:text-[28px]';

  return (
    <div
      className="px-[18px] pt-[26px] pb-[16px]"
      style={{ backgroundImage: HATCH }}
    >
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: '1fr auto 1fr', columnGap: 14 }}
      >
        <div
          className="flex justify-end"
          style={{ transform: 'translateX(-18px)' }}
        >
          {c1 && (
            <SideBlock
              team={{ code: c1.team.code, name: c1.team.nickname }}
              dim={t1Loser}
              logoSize={70}
              nameSize={19}
            />
          )}
        </div>
        <div
          className="flex flex-col items-center shrink-0"
          style={{ rowGap: 13 }}
        >
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
              style={{
                fontWeight: 200,
                color: C.ink25,
                lineHeight: 1,
                padding: '0 2px',
              }}
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
          {statusPillText(node) && (
            <StatusPill mobileSmall>{statusPillText(node)}</StatusPill>
          )}
        </div>
        <div
          className="flex justify-start"
          style={{ transform: 'translateX(18px)' }}
        >
          {c2 && (
            <SideBlock
              team={{ code: c2.team.code, name: c2.team.nickname }}
              dim={t2Loser}
              logoSize={70}
              nameSize={19}
            />
          )}
        </div>
      </div>

      <div className="mt-[14px] text-center hidden">
        {completed ? (
          <span
            className="font-barlow font-semibold"
            style={{ fontSize: 12, color: C.ink70 }}
          >
            Avanza a la siguiente ronda
          </span>
        ) : (
          <span
            className="font-barlow"
            style={{ fontSize: 12, color: C.ink55 }}
          >
            Próximo partido por anunciar
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Final BSN hero ────────────────────────────────────────────────────────────
function FinalHeader({ node }: { node: PlayoffsSeriesNode }) {
  const completed = node.status === 'COMPLETE';
  const c1 = node.competitors[0];
  const c2 = node.competitors[1];
  const w1 = c1?.won ?? 0;
  const w2 = c2?.won ?? 0;
  const t1Loser = completed && w1 < w2;
  const t2Loser = completed && w2 < w1;
  const isPending = node.status === 'UPCOMING' && node.competitors.length < 2;

  if (isPending) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 px-6 py-10"
        style={{ backgroundImage: HATCH, height: '100%' }}
      >
        <span aria-hidden className="text-[#FEC200] text-[28px] leading-none">
          ★
        </span>
        <p
          className="font-special-gothic-condensed-one text-center text-[#0F171F]"
          style={{ fontSize: 36, letterSpacing: 0.3, lineHeight: 1.05 }}
        >
          Por definir
        </p>
        <p
          className="font-barlow text-center"
          style={{ fontSize: 13, color: C.ink55 }}
        >
          A la espera de los finalistas
        </p>
      </div>
    );
  }

  const scoreCls = 'text-[44px] lg:text-[52px]';
  const dashCls = 'text-[28px] lg:text-[32px]';

  return (
    <div
      className="flex flex-col items-center justify-center px-[22px] py-[28px] h-full"
      style={{ backgroundImage: HATCH, rowGap: 21 }}
    >
      <div
        className="grid items-center w-full"
        style={{ gridTemplateColumns: '1fr auto 1fr', columnGap: 14 }}
      >
        <div
          className="flex justify-end"
          style={{ transform: 'translateX(-18px)' }}
        >
          {c1 && (
            <SideBlock
              team={{ code: c1.team.code, name: c1.team.nickname }}
              dim={t2Loser}
              logoSize={88}
              nameSize={20}
            />
          )}
        </div>
        <div
          className="flex items-center gap-[6px] shrink-0 tabular-nums"
          style={{ paddingBottom: 22 }}
        >
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
            style={{
              fontWeight: 200,
              color: C.ink25,
              lineHeight: 1,
              padding: '0 2px',
            }}
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
        <div
          className="flex justify-start"
          style={{ transform: 'translateX(18px)' }}
        >
          {c2 && (
            <SideBlock
              team={{ code: c2.team.code, name: c2.team.nickname }}
              dim={t1Loser}
              logoSize={88}
              nameSize={20}
            />
          )}
        </div>
      </div>

      {statusPillText(node) && <StatusPill>{statusPillText(node)}</StatusPill>}

      {completed ? (
        <div
          className="font-barlow uppercase"
          style={{ fontSize: 12, color: C.ink55, letterSpacing: 1.2 }}
        >
          Avanza a la siguiente ronda
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
  match,
  n,
  last,
  t1Code,
  t2Code,
  t1Wins,
  t2Wins,
  playedCount,
}: {
  match?: SeriesMatch;
  n: number;
  last: boolean;
  t1Code: string;
  t2Code: string;
  t1Wins: number;
  t2Wins: number;
  playedCount: number;
}) {
  const played = !!match && match.status === 'COMPLETE';
  const nextUp = !played && n === playedCount + 1;
  const canReachSeven = t1Wins < 4 && t2Wins < 4;
  const willHappen = played || nextUp || canReachSeven;
  const interactive = [
    'COMPLETE',
    'FINISHED',
    'SCHEDULED',
    'IN_PROGRESS',
  ].includes(match?.status ?? '');
  const href =
    interactive && match?.providerId ? `/partidos/${match.providerId}` : null;

  const t1Score =
    t1Code == match?.homeTeam?.code
      ? match?.homeTeam?.score
      : match?.visitorTeam?.score;
  const t2Score =
    t1Code == match?.homeTeam?.code
      ? match?.visitorTeam?.score
      : match?.homeTeam?.score;
  const t1Won =
    played &&
    t1Score != null &&
    t2Score != null &&
    Number(t1Score) > Number(t2Score);
  const t2Won =
    played &&
    t1Score != null &&
    t2Score != null &&
    Number(t2Score) > Number(t1Score);

  const centerEl = (
    <span
      className="font-barlow font-bold uppercase whitespace-nowrap"
      style={{ fontSize: 11, color: C.ink70, letterSpacing: 1.4 }}
    >
      {match?.status == 'SCHEDULED' ? (
        <>
          <span>{moment(match.startAt).format(MATCH_DATE_SHORT_FORMAT)}</span>
          <span className="hidden md:inline">
            {' - '}
            {moment(match.startAt).format(MATCH_TIME_FORMAT)}
          </span>
        </>
      ) : (
        getMatchStatusLabel(match?.status ?? '')
      )}
    </span>
  );

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

      <span aria-hidden />

      <div className="flex items-center" style={{ columnGap: 10 }}>
        <span
          className="font-special-gothic-condensed-one"
          style={{
            fontSize: 14,
            color: played ? C.ink : C.ink55,
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
            color: t1Won ? C.ink : t2Won ? C.ink40 : C.ink25,
            letterSpacing: 0.3,
            lineHeight: 1,
            minWidth: 26,
            textAlign: 'right',
          }}
        >
          {t1Score ?? '—'}
        </span>

        <div
          className="flex items-center justify-center"
          style={{ minWidth: 40, padding: '0 8px' }}
        >
          {centerEl}
        </div>

        <span
          className="font-special-gothic-condensed-one tabular-nums"
          style={{
            fontSize: 22,
            color: t2Won ? C.ink : t1Won ? C.ink40 : C.ink25,
            letterSpacing: 0.3,
            lineHeight: 1,
            minWidth: 26,
            textAlign: 'left',
          }}
        >
          {t2Score ?? '—'}
        </span>
        <span
          className="font-special-gothic-condensed-one"
          style={{
            fontSize: 14,
            color: played ? C.ink : C.ink55,
            letterSpacing: 0.6,
            lineHeight: 1,
          }}
        >
          {t2Code}
        </span>
      </div>

      <span aria-hidden />

      <div className="justify-self-end flex items-center">
        {interactive ? (
          <>
            <span
              className="lg:hidden inline-flex items-center justify-center"
              style={{ width: 20, height: 20, color: C.ink55 }}
            >
              <svg
                width="10"
                height="14"
                viewBox="0 0 10 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1.5 1.5L8 7L1.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="hidden lg:inline-block font-barlow font-semibold whitespace-nowrap transition-[color,transform] duration-100 group-hover/row:translate-x-[2px] group-hover/row:text-[#1257A8]"
              style={{ fontSize: 12, color: '#1772D9', letterSpacing: 0.3 }}
            >
              {['COMPLETE', 'FINISHED'].includes(match?.status ?? '') &&
                'Ver resultado'}
              {'SCHEDULED' === match?.status && 'Ver previa'}
              {'IN_PROGRESS' === match?.status && 'Ver en vivo'}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );

  if (interactive && href) {
    return (
      <Link
        href={href}
        aria-label={`Ver resultado Juego ${n}`}
        className="block group/row hover:bg-[#FAFAFA]"
      >
        {rowInner}
      </Link>
    );
  }
  return rowInner;
}

// ─── Series card ──────────────────────────────────────────────────────────────
function SeriesCard({
  node,
  fullWidth = false,
}: {
  node: PlayoffsSeriesNode;
  fullWidth?: boolean;
}) {
  const isFinal = node.round === 3;
  const isFinalPending =
    isFinal && node.status === 'UPCOMING' && node.competitors.length < 2;
  const playedCount = node.matches.filter(
    (m) => m.status === 'COMPLETE',
  ).length;

  const t1Code = node.competitors[0]?.team.code ?? '';
  const t2Code = node.competitors[1]?.team.code ?? '';
  const t1Wins = node.competitors[0]?.won ?? 0;
  const t2Wins = node.competitors[1]?.won ?? 0;

  // Mínimo 4 juegos; si la serie sigue sin decidirse, se revela un juego más
  // por cada juego jugado (máximo 7, siempre limitado a los juegos anunciados).
  const seriesDecided = t1Wins >= 4 || t2Wins >= 4;
  const gamesToShow = seriesDecided
    ? Math.max(4, playedCount)
    : Math.min(7, Math.max(4, playedCount + 1));
  const visibleMatches = node.matches.slice(
    0,
    Math.min(node.matches.length, gamesToShow),
  );

  const rowsBlock = (
    <div className="bg-white lg:flex-1">
      {visibleMatches.length === 0 ? (
        <div
          className="font-barlow text-center"
          style={{ fontSize: 12, color: C.ink55, padding: '18px 14px' }}
        >
          Calendario por confirmar
        </div>
      ) : (
        visibleMatches.map((match, i) => (
          <GameRow
            key={match.providerId}
            n={i + 1}
            match={match}
            last={i === visibleMatches.length - 1}
            t1Code={t1Code}
            t2Code={t2Code}
            t1Wins={t1Wins}
            t2Wins={t2Wins}
            playedCount={playedCount}
          />
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
      <CardHeaderBar node={node} isFinal={isFinal} />

      {isFinal && fullWidth ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:flex-1">
          <div className="lg:border-r" style={{ borderRightColor: C.divider }}>
            <FinalHeader node={node} />
          </div>
          <div
            className="flex flex-col justify-center border-t lg:border-t-0"
            style={{ borderTopColor: C.divider }}
          >
            {!isFinalPending && rowsBlock}
          </div>
        </div>
      ) : (
        <>
          {isFinal ? <FinalHeader node={node} /> : <CardHero node={node} />}
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
  label,
  nodes,
  loading,
}: {
  label: string;
  nodes: LeaderNode[];
  loading: boolean;
}) {
  const cardClass =
    'bg-white border border-[rgba(14,20,32,0.08)] rounded-[14px] shadow-[0_1px_2px_rgba(14,20,32,0.04),0_8px_22px_rgba(14,20,32,0.05)] overflow-hidden';

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="px-5 pt-5 pb-4 space-y-3">
          <ShimmerLine height="13px" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <ShimmerLine height="20px" />
              <ShimmerLine height="12px" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-14 h-9 rounded-[8px] bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="border-t border-[rgba(15,23,31,0.06)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-5 py-[10px] ${i < 3 ? 'border-b border-[rgba(15,23,31,0.05)]' : ''}`}
            >
              <div className="w-[14px] h-3 rounded bg-gray-200 animate-pulse shrink-0" />
              <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <ShimmerLine height="14px" />
                <ShimmerLine height="11px" />
              </div>
              <div className="w-8 h-5 rounded bg-gray-200 animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const leader = nodes[0];
  const rest = nodes.slice(1);

  if (!leader) return null;

  return (
    <div className={cardClass}>
      <div className="px-5 pt-5 pb-4">
        <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.55)] mb-3">
          {label}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-special-gothic-condensed-one text-[20px] text-[#0F171F] leading-none">
              <span className="text-[rgba(15,23,31,0.45)] mr-2">1.</span>
              {leader.player.name}
            </p>
            <div className="flex items-center gap-[6px] mt-2">
              <TeamLogoAvatar teamCode={leader.player.teamCode} size={16} />
              <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.6)]">
                {leader.player.teamName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                outline: `2px solid ${TEAM_COLOR[leader.player.teamCode] || '#0F171F'}`,
              }}
            >
              <TeamLogoAvatar teamCode={leader.player.teamCode} size={32} />
            </div>
            <span
              className="font-special-gothic-condensed-one text-white text-[20px] px-3 py-1 rounded-[8px] tabular-nums"
              style={{ backgroundColor: '#E51F1F' }}
            >
              {leader.value.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(15,23,31,0.06)]">
        {rest.map((row, i) => (
          <div
            key={row.player.providerId}
            className={`flex items-center gap-3 px-5 py-[10px] ${i !== rest.length - 1 ? 'border-b border-[rgba(15,23,31,0.05)]' : ''}`}
          >
            <span className="font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] w-[14px] tabular-nums">
              {i + 2}
            </span>
            <div
              className="rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center shrink-0"
              style={{
                width: 28,
                height: 28,
                outline: `1.5px solid ${TEAM_COLOR[row.player.teamCode] || '#0F171F'}`,
              }}
            >
              <TeamLogoAvatar teamCode={row.player.teamCode} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-special-gothic-condensed-one text-[14px] text-[#0F171F] leading-tight truncate">
                {row.player.name}
              </p>
              <p className="font-barlow text-[11px] text-[rgba(15,23,31,0.55)] truncate">
                {row.player.teamName}
              </p>
            </div>
            <span className="font-special-gothic-condensed-one text-[18px] text-[#0F171F] tabular-nums shrink-0">
              {row.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Líderes section ──────────────────────────────────────────────────────────
function PlayoffsLeadersSection() {
  return (
    <section className="bg-[#f2f2f3] border-t border-[rgba(15,23,31,0.06)]">
      <div className="container py-12 lg:py-16">
        <h2 className="font-special-gothic-condensed-one text-[#0F171F] text-[28px] lg:text-[36px] tracking-[-0.3px]">
          Líderes de Playoffs 2026
        </h2>
        <div className="mb-4 lg:mb-6">
          <p className="font-barlow text-[14px] lg:text-[15px] text-[rgba(15,23,31,0.6)] mt-2">
            Los más productivos en la postemporada hasta el momento.
          </p>
        </div>
        <div className="bsn-playoffs-leaders-section">
          <SportRadarPlayoffsLeadersWidget />
        </div>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayoffsPageClient() {
  const { nodes } = usePlayoffsSeries();

  const final = nodes.find((s) => s.round === 3);
  const semifinals = nodes.filter((s) => s.round === 2);
  const cuartos = nodes.filter((s) => s.round === 1);

  return (
    <>
      {/* ── Estado de las series — light blade ───────────────────────────── */}
      <section
        className="bg-[#F4F5F7] border-b border-[rgba(0,0,0,0.06)]"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        <div className="mx-auto px-4 lg:px-6" style={{ maxWidth: 1156 }}>
          <h2 className="font-special-gothic-condensed-one text-[28px] lg:text-[36px] text-[#0F171F] text-center tracking-[-0.3px]">
            Estado de las series
          </h2>

          <div
            className="mt-7 lg:mt-10 grid grid-cols-1 lg:grid-cols-2"
            style={{ columnGap: 20, rowGap: 24 }}
          >
            {cuartos.map((s) => (
              <SeriesCard key={s.providerId} node={s} />
            ))}
            {semifinals.map((s) => (
              <SeriesCard key={s.providerId} node={s} />
            ))}
            {final && <SeriesCard node={final} fullWidth />}
          </div>
        </div>
      </section>

      {/* ── Líderes de Playoffs 2026 ─────────────────────────────────────── */}
      <PlayoffsLeadersSection />
    </>
  );
}
