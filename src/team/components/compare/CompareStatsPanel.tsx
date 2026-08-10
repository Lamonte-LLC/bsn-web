'use client';

import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import {
  COMPARE_SECTIONS,
  formatStatValue,
  getStatValue,
  getWinningIndexes,
  type CompareStat,
} from './compareStats';
import { getCompareTeam } from './teams';
import type { CompareTeamData } from './types';
import CompareRecentMeetings from './CompareRecentMeetings';
import CompareExportPdfFooter, {
  type TeamComparisonPrintRequest,
} from './CompareExportPdfFooter';

type Props = {
  teams: CompareTeamData[];
  seasonProviderId?: string;
};

type TabId = 'todos' | string;

/* Divisor entre estadísticas: más claro que el de los títulos de categoría
 * (esos se quedan en 0.08). */
const ROW_DIVIDER = 'border-b border-[rgba(15,23,31,0.035)]';

/* Columnas compartidas por la fila de equipos (tabs 5c) y las filas de valores
 * para que todo quede alineado verticalmente. Con 3–4 equipos la etiqueta va
 * a mano izquierda y una columna de valores por equipo a la derecha. */
const GRID_TWO = 'grid-cols-[1fr_140px_1fr] lg:grid-cols-[1fr_340px_1fr]';
const GRID_LEFT_3 = 'grid-cols-[96px_repeat(3,1fr)] lg:grid-cols-[240px_repeat(3,1fr)]';
/* 4 equipos: 2 columnas + etiqueta central + 2 columnas. */
const GRID_FOUR = 'grid-cols-[1fr_1fr_92px_1fr_1fr] lg:grid-cols-[1fr_1fr_200px_1fr_1fr]';

/* Altura fija de la fila de tabs → offset del sticky de los títulos. */
const SECTION_STICKY_TOP = 'top-[40px] lg:top-[46px]';

function gridFor(count: number): string {
  if (count === 2) return GRID_TWO;
  if (count === 3) return GRID_LEFT_3;
  return GRID_FOUR;
}

