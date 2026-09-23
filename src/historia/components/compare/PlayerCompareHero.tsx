'use client';

import { useEffect, useRef, useState } from 'react';
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

/** Scope pill on the band: hairline at rest, brighter on hover, inverted (white on ink text) while its menu is open. */
const PILL = 'group/pill relative before:absolute before:inset-x-0 before:-inset-y-[6px] before:content-[""] inline-flex cursor-pointer items-center gap-[7px] rounded-[100px] border border-[rgba(255,255,255,0.32)] px-[14px] py-[6px] font-barlow font-medium text-[12px] text-[rgba(255,255,255,0.85)] transition-[border-color,background-color,color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(255,255,255,0.55)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[rgba(255,255,255,0.5)] data-open:border-white data-open:bg-white data-open:text-[#0F171F] data-open:focus-visible:outline-0 lg:px-[16px] lg:py-[7px] lg:text-[13px]';

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
 * A scrollbar of our own at the right edge of the season list: 3px, track in ink at 6%, thumb at 32% on desktop;
 * 4px and darker on phones, where a hairline fades. Always visible and proportional to what's left, so the list
 * says both that it scrolls and how much remains. It renders from the first paint, before any measurement, and
 * hugs the panel's edge (inside its 10px gutter) like a native overlay scrollbar, clear of the rows and the card.
 */
function ScrollRail({ target, initialHeight }: { target: React.RefObject<HTMLElement | null>; /** Thumb height (%) before the first measurement, so the rail shows from the first paint. */ initialHeight: number }) {
  const [thumb, setThumb] = useState<{ top: number; height: number }>({ top: 0, height: initialHeight });
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) return setThumb({ top: 0, height: 100 });
      setThumb({ top: (scrollTop / scrollHeight) * 100, height: (clientHeight / scrollHeight) * 100 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [target]);
  return (
    <span className="pointer-events-none absolute -right-[7px] bottom-[4px] top-[4px] w-[4px] rounded-full bg-[rgba(15,23,31,0.1)] lg:-right-[8px] lg:w-[3px] lg:bg-[rgba(15,23,31,0.06)]" aria-hidden>
      <span className="absolute inset-x-0 rounded-full bg-[rgba(15,23,31,0.5)] lg:bg-[rgba(15,23,31,0.32)]" style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }} />
    </span>
  );
}

/**
 * Scope of one player: the whole career or a single season, chosen per player so eras can be mixed. A dropdown
 * anchored under the player's pill: "Toda la carrera" as a card and the seasons as a flat list (year, club logo,
 * club name) with a fade and a thin rail that hint at more rows below.
 */
