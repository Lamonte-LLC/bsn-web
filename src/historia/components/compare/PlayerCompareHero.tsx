'use client';

import cx from 'classnames';
import Link from 'next/link';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useSeasons } from '@/historia/hooks/useSeasons';
import { usePlayerComparison } from '@/historia/hooks/usePlayerComparison';
import { MAX_COMPARE_PLAYERS, scopeFor, scopeLabel, type ComparePlayerData, type CompareScope } from '@/historia/lib/compare-players';
import { initialName } from '@/archivo/lib/names';
import PlayerMark from './PlayerMark';
import PlayerPickerDialog from './PlayerPickerDialog';
import { setAllScopes, setCompareScope, setPickerOpen, useCompareNavigation, useCompareState } from './useCompareState';

type Props = {
  players: ComparePlayerData[];
};

const profileHref = (p: ComparePlayerData) => `/jugadores/${p.providerId}`;

const PILL = 'inline-flex cursor-pointer items-center gap-[6px] rounded-[100px] border border-[rgba(255,255,255,0.2)] px-[11px] py-[4px] font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.85)] transition-[border-color,transform] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:border-[rgba(255,255,255,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(255,255,255,0.5)] lg:px-[13px] lg:py-[5px] lg:text-[12px]';

type SeasonOption = { providerId: string; name: string };

/** Season of one player, chosen per player so eras can be mixed (2026 vs 1990). */
function ScopeMenu({ p, scope, scopeName, others, seasons, currentSeasonProviderId }: { p: ComparePlayerData; scope: CompareScope; scopeName: string; others: string[]; seasons: SeasonOption[]; currentSeasonProviderId: string }) {
  return (
    <Menu>
      <MenuButton className={PILL} aria-label={`Alcance de ${p.name}`}>
        <span>{scopeName}</span>
        <span className="h-0 w-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.5)]" aria-hidden />
      </MenuButton>
      <MenuItems transition anchor="bottom" className="z-[999] mt-[8px] max-h-[320px] overflow-y-auto rounded-[12px] border border-[#E2E2E2] bg-white p-[6px] shadow-[0px_1px_15px_0px_#5858581A] transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0">
        {seasons.map((season) => (
          <MenuItem key={season.providerId}>
            <button type="button" onClick={() => setCompareScope(p.key, season.providerId)} className={cx('block w-full cursor-pointer rounded-[8px] px-[14px] py-[7px] text-left font-barlow font-medium text-[13px] data-focus:bg-[#F4F4F4]', season.providerId === scope ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.6)]')}>
              {scopeLabel(season.name)}
            </button>
          </MenuItem>
        ))}
        {others.length ? (
          <MenuItem>
            <button type="button" onClick={() => setAllScopes([p.key, ...others], currentSeasonProviderId)} className="mt-[4px] block w-full cursor-pointer rounded-[8px] border-t border-[rgba(15,23,31,0.08)] px-[14px] pb-[6px] pt-[9px] text-left font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.6)] data-focus:bg-[#F4F4F4]">
              Temporada actual para todos
            </button>
          </MenuItem>
        ) : null}
      </MenuItems>
    </Menu>
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

type ScopeMenuProps = { scope: CompareScope; scopeName: string; others: string[]; seasons: SeasonOption[]; currentSeasonProviderId: string; color: string };

/** Horizontal slot (2 players, desktop): text outside, circle towards the VS. */
function SlotHorizontal({ p, side, onRemove, scope, scopeName, others, seasons, currentSeasonProviderId, color }: { p: ComparePlayerData; side: 'left' | 'right'; onRemove: () => void } & ScopeMenuProps) {
  return (
    <div className={cx('flex items-center gap-[16px] lg:gap-[24px]', side === 'left' ? 'flex-row justify-end' : 'flex-row-reverse justify-end')}>
      <div className={cx('flex flex-col', side === 'left' ? 'items-end text-right' : 'items-start text-left')}>
        <Link href={profileHref(p)} title="Ver perfil" className="transition-opacity hover:opacity-85">
          <span className="block text-[22px] leading-[1.05] text-white lg:text-[32px]">{p.name}</span>
          <span className="mt-[4px] block font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.5)] lg:mt-[6px] lg:text-[13px]">{p.line}</span>
        </Link>
        <span className="mt-[8px]">
          <ScopeMenu p={p} scope={scope} scopeName={scopeName} others={others} seasons={seasons} currentSeasonProviderId={currentSeasonProviderId} />
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
function SlotStacked({ p, count, onRemove, scope, scopeName, others, seasons, currentSeasonProviderId, color }: { p: ComparePlayerData; count: number; onRemove: () => void } & ScopeMenuProps) {
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
        <span className="mt-[2px] block font-barlow font-medium text-[10px] text-[rgba(255,255,255,0.5)] lg:mt-[3px] lg:text-[12px]">{p.line}</span>
      </Link>
      <span className="mt-[6px]">
        <ScopeMenu p={p} scope={scope} scopeName={scopeName} others={others} seasons={seasons} currentSeasonProviderId={currentSeasonProviderId} />
      </span>
    </div>
  );
}

export default function PlayerCompareHero({ players }: Props) {
  const { pickerOpen, scopes } = useCompareState();
  /* Solo para el atajo "temporada actual para todos" — la lista de temporadas de cada jugador sale de su propio
   * usePlayerComparison, no de todas las temporadas de la liga. */
  const { data: leagueSeasons } = useSeasons();
  const currentLeagueSeasonProviderId = (leagueSeasons.find((s) => s.current) ?? leagueSeasons[0])?.providerId ?? '';
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
    const seasonOptions: SeasonOption[] = cmp.seasons.map((s) => ({ providerId: s.providerId, name: s.name }));
    const color = cmp.teamsFor(scope)[0]?.colorPrimary ?? p.color;
    return {
      p,
      scope,
      scopeName: scopeLabel(cmp.nameFor(scope)),
      others: keys.filter((k) => k !== p.key),
      onRemove: () => remove(p.key),
      seasons: seasonOptions,
      currentSeasonProviderId: currentLeagueSeasonProviderId,
      color,
    };
  };

  return (
    <>
      <section className="pb-[76px] pt-[10px] text-center lg:pb-[110px] lg:pt-[26px]">
        <div className="container">
          <h1 className="text-[30px] tracking-[0.4px] text-white lg:text-[42px]">Comparación de jugadores</h1>

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
