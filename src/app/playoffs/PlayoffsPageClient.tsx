'use client';

import { useState } from 'react';
import Link from 'next/link';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';

// ─── Competition config ───────────────────────────────────────────────────────
// Update `label`, `season`, and `phase` when playoffs officially begin.
const COMPETITION = {
  label: 'Playoffs 2026',
  season: '2026',
  phase: 'PLAYOFFS', // 'REGULAR' | 'PLAYOFFS'
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SeriesStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
type Round = 'CUARTOS' | 'GRUPO_FINAL' | 'FINAL';
type MobileRound = Round;

type SeriesTeam = { code: string; name: string; seed: number; wins: number };

type Game = {
  gameNumber: number;
  homeCode: string;
  visitorCode: string;
  homeScore: number | null;
  visitorScore: number | null;
  date: string;
  status: 'UPCOMING' | 'COMPLETED';
  matchId?: string;
};

type Series = {
  id: string;
  round: Round;
  group: 'A' | 'B' | null;
  team1: SeriesTeam;
  team2: SeriesTeam;
  status: SeriesStatus;
  nextGame?: { date: string; time: string; venue: string };
  games: Game[];
};

// ─── Dummy data ───────────────────────────────────────────────────────────────
const SERIES_DATA: Series[] = [
  {
    id: 'A-Q1', round: 'CUARTOS', group: 'A',
    team1: { code: 'SCE', name: 'Cangrejeros', seed: 1, wins: 3 },
    team2: { code: 'MAN', name: 'Osos',        seed: 4, wins: 1 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'SCE', visitorCode: 'MAN', homeScore: 88,   visitorScore: 74,   date: 'Abr 5',  status: 'COMPLETED', matchId: '10001' },
      { gameNumber: 2, homeCode: 'SCE', visitorCode: 'MAN', homeScore: 92,   visitorScore: 85,   date: 'Abr 7',  status: 'COMPLETED', matchId: '10002' },
      { gameNumber: 3, homeCode: 'MAN', visitorCode: 'SCE', homeScore: 79,   visitorScore: 68,   date: 'Abr 9',  status: 'COMPLETED', matchId: '10003' },
      { gameNumber: 4, homeCode: 'MAN', visitorCode: 'SCE', homeScore: 71,   visitorScore: 90,   date: 'Abr 11', status: 'COMPLETED', matchId: '10004' },
    ],
  },
  {
    id: 'A-Q2', round: 'CUARTOS', group: 'A',
    team1: { code: 'CAG', name: 'Criollos', seed: 2, wins: 3 },
    team2: { code: 'BAY', name: 'Vaqueros', seed: 3, wins: 2 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'CAG', visitorCode: 'BAY', homeScore: 95,   visitorScore: 88,   date: 'Abr 5',  status: 'COMPLETED', matchId: '10005' },
      { gameNumber: 2, homeCode: 'CAG', visitorCode: 'BAY', homeScore: 80,   visitorScore: 91,   date: 'Abr 7',  status: 'COMPLETED', matchId: '10006' },
      { gameNumber: 3, homeCode: 'BAY', visitorCode: 'CAG', homeScore: 87,   visitorScore: 76,   date: 'Abr 9',  status: 'COMPLETED', matchId: '10007' },
      { gameNumber: 4, homeCode: 'BAY', visitorCode: 'CAG', homeScore: 83,   visitorScore: 94,   date: 'Abr 11', status: 'COMPLETED', matchId: '10008' },
      { gameNumber: 5, homeCode: 'CAG', visitorCode: 'BAY', homeScore: 99,   visitorScore: 88,   date: 'Abr 13', status: 'COMPLETED', matchId: '10009' },
    ],
  },
  {
    id: 'B-Q1', round: 'CUARTOS', group: 'B',
    team1: { code: 'ARE', name: 'Capitanes', seed: 1, wins: 3 },
    team2: { code: 'PON', name: 'Leones',    seed: 4, wins: 0 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'ARE', visitorCode: 'PON', homeScore: 101, visitorScore: 78,   date: 'Abr 5',  status: 'COMPLETED', matchId: '10010' },
      { gameNumber: 2, homeCode: 'ARE', visitorCode: 'PON', homeScore: 94,  visitorScore: 80,   date: 'Abr 7',  status: 'COMPLETED', matchId: '10011' },
      { gameNumber: 3, homeCode: 'PON', visitorCode: 'ARE', homeScore: 70,  visitorScore: 88,   date: 'Abr 9',  status: 'COMPLETED', matchId: '10012' },
    ],
  },
  {
    id: 'B-Q2', round: 'CUARTOS', group: 'B',
    team1: { code: 'SGE', name: 'Atléticos', seed: 2, wins: 3 },
    team2: { code: 'AGU', name: 'Santeros',  seed: 3, wins: 2 },
    status: 'COMPLETED',
    games: [
      { gameNumber: 1, homeCode: 'SGE', visitorCode: 'AGU', homeScore: 86,   visitorScore: 90,   date: 'Abr 5',  status: 'COMPLETED', matchId: '10013' },
      { gameNumber: 2, homeCode: 'SGE', visitorCode: 'AGU', homeScore: 93,   visitorScore: 81,   date: 'Abr 7',  status: 'COMPLETED', matchId: '10014' },
      { gameNumber: 3, homeCode: 'AGU', visitorCode: 'SGE', homeScore: 88,   visitorScore: 79,   date: 'Abr 9',  status: 'COMPLETED', matchId: '10015' },
      { gameNumber: 4, homeCode: 'AGU', visitorCode: 'SGE', homeScore: 85,   visitorScore: 92,   date: 'Abr 11', status: 'COMPLETED', matchId: '10016' },
      { gameNumber: 5, homeCode: 'SGE', visitorCode: 'AGU', homeScore: 97,   visitorScore: 84,   date: 'Abr 13', status: 'COMPLETED', matchId: '10017' },
    ],
  },
  {
    id: 'A-GF', round: 'GRUPO_FINAL', group: 'A',
    team1: { code: 'SCE', name: 'Cangrejeros', seed: 1, wins: 2 },
    team2: { code: 'CAG', name: 'Criollos',    seed: 2, wins: 1 },
    status: 'IN_PROGRESS',
    nextGame: { date: 'Sáb 19 de Abril', time: '7:30 PM', venue: 'Coliseo Roberto Clemente' },
    games: [
      { gameNumber: 1, homeCode: 'SCE', visitorCode: 'CAG', homeScore: 91,   visitorScore: 84,   date: 'Abr 15', status: 'COMPLETED', matchId: '10018' },
      { gameNumber: 2, homeCode: 'SCE', visitorCode: 'CAG', homeScore: 78,   visitorScore: 89,   date: 'Abr 17', status: 'COMPLETED', matchId: '10019' },
      { gameNumber: 3, homeCode: 'CAG', visitorCode: 'SCE', homeScore: 83,   visitorScore: 97,   date: 'Abr 18', status: 'COMPLETED', matchId: '10020' },
      { gameNumber: 4, homeCode: 'CAG', visitorCode: 'SCE', homeScore: null, visitorScore: null, date: 'Abr 19', status: 'UPCOMING',  matchId: '10021' },
    ],
  },
  {
    id: 'B-GF', round: 'GRUPO_FINAL', group: 'B',
    team1: { code: 'ARE', name: 'Capitanes', seed: 1, wins: 1 },
    team2: { code: 'SGE', name: 'Atléticos', seed: 2, wins: 1 },
    status: 'IN_PROGRESS',
    nextGame: { date: 'Dom 20 de Abril', time: '5:00 PM', venue: 'Coliseo José Miguel Agrelot' },
    games: [
      { gameNumber: 1, homeCode: 'ARE', visitorCode: 'SGE', homeScore: 88,   visitorScore: 80,   date: 'Abr 15', status: 'COMPLETED', matchId: '10022' },
      { gameNumber: 2, homeCode: 'ARE', visitorCode: 'SGE', homeScore: 79,   visitorScore: 91,   date: 'Abr 17', status: 'COMPLETED', matchId: '10023' },
      { gameNumber: 3, homeCode: 'SGE', visitorCode: 'ARE', homeScore: null, visitorScore: null, date: 'Abr 20', status: 'UPCOMING',  matchId: '10024' },
    ],
  },
  {
    id: 'FINAL', round: 'FINAL', group: null,
    team1: { code: 'SCE', name: 'Grupo A', seed: 0, wins: 0 },
    team2: { code: 'ARE', name: 'Grupo B', seed: 0, wins: 0 },
    status: 'UPCOMING',
    games: [],
  },
];

