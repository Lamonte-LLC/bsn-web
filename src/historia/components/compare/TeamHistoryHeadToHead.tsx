'use client';

import Link from 'next/link';
import cx from 'classnames';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getCompareTeam } from '@/team/components/compare/teams';
import { cls } from '@/archivo/lib/tokens';
import { bestIndexes, type SeriesBetween, type TeamHistoryFacts } from '@/historia/lib/head-to-head';

type Props = {
  codes: string[];
  facts: Record<string, TeamHistoryFacts>;
  series: SeriesBetween[];
};

type Fact = { key: keyof Pick<TeamHistoryFacts, 'titles' | 'lastTitle' | 'mvps' | 'seasons' | 'debut'>; label: string; sub: string; higherIsBetter: boolean };
const FACTS: Fact[] = [
  { key: 'titles', label: 'Títulos', sub: 'Campeonatos en su historia', higherIsBetter: true },
  { key: 'lastTitle', label: 'Último', sub: 'Año del último título', higherIsBetter: true },
  { key: 'mvps', label: 'MVP', sub: 'Jugadores más valiosos', higherIsBetter: true },
  { key: 'seasons', label: 'Temp.', sub: 'Temporadas en la liga', higherIsBetter: true },
  { key: 'debut', label: 'Debut', sub: 'Primera temporada', higherIsBetter: false },
];

const GRID_TWO = 'grid-cols-[1fr_140px_1fr] lg:grid-cols-[1fr_340px_1fr]';
const GRID_LEFT_3 = 'grid-cols-[96px_repeat(3,1fr)] lg:grid-cols-[240px_repeat(3,1fr)]';
const GRID_FOUR = 'grid-cols-[1fr_1fr_92px_1fr_1fr] lg:grid-cols-[1fr_1fr_200px_1fr_1fr]';
const ROW = 'border-b border-[rgba(15,23,31,0.06)]';

const colorOf = (code: string) => getCompareTeam(code)?.color ?? '#7D7D7D';
const fmt = (v: number | null) => (v === null ? '—' : v === 0 ? '0' : String(v));

function Dot({ color, side }: { color: string; side: 'left' | 'right' }) {
  return <span className={cx('absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full lg:h-[7px] lg:w-[7px]', side === 'left' ? '-left-[14px] lg:-left-[16px]' : '-right-[12px] lg:-right-[15px]')} style={{ backgroundColor: color }} aria-hidden />;
}

function Label({ fact, align }: { fact: Fact; align: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'px-[8px] text-center' : 'pr-[8px] text-left'}>
      <div className="text-[11px] font-semibold text-[rgba(15,23,31,0.65)] lg:text-[13px]">{fact.label}</div>
      <div className="mt-[1px] text-[9px] leading-[1.3] text-[rgba(15,23,31,0.45)] lg:text-[11px]">{fact.sub}</div>
    </div>
  );
}

function Value({ v, winner, color, side, size }: { v: string; winner: boolean; color: string; side: 'left' | 'right'; size: string }) {
  return (
    <span className={cx('relative leading-none tabular-nums', size, winner ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.25)]')}>
      {v}
      {winner ? <Dot color={color} side={side} /> : null}
    </span>
  );
}

/**
 * Backlog 13: the compared teams' history side by side, under the season stats, in the same mirror rows as the
 * panel above (best value in ink with the team's dot). Then every real playoff series between them since 2025.
 */
