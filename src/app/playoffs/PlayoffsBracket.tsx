'use client';

import { useState } from 'react';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { SERIES_DATA, MOBILE_ROUNDS, type Series, type Round, type MobileRound } from './data';

// Slimmer cards w/ wider gutters so the bracket has more breathing room.
// Reduced from 250/263/280/263/250 (1.25× handoff scale) → ~12% narrower.
const BR = {
  cols: [220, 232, 248, 232, 220] as const,
  gap: 35,
  qfH: 138,
  vGapQF: 45,
};
const BR_W = BR.cols.reduce((a, b) => a + b, 0) + BR.gap * 4;

// Translucent bracket card: lower surface alpha so the hero bg bleeds
// through, with a slightly brighter border + a faint top-edge highlight to
// give a subtle "shiny glass" lift.
const GLASS_CARD =
  'bg-[rgba(54,54,54,0.28)] lg:bg-[rgba(54,54,54,0.18)] ' +
  'lg:[backdrop-filter:blur(40px)] lg:[-webkit-backdrop-filter:blur(40px)] ' +
  'border border-[rgba(180,180,180,0.22)] rounded-[10px] overflow-hidden ' +
  'shadow-[0_8px_18px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]';

function BracketRow({
  team,
  score,
  dim,
  won,
  big = false,
  showSeed = false,
  group,
}: {
  team: { code: string; name: string; seed: number };
  score: number;
  dim: boolean;
  won: boolean;
  big?: boolean;
  showSeed?: boolean;
  group?: 'A' | 'B' | null;
}) {
  return (
    <div
      className="flex items-center gap-[12px] transition-opacity duration-200"
      style={{ padding: big ? '15px 18px' : '13px 15px', opacity: dim ? 0.55 : 1 }}
    >
      <TeamLogoAvatar teamCode={team.code} size={big ? 38 : 30} />
      <div className="flex-1 min-w-0 flex flex-col">
        <span
          className="font-special-gothic-condensed-one text-white leading-none truncate"
          style={{ fontSize: big ? 20 : 17, letterSpacing: 0.3 }}
        >
          {team.name}
        </span>
        {showSeed && (
          <span
            className="font-barlow text-white/45"
            style={{ fontSize: 12, letterSpacing: 0.4, marginTop: 3 }}
          >
            #{team.seed}
            {group ? ` · Grupo ${group}` : ''}
          </span>
        )}
      </div>
      <span
        className="font-special-gothic-condensed-one tabular-nums leading-none"
        style={{
          fontSize: big ? 35 : 28,
          letterSpacing: 0.4,
          color: won ? '#fff' : 'rgba(255,255,255,0.72)',
        }}
      >
        {score}
      </span>
    </div>
  );
}

function BracketCard({ series, big = false }: { series: Series; big?: boolean }) {
  const t1w = series.team1.wins;
  const t2w = series.team2.wins;
  const completed = series.status === 'COMPLETED';
  const t1Won = completed && t1w > t2w;
  const t2Won = completed && t2w > t1w;
  const showSeed = series.round === 'CUARTOS';

  return (
    <div className={GLASS_CARD}>
      <BracketRow
        team={series.team1}
        score={t1w}
        dim={t2Won}
        won={t1Won}
        big={big}
        showSeed={showSeed}
        group={series.group}
      />
      <div className="h-px bg-white/[0.08]" />
      <BracketRow
        team={series.team2}
        score={t2w}
        dim={t1Won}
        won={t2Won}
        big={big}
        showSeed={showSeed}
        group={series.group}
      />
      {!completed && series.nextGame && (
        <div className="flex items-center justify-between gap-[8px] border-t border-white/[0.06]" style={{ padding: '8px 15px 10px' }}>
          <span className="font-barlow text-white/55" style={{ fontSize: 12.5, letterSpacing: 0.3 }}>
            Juego {series.games.length + 1} · {series.nextGame.date}
          </span>
          <span className="font-barlow text-white/40" style={{ fontSize: 12.5, letterSpacing: 0.3 }}>
            {series.nextGame.time}
          </span>
        </div>
      )}
    </div>
  );
}

function PendingFinalCard() {
  // Two stacked rows mirroring BracketCard's `big` layout, but with each
  // team replaced by a large dashed circle. No labels, just the placeholder.
  const Row = () => (
    <div className="flex items-center" style={{ padding: '15px 18px', height: BR.qfH / 2 }}>
      <div
        className="rounded-full shrink-0"
        style={{ width: 44, height: 44, border: '1.5px dashed rgba(255,255,255,0.30)' }}
      />
    </div>
  );
  return (
    <div className={GLASS_CARD}>
      <Row />
      <div className="h-px bg-white/[0.08]" />
      <Row />
    </div>
  );
}

