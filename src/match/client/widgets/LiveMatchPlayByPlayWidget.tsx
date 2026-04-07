'use client';

import Lottie from 'lottie-react';
import animationLiveStreamData from '../../../lottie/live-stream-green.json';
import MatchPlayByPlayBasicList from '../components/play-by-play/MatchPlayByPlayBasicList';
import { useMatchLivePlayByPlay } from '../hooks/matches';
import ShimmerLine from '@/shared/client/components/ui/ShimmerLine';
import { MatchPlayByPlayEventType } from '@/match/types';

type Props = {
  matchProviderId: string;
};

function playByPlayFormatter(item: MatchPlayByPlayEventType) {
  let title = '';
  let description = '';
  let highlight = false;

  switch (item.eventType) {
    case '2pt':
      title = item.success ? '+2 puntos' : 'Falló 2 puntos';
      highlight = item.success;
      description = item.person?.name ?? 'Desconocido';
      break;
    case '3pt':
      title = item.success ? '+3 puntos' : 'Falló 3 puntos';
      highlight = item.success;
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'assist':
      title = 'Asistencia';
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'rebound':
      title = 'Rebote';
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'steal':
      title = 'Robo de balón';
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'block':
      title = 'Bloqueo';
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'foul':
      title = 'Falta';
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'freeThrow':
      title = item.success ? 'Tiro libre anotado' : 'Falló tiro libre';
      highlight = item.success;
      description = item.person?.name ?? 'Desconocido';
      break;
    case 'substitution':
      title = 'Sustitución';
      const inOut = item.subType === 'in' ? 'entró al juego' : 'salió del juego';
      description = `${item.person?.name ?? 'Desconocido'} ${inOut}`;
      break;
    case 'turnover':
      title = 'Pérdida de balón';
      description = item.person?.name ?? 'Desconocido';
      break;
    default:
      title = 'Otra jugada';
      description = 'Descripción de la jugada';
  }

  return {
    id: item.eventId,
    time: item.clock || '',
    title,
    description,
    team: {
      code: item.team?.code || 'ZZZ',
    },
    highlight,
    extraInfo: [],
  }
}

export default function LiveMatchPlayByPlayWidget({ matchProviderId }: Props) {
  const { data, loading } = useMatchLivePlayByPlay(matchProviderId, true)

  if (loading) {
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
        <div className="space-y-2">
          <ShimmerLine height="40px" />
          <ShimmerLine height="40px" />
          <ShimmerLine height="40px" />
          <ShimmerLine height="40px" />
        </div>
      </div>
    )
  }

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
          data={data.map(playByPlayFormatter)}
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