const LEADERS_DATA = [
  { player: { providerId: 'p1', name: 'José Juan Barea', teamCode: 'SCE', avatarUrl: '' }, value: 22.4 },
  { player: { providerId: 'p2', name: 'Tremont Waters',  teamCode: 'ARE', avatarUrl: '' }, value: 20.8 },
  { player: { providerId: 'p3', name: 'Isaiah Piñeiro',  teamCode: 'CAG', avatarUrl: '' }, value: 18.5 },
  { player: { providerId: 'p4', name: 'Gary Browne',     teamCode: 'SGE', avatarUrl: '' }, value: 17.9 },
  { player: { providerId: 'p5', name: 'Rafael Barrios',  teamCode: 'AGU', avatarUrl: '' }, value: 16.2 },
];

const TEAM_LOGO_MAP: Record<string, string> = {
  AGU: 'Aguada', ARE: 'Arecibo', BAY: 'Bayamon', CAG: 'Caguas',
  CAR: 'Carolina', GBO: 'Guaynabo', MAN: 'Manati', MAY: 'Mayaguez',
  PON: 'Ponce', QUE: 'Quebradillas', SGE: 'San-German', SCE: 'Santurce',
};

const LEADER_CATEGORIES = [
  { code: 'PPG', label: 'Puntos' },
  { code: 'RPG', label: 'Rebotes' },
  { code: 'APG', label: 'Asistencias' },
];

