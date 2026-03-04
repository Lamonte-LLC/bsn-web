import { getClient } from '@/apollo-client';
import { SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY } from '@/graphql/stats';
import APGPlayerLeadersCard from '@/stats/widgets/season/player/APGPlayerLeadersCard';
import BPGPlayerLeadersCard from '@/stats/widgets/season/player/BPGPlayerLeadersCard';
import FGMPlayerLeadersCard from '@/stats/widgets/season/player/FGMPlayerLeadersCard';
import PPGPlayerLeadersCard from '@/stats/widgets/season/player/PPGPlayerLeadersCard';
import RPGPlayerLeadersCard from '@/stats/widgets/season/player/RPGPlayerLeadersCard';
import SPGPlayerLeadersCardNew from '@/stats/widgets/season/player/SPGPlayerLeadersCardNew';

/**
 * Renders the "Líderes de Temporada 2026" section only when there is data.
 * Uses the PPG leaders query as a lightweight proxy check — if it returns
 * no results the whole section is hidden.
 */
export default async function SeasonLeadersSection() {
  const { data } = await getClient().query({
    query: SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY,
    variables: { statsCode: 'POINTS_AVG', first: 1 },
  });

  const hasData =
    (data?.seasonPlayerStatsConnection?.edges?.length ?? 0) > 0;

  if (!hasData) return null;

  return (
    <section className="container mb-8 lg:mb-16">
      <div className="lg:w-11/12 mx-auto">
        <div className="flex flex-row justify-between items-center mb-[20px] md:mb-[32px]">
          <h2 className="text-[22px] text-[#0F171F] md:text-[32px]">
            Líderes de Temporada 2026
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[24px] gap-y-[23px]">
          <PPGPlayerLeadersCard />
          <RPGPlayerLeadersCard />
          <APGPlayerLeadersCard />
          <BPGPlayerLeadersCard />
          <SPGPlayerLeadersCardNew />
          <FGMPlayerLeadersCard />
        </div>
      </div>
    </section>
  );
}
