import cx from 'classnames';
import Link from 'next/link';
import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

type Props = {
  position: number;
  player: {
    id: string;
    avatarUrl?: string | null;
    name: string;
    team?: {
      code: string;
      name: string;
    };
  };
  statValue: string | number;
  avatarSize?: number;
  size?: 'sm' | 'md' | 'lg';
};

export default function SeasonPlayerLeaderItem({
  position = 1,
  player,
  statValue,
  avatarSize = 30,
  size = 'md',
}: Props) {
  return (
    <Link
      href={`/jugadores/${player.id}`}
      className="flex items-center py-2 gap-1"
    >
      <div className="w-4 text-left">
        <span className="font-barlow-condensed text-[15px] text-[rgba(0,0,0,0.8)]">
          {position}
        </span>
      </div>
      <div className="flex flex-1 flex-row items-center gap-3">
        <div className="rounded-full border border-[#E5E5E5] overflow-hidden shrink-0">
          <PlayerPhotoAvatar
            photoUrl={player.avatarUrl ?? ''}
            size={avatarSize}
            name={player.name}
          />
        </div>
        <div className="flex-1">
          <p
            className={cx('text-[rgba(15,23,31,0.9)]', {
              'text-[13px]/5': size === 'sm',
              'text-[16px]/4': size === 'md',
              'text-[17px]/5': size === 'lg',
            })}
          >
            {player.name}
          </p>
          <div className="flex items-center gap-1">
            {player.team?.code && (
              <TeamLogoAvatar teamCode={player.team.code} size={12} />
            )}
            <p className="font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)]">
              {player.team?.name}
            </p>
          </div>
        </div>
      </div>
      <p
        className={cx('text-[rgba(15,23,31,0.9)]', {
          'text-base md:text-[18px]': size === 'sm',
          'text-[20px] md:text-[24px]': size === 'md',
          'text-[26px] md:text-[32px]': size === 'lg',
        })}
      >
        {statValue}
      </p>
    </Link>
  );
}