const MOBILE_ROUNDS: { key: MobileRound; label: string }[] = [
  { key: 'CUARTOS',     label: 'Cuartos' },
  { key: 'GRUPO_FINAL', label: 'Final de Grupo' },
  { key: 'FINAL',       label: 'La Final Brava' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeriesStatusText({ series }: { series: Series }) {
  const total = series.team1.wins + series.team2.wins;
  if (series.status === 'UPCOMING') {
    return <span className="font-barlow text-[13px] text-[rgba(15,23,31,0.5)]">Por jugar</span>;
  }
  if (series.status === 'COMPLETED') {
    const winner = series.team1.wins > series.team2.wins ? series.team1 : series.team2;
    return (
      <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)]">
        {winner.name} gana {winner.wins}-{Math.min(series.team1.wins, series.team2.wins)}
      </span>
    );
  }
  const leader = series.team1.wins >= series.team2.wins ? series.team1 : series.team2;
  const trailer = series.team1.wins >= series.team2.wins ? series.team2 : series.team1;
  if (leader.wins === trailer.wins) {
    return (
      <span className="font-barlow font-semibold text-[13px] text-[rgba(15,23,31,0.85)]">
        Serie empatada {leader.wins}-{trailer.wins} · JJ{total + 1}
      </span>
    );
  }
  return (
    <span className="font-barlow font-semibold text-[13px] text-[rgba(15,23,31,0.85)]">
      {leader.name} lidera {leader.wins}-{trailer.wins} · JJ{total + 1}
    </span>
  );
}

