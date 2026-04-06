'use client';

import Lottie from 'lottie-react';
import animationLiveStreamData from '../../../lottie/live-stream-green.json';
import MatchPlayByPlayBasicList from '../components/play-by-play/MatchPlayByPlayBasicList';

export default function LiveMatchPlayByPlayWidget() {
  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">En vivo</h3>
        </div>
        <div className="flex flex-row items-center gap-1">
          <Lottie
            animationData={animationLiveStreamData}
            loop
            autoplay
            style={{ width: '16px', height: '16px' }}
          />
          <p className="font-barlow font-medium text-[13px] text-[#8D939E]">
            Auto-actualización ON
          </p>
        </div>
      </div>
      <div className="mb-[14px] lg:mb-[30px]">
        <MatchPlayByPlayBasicList
          data={[
            {
              id: '1',
              time: '00:05',
              title: 'Rebote defensivo',
              description: 'Gabriel Santiago',
              team: {
                code: 'SCE',
              },
              highlight: true,
              extraInfo: [
                { label: 'SCE', value: '127' },
                { label: 'GBO', value: '113' },
              ],
            },
            {
              id: '2',
              time: '00:10',
              title: 'Canasta de 2 puntos',
              description: 'Juan Pérez',
              team: {
                code: 'GBO',
              },
              highlight: false,
              extraInfo: [],
            },
            {
              id: '3',
              time: '00:20',
              title: 'Falta personal',
              description: 'Gabriel Santiago',
              team: {
                code: 'SCE',
              },
              highlight: false,
              extraInfo: [],
            },
          ]}
        />
      </div>
      <div>
        <button
          className="bg-[#FCFCFC] block border border-[#D9D3D3] cursor-pointer rounded-[12px] p-[12px] text-center w-full"
          type="button"
        >
          <span className="text-base text-black">Ver todas las jugadas</span>
        </button>
      </div>
    </div>
  );
}
