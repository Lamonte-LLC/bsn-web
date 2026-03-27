import numeral from 'numeral';
import Link from 'next/link';
import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import { getFirstWord } from '@/utils/text';

type Row = {
  team: {
    code: string;
    nickname: string;
  };
  pg: number;
  pp: number;
  pct: number;
};

type Props = {
  data: Row[];
};

export default function SeasonStandingsGroupTableBasic({ data }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        <div className="flex-none w-8 px-2 py-2 text-right">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">#</span>
        </div>
        <div className="flex-1 pl-1 pr-2 py-1 text-left">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">EQUIPO</span>
        </div>
        <div className="flex-none px-2 py-1 text-center w-8">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">JJ</span>
        </div>
        <div className="flex-none px-2 py-1 text-center w-8">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">G</span>
        </div>
        <div className="flex-none px-2 py-1 text-center w-8">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">P</span>
        </div>
        <div className="flex-none pl-2 pr-3 py-1 text-center w-12">
          <span className="text-sm text-[rgba(0,0,0,0.4)]">PCT</span>
        </div>
      </div>
      <div>
        {data.map((row, index) => (
          <div
            key={row.team.code}
            className={`flex ${index % 2 === 1 ? 'bg-[#FAFAFA]' : ''} items-center rounded-[8px] py-3`}
          >
            <div className="flex-none w-8 px-2 py-1 text-right">
              <span className="font-barlow font-bold text-sm text-[rgba(108,108,108,0.9)]">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 pl-1 pr-2 py-1">
              <Link
                href={`/equipos/${row.team.code}`}
                className="flex flex-row gap-[9px]"
              >
                <TeamLogoAvatar teamCode={row.team.code} size={24} />
                <span className="grow text-base text-[rgba(15,23,31,0.9)]">
                  {getFirstWord(row.team.nickname)}
                </span>
              </Link>
            </div>
            <div className="flex-none px-2 py-1 text-center w-8">
              <span className="font-barlow text-sm text-[rgba(0,0,0,0.9)]">
                {numeral(row.pg + row.pp).format('0')}
              </span>
            </div>
            <div className="flex-none px-2 py-1 text-center w-8">
              <span className="font-barlow text-sm text-[rgba(22,162,73,1)]">
                {numeral(row.pg).format('0')}
              </span>
            </div>
            <div className="flex-none px-2 py-1 text-center w-8">
              <span className="font-barlow font-medium text-sm text-[rgba(239,67,67,1)]">
                {numeral(row.pp).format('0')}
              </span>
            </div>
            <div className="flex-none pl-2 pr-3 py-1 text-center w-12">
              <span className="font-barlow text-sm text-[rgba(0,0,0,0.9)]">
                {numeral(row.pct).format('0%')}
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-[rgba(0,0,0,0.4)]">
              No hay datos disponibles
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
