'use client';

import { useHeadToHeadTeamStats } from '@/team/client/hooks/teams';
import CompareEmptyCard from '@/team/components/compare/CompareEmptyCard';
import CompareStatsPanel from '@/team/components/compare/CompareStatsPanel';
import { MIN_COMPARE_TEAMS } from '@/team/components/compare/teams';
import type {
  CompareTeamData,
  TeamRecord,
} from '@/team/components/compare/types';
import { toggleCompareTeam, useCompareSelection } from './useCompareSelection';

type Props = {
  /** Récords (G-P, grupo) resueltos en el servidor desde standings. */
  records: Record<string, TeamRecord>;
};

export default function CompararEquiposPageClient({ records }: Props) {
  const { selected, seasonProviderId } = useCompareSelection();
  const hasComparison = selected.length >= MIN_COMPARE_TEAMS;

  const { data, loading } = useHeadToHeadTeamStats(
    hasComparison ? selected : [],
    seasonProviderId,
  );

  const teams: CompareTeamData[] = selected.map((code) => ({
    code,
    loading,
    stats: data?.find((entry) => entry.team.code === code)?.stats,
    record: records[code],
  }));

  return (
    <section className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
      <div className="mx-auto max-w-[1120px]">
        {hasComparison ? (
          <CompareStatsPanel teams={teams} seasonProviderId={seasonProviderId} />
        ) : (
          <CompareEmptyCard selected={selected} onToggle={toggleCompareTeam} />
        )}
      </div>
    </section>
  );
}
