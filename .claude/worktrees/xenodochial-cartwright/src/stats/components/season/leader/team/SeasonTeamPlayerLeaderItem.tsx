import PlayerPhotoAvatar from '@/player/components/avatar/PlayerPhotoAvatar';
import Link from 'next/link';

type Props = {
  position: number;
  player: {
    id: string;
    avatarUrl?: string | null;
    name: string;
  };
  statValue: number;
  avatarSize?: number;
};

export default function SeasonTeamPlayerLeaderItem({
  position = 1,
  player,
  statValue,
  avatarSize = 30,
}: Props) {
  return (
    <Link
      href={`/jugadores/${player.id}`}
      className="flex items-center py-1 gap-3"
    >
      <div className="w-4 text-right">
        <span className="font-barlow-condensed text-[15px] text-[rgba(0,0,0,0.8)]">
          {position}
        </span>
      </div>
      <div className="flex flex-1 flex-row items-center gap-3">
        <PlayerPhotoAvatar
          photoUrl={player.avatarUrl ?? ''}
          size={avatarSize}
          name={player.name}
        />
        <div className="flex-1">
          <p className="text-[16px] text-[rgba(15,23,31,0.9)]">
            {player.name}
          </p>
        </div>
      </div>
      <div className="text-[24px] text-[rgba(15,23,31,0.9)] md:text-[32px]">
        {statValue}
      </div>
    </Link>
  );
}
