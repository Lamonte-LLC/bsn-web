import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import cx from 'classnames';

type Props = {
  code: string;
  name: string;
  city: string;
  ranking?: string;
  disabled?: boolean;
  avatarSize?: number;
};

export default function MatchCompetitor({
  code,
  name,
  city,
  ranking,
  disabled = false,
  avatarSize = 42,
}: Props) {
  return (
    <div
      className="flex flex-row items-center justify-center gap-[6px] md:gap-[12px]"
    >
      <div className="hidden md:block">
        <TeamLogoAvatar teamCode={code} size={avatarSize} />
      </div>
      <div className="md:hidden">
        <TeamLogoAvatar teamCode={code} size={25} />
      </div>
      <div className="flex-1">
        <p
          className="text-base md:text-lg/5"
          style={{
            color: disabled ? 'rgba(255, 255, 255, 0.5)' : '#fff',
          }}
        >
          {name}{' '}
          {ranking && (
            <span className="font-barlow text-xs text-[rgba(255,255,255,0.6)] hidden md:inline ml-[2px]">
              {ranking}
            </span>
          )}
        </p>
        <p className="font-barlow text-xs text-[rgba(255,255,255,0.6)] hidden md:block">
          {city}
        </p>
      </div>
    </div>
  );
}
