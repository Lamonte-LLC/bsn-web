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
  statValue: string | number;
};

type Props = {
  title: string;
  subtitle?: string;
  data: Row[];
};

export default function SeasonPlayerLeadersCard({ title, subtitle, data }: Props) {
  return (
    <div className="border border-[#E5E5E5] flex-1 rounded-[12px] bg-[#fdfdfd]">
      <div className="flex flex-row justify-between items-center py-[18px] pl-[20px] pr-[25px]">
        <h2 className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.7)]">
          {title}
        </h2>
        <h4 className="font-barlow text-xs text-[rgba(0,0,0,0.6)]">{subtitle}</h4>
      </div>
      <div className="pl-[20px] pr-[25px]">
        <ul>
          {data.map((row, index) => (
            <li key={index} className={index < data.length - 1 ? 'border-b-[0.5px] border-[rgba(0,0,0,0.05)]' : ''}>
              <SeasonPlayerLeaderItem
                position={row.position}
                player={row.player}
                statValue={row.statValue}
                avatarSize={index == 0 ? 45 : 30}
                size={index == 0 ? 'lg' : 'md'}
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
      <div className="border-t border-[rgba(0,0,0,0.13)] p-3.5 hidden">
        <p className="text-center">
          <a
            href="#"
            className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.9)]"
          >
            <span className="underline">Ver más estadísticas</span>&nbsp;
            <img src="/assets/images/icons/icon-arrow-right.svg" alt="" className="align-middle inline" />
          </a>
        </p>
      </div>
    </div>
  );
}
