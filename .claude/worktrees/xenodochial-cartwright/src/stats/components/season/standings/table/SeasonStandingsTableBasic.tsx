import TeamLogoAvatar from '@/team/components/avatar/TeamLogoAvatar';
import {
  formatStandingsWinPct,
  winFractionFromRecord,
} from '@/utils/number-formater';

type Row = {
  team: {
    code: string;
    nickname: string;
  };
  pg: number;
  pp: number;
  loc: string;
  vis: string;
};

type Props = {
  group: string;
  data: Row[];
};

export default function SeasonStandingsTableBasic({ group, data }: Props) {
  return (
    <div className="flex flex-col justify-start gap-4">
      <div>
        <div className="flex flex-row justify-start items-center">
          <div className="w-[40%]">
            <p className="font-special-gothic-condensed-one text-base">
              {group}
            </p>
          </div>
          <div className="w-[12%]">
            <p className="font-special-gothic-condensed-one text-base text-right">
              PG
            </p>
          </div>
          <div className="w-[12%]">
            <p className="font-special-gothic-condensed-one text-base text-right">
              PP
            </p>
          </div>
          <div className="w-[12%]">
            <p className="font-special-gothic-condensed-one text-base text-right">
              PCT
            </p>
          </div>
          <div className="w-[12%]">
            <p className="font-special-gothic-condensed-one text-base text-right">
              LOC
            </p>
          </div>
          <div className="w-[12%]">
            <p className="font-special-gothic-condensed-one text-base text-right">
              VIS
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start gap-4">
        {data.map((row, index) => (
          <div
            key={row.team.code}
            className="flex flex-row justify-start items-center"
          >
            <div className="w-[40%]">
              <a className="flex flex-row justify-start items-center gap-2">
                <div className="border border-[rgba(125,125,125,0.13)] rounded-full bg-[rgba(54,54,54,0.18)] w-[25px] h-[25px] flex justify-center items-center">
                  <p className="font-barlow font-semibold text-sm">
                    {index + 1}
                  </p>
                </div>
                <TeamLogoAvatar teamCode={row.team.code} size={24} />
                <p className="font-special-gothic-condensed-one text-base">
                  {row.team.nickname}
                </p>
              </a>
            </div>
            <div className="w-[12%]">
              <p className="font-barlow text-sm text-right">{row.pg}</p>
            </div>
            <div className="w-[12%]">
              <p className="font-barlow text-sm text-right">{row.pp}</p>
            </div>
            <div className="w-[12%]">
              <p className="font-barlow text-sm text-right">
                {formatStandingsWinPct(
                  winFractionFromRecord(row.pg, row.pp),
                )}
              </p>
            </div>
            <div className="w-[12%]">
              <p className="font-barlow text-sm text-right">{row.loc}</p>
            </div>
            <div className="w-[12%]">
              <p className="font-barlow text-sm text-right">{row.vis}</p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="flex flex-row justify-center items-center py-4">
            <p className="text-center text-gray-500">
              No hay datos disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
