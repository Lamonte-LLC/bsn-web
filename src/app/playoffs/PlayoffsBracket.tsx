'use client';

import { useState } from 'react';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { SERIES_DATA, MOBILE_ROUNDS, type Series, type Round, type MobileRound } from './data';

// ─── Series status line ───────────────────────────────────────────────────────
function seriesStatusLine(s: Series): string | null {
  if (s.status === 'UPCOMING') return null;
  const w1 = s.team1.wins;
  const w2 = s.team2.wins;
  if (s.status === 'COMPLETED') {
    const winner = w1 > w2 ? s.team1 : s.team2;
    const loserWins = Math.min(w1, w2);
    return `${winner.code} gana ${winner.wins}-${loserWins}`;
  }
  if (w1 === w2) return `Empate a ${w1}`;
  const leader = w1 > w2 ? s.team1 : s.team2;
  const trailer = w1 > w2 ? s.team2 : s.team1;
  return `${leader.code} lidera ${leader.wins}-${trailer.wins}`;
}

// ─── Bracket card ─────────────────────────────────────────────────────────────
function BracketCard({ series, highlight = false }: { series: Series; highlight?: boolean }) {
  const isFinal = series.round === 'FINAL';
  const isPending = series.status === 'UPCOMING' && series.team1.seed === 0;
  const completed = series.status === 'COMPLETED';
  const t1wins = series.team1.wins;
  const t2wins = series.team2.wins;
  const t1winner = completed && t1wins > t2wins;
  const t2winner = completed && t2wins > t1wins;
  const statusLine = seriesStatusLine(series);

  // Refined layered shadow — broadcast-grade depth without the harshness.
  const shadow =
    'shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_6px_18px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.14)]';

  if (isFinal && isPending) {
    // Solid hairline border (no dotted), centered ghost matchup.
    return (
      <div className={`rounded-[10px] overflow-hidden bg-white/[0.04] border border-white/10 ${shadow} ${highlight ? 'ring-1 ring-white/25' : ''}`}>
        <div className="px-4 py-[18px] text-center">
          <p className="font-special-gothic-condensed-one text-white/65 text-[18px] lg:text-[20px] leading-none tracking-[0.06em]">
            Ganador SF1
          </p>
          <p className="font-barlow text-white/35 text-[10px] tracking-[0.18em] uppercase my-[7px]">
            vs
          </p>
          <p className="font-special-gothic-condensed-one text-white/65 text-[18px] lg:text-[20px] leading-none tracking-[0.06em]">
            Ganador SF2
          </p>
        </div>
        <div className="px-4 py-[7px] border-t border-white/8 bg-white/[0.015]">
          <p className="font-barlow font-medium text-[10px] text-white/45 text-center tracking-[0.06em]">
            {series.nextGame ? `Comienza ${series.nextGame.date} · ${series.nextGame.venue}` : 'Por definir'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`rounded-[10px] overflow-hidden bg-white/[0.04] border border-white/10 ${shadow} ${highlight ? 'ring-1 ring-white/25' : ''}`}>
        {/* Team 1 */}
        <div className={`flex items-center gap-3 px-4 py-[14px] border-b border-white/8 transition-opacity ${t2winner ? 'opacity-40' : ''}`}>
          {!isFinal && (
            <span className="font-barlow font-medium text-[10px] text-white/45 w-[20px] shrink-0 text-center tabular-nums tracking-[0.06em]">
              {series.team1.seed}{series.group}
            </span>
          )}
          <TeamLogoAvatar teamCode={series.team1.code} size={26} />
          <span className="font-special-gothic-condensed-one text-[18px] lg:text-[22px] text-white grow leading-none truncate uppercase tracking-[0.08em]">
            {series.team1.code || series.team1.name}
          </span>
          <span className={`font-special-gothic-condensed-one text-[28px] lg:text-[32px] leading-none shrink-0 tabular-nums ${
            t1winner ? 'text-white' : completed ? 'text-white/30' : 'text-white/55'
          }`}>
            {t1wins}
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center gap-3 px-4 py-[14px] transition-opacity ${t1winner ? 'opacity-40' : ''}`}>
          {!isFinal && (
            <span className="font-barlow font-medium text-[10px] text-white/45 w-[20px] shrink-0 text-center tabular-nums tracking-[0.06em]">
              {series.team2.seed}{series.group}
            </span>
          )}
          <TeamLogoAvatar teamCode={series.team2.code} size={26} />
          <span className="font-special-gothic-condensed-one text-[18px] lg:text-[22px] text-white grow leading-none truncate uppercase tracking-[0.08em]">
            {series.team2.code || series.team2.name}
          </span>
          <span className={`font-special-gothic-condensed-one text-[28px] lg:text-[32px] leading-none shrink-0 tabular-nums ${
            t2winner ? 'text-white' : completed ? 'text-white/30' : 'text-white/55'
          }`}>
            {t2wins}
          </span>
        </div>
      </div>

      {/* Series status line under the card */}
      {statusLine && (
        <p className="mt-[7px] font-barlow font-medium text-[11px] text-white/55 tracking-[0.04em] text-center">
          {statusLine}
        </p>
      )}
    </div>
  );
}

// ─── Bracket ──────────────────────────────────────────────────────────────────
export default function PlayoffsBracket() {
  const [mobileRound, setMobileRound] = useState<MobileRound>('GRUPO_FINAL');

  const byRoundGroup = (round: Round, group: 'A' | 'B' | null) =>
    SERIES_DATA.filter((s) => s.round === round && s.group === group);

  const finalSeries = SERIES_DATA.find((s) => s.round === 'FINAL')!;

  return (
    <div>
      {/* Round-header rail (desktop) */}
      <div className="hidden lg:grid grid-cols-[1fr_1fr_1.15fr_1fr_1fr] gap-x-6 mb-5">
        {[
          'Cuartos · Grupo A',
          'Final Conferencia · Grupo A',
          'Final BSN',
          'Final Conferencia · Grupo B',
          'Cuartos · Grupo B',
        ].map((label) => (
          <p
            key={label}
            className="font-barlow font-semibold text-[10px] text-white/45 text-center tracking-[0.18em] uppercase pb-3 border-b border-white/8"
          >
            {label}
          </p>
        ))}
      </div>

      {/* Desktop bracket grid */}
      <div className="hidden lg:grid grid-cols-[1fr_1fr_1.15fr_1fr_1fr] gap-x-6 items-stretch">
        {/* Cuartos A */}
        <div className="flex flex-col gap-7 justify-center">
          {byRoundGroup('CUARTOS', 'A').map((s) => (
            <BracketCard key={s.id} series={s} />
          ))}
        </div>
        {/* Final Conf A */}
        <div className="flex flex-col justify-center">
          {byRoundGroup('GRUPO_FINAL', 'A').map((s) => (
            <BracketCard key={s.id} series={s} />
          ))}
        </div>
        {/* Final BSN */}
        <div className="flex flex-col justify-center">
          <BracketCard series={finalSeries} highlight />
        </div>
        {/* Final Conf B */}
        <div className="flex flex-col justify-center">
          {byRoundGroup('GRUPO_FINAL', 'B').map((s) => (
            <BracketCard key={s.id} series={s} />
          ))}
        </div>
        {/* Cuartos B */}
        <div className="flex flex-col gap-7 justify-center">
          {byRoundGroup('CUARTOS', 'B').map((s) => (
            <BracketCard key={s.id} series={s} />
          ))}
        </div>
      </div>

      {/* ─── Mobile bracket: dark-on-dark tabs + grouped stacks ─────────── */}
      <div className="lg:hidden">
        {/* Tabs */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex gap-[2px] p-[3px] rounded-full bg-white/[0.04] border border-white/8">
            {MOBILE_ROUNDS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMobileRound(key)}
                className={`px-[14px] py-[6px] rounded-full font-barlow font-semibold text-[11px] tracking-[0.06em] uppercase transition-all duration-200 ${
                  mobileRound === key
                    ? 'bg-white text-[#0F171F] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                    : 'text-white/55 hover:text-white/85'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mobileRound === 'CUARTOS' && (
          <div className="space-y-7">
            {(['A', 'B'] as const).map((grp) => (
              <div key={grp}>
                <p className="font-barlow font-semibold text-[10px] text-white/45 uppercase tracking-[0.18em] mb-3 text-center">
                  Grupo {grp}
                </p>
                <div className="space-y-3">
                  {byRoundGroup('CUARTOS', grp).map((s) => (
                    <BracketCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {mobileRound === 'GRUPO_FINAL' && (
          <div className="space-y-7">
            {(['A', 'B'] as const).map((grp) => (
              <div key={grp}>
                <p className="font-barlow font-semibold text-[10px] text-white/45 uppercase tracking-[0.18em] mb-3 text-center">
                  Grupo {grp}
                </p>
                <div className="space-y-3">
                  {byRoundGroup('GRUPO_FINAL', grp).map((s) => (
                    <BracketCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {mobileRound === 'FINAL' && (
          <div>
            <p className="font-barlow font-semibold text-[10px] text-white/45 uppercase tracking-[0.18em] mb-3 text-center">
              Final BSN
            </p>
            <BracketCard series={finalSeries} highlight />
          </div>
        )}
      </div>
    </div>
  );
}
