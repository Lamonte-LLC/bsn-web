'use client';

import { useCallback, useState } from "react";
import PlayerStatsWidget from "./PlayerStatsWidget";
import { SeasonType } from "@/season/types";
import PlayerStatsFilter from "../components/PlayerStatsFilter";

type Props = {
  playerProviderId: string;
};

export default function PlayerSeasonStatsWidget({ playerProviderId }: Props) {
  const [appliedSeason, setAppliedSeason] = useState<SeasonType | null>(null);

  const handleOnApply = useCallback((filters: { season: SeasonType | null }) => {
    setAppliedSeason(filters.season);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-[40px] md:gap-[30px] md:grid-cols-12">
      <div className="order-last md:order-first md:col-span-8">
        <div className="flex flex-row justify-between items-center mb-[30px]">
          <div>
            <h3 className="text-[22px] text-black md:text-[24px]">
              Promedios - {appliedSeason ? appliedSeason.name : 'Última temporada'}
            </h3>
          </div>
        </div>
        <div className="mb-6 md:mb-10 lg:mb-15">
          <PlayerStatsWidget
            playerProviderId={playerProviderId}
            seasonProviderId={appliedSeason?.providerId ?? ''}
          />
        </div>
      </div>
      <div className="md:col-span-4">
        <PlayerStatsFilter
          onApply={handleOnApply}
        />
      </div>
    </div>
  );
}
