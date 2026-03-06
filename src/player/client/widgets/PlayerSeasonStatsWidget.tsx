'use client';

import { useCallback, useState } from 'react';
import PlayerSeasonAvgStatsWidget from './PlayerSeasonAvgStatsWidget';
import { SeasonType } from '@/season/types';
import PlayerStatsFilter from '../components/PlayerStatsFilter';
import PlayerSeasonTotalStatsWidget from './PlayerSeasonTotalStatsWidget';

type Props = {
  playerProviderId: string;
};

export default function PlayerSeasonStatsWidget({ playerProviderId }: Props) {
  const [appliedSeason, setAppliedSeason] = useState<SeasonType | null>(null);
  const [appliedView, setAppliedView] = useState<string>('AVERAGE');

  const handleOnApply = useCallback(
    (filters: { season: SeasonType | null; view: string }) => {
      setAppliedSeason(filters.season);
      setAppliedView(filters.view);
    },
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-[40px] md:gap-[30px] md:grid-cols-12">
      <div className="order-last md:order-first md:col-span-8">
        <div className="flex flex-row justify-between items-center mb-[30px]">
          <div>
            <h3 className="text-[22px] text-black md:text-[24px]">
              {appliedView === 'AVERAGE' ? 'Promedios' : 'Totales'} -{' '}
              {appliedSeason ? appliedSeason.name : 'Última temporada'}
            </h3>
          </div>
        </div>
        <div className="mb-6 md:mb-10 lg:mb-15">
          {appliedView === 'AVERAGE' ? (
            <PlayerSeasonAvgStatsWidget
              playerProviderId={playerProviderId}
              seasonProviderId={appliedSeason?.providerId ?? ''}
            />
          ) : (
            <PlayerSeasonTotalStatsWidget
              playerProviderId={playerProviderId}
              seasonProviderId={appliedSeason?.providerId ?? ''}
            />
          )}
        </div>
      </div>
      <div className="md:col-span-4">
        <PlayerStatsFilter onApply={handleOnApply} />
      </div>
    </div>
  );
}