function HalfPendingCard({ team }: { team: { code: string; name: string; seed: number }; group?: 'A' | 'B' | null }) {
  return (
    <div className={GLASS_CARD}>
      <div className="flex items-center gap-[12px]" style={{ padding: '13px 15px' }}>
        <TeamLogoAvatar teamCode={team.code} size={30} />
        <div className="flex-1 min-w-0">
          <span
            className="font-special-gothic-condensed-one text-white truncate leading-none"
            style={{ fontSize: 17, letterSpacing: 0.3 }}
          >
            {team.name}
          </span>
        </div>
        <span
          className="font-special-gothic-condensed-one text-white/30 tabular-nums leading-none"
          style={{ fontSize: 28, letterSpacing: 0.4 }}
        >
          —
        </span>
      </div>
      <div className="h-px bg-white/[0.08]" />
      <div className="flex items-center" style={{ padding: '13px 15px' }}>
        <div
          className="rounded-full shrink-0"
          style={{ width: 30, height: 30, border: '1.5px dashed rgba(255,255,255,0.30)' }}
        />
      </div>
    </div>
  );
}

function BracketConnectors({ height }: { height: number }) {
  // Coords in the intrinsic BR_W-wide grid; SVG uses viewBox so paths stretch
  // horizontally to fill whatever the parent grid measures.
  const x: { left: number; right: number; mid: number }[] = [];
  let cur = 0;
  for (let i = 0; i < BR.cols.length; i += 1) {
    x.push({ left: cur, right: cur + BR.cols[i], mid: cur + BR.cols[i] / 2 });
    cur += BR.cols[i] + BR.gap;
  }
  const qfTopY = BR.qfH / 2;
  const qfBotY = BR.qfH + BR.vGapQF + BR.qfH / 2;
  const midY = height / 2;

  // Original elbow: horizontal → vertical at midpoint of gutter → horizontal.
  const elbow = (x1: number, y1: number, x2: number, y2: number) => {
    const xm = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${xm} ${y1} L ${xm} ${y2} L ${x2} ${y2}`;
  };

  const stroke = 'rgba(255,255,255,0.10)';
  return (
    <svg
      viewBox={`0 0 ${BR_W} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, display: 'block' }}
    >
      {/* Left side: QF-A top + QF-A bottom → GF-A center */}
      <path d={elbow(x[0].right, qfTopY, x[1].left, midY)} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
      <path d={elbow(x[0].right, qfBotY, x[1].left, midY)} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
      {/* GF-A → FINAL */}
      <path d={`M ${x[1].right} ${midY} L ${x[2].left} ${midY}`} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />

      {/* Right side mirror: QF-B top + QF-B bottom → GF-B center */}
      <path d={elbow(x[4].left, qfTopY, x[3].right, midY)} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
      <path d={elbow(x[4].left, qfBotY, x[3].right, midY)} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
      {/* GF-B → FINAL */}
      <path d={`M ${x[3].left} ${midY} L ${x[2].right} ${midY}`} stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" />
    </svg>
  );
}

