'use client';

import cx from 'classnames';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { COMPARE_TEAMS, MAX_COMPARE_TEAMS } from './teams';

type Props = {
  selected: string[];
  onToggle: (code: string) => void;
  /** Rejilla del diálogo: tiles un poco más compactos. */
  compact?: boolean;
  className?: string;
};

export default function TeamPickerGrid({
  selected,
  onToggle,
  compact = false,
  className = '',
}: Props) {
  const isFull = selected.length >= MAX_COMPARE_TEAMS;

  return (
    <div
      className={cx(
        'grid grid-cols-3 gap-[7px] md:grid-cols-4 md:gap-[10px]',
        !compact && 'lg:grid-cols-6',
        className,
      )}
    >
      {COMPARE_TEAMS.map((team) => {
        const isSelected = selected.includes(team.code);
        const isDisabled = !isSelected && isFull;

        return (
          <button
            key={team.code}
            type="button"
            onClick={() => onToggle(team.code)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            className={cx(
              'flex aspect-square flex-col items-center justify-center rounded-[10px] border bg-white px-[6px] text-center transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F171F]/30',
              {
                'border-[#0F171F] bg-[rgba(15,23,31,0.03)]': isSelected,
                'border-[#EAEAEA] hover:border-[rgba(47,47,47,1)]':
                  !isSelected && !isDisabled,
                'border-[#EAEAEA] opacity-40 cursor-not-allowed': isDisabled,
                'cursor-pointer': !isDisabled,
              },
            )}
          >
            <TeamLogoAvatar teamCode={team.code} size={compact ? 40 : 48} />
            <span
              className={cx('mt-[5px] leading-[1.15] md:mt-[7px]', {
                'text-[15px] md:text-[16px]': true,
                'text-[#0F171F]': isSelected,
                'text-[rgba(15,23,31,0.9)]': !isSelected,
              })}
            >
              {team.nickname}
            </span>
            <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.5)]">
              {team.city}
            </span>
          </button>
        );
      })}
    </div>
  );
}
