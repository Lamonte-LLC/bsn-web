'use client';

import SeasonStandingsGroupTableBasic from '@/stats/components/season/standings/table/SeasonStandingsGroupTableBasic';
import { useState } from 'react';

type Row = {
  team: {
    code: string;
    nickname: string;
  };
  pg: number;
  pp: number;
};

type Group = {
  name: string;
  teams: Row[];
};

type Props = {
  groups: Group[];
};

export default function SeasonStandingsTableBasicGroups({ groups }: Props) {
  const [tab, setTab] = useState(groups[0]?.name ?? '');

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-3">
        <h3 className="text-[22px] text-black md:text-[24px]">
          Posiciones
        </h3>
        <div className="flex flex-row gap-[8px]">
          {groups.map((group) => (
            <button
              key={`table-tab-${group.name}`}
              onClick={() => setTab(group.name)}
              className="border rounded-[100px] px-[20px] py-[5px] text-[15px]"
              style={{
                backgroundColor: tab === group.name ? '#0F171F' : '#ffffff',
                color: tab === group.name ? '#FFFFFF' : 'rgba(0, 0, 0, 0.65)',
                borderColor: tab === group.name ? '#0F171F' : 'rgba(213, 213, 213, 1)',
              }}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        {groups.map((group) => (
          <div
            key={`table-tab-content-${group.name}`}
            className={tab === group.name ? '' : 'hidden'}
          >
            <SeasonStandingsGroupTableBasic data={group.teams} />
          </div>
        ))}
      </div>
    </div>
  );
}
