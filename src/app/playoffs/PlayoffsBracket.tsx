'use client';

import { useEffect, useState } from 'react';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import {
  usePlayoffsBracket,
  type SeriesNode,
} from '@/playoffs/hooks/usePlayoffsBracket';

const BR = {
  cols: [220, 232, 248, 232, 220] as const,
  gap: 35,
  qfH: 138,
  vGapQF: 45,
};
const BR_W = BR.cols.reduce((a, b) => a + b, 0) + BR.gap * 4;

const GLASS_CARD =
  'bg-[rgba(54,54,54,0.28)] lg:bg-[rgba(54,54,54,0.18)] ' +
  'lg:[backdrop-filter:blur(40px)] lg:[-webkit-backdrop-filter:blur(40px)] ' +
  'border border-[rgba(180,180,180,0.22)] rounded-[10px] overflow-hidden ' +
  'shadow-[0_8px_18px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]';

type CardTeam = { code: string; name: string; wins: number; position: number };

function BracketRow({
  team,
  score,
  dim,
  won,
  big = false,
  group,
}: {
  team: { code: string; name: string; position: number };
  score: number;
  dim: boolean;
  won: boolean;
  big?: boolean;
  group?: string | null;
}) {
  return (
    <div
      className="flex items-center gap-[12px] transition-opacity duration-200"
      style={{
        padding: big ? '15px 18px' : '13px 15px',
        opacity: dim ? 0.55 : 1,
      }}
    >
      <TeamLogoAvatar teamCode={team.code} size={big ? 38 : 30} />
      <div className="flex-1 min-w-0 flex flex-col">
        <span
          className="font-special-gothic-condensed-one text-white leading-none truncate"
          style={{ fontSize: big ? 20 : 17, letterSpacing: 0.3 }}
        >
          {team.name}
        </span>
        <span
          className="font-barlow text-white/45"
          style={{ fontSize: 12, letterSpacing: 0.4, marginTop: 3 }}
        >
          {team.position ? `#${team.position}` : ''}
          {group ? ` · ${group}` : ''}
        </span>
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

function BracketCard({
  team1,
  team2,
  group,
  big = false,
}: {
  team1: CardTeam;
  team2: CardTeam;
  group: string | null;
  big?: boolean;
}) {
  const t1w = team1.wins;
  const t2w = team2.wins;
  const completed = t1w === 4 || t2w === 4;
  const t1Won = completed && t1w > t2w;
  const t2Won = completed && t2w > t1w;
  return (
    <div className={GLASS_CARD}>
      <BracketRow
        team={team1}
        score={t1w}
        dim={t2Won}
        won={t1Won}
        big={big}
        group={group}
      />
      <div className="h-px bg-white/[0.08]" />
      <BracketRow
        team={team2}
        score={t2w}
        dim={t1Won}
        won={t2Won}
        big={big}
        group={group}
      />
    </div>
  );
}

function PendingFinalCardRow() {
  return (
    <div
      className="flex items-center"
      style={{ padding: '15px 18px', height: BR.qfH / 2 }}
    >
      <div
        className="rounded-full shrink-0"
        style={{
          width: 44,
          height: 44,
          border: '1.5px dashed rgba(255,255,255,0.30)',
        }}
      />
    </div>
  );
}

function PendingFinalCard() {
  return (
    <div className={GLASS_CARD}>
      <PendingFinalCardRow />
      <div className="h-px bg-white/[0.08]" />
      <PendingFinalCardRow />
    </div>
  );
}

function HalfPendingCard({ team }: { team: { code: string; name: string } }) {
  return (
    <div className={GLASS_CARD}>
      <div
        className="flex items-center gap-[12px]"
        style={{ padding: '13px 15px' }}
      >
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
          style={{
            width: 30,
            height: 30,
            border: '1.5px dashed rgba(255,255,255,0.30)',
          }}
        />
      </div>
    </div>
  );
}

function BracketConnectors({ height }: { height: number }) {
  const x: { left: number; right: number; mid: number }[] = [];
  let cur = 0;
  for (let i = 0; i < BR.cols.length; i += 1) {
    x.push({ left: cur, right: cur + BR.cols[i], mid: cur + BR.cols[i] / 2 });
    cur += BR.cols[i] + BR.gap;
  }
  const qfTopY = BR.qfH / 2;
  const qfBotY = BR.qfH + BR.vGapQF + BR.qfH / 2;
  const midY = height / 2;

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
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    >
      <path
        d={elbow(x[0].right, qfTopY, x[1].left, midY)}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={elbow(x[0].right, qfBotY, x[1].left, midY)}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={`M ${x[1].right} ${midY} L ${x[2].left} ${midY}`}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={elbow(x[4].left, qfTopY, x[3].right, midY)}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={elbow(x[4].left, qfBotY, x[3].right, midY)}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={`M ${x[3].left} ${midY} L ${x[2].right} ${midY}`}
        stroke={stroke}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>
  );
}

function renderCard(node: SeriesNode | undefined, big = false) {
  if (!node) return <PendingFinalCard />;
  if (node.competitors.length >= 2) {
    const team1 = {
      code: node.competitors[0].team.code,
      name: node.competitors[0].team.nickname,
      wins: node.competitors[0].won,
      position: node.competitors[0].position,
    };
    const team2 = {
      code: node.competitors[1].team.code,
      name: node.competitors[1].team.nickname,
      wins: node.competitors[1].won,
      position: node.competitors[1].position,
    };
    return (
      <BracketCard team1={team1} team2={team2} group={node.group} big={big} />
    );
  }
  if (node.competitors.length === 1) {
    const team = {
      code: node.competitors[0].team.code,
      name: node.competitors[0].team.nickname,
    };
    return <HalfPendingCard team={team} />;
  }
  return <PendingFinalCard />;
}

type MobileRound = 1 | 2 | 3;

const MOBILE_TABS: { key: MobileRound; label: string }[] = [
  { key: 1, label: 'Cuartos' },
  { key: 2, label: 'Finales de Conf.' },
  { key: 3, label: 'Final Brava' },
];

export default function PlayoffsBracket() {
  const [mobileRound, setMobileRound] = useState<MobileRound>(2);
  const { nodes } = usePlayoffsBracket();

  const byRoundGroup = (round: number, group: string) =>
    nodes.filter((s) => s.round === round && s.group === group);

  const [aQ1, aQ2] = byRoundGroup(1, 'Grupo A');
  const [bQ1, bQ2] = byRoundGroup(1, 'Grupo B');
  const [aGF] = nodes
    .filter((s) => s.round === 2)
    .filter((s) =>
      s.competitors.some(
        (c) =>
          c.team.code === aQ1?.competitors[0]?.team.code ||
          c.team.code === aQ2?.competitors[0]?.team.code,
      ),
    );
  const [bGF] = nodes
    .filter((s) => s.round === 2)
    .filter((s) =>
      s.competitors.some(
        (c) =>
          c.team.code === bQ1?.competitors[0]?.team.code ||
          c.team.code === bQ2?.competitors[0]?.team.code,
      ),
    );
  const [final] = nodes.filter((s) => s.round === 3);

  const qfTotal = 2 * BR.qfH + BR.vGapQF;
  const colsTemplate = BR.cols.map((c) => `${c}fr`).join(' ');
  const gapPct = `${(BR.gap / BR_W) * 100}%`;

  const columnLabels = [
    { l: 'Cuartos de Final A', bright: false },
    { l: 'Finales Conferencia A', bright: false },
    { l: 'Final Brava', bright: true },
    { l: 'Finales Conferencia B', bright: false },
    { l: 'Cuartos de Final B', bright: false },
  ];

  return (
    <div>
      {/* ── Desktop bracket ───────────────────────────────────────────────── */}
      <div className="hidden lg:block w-full relative">
        <div
          className="grid"
          style={{
            gridTemplateColumns: colsTemplate,
            columnGap: gapPct,
            marginBottom: 22,
          }}
        >
          {columnLabels.map((label) => (
            <div
              key={label.l}
              className="font-barlow font-bold text-center uppercase border-b border-white/[0.08]"
              style={{
                fontSize: 13,
                letterSpacing: 1.6,
                color: label.bright
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(255,255,255,0.45)',
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
            style={{
              position: 'relative',
              zIndex: 1,
              gridTemplateColumns: colsTemplate,
              columnGap: gapPct,
            }}
          >
            <div className="flex flex-col justify-between">
              <div className="flex items-center" style={{ height: BR.qfH }}>
                <div className="w-full">{renderCard(aQ1)}</div>
              </div>
              <div className="flex items-center" style={{ height: BR.qfH }}>
                <div className="w-full">{renderCard(aQ2)}</div>
              </div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">{renderCard(aGF)}</div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">{renderCard(final, true)}</div>
            </div>
            <div className="flex items-center" style={{ height: qfTotal }}>
              <div className="w-full">{renderCard(bGF)}</div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex items-center" style={{ height: BR.qfH }}>
                <div className="w-full">{renderCard(bQ1)}</div>
              </div>
              <div className="flex items-center" style={{ height: BR.qfH }}>
                <div className="w-full">{renderCard(bQ2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bracket: tabs + stacked cards ─────────────────────────── */}
      <div className="lg:hidden">
        <div className="flex justify-center mb-4">
          <div className="inline-flex gap-[2px] p-[3px] rounded-full bg-white/[0.04] border border-white/[0.08]">
            {MOBILE_TABS.map(({ key, label }) => (
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

        {mobileRound === 1 && (
          <div className="flex flex-col gap-[18px]">
            {(['Grupo A', 'Grupo B'] as const).map((grp) => (
              <div key={grp}>
                <p
                  className="font-barlow font-bold text-white/50 uppercase mb-2 text-center"
                  style={{ fontSize: 10, letterSpacing: 1.4 }}
                >
                  {grp}
                </p>
                <div className="flex flex-col gap-[14px]">
                  {byRoundGroup(1, grp).map((s, i) => (
                    <div key={i}>{renderCard(s)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mobileRound === 2 && (
          <div className="flex flex-col gap-[18px]">
            <div>{renderCard(aGF)}</div>
            <div>{renderCard(bGF)}</div>
          </div>
        )}

        {mobileRound === 3 && (
          <div>
            {renderCard(final, true)}
          </div>
        )}
      </div>
    </div>
  );
}
