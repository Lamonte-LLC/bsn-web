'use client';

import cx from 'classnames';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { SeasonType } from '@/season/types';
import CompareTeamMark from './CompareTeamMark';
import { getCompareTeam, MAX_COMPARE_TEAMS } from './teams';
import type { TeamRecord } from './types';

type Props = {
  selected: string[];
  records: Record<string, TeamRecord>;
  seasons: SeasonType[];
  selectedSeasonProviderId?: string;
  seasonName?: string;
  onOpenPicker: () => void;
  onSeasonChange: (seasonProviderId: string) => void;
  onRemove: (code: string) => void;
};

/** Ordinal corto en español: 1ro, 2do, 3ro, 4to, 5to, 6to. */
function ordinal(n: number): string {
  const suffix: Record<number, string> = { 1: 'ro', 2: 'do', 3: 'ro' };
  return `${n}${suffix[n] ?? 'to'}`;
}

function recordLine(record?: TeamRecord): string {
  if (!record) return '';
  const base = `${record.won}-${record.lost}`;
  if (!record.groupName) return base;
  const position = record.position ? `${ordinal(record.position)} ` : '';
  return `${base} · ${position}${record.groupName}`;
}

/** Círculo del equipo con la X para quitarlo de la comparación. */
function RemovableMark({
  code,
  size,
  sizeLg,
  onRemove,
}: {
  code: string;
  size: number;
  sizeLg: number;
  onRemove: (code: string) => void;
}) {
  const nickname = getCompareTeam(code)?.nickname ?? code;

  return (
    <span className="relative inline-flex">
      <span className="lg:hidden">
        <CompareTeamMark code={code} size={size} />
      </span>
      {/* Desktop: círculo más grande con logo a menor proporción para dejar
          más padding alrededor del logo. */}
      <span className="hidden lg:inline-flex">
        <CompareTeamMark code={code} size={sizeLg} logoRatio={0.54} />
      </span>
      <button
        type="button"
        aria-label={`Quitar ${nickname}`}
        title={`Quitar ${nickname}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove(code);
        }}
        className="absolute -right-[3px] -top-[3px] flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] text-white/45 transition-colors hover:bg-[rgba(255,255,255,0.22)] hover:text-white lg:h-[18px] lg:w-[18px]"
      >
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden>
          <path
            d="M1 1L7 7M7 1L1 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}

/**
 * Slot vacío. Igual que un equipo real: en el slot izquierdo el texto va
 * primero y el círculo hacia el VS; en el derecho, el círculo primero.
 * En desktop el texto queda en una sola línea.
 */
function EmptySlot({
  side,
  onClick,
}: {
  side: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-[6px] transition-opacity hover:opacity-80 lg:flex-row lg:gap-[18px]"
    >
      {/* Mobile: círculo arriba. Desktop: el círculo queda hacia el VS. */}
      <span
        className={cx(
          'order-1 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-dashed border-[rgba(255,255,255,0.25)] text-[20px] text-[rgba(255,255,255,0.35)] lg:h-[62px] lg:w-[62px] lg:text-[24px]',
          side === 'left' && 'lg:order-2',
        )}
      >
        +
      </span>
      <span
        className={cx(
          'order-2 whitespace-nowrap text-[15px] leading-[1.1] text-[rgba(255,255,255,0.35)] lg:text-[28px]',
          side === 'left' && 'lg:order-1',
        )}
      >
        Escoge un equipo
      </span>
    </button>
  );
}

/** Slot horizontal (2 equipos, desktop): texto afuera, círculo hacia el VS. */
function TeamSlotHorizontal({
  code,
  record,
  side,
  onOpenPicker,
  onRemove,
}: {
  code: string;
  record?: TeamRecord;
  side: 'left' | 'right';
  onOpenPicker: () => void;
  onRemove: (code: string) => void;
}) {
  const team = getCompareTeam(code);

  return (
    <div
      className={cx(
        'flex items-center gap-[16px] lg:gap-[24px]',
        side === 'left' ? 'flex-row justify-end' : 'flex-row-reverse justify-end',
      )}
    >
      <button
        type="button"
        onClick={onOpenPicker}
        title="Cambiar equipo"
        className={cx(
          'cursor-pointer transition-opacity hover:opacity-85',
          side === 'left' ? 'text-right' : 'text-left',
        )}
      >
        <span className="block text-[22px] leading-[1.05] text-white lg:text-[32px]">
          {team?.nickname}
        </span>
        {record && (
          <span className="mt-[4px] block font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.5)] lg:mt-[6px] lg:text-[13px]">
            {recordLine(record)}
          </span>
        )}
      </button>
      <RemovableMark code={code} size={62} sizeLg={96} onRemove={onRemove} />
    </div>
  );
}

/** Slot apilado (mobile 2 equipos, y 3–4 equipos en todos los tamaños). */
function TeamSlotStacked({
  code,
  record,
  count,
  onOpenPicker,
  onRemove,
}: {
  code: string;
  record?: TeamRecord;
  count: number;
  onOpenPicker: () => void;
  onRemove: (code: string) => void;
}) {
  const team = getCompareTeam(code);
  const size = count === 4 ? 44 : 50;
  const sizeLg = count === 4 ? 62 : 70;

  return (
    <div className="flex flex-col items-center text-center">
      <RemovableMark code={code} size={size} sizeLg={sizeLg} onRemove={onRemove} />
      <button
        type="button"
        onClick={onOpenPicker}
        title="Cambiar equipo"
        className="cursor-pointer transition-opacity hover:opacity-85"
      >
        <span
          className={cx(
            'mt-[5px] block leading-[1.1] text-white lg:mt-[8px]',
            count === 4 ? 'text-[13px] lg:text-[20px]' : 'text-[15px] lg:text-[22px]',
          )}
        >
          {team?.nickname}
        </span>
        {record && (
          <span className="mt-[2px] block font-barlow font-medium text-[10px] text-[rgba(255,255,255,0.5)] lg:mt-[3px] lg:text-[12px]">
            {recordLine(record)}
          </span>
        )}
      </button>
    </div>
  );
}

export default function CompareHero({
  selected,
  records,
  seasons,
  selectedSeasonProviderId,
  seasonName,
  onOpenPicker,
  onSeasonChange,
  onRemove,
}: Props) {
  const count = selected.length;
  const isEmpty = count < 2;

  return (
    <section className="pb-[76px] pt-[10px] text-center lg:pb-[110px] lg:pt-[26px]">
      <div className="container">
        <h1 className="text-[30px] tracking-[0.4px] text-white lg:text-[42px]">
          Comparación de equipos
        </h1>

        {isEmpty ? (
          <div className="mt-[30px] flex items-center justify-center gap-[20px] lg:mt-[30px] lg:gap-[48px]">
            {selected[0] ? (
              <TeamSlotHorizontal
                code={selected[0]}
                record={records[selected[0]]}
                side="left"
                onOpenPicker={onOpenPicker}
                onRemove={onRemove}
              />
            ) : (
              <EmptySlot side="left" onClick={onOpenPicker} />
            )}
            <span className="text-[20px] text-[rgba(255,255,255,0.3)] lg:text-[26px]">
              VS
            </span>
            <EmptySlot side="right" onClick={onOpenPicker} />
          </div>
        ) : count === 2 ? (
          <>
            {/* Mobile: apilado */}
            <div className="mx-auto mt-[30px] grid max-w-[420px] grid-cols-[1fr_auto_1fr] items-center gap-[14px] lg:hidden">
              <div className="flex justify-center">
                <TeamSlotStacked
                  code={selected[0]}
                  record={records[selected[0]]}
                  count={2}
                  onOpenPicker={onOpenPicker}
                  onRemove={onRemove}
                />
              </div>
              <span className="px-[6px] text-[18px] text-[rgba(255,255,255,0.35)]">
                VS
              </span>
              <div className="flex justify-center">
                <TeamSlotStacked
                  code={selected[1]}
                  record={records[selected[1]]}
                  count={2}
                  onOpenPicker={onOpenPicker}
                  onRemove={onRemove}
                />
              </div>
            </div>
            {/* Desktop: horizontal como la página de juego futuro */}
            <div className="mx-auto mt-[30px] hidden max-w-[980px] grid-cols-[1fr_auto_1fr] items-center gap-[48px] lg:grid">
              <TeamSlotHorizontal
                code={selected[0]}
                record={records[selected[0]]}
                side="left"
                onOpenPicker={onOpenPicker}
                onRemove={onRemove}
              />
              <span className="px-[36px] text-[24px] text-[rgba(255,255,255,0.35)]">
                VS
              </span>
              <TeamSlotHorizontal
                code={selected[1]}
                record={records[selected[1]]}
                side="right"
                onOpenPicker={onOpenPicker}
                onRemove={onRemove}
              />
            </div>
          </>
        ) : (
          <div
            className={cx(
              'mx-auto mt-[30px] grid items-start lg:mt-[30px]',
              count === 3
                ? 'max-w-[760px] grid-cols-3 gap-[8px] lg:gap-[20px]'
                : 'max-w-[900px] grid-cols-4 gap-[6px] lg:gap-[16px]',
            )}
          >
            {selected.map((code) => (
              <TeamSlotStacked
                key={code}
                code={code}
                record={records[code]}
                count={count}
                onOpenPicker={onOpenPicker}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}

        <div className="mb-[10px] mt-[18px] flex flex-wrap items-center justify-center gap-[8px] lg:gap-[10px]">
          <Menu>
            <MenuButton className="inline-flex cursor-pointer items-center gap-[7px] rounded-[100px] border border-[rgba(255,255,255,0.2)] px-[14px] py-[6px] font-barlow font-medium text-[12px] text-[rgba(255,255,255,0.85)] transition-colors hover:border-[rgba(255,255,255,0.4)] focus-visible:outline-none lg:px-[16px] lg:py-[7px] lg:text-[13px]">
              {seasonName ? `Temporada ${seasonName}` : 'Temporada regular'}
              <span
                className="h-0 w-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.5)]"
                aria-hidden
              />
            </MenuButton>
            <MenuItems
              transition
              anchor="bottom"
              className="z-[999] mt-[8px] rounded-[12px] border border-[#E2E2E2] bg-white p-[6px] shadow-[0px_1px_15px_0px_#5858581A] transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0"
            >
              {seasons.map((season) => (
                <MenuItem key={season.providerId}>
                  <button
                    type="button"
                    onClick={() => onSeasonChange(season.providerId)}
                    className={cx(
                      'block w-full cursor-pointer rounded-[8px] px-[14px] py-[7px] text-left font-barlow font-medium text-[13px] data-focus:bg-[#F4F4F4]',
                      season.providerId === selectedSeasonProviderId
                        ? 'text-[#0F171F]'
                        : 'text-[rgba(15,23,31,0.6)]',
                    )}
                  >
                    Temporada {season.name}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
          {count >= 1 && count < MAX_COMPARE_TEAMS && (
            <button
              type="button"
              onClick={onOpenPicker}
              className="inline-flex cursor-pointer items-center rounded-[100px] border border-dashed border-[rgba(255,255,255,0.28)] px-[13px] py-[5px] font-barlow font-medium text-[11px] text-[rgba(255,255,255,0.6)] transition-colors hover:border-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] lg:px-[15px] lg:py-[6px] lg:text-[12px]"
            >
              + Añadir equipo
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
