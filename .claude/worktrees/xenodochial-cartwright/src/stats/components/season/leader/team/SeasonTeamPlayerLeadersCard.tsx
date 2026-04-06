import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import SeasonTeamPlayerLeaderItem from './SeasonTeamPlayerLeaderItem';

type Row = {
  position: number;
  player: {
    id: string;
    avatarUrl?: string | null;
    name: string;
  };
  statValue: number;
};

type Props = {
  title: string;
  teamCode: string;
  data: Row[];
};

export default function SeasonTeamPlayerLeadersCard({ title, teamCode, data }: Props) {
  return (
    <div className="border border-[#E5E5E5] flex-1 rounded-[12px] bg-[#fdfdfd] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
      <div className="flex flex-row justify-between items-center px-[20px] py-4">
        <h2 className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.7)]">
          {title}
        </h2>
        <TeamLogoAvatar teamCode={teamCode} size={28} />
      </div>
      <div className="px-[20px] pb-[12px]">
        <ul>
          {data.map((row, index) => (
            <li
              key={row.player.id}
              className={index < data.length - 1 ? 'border-b border-[rgba(0,0,0,0.07)]' : ''}
            >
              <SeasonTeamPlayerLeaderItem
                position={row.position}
                player={row.player}
                statValue={row.statValue}
                avatarSize={30}
              />
            </li>
          ))}
          {data.length === 0 && (
            <li className="p-4 text-center text-gray-500">
              No hay datos disponibles.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