// NBA-style bracket card: each team is one horizontal row
function BracketCard({ series, highlight = false }: { series: Series; highlight?: boolean }) {
  const isFinal = series.round === 'FINAL';
  const isPending = series.status === 'UPCOMING' && series.team1.seed === 0;
  const completed = series.status === 'COMPLETED';
  const t1wins = series.team1.wins;
  const t2wins = series.team2.wins;
  const t1winner = completed && t1wins > t2wins;
  const t2winner = completed && t2wins > t1wins;

  if (isFinal && isPending) {
    return (
      <div className={`bg-white rounded-[12px] overflow-hidden shadow-[0px_2px_14px_rgba(14,20,32,0.08)] ${highlight ? 'ring-2 ring-[#0F171F]' : 'border border-[rgba(14,20,32,0.1)]'}`}>
        <div className="flex items-center gap-3 px-4 py-[13px] border-b border-[rgba(0,0,0,0.07)]">
          <div className="w-[28px] h-[28px] rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center shrink-0">
            <span className="font-special-gothic-condensed-one text-[13px] text-[rgba(15,23,31,0.35)]">A</span>
          </div>
          <span className="font-special-gothic-condensed-one text-[16px] text-[rgba(15,23,31,0.35)] grow">Ganador Grupo A</span>
          <span className="font-special-gothic-condensed-one text-[22px] text-[rgba(15,23,31,0.2)] tabular-nums">—</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-[13px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[rgba(15,23,31,0.06)] flex items-center justify-center shrink-0">
            <span className="font-special-gothic-condensed-one text-[13px] text-[rgba(15,23,31,0.35)]">B</span>
          </div>
          <span className="font-special-gothic-condensed-one text-[16px] text-[rgba(15,23,31,0.35)] grow">Ganador Grupo B</span>
          <span className="font-special-gothic-condensed-one text-[22px] text-[rgba(15,23,31,0.2)] tabular-nums">—</span>
        </div>
        <div className="px-4 py-[8px] border-t border-[rgba(0,0,0,0.07)] bg-[rgba(15,23,31,0.02)]">
          <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.45)]">Por definir</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[12px] overflow-hidden shadow-[0px_2px_14px_rgba(14,20,32,0.08)] ${highlight ? 'ring-2 ring-[#0F171F]' : 'border border-[rgba(14,20,32,0.1)]'}`}>
      {/* Team 1 row */}
      <div className={`flex items-center gap-[10px] px-4 py-[12px] border-b border-[rgba(0,0,0,0.07)] transition-opacity ${t2winner ? 'opacity-35' : ''}`}>
        {!isFinal && (
          <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.4)] w-[14px] shrink-0 text-center tabular-nums">
            {series.team1.seed}
          </span>
        )}
        <TeamLogoAvatar teamCode={series.team1.code} size={26} />
        <span className="font-special-gothic-condensed-one text-[16px] text-[#0F171F] grow leading-none truncate">
          {series.team1.name}
        </span>
        <span className={`font-special-gothic-condensed-one text-[22px] leading-none shrink-0 tabular-nums ${t1winner || (!completed && t1wins >= t2wins && series.status === 'IN_PROGRESS') ? 'text-[#0F171F]' : completed ? 'text-[rgba(15,23,31,0.3)]' : 'text-[rgba(15,23,31,0.5)]'}`}>
          {t1wins}
        </span>
      </div>
      {/* Team 2 row */}
      <div className={`flex items-center gap-[10px] px-4 py-[12px] transition-opacity ${t1winner ? 'opacity-35' : ''}`}>
        {!isFinal && (
          <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.4)] w-[14px] shrink-0 text-center tabular-nums">
            {series.team2.seed}
          </span>
        )}
        <TeamLogoAvatar teamCode={series.team2.code} size={26} />
        <span className="font-special-gothic-condensed-one text-[16px] text-[#0F171F] grow leading-none truncate">
          {series.team2.name}
        </span>
        <span className={`font-special-gothic-condensed-one text-[22px] leading-none shrink-0 tabular-nums ${t2winner || (!completed && t2wins > t1wins && series.status === 'IN_PROGRESS') ? 'text-[#0F171F]' : completed ? 'text-[rgba(15,23,31,0.3)]' : 'text-[rgba(15,23,31,0.5)]'}`}>
          {t2wins}
        </span>
      </div>
      {/* Status footer */}
      <div className="px-4 py-[8px] border-t border-[rgba(0,0,0,0.07)] bg-[rgba(15,23,31,0.015)]">
        <SeriesStatusText series={series} />
      </div>
    </div>
  );
}