/** Punto del color de marca junto al valor ganador. */
function WinnerDot({
  color,
  side,
}: {
  color: string;
  side: 'left' | 'right';
}) {
  return (
    <span
      className={cx(
        'absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full lg:h-[7px] lg:w-[7px]',
        side === 'left' ? '-left-[14px] lg:-left-[16px]' : '-right-[12px] lg:-right-[15px]',
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

/** Sigla + descripción del stat. */
function StatLabel({
  stat,
  align,
}: {
  stat: CompareStat;
  align: 'center' | 'left';
}) {
  return (
    <div
      className={cx(
        'font-barlow',
        align === 'center'
          ? 'px-[6px] text-center lg:px-[10px]'
          : 'pr-[8px] text-left lg:pr-[16px]',
      )}
    >
      <div className="text-[11px] font-semibold text-[rgba(15,23,31,0.65)] lg:text-[13px]">
        {stat.code}
      </div>
      <div className="mt-[1px] text-[9px] leading-[1.3] text-[rgba(15,23,31,0.45)] lg:text-[11px]">
        {stat.label}
      </div>
    </div>
  );
}

/** Fila espejo (2 equipos): valor · etiqueta centrada · valor. */
function StatRowTwo({
  stat,
  teams,
}: {
  stat: CompareStat;
  teams: CompareTeamData[];
}) {
  const values = teams.map((t) => getStatValue(stat, t.stats));
  const winners = getWinningIndexes(values, stat.higherIsBetter);

  const valueClass = (index: number) =>
    winners.includes(index) ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.25)]';

  return (
    <div
      className={cx(
        'grid items-center py-[12px] last:border-b-0 lg:py-[13px]',
        GRID_TWO,
        ROW_DIVIDER,
      )}
    >
      <div
        className={cx(
          'text-right text-[22px] leading-none tabular-nums lg:text-[30px]',
          valueClass(0),
        )}
      >
        <span className="relative">
          {formatStatValue(values[0], stat.format)}
          {winners.includes(0) && (
            <WinnerDot
              color={getCompareTeam(teams[0].code)?.color ?? '#7D7D7D'}
              side="left"
            />
          )}
        </span>
      </div>
      <StatLabel stat={stat} align="center" />
      <div
        className={cx(
          'text-[22px] leading-none tabular-nums lg:text-[30px]',
          valueClass(1),
        )}
      >
        <span className="relative">
          {formatStatValue(values[1], stat.format)}
          {winners.includes(1) && (
            <WinnerDot
              color={getCompareTeam(teams[1].code)?.color ?? '#7D7D7D'}
              side="right"
            />
          )}
        </span>
      </div>
    </div>
  );
}

/** Fila de 3 equipos: etiqueta a la izquierda, una columna por equipo. */
function StatRowLeft({
  stat,
  teams,
}: {
  stat: CompareStat;
  teams: CompareTeamData[];
}) {
  const values = teams.map((t) => getStatValue(stat, t.stats));
  const winners = getWinningIndexes(values, stat.higherIsBetter);

  return (
    <div
      className={cx(
        'grid items-center py-[12px] last:border-b-0 lg:py-[14px]',
        GRID_LEFT_3,
        ROW_DIVIDER,
      )}
    >
      <StatLabel stat={stat} align="left" />
      {teams.map((team, index) => (
        <div
          key={team.code}
          className={cx(
            'text-center text-[18px] leading-none tabular-nums lg:text-[28px]',
            winners.includes(index)
              ? 'text-[#0F171F]'
              : 'text-[rgba(15,23,31,0.25)]',
          )}
        >
          <span className="relative">
            {formatStatValue(values[index], stat.format)}
            {winners.includes(index) && (
              <WinnerDot
                color={getCompareTeam(team.code)?.color ?? '#7D7D7D'}
                side="right"
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Fila de 4 equipos: dos valores · etiqueta centrada · dos valores. */
function StatRowFour({
  stat,
  teams,
}: {
  stat: CompareStat;
  teams: CompareTeamData[];
}) {
  const values = teams.map((t) => getStatValue(stat, t.stats));
  const winners = getWinningIndexes(values, stat.higherIsBetter);

  const cell = (index: number) => (
    <div
      key={teams[index].code}
      className={cx(
        'text-center text-[16px] leading-none tabular-nums lg:text-[26px]',
        winners.includes(index) ? 'text-[#0F171F]' : 'text-[rgba(15,23,31,0.25)]',
      )}
    >
      <span className="relative">
        {formatStatValue(values[index], stat.format)}
        {winners.includes(index) && (
          <WinnerDot
            color={getCompareTeam(teams[index].code)?.color ?? '#7D7D7D'}
            side="right"
          />
        )}
      </span>
    </div>
  );

  return (
    <div
      className={cx(
        'grid items-center py-[12px] last:border-b-0 lg:py-[14px]',
        GRID_FOUR,
        ROW_DIVIDER,
      )}
    >
      {cell(0)}
      {cell(1)}
      <StatLabel stat={stat} align="center" />
      {cell(2)}
      {cell(3)}
    </div>
  );
}

/** Título de sección: sticky bajo la fila de tabs al hacer scroll.
 * En el layout de 3 equipos va alineado a la izquierda, como las etiquetas. */
function SectionTitle({
  title,
  align = 'center',
}: {
  title: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      className={cx(
        'sticky z-[2] flex items-center gap-[12px] bg-white pb-[4px] pt-[16px] lg:gap-[14px] lg:pb-[8px] lg:pt-[26px]',
        SECTION_STICKY_TOP,
      )}
    >
      {align === 'center' && (
        <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" />
      )}
      <span className="text-[17px] tracking-[0.3px] text-[#0F171F] lg:text-[20px]">
        {title}
      </span>
      <span className="h-px flex-1 bg-[rgba(15,23,31,0.08)]" />
    </div>
  );
}

/**
 * Tab de equipo (versión 5c): logo + nombre con subrayado de 2.5px en el color
 * del equipo, superpuesto a la regla inferior de la fila.
 */
function TeamTab({
  code,
  justify,
  compact = false,
  hideLogoOnMobile = false,
  insetUnderline = false,
}: {
  code: string;
  justify: 'start' | 'center' | 'end';
  compact?: boolean;
  hideLogoOnMobile?: boolean;
  insetUnderline?: boolean;
}) {
  const team = getCompareTeam(code);

  return (
    <div
      className={cx(
        'relative flex min-w-0 items-center gap-[6px] self-stretch pb-[9px] pt-[10px] lg:gap-[8px]',
        {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
        },
      )}
    >
      <span
        className={cx('shrink-0', hideLogoOnMobile ? 'hidden lg:inline-flex' : 'inline-flex')}
      >
        <span className="lg:hidden">
          <TeamLogoAvatar teamCode={code} size={20} />
        </span>
        <span className="hidden lg:inline-flex">
          <TeamLogoAvatar teamCode={code} size={compact ? 20 : 24} />
        </span>
      </span>
      <span
        className={cx(
          'truncate text-[rgba(15,23,31,0.9)]',
          compact ? 'text-[13px] lg:text-[16px]' : 'text-[14px] lg:text-[17px]',
        )}
      >
        {team?.nickname}
      </span>
      {/* Subrayado del color del equipo, montado sobre la regla de la fila. */}
      <span
        className={cx(
          'absolute -bottom-[1px] h-[2.5px] rounded-full',
          insetUnderline ? 'left-[14px] right-[14px]' : 'left-0 right-0',
        )}
        style={{ backgroundColor: team?.color ?? '#7D7D7D' }}
        aria-hidden
      />
    </div>
  );
}

const TABS_LABEL_CLASS =
  'font-barlow text-[8px] font-semibold tracking-[1.2px] text-[rgba(15,23,31,0.4)] lg:text-[10px] lg:tracking-[1.6px]';

/**
 * Fila de equipos seleccionados (5c: tabs de equipo). Sticky arriba del view;
 * al despegar aparece una sombra inferior sutil (sentinel + IO).
 */
function TeamTabsRow({ teams }: { teams: CompareTeamData[] }) {
  const count = teams.length;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const row = cx(
    'sticky top-0 z-[3] grid min-h-[40px] items-center border-b border-[rgba(15,23,31,0.08)] bg-white transition-shadow lg:min-h-[46px]',
    gridFor(count),
    stuck && 'shadow-[0_10px_14px_-10px_rgba(15,23,31,0.15)]',
  );

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="mt-[14px] h-px lg:mt-[22px]" />
      {count === 2 ? (
        <div className={row}>
          <TeamTab code={teams[0].code} justify="end" />
          <div className={cx('self-center pb-[12px] pt-[10px] text-center', TABS_LABEL_CLASS)}>
            ESTADÍSTICA
          </div>
          <TeamTab code={teams[1].code} justify="start" />
        </div>
      ) : count === 4 ? (
        <div className={row}>
          <TeamTab code={teams[0].code} justify="center" compact hideLogoOnMobile insetUnderline />
          <TeamTab code={teams[1].code} justify="center" compact hideLogoOnMobile insetUnderline />
          <div className={cx('self-center pb-[12px] pt-[10px] text-center', TABS_LABEL_CLASS)}>
            ESTADÍSTICA
          </div>
          <TeamTab code={teams[2].code} justify="center" compact hideLogoOnMobile insetUnderline />
          <TeamTab code={teams[3].code} justify="center" compact hideLogoOnMobile insetUnderline />
        </div>
      ) : (
        <div className={row}>
          <div className={cx('self-center text-left', TABS_LABEL_CLASS)}>
            ESTADÍSTICA
          </div>
          {teams.map((team) => (
            <TeamTab
              key={team.code}
              code={team.code}
              justify="center"
              compact
              hideLogoOnMobile
              insetUnderline
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function CompareStatsPanel({ teams, seasonProviderId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('todos');
  const isLoading = teams.some((t) => t.loading);
  const count = teams.length;

  const visibleSections =
    activeTab === 'todos'
      ? COMPARE_SECTIONS
      : COMPARE_SECTIONS.filter((s) => s.id === activeTab);

  const renderRow = (stat: CompareStat) => {
    const key = stat.code + stat.label;
    if (count === 2) return <StatRowTwo key={key} stat={stat} teams={teams} />;
    if (count === 4) return <StatRowFour key={key} stat={stat} teams={teams} />;
    return <StatRowLeft key={key} stat={stat} teams={teams} />;
  };

  return (
    <div className="rounded-[16px] border border-[rgba(15,23,31,0.06)] bg-white px-[16px] pb-[18px] pt-[6px] shadow-[0_12px_32px_rgba(15,23,31,0.08)] lg:px-[44px] lg:pb-[34px] lg:pt-[10px]">
      {/* Tabs de secciones */}
      <div className="mt-[14px] flex flex-wrap justify-center gap-x-[14px] gap-y-[6px] lg:mt-[20px] lg:gap-x-[30px]">
        {[
          { id: 'todos' as TabId, label: 'Todos', shortLabel: 'Todos' },
          ...COMPARE_SECTIONS.map((s) => ({
            id: s.id as TabId,
            label: s.title,
            shortLabel: s.shortTitle,
          })),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cx(
              'cursor-pointer pb-[5px] text-[16px] transition-colors lg:pb-[6px] lg:text-[18px]',
              activeTab === tab.id
                ? 'border-b-2 border-[#0F171F] text-[#0F171F]'
                : 'text-[rgba(15,23,31,0.4)] hover:text-[rgba(15,23,31,0.65)]',
            )}
          >
            <span className="lg:hidden">{tab.shortLabel}</span>
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <TeamTabsRow teams={teams} />

      {isLoading ? (
        <div className="space-y-3 py-[26px]">
          <ShimmerLine height="28px" />
          <ShimmerLine height="28px" />
          <ShimmerLine height="28px" />
          <ShimmerLine height="28px" />
        </div>
      ) : (
        <>
          {visibleSections.map((section) => (
            <div key={section.id}>
              <SectionTitle
                title={section.title}
                align={count === 3 ? 'left' : 'center'}
              />
              {section.stats.map(renderRow)}
            </div>
          ))}

          {/* Últimos encuentros solo en el tab default "Todos". */}
          {activeTab === 'todos' && (
            <CompareRecentMeetings
              codes={teams.map((t) => t.code)}
              seasonProviderId={seasonProviderId}
              titleAlign={count === 3 ? 'left' : 'center'}
            />
          )}

          <CompareExportPdfFooter
            season={seasonProviderId ?? ''}
            teamIds={teams.map((t) => t.code)}
            /* TabId es 'todos' | string, así que no estrecha solo. */
            tab={activeTab as TeamComparisonPrintRequest['tab']}
          />
        </>
      )}
    </div>
  );
}
