'use client';

import cx from 'classnames';
import { cls } from '@/archivo/lib/tokens';
import ClubMark from '@/historia/components/ClubMark';
import { usePlayerMatches } from '@/player/client/hooks/player';
import type { PlayerMatchType } from '@/player/types';
import { formatDate } from '@/utils/date-formatter';
import { f1 } from './profile-data';

const PANEL_CARD = 'rounded-[12px] border border-[rgba(15,23,31,0.08)] bg-white';
const INK = '#0F171F';
const LOSS = '#D03535';
const WIN = '#16A14A';

type Game = { won: boolean; home: boolean; pts: number; reb: number; ast: number; opponent: { code: string; nickname: string }; date: string };

/** One game of the log as the modules read it; the player's side is whichever team is not the opponent. */
function toGame(m: PlayerMatchType): Game | null {
  const { homeTeam, visitorTeam } = m.match;
  const home = m.opponentTeam.code !== homeTeam.code;
  const own = home ? homeTeam : visitorTeam;
  const other = home ? visitorTeam : homeTeam;
  const a = parseInt(own.score, 10);
  const b = parseInt(other.score, 10);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return null;
  return { won: a > b, home, pts: m.stats.points ?? 0, reb: m.stats.reboundsTotal ?? 0, ast: m.stats.assists ?? 0, opponent: m.opponentTeam, date: m.match.startAt };
}

const avg = (xs: Game[], k: 'pts' | 'reb' | 'ast') => (xs.length ? xs.reduce((s, g) => s + g[k], 0) / xs.length : 0);

function ModuleTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-[14px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px]">
      <span className="text-[18px] leading-[1.1] text-[#0F171F]">{title}</span>
      {children}
    </div>
  );
}

/** Two groups of games face to face: bars grow from the middle outward and every value sits in its own fixed column. */
function Diverging({ title, a, b }: { title: string; a: { label: string; games: Game[] }; b: { label: string; games: Game[] } }) {
  const rows: Array<['pts' | 'reb' | 'ast', string]> = [['pts', 'Puntos'], ['reb', 'Rebotes'], ['ast', 'Asistencias']];
  const legend = (label: string, color: string, n: number) => (
    <span className="inline-flex items-center gap-[6px] font-barlow text-[12.5px] text-[rgba(15,23,31,0.6)] tabular-nums">
      <span className="h-[8px] w-[8px] rounded-full" style={{ background: color }} aria-hidden />
      {label} · {n}
    </span>
  );
  return (
    <div className={`${PANEL_CARD} px-[14px] py-[14px] lg:px-[20px] lg:py-[18px]`}>
      <ModuleTitle title={title}>
        {legend(a.label, INK, a.games.length)}
        {legend(b.label, LOSS, b.games.length)}
      </ModuleTitle>
      <div className="flex flex-col gap-[10px]">
        {rows.map(([k, label]) => {
          const va = avg(a.games, k);
          const vb = avg(b.games, k);
          const max = Math.max(va, vb, 0.1);
          return (
            <div key={k} className="grid grid-cols-[40px_1fr_84px_1fr_40px] items-center gap-[8px] lg:grid-cols-[48px_1fr_100px_1fr_48px] lg:gap-[10px]">
              <span className="text-right text-[17px] leading-none text-[#0F171F] tabular-nums lg:text-[18px]">{f1(va)}</span>
              <div className="flex justify-end"><div className="h-[10px] rounded-l-[5px]" style={{ width: `${(va / max) * 100}%`, background: INK }} /></div>
              <span className={`text-center ${cls.label}`}>{label}</span>
              <div className="flex justify-start"><div className="h-[10px] rounded-r-[5px]" style={{ width: `${(vb / max) * 100}%`, background: LOSS }} /></div>
              <span className="text-left text-[17px] leading-none text-[#0F171F] tabular-nums lg:text-[18px]">{f1(vb)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The best game in each of the main stats, with the opponent, the date and the result in the game log's colors. */
function SeasonHighs({ games }: { games: Game[] }) {
  const best = (k: 'pts' | 'reb' | 'ast') => games.reduce((m, g) => (g[k] > m[k] ? g : m), games[0]);
  const highs: Array<[string, 'pts' | 'reb' | 'ast']> = [['Puntos', 'pts'], ['Rebotes', 'reb'], ['Asistencias', 'ast']];
  return (
    <div>
      <ModuleTitle title="Máximos de la temporada" />
      <div className="grid grid-cols-1 gap-[8px] lg:grid-cols-3 lg:gap-[12px]">
        {highs.map(([label, k]) => {
          const g = best(k);
          return (
            <div key={k} className={`${PANEL_CARD} flex items-center gap-[12px] px-[14px] py-[12px] lg:px-[18px] lg:py-[14px]`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-[8px]">
                  <span className="text-[32px] leading-none text-[#0F171F] tabular-nums lg:text-[36px]">{g[k]}</span>
                  <span className={cls.label}>{label}</span>
                </div>
                <div className="mt-[6px] flex flex-wrap items-center gap-x-[7px] gap-y-[2px] font-barlow text-[13px] text-[#0F171F]">
                  <ClubMark code={g.opponent.code} color="#4A5560" size={18} />
                  <span className="font-semibold">vs {g.opponent.nickname}</span>
                  <span className="text-[rgba(15,23,31,0.5)] tabular-nums">· {formatDate(g.date, 'D MMM')}</span>
                </div>
              </div>
              <span className={cx('inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border text-[15px] leading-none', g.won ? 'border-[rgba(22,161,74,0.15)] bg-[#EBF5ED]' : 'border-[rgba(208,53,53,0.15)] bg-[#FFEDED]')} style={{ color: g.won ? WIN : LOSS }}>
                {g.won ? 'G' : 'P'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Home/away and win/loss splits plus season highs, all from the player's game log. Nothing renders until the
 * log holds real lines (the sandbox returns a single zeroed game today).
 */
export default function GameInsights({ playerProviderId }: { playerProviderId: string }) {
  const { playerMatches } = usePlayerMatches(playerProviderId, 60);
  const games = playerMatches.map(toGame).filter((g): g is Game => g !== null && g.pts + g.reb + g.ast > 0);
  if (games.length < 2) return null;
  const home = games.filter((g) => g.home);
  const away = games.filter((g) => !g.home);
  const wins = games.filter((g) => g.won);
  const losses = games.filter((g) => !g.won);
  return (
    <div className="flex flex-col gap-[22px] lg:gap-[28px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        {home.length && away.length ? <Diverging title="Local vs visitante" a={{ label: 'En casa', games: home }} b={{ label: 'De visita', games: away }} /> : null}
        {wins.length && losses.length ? <Diverging title="Victorias vs derrotas" a={{ label: 'En victorias', games: wins }} b={{ label: 'En derrotas', games: losses }} /> : null}
      </div>
      <SeasonHighs games={games} />
    </div>
  );
}