export default function TeamHistoryHeadToHead({ codes, facts, series }: Props) {
  const teams = codes.map((c) => facts[c]).filter((f): f is TeamHistoryFacts => Boolean(f));
  if (teams.length < 2) return null;
  const n = teams.length;
  const grid = n === 2 ? GRID_TWO : n === 3 ? GRID_LEFT_3 : GRID_FOUR;

  const row = (fact: Fact) => {
    const values = teams.map((t) => t[fact.key]);
    const winners = bestIndexes(values, fact.higherIsBetter);
    const cell = (i: number, side: 'left' | 'right', size: string, align = 'text-center') => (
      <div key={teams[i].code} className={align}>
        <Value v={fmt(values[i])} winner={winners.includes(i)} color={colorOf(teams[i].code)} side={side} size={size} />
      </div>
    );
    if (n === 2)
      return (
        <div key={fact.key} className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[13px]', grid, ROW)}>
          {cell(0, 'left', 'text-[22px] lg:text-[30px]', 'text-right')}
          <Label fact={fact} align="center" />
          {cell(1, 'right', 'text-[22px] lg:text-[30px]', 'text-left')}
        </div>
      );
    if (n === 3)
      return (
        <div key={fact.key} className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[14px]', grid, ROW)}>
          <Label fact={fact} align="left" />
          {teams.map((_, i) => cell(i, 'right', 'text-[18px] lg:text-[28px]'))}
        </div>
      );
    return (
      <div key={fact.key} className={cx('grid items-center py-[12px] last:border-b-0 lg:py-[14px]', grid, ROW)}>
        {cell(0, 'right', 'text-[16px] lg:text-[26px]')}
        {cell(1, 'right', 'text-[16px] lg:text-[26px]')}
        <Label fact={fact} align="center" />
        {cell(2, 'right', 'text-[16px] lg:text-[26px]')}
        {cell(3, 'right', 'text-[16px] lg:text-[26px]')}
      </div>
    );
  };

  return (
    <div className="mt-[16px] rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[18px] pt-[6px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:mt-[24px] lg:px-[44px] lg:pb-[30px] lg:pt-[10px]">
      <div className="flex items-center gap-[12px] pb-[4px] pt-[16px] lg:gap-[14px] lg:pb-[8px] lg:pt-[22px]">
        <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
        <span className="text-[17px] tracking-[0.3px] text-[#0F171F] lg:text-[20px]">Cara a cara histórico</span>
        <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
      </div>
      <div className={cx('grid items-center pb-[6px] pt-[8px] lg:pt-[12px]', grid)}>
        {n === 2 ? (
          <>
            <div className="flex justify-end">
              <Link href={`/equipos/${teams[0].code}?tab=historia`} className={`inline-flex items-center gap-[8px] rounded-[6px] font-barlow text-[12px] font-semibold text-[#0F171F] ${cls.focus}`}>
                <TeamLogoAvatar teamCode={teams[0].code} size={22} />
                {teams[0].nickname}
              </Link>
            </div>
            <span />
            <div>
              <Link href={`/equipos/${teams[1].code}?tab=historia`} className={`inline-flex items-center gap-[8px] rounded-[6px] font-barlow text-[12px] font-semibold text-[#0F171F] ${cls.focus}`}>
                {teams[1].nickname}
                <TeamLogoAvatar teamCode={teams[1].code} size={22} />
              </Link>
            </div>
          </>
        ) : (
          <>
            {n === 3 ? <span /> : null}
            {teams.slice(0, n === 4 ? 2 : n).map((t) => (
              <div key={t.code} className="flex justify-center">
                <Link href={`/equipos/${t.code}?tab=historia`} className={`rounded-full ${cls.focus}`} aria-label={`Historia de ${t.nickname}`}>
                  <TeamLogoAvatar teamCode={t.code} size={22} />
                </Link>
              </div>
            ))}
            {n === 4 ? <span /> : null}
            {n === 4
              ? teams.slice(2).map((t) => (
                  <div key={t.code} className="flex justify-center">
                    <Link href={`/equipos/${t.code}?tab=historia`} className={`rounded-full ${cls.focus}`} aria-label={`Historia de ${t.nickname}`}>
                      <TeamLogoAvatar teamCode={t.code} size={22} />
                    </Link>
                  </div>
                ))
              : null}
          </>
        )}
      </div>
      {FACTS.map(row)}

      {series.length ? (
        <>
          <div className="flex items-center gap-[12px] pb-[4px] pt-[20px] lg:gap-[14px] lg:pb-[8px] lg:pt-[26px]">
            <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
            <span className="text-[17px] tracking-[0.3px] text-[#0F171F] lg:text-[20px]">Series entre ellos</span>
            <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" aria-hidden />
          </div>
          <ol className="mx-auto max-w-[640px]">
            {series.map((s) => {
              const winA = s.winnerCode === s.a.code;
              const winB = s.winnerCode === s.b.code;
              return (
                <li key={`${s.year}-${s.name}-${s.a.code}`} className={cx('grid grid-cols-[1fr_auto_1fr] items-center gap-[10px] py-[10px] last:border-b-0 lg:py-[12px]', ROW)}>
                  <div className="flex items-center justify-end gap-[8px]">
                    <span className={cx('font-barlow text-[13px] font-semibold', winA ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.45)]')}>{facts[s.a.code]?.nickname ?? s.a.code}</span>
                    <TeamLogoAvatar teamCode={s.a.code} size={20} />
                  </div>
                  <div className="text-center">
                    <div className={`text-[22px] leading-none tabular-nums text-[#0F171F] lg:text-[26px]`}>
                      <span className={winA ? '' : 'text-[rgba(15,23,31,0.35)]'}>{s.a.won}</span>
                      <span className="mx-[6px] text-[rgba(15,23,31,0.25)]">–</span>
                      <span className={winB ? '' : 'text-[rgba(15,23,31,0.35)]'}>{s.b.won}</span>
                    </div>
                    <Link href={`/temporadas/${s.year}`} className={`mt-[3px] block font-barlow text-[10px] font-medium text-[rgba(15,23,31,0.5)] hover:text-[#0F171F] lg:text-[11px] ${cls.focus} rounded-[3px]`}>
                      {s.name} · {s.year}
                      {s.winnerCode ? '' : ' · en juego'}
                    </Link>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <TeamLogoAvatar teamCode={s.b.code} size={20} />
                    <span className={cx('font-barlow text-[13px] font-semibold', winB ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.45)]')}>{facts[s.b.code]?.nickname ?? s.b.code}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}
      <p className="mt-[16px] text-center font-barlow text-[12px] text-[rgba(15,23,31,0.5)] lg:mt-[22px] lg:text-[13px]">Títulos, MVP y temporadas según el archivo histórico · series de playoffs desde 2025</p>
    </div>
  );
}
