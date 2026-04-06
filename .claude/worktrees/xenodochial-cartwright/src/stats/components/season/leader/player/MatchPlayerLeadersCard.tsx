import SeasonPlayerLeaderItem from './SeasonPlayerLeaderItem';

type Row = {
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
  statValue: number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: Row[];
};

export default function MatchPlayerLeadersCard({ title, subtitle, data }: Props) {
  return (
    <div className="border border-[#E5E5E5] flex-1 rounded-[12px] bg-[#fdfdfd] shadow-[0px_1px_3px_0px_rgba(20,24,31,0.04)]">
      <div className="flex flex-row justify-between items-center p-4">
        <h2 className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.7)]">
          {title}
        </h2>
        {subtitle && (<h4 className="font-barlow text-xs text-[rgba(0,0,0,0.6)]">{subtitle}</h4>)}
      </div>
      <div className="px-[20px] pb-[10px]">
        <ul>
          {data.map((row, index) => (
            <li key={index} className={index < data.length - 1 ? 'border-b border-[rgba(0,0,0,0.07)]' : ''}>
              <SeasonPlayerLeaderItem
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
