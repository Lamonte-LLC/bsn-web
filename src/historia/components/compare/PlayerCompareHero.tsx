'use client';

import cx from 'classnames';
import Link from 'next/link';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { cls, EXTINCT_CODE_COLORS } from '@/archivo/lib/tokens';
import TeamLogoAvatar, { TEAM_LOGOS } from '@/team/components/avatar/TeamLogoAvatar';
import { usePlayerComparison } from '@/historia/hooks/usePlayerComparison';
import { CAREER_SCOPE, MAX_COMPARE_PLAYERS, scopeFor, scopeLabel, type ComparePlayerData, type CompareScope } from '@/historia/lib/compare-players';
import { initialName } from '@/archivo/lib/names';
import PlayerMark from './PlayerMark';
import PlayerPickerDialog from './PlayerPickerDialog';
import { setCompareScope, setPickerOpen, useCompareNavigation, useCompareState } from './useCompareState';

type Props = {
  players: ComparePlayerData[];
};

const profileHref = (p: ComparePlayerData) => `/jugadores/${p.providerId}`;

/** "Brujos de Guayama" → "Brujos": the live API keeps the city in some extinct clubs' nicknames. */
const clubShortName = (name: string) => name.replace(/\s+de\s+.+$/i, '');

const PILL = 'inline-flex cursor-pointer items-center gap-[6px] rounded-[100px] border border-[rgba(255,255,255,0.2)] px-[11px] py-[4px] font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.85)] transition-[border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(255,255,255,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:px-[13px] lg:py-[5px] lg:text-[12px]';

type SeasonOption = { providerId: string; year: number; teams: Array<{ code: string; name: string; color: string }> };

/** Club mark of a season row: the real logo when the site has it, else a disc in the archive's provisional color. */
function ClubMark({ code, color, size = 20 }: { code: string; color: string; size?: number }) {
  if (code in TEAM_LOGOS) return <TeamLogoAvatar teamCode={code} size={size} />;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-barlow-condensed font-bold italic text-white" style={{ backgroundColor: color, width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      {code}
    </span>
  );
}

