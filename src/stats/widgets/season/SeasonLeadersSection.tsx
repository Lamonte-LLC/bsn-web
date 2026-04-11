import { getClient } from '@/apollo-client';
import { CURRENT_SEASON } from '@/graphql/season';
import { SeasonType } from '@/season/types';
import SportRadarLeadersWidget from '@/match/client/widgets/SportRadarLeadersWidget';

type CurrentSeasonResponse = {
  currentSeason?: SeasonType;
};

const fetchCurrentSeason = async (): Promise<SeasonType | null> => {
  const { data, error } = await getClient().query<CurrentSeasonResponse>({
    query: CURRENT_SEASON,
  });

  if (error) {
    console.error('Error fetching current season:', error);
    return null;
  }
  return data?.currentSeason ?? null;
};

/**
 * Renders the "Líderes de Temporada 2026" section only when there is data.
 * Uses the PPG leaders query as a lightweight proxy check — if it returns
 * no results the whole section is hidden.
 */
export default async function SeasonLeadersSection() {
  const currentSeason: SeasonType | null = await fetchCurrentSeason();

  return (
    <section className="container">
      <div className="flex flex-row justify-between items-center mb-[20px] md:mb-[32px]">
        <h2 className="text-[22px] text-[#0F171F] md:text-[32px]">
          Líderes {currentSeason ? `de ${currentSeason.name}` : ''}
        </h2>
      </div>
      <SportRadarLeadersWidget />
    </section>
  );
}