export default function PlayoffsBracket() {
  const [mobileRound, setMobileRound] = useState<MobileRound>('GRUPO_FINAL');

  const get = (id: string) => SERIES_DATA.find((s) => s.id === id);
  const aQ1 = get('A-Q1');
  const aQ2 = get('A-Q2');
  const bQ1 = get('B-Q1');
  const bQ2 = get('B-Q2');
  const aGF = get('A-GF');
  const bGF = get('B-GF');
  const final = SERIES_DATA.find((s) => s.round === 'FINAL')!;

  const qfTotal = 2 * BR.qfH + BR.vGapQF;
  // Fluid layout: columns + gap defined in `fr` of the intrinsic 1311 grid so
  // the bracket fills 100% of its parent container without overflowing.
  const colsTemplate = BR.cols.map((c) => `${c}fr`).join(' ');
  const gapPct = `${(BR.gap / BR_W) * 100}%`;

  const byRoundGroup = (round: Round, group: 'A' | 'B' | null) =>
    SERIES_DATA.filter((s) => s.round === round && s.group === group);

  return (
    <div>
      {/* ── Desktop bracket ───────────────────────────────────────────────── */}
      <div className="hidden lg:block w-full relative">
        <div
          className="grid"
          style={{ gridTemplateColumns: colsTemplate, columnGap: gapPct, marginBottom: 22 }}
        >
          {[
            { l: 'Cuartos · Grupo A', bright: false },
            { l: 'Final Grupo A', bright: false },
            { l: 'Final BSN', bright: true },
            { l: 'Final Grupo B', bright: false },
            { l: 'Cuartos · Grupo B', bright: false },
          ].map((label) => (
            <div
              key={label.l}
              className="font-barlow font-bold text-center uppercase border-b border-white/[0.08]"
              style={{
                fontSize: 13,
                letterSpacing: 1.6,
                color: label.bright ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
                paddingBottom: 12,
              }}
            >
              {label.l}
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', height: qfTotal }}>
          <BracketConnectors height={qfTotal} />
          <div
            className="grid h-full"
            style={{ position: 'relative', zIndex: 1, gridTemplateColumns: colsTemplate, columnGap: gapPct }}
          >
            {/* Each card sits in a fixed-height slot so the connector y-coords */}
            {/* (BR.qfH/2, qfTotal − BR.qfH/2, qfTotal/2) line up exactly with */}
            {/* each card's vertical centre regardless of inner content. */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center" style={{ height: BR.qfH }}>
                {aQ1 && <div className="w-full"><BracketCard series={aQ1} /></div>}
              </div>
              <div className="flex items-center" style={{ height: BR.qfH }}>
                {aQ2 && <div className="w-full"><BracketCard series={aQ2} /></div>}
              </div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">
                {aGF && (aGF.status === 'UPCOMING' ? <HalfPendingCard team={aGF.team1} group={aGF.group} /> : <BracketCard series={aGF} />)}
              </div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">
                {final.status === 'UPCOMING' ? <PendingFinalCard /> : <BracketCard series={final} big />}
              </div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">
                {bGF && (bGF.status === 'UPCOMING' ? <HalfPendingCard team={bGF.team1} group={bGF.group} /> : <BracketCard series={bGF} />)}
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex items-center" style={{ height: BR.qfH }}>
                {bQ1 && <div className="w-full"><BracketCard series={bQ1} /></div>}
              </div>
              <div className="flex items-center" style={{ height: BR.qfH }}>
                {bQ2 && <div className="w-full"><BracketCard series={bQ2} /></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bracket: tabs + stacked cards ─────────────────────────── */}
      <div className="lg:hidden">
        <div className="flex justify-center mb-4">
          <div className="inline-flex gap-[2px] p-[3px] rounded-full bg-white/[0.04] border border-white/[0.08]">
            {MOBILE_ROUNDS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMobileRound(key)}
                className={`px-[14px] py-[6px] rounded-full font-barlow font-bold uppercase transition-all duration-200 ${
                  mobileRound === key
                    ? 'bg-white text-[#0F171F] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                    : 'bg-transparent text-white/60 hover:text-white/85'
                }`}
                style={{ fontSize: 11, letterSpacing: 0.6 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mobileRound === 'CUARTOS' && (
          <div className="flex flex-col gap-[18px]">
            {(['A', 'B'] as const).map((grp) => (
              <div key={grp}>
                <p
                  className="font-barlow font-bold text-white/50 uppercase mb-2 text-center"
                  style={{ fontSize: 10, letterSpacing: 1.4 }}
                >
                  Grupo {grp}
                </p>
                <div className="flex flex-col gap-[14px]">
                  {byRoundGroup('CUARTOS', grp).map((s) => (
                    <BracketCard key={s.id} series={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mobileRound === 'GRUPO_FINAL' && (
          <div className="flex flex-col gap-[18px]">
            {(['A', 'B'] as const).map((grp) => (
              <div key={grp}>
                <p
                  className="font-barlow font-bold text-white/50 uppercase mb-2 text-center"
                  style={{ fontSize: 10, letterSpacing: 1.4 }}
                >
                  Grupo {grp}
                </p>
                {byRoundGroup('GRUPO_FINAL', grp).map((s) =>
                  s.status === 'UPCOMING' ? (
                    <HalfPendingCard key={s.id} team={s.team1} group={s.group} />
                  ) : (
                    <BracketCard key={s.id} series={s} />
                  ),
                )}
              </div>
            ))}
          </div>
        )}

        {mobileRound === 'FINAL' && (
          <div>
            <p
              className="font-barlow font-bold text-white/50 uppercase mb-2 text-center"
              style={{ fontSize: 10, letterSpacing: 1.4 }}
            >
              Final BSN
            </p>
            {final.status === 'UPCOMING' ? <PendingFinalCard /> : <BracketCard series={final} big />}
          </div>
        )}
      </div>
    </div>
  );
}