function GameBubble({ game }: { game: Game }) {
  const isCompleted = game.status === 'COMPLETED';

  const inner = (
    <div className={`flex flex-col items-center gap-1 shrink-0 w-[44px] ${!isCompleted ? 'opacity-40' : ''}`}>
      <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center font-barlow font-semibold text-[12px] border
        ${isCompleted ? 'bg-[#0F171F] border-[#0F171F] text-white' : 'bg-white border-[rgba(15,23,31,0.2)] text-[rgba(15,23,31,0.45)]'}`}>
        J{game.gameNumber}
      </div>
      <span className="font-barlow text-[10px] text-[rgba(15,23,31,0.6)] text-center leading-tight tabular-nums">
        {isCompleted ? `${game.homeScore}-${game.visitorScore}` : game.date}
      </span>
    </div>
  );

  if (game.matchId) {
    return (
      <Link href={`/partidos/${game.matchId}`} className="hover:opacity-70 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}

function ActiveSeriesCard({ series }: { series: Series }) {
  return (
    <div className="bg-white border border-[rgba(14,20,32,0.1)] rounded-[14px] shadow-[0px_2px_14px_rgba(14,20,32,0.08)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-[10px]">
          <TeamLogoAvatar teamCode={series.team1.code} size={30} />
          <TeamLogoAvatar teamCode={series.team2.code} size={30} />
          <span className="font-special-gothic-condensed-one text-[18px] text-[#0F171F] leading-tight">
            {series.team1.name} vs {series.team2.name}
          </span>
        </div>
        <SeriesStatusText series={series} />
      </div>

      {/* Game bubbles */}
      <div className="flex items-end gap-[6px] overflow-x-auto no-scrollbar pb-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const game = series.games[i];
          if (game) return <GameBubble key={i} game={game} />;
          return <div key={i} className="w-[36px] h-[36px] rounded-full border border-dashed border-[rgba(15,23,31,0.1)] shrink-0" />;
        })}
        <div className="w-1 shrink-0" />
      </div>

      {/* Next game */}
      {series.nextGame && (
        <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.07)] flex items-center justify-between gap-4 flex-wrap">
          <span className="font-barlow text-[12px] text-[rgba(15,23,31,0.5)] uppercase tracking-wider shrink-0">
            Próximo juego
          </span>
          <div className="text-right">
            <p className="font-special-gothic-condensed-one text-[16px] text-[#0F171F]">
              {series.nextGame.date} · {series.nextGame.time}
            </p>
            <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.55)]">{series.nextGame.venue}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlayoffsPageClient() {
  const [mobileRound, setMobileRound] = useState<MobileRound>('GRUPO_FINAL');
  const [leaderCat, setLeaderCat] = useState('PPG');

  const byRoundGroup = (round: Round, group: 'A' | 'B' | null) =>
    SERIES_DATA.filter((s) => s.round === round && s.group === group);

  const activeSeries = SERIES_DATA.filter((s) => s.status === 'IN_PROGRESS');
  const finalSeries = SERIES_DATA.find((s) => s.round === 'FINAL')!;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-bsn border-b border-white/10">
        <div className="container">
          <div className="hidden lg:block border-b border-white/10" />
          <div className="py-8 lg:pt-[52px] lg:pb-[52px] lg:text-center">
            <div className="flex lg:justify-center mb-3">
              <span className="inline-flex items-center px-3 py-[3px] rounded-full border border-white/20 font-barlow font-medium text-[11px] text-white/50 uppercase tracking-widest">
                {COMPETITION.season}
              </span>
            </div>
            <h1 className="font-special-gothic-condensed-one text-white text-[48px] lg:text-[72px] tracking-[0.3px] leading-none">
              {COMPETITION.label}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Active series ─────────────────────────────────────────────────── */}
      {activeSeries.length > 0 && (
        <div className="bg-[#f2f2f3] border-b border-[rgba(0,0,0,0.08)]">
          <div className="container py-6 lg:py-8">
            <h2 className="font-special-gothic-condensed-one text-[24px] lg:text-[28px] text-[#0F171F] mb-4">
              Series activas
            </h2>
            {/* Mobile: swipe carousel */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 lg:hidden">
              {activeSeries.map((s) => (
                <div key={s.id} className="shrink-0 w-[calc(100vw-48px)]">
                  <ActiveSeriesCard series={s} />
                </div>
              ))}
            </div>
            {/* Desktop: stacked */}
            <div className="hidden lg:flex lg:flex-col gap-4">
              {activeSeries.map((s) => <ActiveSeriesCard key={s.id} series={s} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Bracket ──────────────────────────────────────────────────────── */}
      <div className="bg-[#fdfdfd]">
        <div className="container py-8 lg:py-14">

          {/* Section title + mobile tabs */}
          <div className="flex items-center justify-between mb-6 lg:mb-10">
            <h2 className="font-special-gothic-condensed-one text-[24px] lg:text-[28px] text-[#0F171F]">
              Bracket
            </h2>
            {/* Mobile round tabs */}
            <div className="flex gap-[3px] p-[3px] bg-[rgba(15,23,31,0.06)] rounded-full lg:hidden">
              {MOBILE_ROUNDS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMobileRound(key)}
                  className={`px-3 py-[5px] rounded-full text-[12px] font-barlow font-medium transition-all ${
                    mobileRound === key
                      ? 'bg-white text-[#0F171F] shadow-[0px_1px_4px_rgba(0,0,0,0.12)]'
                      : 'text-[rgba(15,23,31,0.5)] hover:text-[#0F171F]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Desktop bracket ──────────────────────────────────────────── */}
          <div className="hidden lg:block overflow-x-auto">
            {/* Round + group headers */}
            <div className="flex min-w-[860px] mb-2">
              <div className="w-[210px] shrink-0 text-center">
                <p className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.55)]">Cuartos de Final</p>
                <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.35)] mt-[2px]">Grupo A</p>
              </div>
              <div className="w-[22px] shrink-0" />
              <div className="w-[210px] shrink-0 text-center">
                <p className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.55)]">Final de Grupo</p>
                <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.35)] mt-[2px]">Grupo A</p>
              </div>
              <div className="w-[22px] shrink-0" />
              <div className="flex-1 min-w-[200px] text-center">
                <p className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.55)]">La Final Brava</p>
              </div>
              <div className="w-[22px] shrink-0" />
              <div className="w-[210px] shrink-0 text-center">
                <p className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.55)]">Final de Grupo</p>
                <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.35)] mt-[2px]">Grupo B</p>
              </div>
              <div className="w-[22px] shrink-0" />
              <div className="w-[210px] shrink-0 text-center">
                <p className="font-special-gothic-condensed-one text-[15px] text-[rgba(15,23,31,0.55)]">Cuartos de Final</p>
                <p className="font-barlow text-[12px] text-[rgba(15,23,31,0.35)] mt-[2px]">Grupo B</p>
              </div>
            </div>

            {/* Bracket tree */}
            <div className="flex items-stretch min-w-[860px]">

              {/* Cuartos A */}
              <div className="w-[210px] shrink-0 flex flex-col gap-[36px] justify-center">
                {byRoundGroup('CUARTOS', 'A').map((s) => <BracketCard key={s.id} series={s} />)}
              </div>

              {/* Connector right-edge A */}
              <div className="w-[22px] shrink-0 self-stretch flex flex-col">
                <div className="flex-1 border-r-2 border-t-2 border-[rgba(15,23,31,0.1)] rounded-tr-[8px]" />
                <div className="flex-1 border-r-2 border-b-2 border-[rgba(15,23,31,0.1)] rounded-br-[8px]" />
              </div>

              {/* Final de Grupo A */}
              <div className="w-[210px] shrink-0 flex items-center">
                {byRoundGroup('GRUPO_FINAL', 'A').map((s) => <BracketCard key={s.id} series={s} />)}
              </div>

              {/* Connector A → center */}
              <div className="w-[22px] shrink-0 self-stretch flex flex-col">
                <div className="flex-1 border-t-2 border-[rgba(15,23,31,0.1)]" />
                <div className="flex-1" />
              </div>

              {/* La Final Brava */}
              <div className="flex-1 min-w-[200px] flex items-center justify-center px-2">
                <div className="w-full">
                  <BracketCard series={finalSeries} highlight />
                </div>
              </div>

              {/* Connector center → B */}
              <div className="w-[22px] shrink-0 self-stretch flex flex-col">
                <div className="flex-1 border-t-2 border-[rgba(15,23,31,0.1)]" />
                <div className="flex-1" />
              </div>

              {/* Final de Grupo B */}
              <div className="w-[210px] shrink-0 flex items-center">
                {byRoundGroup('GRUPO_FINAL', 'B').map((s) => <BracketCard key={s.id} series={s} />)}
              </div>

              {/* Connector left-edge B */}
              <div className="w-[22px] shrink-0 self-stretch flex flex-col">
                <div className="flex-1 border-l-2 border-t-2 border-[rgba(15,23,31,0.1)] rounded-tl-[8px]" />
                <div className="flex-1 border-l-2 border-b-2 border-[rgba(15,23,31,0.1)] rounded-bl-[8px]" />
              </div>

              {/* Cuartos B */}
              <div className="w-[210px] shrink-0 flex flex-col gap-[36px] justify-center">
                {byRoundGroup('CUARTOS', 'B').map((s) => <BracketCard key={s.id} series={s} />)}
              </div>

            </div>
          </div>

          {/* ── Mobile bracket ───────────────────────────────────────────── */}
          <div className="lg:hidden">

            {mobileRound === 'CUARTOS' && (
              <div className="flex flex-col gap-6">
                {(['A', 'B'] as const).map((grp) => (
                  <div key={grp}>
                    <p className="font-special-gothic-condensed-one text-[18px] text-[rgba(15,23,31,0.6)] mb-3">
                      Grupo {grp}
                    </p>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                      {byRoundGroup('CUARTOS', grp).map((s) => (
                        <div key={s.id} className="shrink-0 w-[calc(55vw+10px)] min-w-[210px]">
                          <BracketCard series={s} />
                        </div>
                      ))}
                      <div className="w-1 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mobileRound === 'GRUPO_FINAL' && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                {(['A', 'B'] as const).map((grp) => (
                  <div key={grp} className="shrink-0 w-[calc(55vw+10px)] min-w-[210px]">
                    <p className="font-special-gothic-condensed-one text-[18px] text-[rgba(15,23,31,0.6)] mb-3">
                      Grupo {grp}
                    </p>
                    {byRoundGroup('GRUPO_FINAL', grp).map((s) => (
                      <BracketCard key={s.id} series={s} />
                    ))}
                  </div>
                ))}
                <div className="w-1 shrink-0" />
              </div>
            )}

            {mobileRound === 'FINAL' && (
              <BracketCard series={finalSeries} highlight />
            )}

          </div>
        </div>
      </div>

      {/* ── Playoffs Leaders ─────────────────────────────────────────────── */}
      <div className="bg-[#f2f2f3] border-t border-[rgba(0,0,0,0.08)]">
        <div className="container py-8 lg:py-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-special-gothic-condensed-one text-[24px] lg:text-[28px] text-[#0F171F]">
              Líderes de Playoffs
            </h2>
            <span className="hidden lg:block font-barlow text-[13px] text-[rgba(0,0,0,0.45)]">
              {COMPETITION.season} · Playoffs · Promedios
            </span>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
            {LEADER_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setLeaderCat(cat.code)}
                className={`flex-none px-[18px] py-[7px] rounded-full border text-[15px] font-special-gothic-condensed-one tracking-[0.3px] whitespace-nowrap transition-colors ${
                  leaderCat === cat.code
                    ? 'bg-[#0F171F] border-[#0F171F] text-white'
                    : 'bg-white border-[rgba(14,20,32,0.18)] text-[#0F171F] hover:border-[#0F171F]/50 hover:bg-[#f8f8f8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[14px] border border-[rgba(14,20,32,0.1)] shadow-[0px_2px_14px_rgba(14,20,32,0.07)] overflow-hidden">
            <div className="grid grid-cols-[48px_1fr_80px_64px] items-center px-4 py-[10px] border-b border-[rgba(0,0,0,0.08)]">
              <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.5)] tracking-[1px] uppercase text-center">#</span>
              <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.5)] tracking-[1px] uppercase">Jugador</span>
              <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.5)] tracking-[1px] uppercase text-center">Equipo</span>
              <span className="font-special-gothic-condensed-one text-[12px] text-[rgba(0,0,0,0.5)] tracking-[1px] uppercase text-right">
                {LEADER_CATEGORIES.find((c) => c.code === leaderCat)?.code}
              </span>
            </div>

            {LEADERS_DATA.map((item, index) => (
              <Link
                key={item.player.providerId}
                href={`/jugadores/${item.player.providerId}`}
                className={`grid grid-cols-[48px_1fr_80px_64px] items-center px-4 py-[11px] transition-colors ${
                  index % 2 === 1 ? 'bg-[#f9f9f9] hover:bg-[#f2f2f2]' : 'hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="font-barlow-condensed text-[15px] text-[rgba(0,0,0,0.6)] text-center tabular-nums">
                  {index + 1}
                </span>
                <div className="flex items-center gap-[10px] pr-2">
                  <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 34, height: 34, outline: '0.5px solid rgba(81,81,81,0.18)' }}>
                    <PlayerPhotoAvatar photoUrl={item.player.avatarUrl} size={34} name={item.player.name} />
                  </div>
                  <span className="font-special-gothic-condensed-one text-[16px] text-[#0F171F] leading-tight">
                    {item.player.name}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-[5px]">
                  {TEAM_LOGO_MAP[item.player.teamCode] && (
                    <img src={`/assets/images/teams/${TEAM_LOGO_MAP[item.player.teamCode]}.png`} alt={item.player.teamCode} width={20} height={20} className="object-contain" />
                  )}
                  <span className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)]">
                    {item.player.teamCode}
                  </span>
                </div>
                <span className="font-special-gothic-condensed-one text-[24px] text-[#0F171F] text-right tabular-nums leading-none">
                  {item.value.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
