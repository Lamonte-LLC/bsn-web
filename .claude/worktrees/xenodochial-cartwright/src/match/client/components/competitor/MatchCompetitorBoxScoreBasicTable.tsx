import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';

type Row = {
  player: {
    id: string;
    name: string;
  };
  points: number;
  rebounds: number;
  assists: number;
};

type Props = {
  team: {
    code: string;
    nickname: string;
  };
  data: Row[];
};

export default function MatchCompetitorBoxScoreBasicTable({
  team,
  data,
}: Props) {
  return (
    <div>
      <div className="flex flex-row justify-between items-center gap-[12px] py-1.5">
        <div className="flex flex-row grow items-center gap-1">
          <TeamLogoAvatar teamCode={team.code} size={20} />
          <p className="text-center text-[13px] text-[rgba(0,0,0,0.6)] uppercase">
            {team.nickname}
          </p>
        </div>
        <div className="w-[34px]">
          <p className="text-center text-[13px] text-[rgba(0,0,0,0.6)]">PTS</p>
        </div>
        <div className="w-[34px]">
          <p className="text-center text-[13px] text-[rgba(0,0,0,0.6)]">REB</p>
        </div>
        <div className="w-[34px]">
          <p className="text-center text-[13px] text-[rgba(0,0,0,0.6)]">AST</p>
        </div>
      </div>
      <div className="divide-y divide-[rgba(0,0,0,0.07)]">
        {data.map((row) => (
          <div
            key={row.player.id}
            className="flex flex-row justify-between items-center gap-[12px] py-1.5"
          >
            <div className="grow">
              <p className="text-[14px] text-black">{row.player.name}</p>
            </div>
            <div className="w-[34px]">
              <p className="font-barlow text-center text-[14px] text-[rgba(0,0,0,0.9)]">
                {row.points}
              </p>
            </div>
            <div className="w-[34px]">
              <p className="font-barlow text-center text-[14px] text-[rgba(0,0,0,0.9)]">
                {row.rebounds}
              </p>
            </div>
            <div className="w-[34px]">
              <p className="font-barlow text-center text-[14px] text-[rgba(0,0,0,0.9)]">
                {row.assists}
              </p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-[14px] text-[rgba(0,0,0,0.6)] mt-2">
            No hay datos disponibles.
          </p>
        )}
      </div>
    </div>
  );
}
