'use client';

import PlayerAvatar from '@/archivo/components/PlayerAvatar';
import type { ComparePlayerData } from '@/historia/lib/compare-players';

type Props = {
  player: Pick<ComparePlayerData, 'name' | 'avatarUrl' | 'color'>;
  /** Outer diameter in px. */
  size: number;
  /** Rendered on the ink band (initials get the on-dark treatment). */
  onDark?: boolean;
  onRemove?: () => void;
  className?: string;
};

/**
 * Player photo inside a circle outlined in the team color, same treatment as CompareTeamMark in
 * /comparar-equipos (border-2, no fill). Without a photo, the initials avatar of the archive.
 */
export default function PlayerMark({ player, size, onDark = false, onRemove, className = '' }: Props) {
  const inner = size - 4;
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span
        className="flex items-center justify-center overflow-hidden rounded-full border-2"
        style={{ width: size, height: size, borderColor: player.color, background: onDark ? '#0F171F' : '#fff' }}
      >
        {player.avatarUrl ? (
          <img src={`${player.avatarUrl}?size=200`} alt={player.name} width={inner} height={inner} className="h-full w-full object-cover" />
        ) : (
          <PlayerAvatar name={player.name} color={player.color} sizePx={inner} onDark={onDark} />
        )}
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Quitar a ${player.name}`}
          title={`Quitar a ${player.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute -right-[4px] -top-[4px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] text-white/45 transition-colors before:absolute before:-inset-[12px] before:content-[''] hover:bg-[rgba(255,255,255,0.22)] hover:text-white lg:-right-[3px] lg:-top-[3px] lg:h-[18px] lg:w-[18px]"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}