function ScopeMenu({ p, scope, scopeName, seasons, clubs }: { p: ComparePlayerData; scope: CompareScope; scopeName: string; seasons: SeasonOption[]; color: string; clubs: SeasonOption['teams'] }) {
  const isCareer = scope === CAREER_SCOPE;
  // The list scrolls past ~7 rows (300px at 38px each); only then it needs the fade and the room under it.
  const overflows = seasons.length * 38 > 300;
  const listRef = useRef<HTMLUListElement>(null);
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
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="-mr-[2px] shrink-0 text-[rgba(255,255,255,0.8)] transition-transform duration-200 group-data-open/pill:rotate-180 group-data-open/pill:text-[rgba(15,23,31,0.7)] motion-reduce:transition-none" aria-hidden>
                <path d="M2.5 4.5L6 8l3.5-3.5" />
              </svg>
            </PopoverButton>
            <PopoverPanel
              transition
              anchor={{ to: 'bottom', gap: 8, padding: 12 }}
              className="z-[999] flex w-[300px] flex-col rounded-[14px] border border-[#E2E2E2] bg-white px-[10px] pb-[10px] pt-[10px] shadow-[0px_1px_15px_0px_#5858581A] transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0 lg:w-[320px]"
            >
              <button type="button" onClick={() => pick(CAREER_SCOPE)} role="radio" aria-checked={isCareer} className={cx(ROW, 'shrink-0', isCareer ? 'bg-[#F4F4F4]' : 'hover:bg-[#FAFAFA]')}>
                <span className="text-[17px] leading-[1] text-[#0F171F]">Toda su carrera</span>
                <span className={cx('ml-auto font-barlow text-[12.5px] transition-colors duration-150', cls.tabular, isCareer ? 'font-semibold text-[#0F171F]' : 'font-medium text-[rgba(15,23,31,0.6)] group-hover:font-semibold group-hover:text-[#0F171F]')} title={clubs.map((c) => c.name).join(', ')}>
                  {clubs.length} {clubs.length === 1 ? 'equipo' : 'equipos'}
                </span>
                <Radio on={isCareer} />
              </button>
              <div className="mt-[10px] shrink-0 border-t border-[rgba(0,0,0,0.08)]" aria-hidden />
              <p className={`shrink-0 px-[12px] pb-[6px] pt-[14px] ${cls.label} ${cls.tabular}`}>
                {seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'}
              </p>
              {/* Headless UI caps the panel at the room left under the pill (max-height + overflow auto). The list, not
                  the panel, absorbs that cap, so the fade and the rail stay on the visible edge instead of scrolling
                  away with the content. */}
              <div className="relative flex min-h-0 flex-col">
                <ul ref={listRef} className={cx('min-h-0 max-h-[300px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', overflows && 'pb-[40px]')} role="radiogroup" aria-label={`Temporadas de ${p.name}`}>
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
                {overflows ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40px] rounded-b-[10px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-white" aria-hidden /> : null}
                {overflows ? <ScrollRail target={listRef} initialHeight={(300 / (seasons.length * 38 + 40)) * 100} /> : null}
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

/* Touch: every pill and link on the band extends its hit area to ≥44px with a ::before, without growing visually. */
/** Horizontal slot (2 players, desktop): text outside, circle towards the VS. */
function SlotHorizontal({ p, side, onRemove, scope, scopeName, seasons, color, clubs }: { p: ComparePlayerData; side: 'left' | 'right'; onRemove: () => void } & ScopeMenuProps) {
  return (
    <div className={cx('flex items-center gap-[16px] lg:gap-[24px]', side === 'left' ? 'flex-row justify-end' : 'flex-row-reverse justify-end')}>
      <div className={cx('flex flex-col', side === 'left' ? 'items-end text-right' : 'items-start text-left')}>
        <Link href={profileHref(p)} title="Ver perfil" className="relative transition-opacity before:absolute before:-inset-x-[4px] before:-inset-y-[10px] before:content-[''] hover:opacity-85">
          <span className="block text-[23px] leading-[1.05] text-white lg:text-[33px]">{p.name}</span>
        </Link>
        <span className="mt-[10px]">
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
function SlotStacked({ p, count, onRemove, reserveLine, scope, scopeName, seasons, color, clubs }: { p: ComparePlayerData; count: number; onRemove: () => void; /** Keep the position line's height even when this player has none, so every slot in the row aligns. */ reserveLine: boolean } & ScopeMenuProps) {
  const size = count === 4 ? 44 : 50;
  const sizeLg = count === 4 ? 62 : 70;
  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex lg:hidden">
        <PlayerMark player={{ ...p, color }} size={size} onDark onRemove={onRemove} />
      </span>
      <span className="hidden lg:inline-flex">
        <PlayerMark player={{ ...p, color }} size={sizeLg} onDark onRemove={onRemove} />
      </span>
      <Link href={profileHref(p)} title="Ver perfil" className="relative transition-opacity before:absolute before:-inset-x-[4px] before:-inset-y-[10px] before:content-[''] hover:opacity-85">
        <span className={cx('mt-[7px] block leading-[1.1] text-white lg:mt-[8px]', count === 4 ? 'text-[14px] lg:text-[21px]' : 'text-[16px] lg:text-[23px]')} title={p.name}>
          <span className="lg:hidden">{initialName(p.name)}</span>
          <span className="hidden lg:inline">{p.name}</span>
        </span>
        {p.line || reserveLine ? <span className="mt-[2px] block font-barlow font-medium text-[10px] leading-[1.4] text-[rgba(255,255,255,0.5)] lg:mt-[3px] lg:text-[12px]">{p.line || '\u00a0'}</span> : null}
      </Link>
      <span className="mt-[14px] lg:mt-[20px]">
        <ScopeMenu p={p} scope={scope} scopeName={scopeName} seasons={seasons} color={color} clubs={clubs} />
      </span>
    </div>
  );
}

export default function PlayerCompareHero({ players }: Props) {
  const { pickerOpen, scopes } = useCompareState();
  const keys = players.map((p) => p.key);
  const { add, remove, clear } = useCompareNavigation(keys);
  const count = players.length;
  const isEmpty = count < 2;
  const openPicker = () => setPickerOpen(true);
  // Slots share the row: the position line is reserved for everyone only when someone has one.
  const anyLine = players.some((p) => Boolean(p.line));

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
          <h1 className="text-[30px] tracking-[0.4px] text-white lg:text-[42px]">Comparar jugadores</h1>

          {isEmpty ? (
            <div className="mt-[30px] flex items-center justify-center gap-[20px] lg:gap-[48px]">
              {players[0] ? <SlotHorizontal {...slotProps(players[0])} side="left" /> : <EmptySlot side="left" onClick={openPicker} />}
              <span className="text-[20px] text-[rgba(255,255,255,0.3)] lg:text-[26px]">VS</span>
              <EmptySlot side="right" onClick={openPicker} />
            </div>
          ) : count === 2 ? (
            <>
              <div className="mx-auto mt-[30px] grid max-w-[420px] grid-cols-[1fr_auto_1fr] items-start gap-[14px] lg:hidden">
                <div className="flex justify-center">
                  <SlotStacked {...slotProps(players[0])} count={2} reserveLine={anyLine} />
                </div>
                <span className="self-center px-[6px] text-[18px] text-[rgba(255,255,255,0.35)]">VS</span>
                <div className="flex justify-center">
                  <SlotStacked {...slotProps(players[1])} count={2} reserveLine={anyLine} />
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
                <SlotStacked key={p.key} {...slotProps(p)} count={count} reserveLine={anyLine} />
              ))}
            </div>
          )}

          <div className="mb-[10px] mt-[27px] flex flex-wrap items-center justify-center gap-[8px] lg:gap-[10px]">
            {/* Same box as the scope pill (padding, type size, icon slot) so both controls read as one family. */}
            {count >= 1 && count < MAX_COMPARE_PLAYERS ? (
              <button type="button" onClick={openPicker} className="group/add relative before:absolute before:inset-x-0 before:-inset-y-[6px] before:content-[''] inline-flex cursor-pointer items-center gap-[8px] rounded-[100px] border border-dashed border-[rgba(255,255,255,0.4)] px-[14px] py-[6px] font-barlow font-medium text-[12px] text-[rgba(255,255,255,0.85)] transition-[border-color,color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(255,255,255,0.7)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:px-[16px] lg:py-[7px] lg:text-[13px]">
                {/* The plus lives in its own disc: the disc carries the weight, the glyph stays light, and on hover the disc turns white with the plus in ink. */}
                <span className="-ml-[4px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.14)] text-white transition-colors duration-200 ease-out group-hover/add:bg-white group-hover/add:text-[#0F171F]" aria-hidden>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 1.5v9M1.5 6h9" />
                  </svg>
                </span>
                Añadir jugador
              </button>
            ) : null}
            {/* Reset: same box as «Añadir jugador» but filled and borderless, a step quieter, so the pair sits balanced. */}
            {count >= 1 ? (
              <button type="button" onClick={clear} className="relative before:absolute before:inset-x-0 before:-inset-y-[6px] before:content-[''] inline-flex cursor-pointer items-center gap-[7px] rounded-[100px] border border-transparent bg-[rgba(255,255,255,0.08)] px-[14px] py-[6px] font-barlow font-medium text-[12px] text-[rgba(255,255,255,0.6)] transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:bg-[rgba(255,255,255,0.14)] hover:text-[rgba(255,255,255,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:px-[16px] lg:py-[7px] lg:text-[13px]">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="-ml-[2px] shrink-0" aria-hidden>
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
                Limpiar
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <PlayerPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} selectedKeys={keys} onPick={add} />
    </>
  );
}
