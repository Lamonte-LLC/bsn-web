'use client';

import Lottie from 'lottie-react';
import MatchCompetitorBoxScoreBasicTable from '../components/competitor/MatchCompetitorBoxScoreBasicTable';
import animationLiveStreamData from '../../../lottie/live-stream-green.json';

export default function LiveMatchBasicBoxScoreBasicWidget() {
  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">En cancha</h3>
        </div>
        <div className="flex flex-row items-center gap-1">
          <Lottie
            animationData={animationLiveStreamData}
            loop
            autoplay
            style={{ width: '16px', height: '16px' }}
          />
          <p className="font-barlow font-medium text-[13px] text-[#8D939E]">
            En vivo
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 mb-[14px] lg:grid-cols-2 lg:gap-[50px] lg:mb-[30px]">
        <MatchCompetitorBoxScoreBasicTable
          team={{
            code: 'SCE',
            nickname: 'Cangrejeros',
          }}
          data={[
            {
              player: {
                id: '1',
                name: 'Player One',
              },
              points: 15,
              rebounds: 7,
              assists: 4,
            },
            {
              player: {
                id: '2',
                name: 'Player Two',
              },
              points: 15,
              rebounds: 7,
              assists: 4,
            },
            {
              player: {
                id: '3',
                name: 'Player Three',
              },
              points: 15,
              rebounds: 7,
              assists: 4,
            },
          ]}
        />
        <MatchCompetitorBoxScoreBasicTable
          team={{
            code: 'CAG',
            nickname: 'Criollos',
          }}
          data={[]}
        />
      </div>
      <div>
        <button
          className="bg-[#FCFCFC] block border border-[#D9D3D3] cursor-pointer rounded-[12px] p-[12px] text-center w-full"
          type="button"
        >
          <span className="text-base text-black">Ver Box Score</span>
        </button>
      </div>
    </div>
  );
}