/** Selection mark of every row: empty ring at rest, darker ring on hover, ink disc with a check when chosen. */
function Radio({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150', className, on ? 'border-[#0F171F] bg-[#0F171F]' : 'border-[rgba(15,23,31,0.2)] group-hover:border-[rgba(15,23,31,0.45)]')} aria-hidden>
      {on ? <CheckIcon className="h-[10px] w-[10px] text-white" /> : null}
    </span>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

/**
 * Scope of one player: the whole career or a single season, chosen per player so eras can be mixed. A dropdown
 * anchored under the player's pill: "Toda la carrera" as a card and the seasons as a flat list (year, club logo,
 * club name) with a fade that hints at more rows below.
 */
function ScopeMenu({ p, scope, scopeName, seasons, clubs }: { p: ComparePlayerData; scope: CompareScope; scopeName: string; seasons: SeasonOption[]; color: string; clubs: SeasonOption['teams'] }) {
  const isCareer = scope === CAREER_SCOPE;
  // The list scrolls past ~7 rows (300px at 38px each); only then it needs the fade and the room under it.
  const overflows = seasons.length * 38 > 300;
  const ROW = `group relative flex h-[40px] w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[12px] text-left transition-colors duration-150 ${cls.focus} focus-visible:outline-offset-[-2px]`;

  return (
    <Popover className="relative">
      {({ close }) => {
        const pick = (next: CompareScope) => {
          setCompareScope(p.key, next);
          close();
        };
        return (
          <>
            <PopoverButton className={PILL} aria-label={`Alcance de ${p.name}`}>
              <span>{scopeName}</span>
              <span className="h-0 w-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.5)]" aria-hidden />
            </PopoverButton>
            <PopoverPanel
              transition
              anchor={{ to: 'bottom', gap: 8, padding: 12 }}
              className="z-[999] flex w-[300px] flex-col rounded-[14px] border border-[#E2E2E2] bg-white px-[10px] pb-[10px] pt-[10px] shadow-[0px_1px_15px_0px_#5858581A] transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0 lg:w-[320px]"
            >
              <button type="button" onClick={() => pick(CAREER_SCOPE)} role="radio" aria-checked={isCareer} className={cx(ROW, isCareer ? 'bg-[#F4F4F4]' : 'hover:bg-[#FAFAFA]')}>
                <span className="text-[17px] leading-[1] text-[#0F171F]">Toda su carrera</span>
                <span className={cx('ml-auto font-barlow text-[12.5px] transition-colors duration-150', cls.tabular, isCareer ? 'font-semibold text-[#0F171F]' : 'font-medium text-[rgba(15,23,31,0.6)] group-hover:font-semibold group-hover:text-[#0F171F]')} title={clubs.map((c) => c.name).join(', ')}>
                  {clubs.length} {clubs.length === 1 ? 'equipo' : 'equipos'}
                </span>
                <Radio on={isCareer} />
              </button>
              <div className="mx-[12px] mt-[6px] border-t border-[rgba(0,0,0,0.08)]" aria-hidden />
              <p className={`px-[12px] pb-[6px] pt-[14px] ${cls.label} ${cls.tabular}`}>
                {seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'}
              </p>
              <div className="relative min-h-0">
                <ul className={cx('max-h-[300px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', overflows && 'pb-[40px]')} role="radiogroup" aria-label={`Temporadas de ${p.name}`}>
                  {seasons.map((season, i) => {
                    const on = season.providerId === scope;
                    return (
                      <li key={season.providerId}>
                        <button type="button" role="radio" aria-checked={on} onClick={() => pick(season.providerId)} className={cx(ROW, 'group', on ? 'bg-[#F4F4F4]' : 'hover:bg-[#FAFAFA]')}>
                          <span className={`w-[40px] text-[17px] text-[#0F171F] ${cls.tabular}`}>{season.year}</span>
                          <span className="inline-flex items-center -space-x-[4px]">
                            {season.teams.map((t) => (
                              <ClubMark key={t.code} code={t.code} color={t.color} />
                            ))}
                          </span>
                          <span className={cx('min-w-0 truncate font-barlow text-[12.5px] transition-colors duration-150', on ? 'font-semibold text-[#0F171F]' : 'font-medium text-[rgba(15,23,31,0.6)] group-hover:font-semibold group-hover:text-[#0F171F]')} title={season.teams.map((t) => t.name).join(' / ')}>
                            {season.teams.map((t) => t.name).join(' / ')}
                          </span>
                          <Radio on={on} className="ml-auto" />
                          {!on && i < seasons.length - 1 ? <span className="absolute bottom-0 left-[12px] right-[12px] h-px bg-[rgba(0,0,0,0.06)]" aria-hidden /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {overflows ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56px] rounded-b-[10px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-white" aria-hidden /> : null}
              </div>
            </PopoverPanel>
          </>
        );
      }}
    </Popover>
  );
}

/** Empty slot: same anatomy as a real player, circle towards the VS. */
function EmptySlot({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer flex-col items-center gap-[6px] transition-opacity hover:opacity-80 lg:flex-row lg:gap-[18px]">
      <span className={cx('order-1 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-dashed border-[rgba(255,255,255,0.25)] text-[20px] text-[rgba(255,255,255,0.35)] lg:h-[62px] lg:w-[62px] lg:text-[24px]', side === 'left' && 'lg:order-2')}>+</span>
      <span className={cx('order-2 whitespace-nowrap text-[15px] leading-[1.1] text-[rgba(255,255,255,0.35)] lg:text-[28px]', side === 'left' && 'lg:order-1')}>Escoge un jugador</span>
    </button>
  );
}

type ScopeMenuProps = { scope: CompareScope; scopeName: string; seasons: SeasonOption[]; color: string; clubs: SeasonOption['teams'] };

/** Horizontal slot (2 players, desktop): text outside, circle towards the VS. */
function SlotHorizontal({ p, side, onRemove, scope, scopeName, seasons, color, clubs }: { p: ComparePlayerData; side: 'left' | 'right'; onRemove: () => void } & ScopeMenuProps) {
  return (
    <div className={cx('flex items-center gap-[16px] lg:gap-[24px]', side === 'left' ? 'flex-row justify-end' : 'flex-row-reverse justify-end')}>
      <div className={cx('flex flex-col', side === 'left' ? 'items-end text-right' : 'items-start text-left')}>
        <Link href={profileHref(p)} title="Ver perfil" className="transition-opacity hover:opacity-85">
          <span className="block text-[22px] leading-[1.05] text-white lg:text-[32px]">{p.name}</span>
          <span className="mt-[4px] block font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.5)] lg:mt-[6px] lg:text-[13px]">{p.nickname}</span>
        </Link>
        <span className="mt-[8px]">
          <ScopeMenu p={p} scope={scope} scopeName={scopeName} seasons={seasons} color={color} clubs={clubs} />
        </span>
      </div>
      <span className="lg:hidden">
        <PlayerMark player={{ ...p, color }} size={62} onDark onRemove={onRemove} />
      </span>
      <span className="hidden lg:inline-flex">
        <PlayerMark player={{ ...p, color }} size={96} onDark onRemove={onRemove} />
      </span>
    </div>
  );
}

/** Stacked slot (mobile with 2, and 3–4 players everywhere). */
function SlotStacked({ p, count, onRemove, scope, scopeName, seasons, color, clubs }: { p: ComparePlayerData; count: number; onRemove: () => void } & ScopeMenuProps) {
  const size = count === 4 ? 44 : 50;
  const sizeLg = count === 4 ? 62 : 70;
  return (
    <div className="flex flex-col items-center text-center">
      <span className="lg:hidden">
        <PlayerMark player={{ ...p, color }} size={size} onDark onRemove={onRemove} />
      </span>
      <span className="hidden lg:inline-flex">
        <PlayerMark player={{ ...p, color }} size={sizeLg} onDark onRemove={onRemove} />
      </span>
      <Link href={profileHref(p)} title="Ver perfil" className="transition-opacity hover:opacity-85">
        <span className={cx('mt-[5px] block leading-[1.1] text-white lg:mt-[8px]', count === 4 ? 'text-[13px] lg:text-[20px]' : 'text-[15px] lg:text-[22px]')} title={p.name}>
          <span className="lg:hidden">{initialName(p.name)}</span>
          <span className="hidden lg:inline">{p.name}</span>
        </span>
        <span className="mt-[2px] block min-h-[14px] font-barlow font-medium text-[10px] leading-[1.4] text-[rgba(255,255,255,0.5)] lg:mt-[3px] lg:min-h-[17px] lg:text-[12px]">{p.line || '\u00a0'}</span>
      </Link>
      <span className="mt-[6px]">
        <ScopeMenu p={p} scope={scope} scopeName={scopeName} seasons={seasons} color={color} clubs={clubs} />
      </span>
    </div>
  );
}

export default function PlayerCompareHero({ players }: Props) {
  const { pickerOpen, scopes } = useCompareState();
  const keys = players.map((p) => p.key);
  const { add, remove } = useCompareNavigation(keys);
  const count = players.length;
  const isEmpty = count < 2;
  const openPicker = () => setPickerOpen(true);

  // Fixed slots (MAX_COMPARE_PLAYERS): hooks must run the same number of times every render.
  const slots = [players[0] ?? null, players[1] ?? null, players[2] ?? null, players[3] ?? null];
  const comparisons = [
    usePlayerComparison(slots[0]?.providerId ?? null),
    usePlayerComparison(slots[1]?.providerId ?? null),
    usePlayerComparison(slots[2]?.providerId ?? null),
    usePlayerComparison(slots[3]?.providerId ?? null),
  ];
  const comparisonOf = (p: ComparePlayerData) => comparisons[players.findIndex((pl) => pl.key === p.key)];

  const slotProps = (p: ComparePlayerData) => {
    const cmp = comparisonOf(p);
    const scope = scopeFor(p, scopes, cmp.currentSeasonProviderId ?? '');
    const seasonOptions: SeasonOption[] = cmp.seasons.map((s) => ({
      providerId: s.providerId,
      year: s.year,
      teams: cmp.teamsFor(s.providerId).map((t) => ({ code: t.code, name: clubShortName(t.nickname || t.name || t.code), color: t.colorPrimary || EXTINCT_CODE_COLORS[t.code] || '#6B7280' })),
    }));
    // Distinct clubs of the career, in order of appearance (most recent first), for the career row.
    const clubs = seasonOptions.flatMap((s) => s.teams).filter((t, i, all) => all.findIndex((x) => x.code === t.code) === i);
    const color = cmp.colorsFor(scope, p.color)[0];
    return {
      p,
      scope,
      scopeName: scopeLabel(cmp.nameFor(scope)),
      onRemove: () => remove(p.key),
      seasons: seasonOptions,
      color,
      clubs,
    };
  };

  return (
    <>
      <section className="pb-[76px] pt-[10px] text-center lg:pb-[110px] lg:pt-[26px]">
        <div className="container">
          <h1 className="text-[30px] tracking-[0.4px] text-white lg:text-[42px]">Comparación de jugadores</h1>

          {isEmpty ? (
            <div className="mt-[30px] flex items-start justify-center gap-[20px] lg:gap-[48px]">
              {players[0] ? <SlotHorizontal {...slotProps(players[0])} side="left" /> : <EmptySlot side="left" onClick={openPicker} />}
              <span className="text-[20px] text-[rgba(255,255,255,0.3)] lg:text-[26px]">VS</span>
              <EmptySlot side="right" onClick={openPicker} />
            </div>
          ) : count === 2 ? (
            <>
              <div className="mx-auto mt-[30px] grid max-w-[420px] grid-cols-[1fr_auto_1fr] items-start gap-[14px] lg:hidden">
                <div className="flex justify-center">
                  <SlotStacked {...slotProps(players[0])} count={2} />
                </div>
                <span className="self-center px-[6px] text-[18px] text-[rgba(255,255,255,0.35)]">VS</span>
                <div className="flex justify-center">
                  <SlotStacked {...slotProps(players[1])} count={2} />
                </div>
              </div>
              <div className="mx-auto mt-[30px] hidden max-w-[980px] grid-cols-[1fr_auto_1fr] items-center gap-[48px] lg:grid">
                <SlotHorizontal {...slotProps(players[0])} side="left" />
                <span className="px-[36px] text-[24px] text-[rgba(255,255,255,0.35)]">VS</span>
                <SlotHorizontal {...slotProps(players[1])} side="right" />
              </div>
            </>
          ) : (
            <div className={cx('mx-auto mt-[30px] grid items-start', count === 3 ? 'max-w-[760px] grid-cols-3 gap-[8px] lg:gap-[20px]' : 'max-w-[900px] grid-cols-4 gap-[6px] lg:gap-[16px]')}>
              {players.map((p) => (
                <SlotStacked key={p.key} {...slotProps(p)} count={count} />
              ))}
            </div>
          )}

          <div className="mb-[10px] mt-[18px] flex flex-wrap items-center justify-center gap-[8px] lg:gap-[10px]">
            {count >= 1 && count < MAX_COMPARE_PLAYERS ? (
              <button type="button" onClick={openPicker} className="inline-flex cursor-pointer items-center rounded-[100px] border border-dashed border-[rgba(255,255,255,0.28)] px-[13px] py-[5px] font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.6)] transition-[border-color,color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:px-[15px] lg:py-[6px] lg:text-[12px]">
                + Añadir jugador
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <PlayerPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} selectedKeys={keys} onPick={add} />
    </>
  );
}
