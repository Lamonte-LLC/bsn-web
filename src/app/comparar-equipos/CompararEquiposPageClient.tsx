'use client';

import { useHeadToHeadTeamStats } from '@/team/client/hooks/teams';
import CompareEmptyCard from '@/team/components/compare/CompareEmptyCard';
import CompareStatsPanel from '@/team/components/compare/CompareStatsPanel';
import { MIN_COMPARE_TEAMS } from '@/team/components/compare/teams';
import type {
  CompareTeamData,
  TeamRecord,
} from '@/team/components/compare/types';
import TeamHistoryHeadToHead from '@/historia/components/compare/TeamHistoryHeadToHead';
import type { SeriesBetween, TeamHistoryFacts } from '@/historia/lib/head-to-head';
import { toggleCompareTeam, useCompareSelection } from './useCompareSelection';

type Props = {
  /** Récords (G-P, grupo) resueltos en el servidor desde standings. */
  records: Record<string, TeamRecord>;
  /** Historia de cada franquicia (títulos, MVP, temporadas), por código. */
  historyFacts: Record<string, TeamHistoryFacts>;
  /** Series reales de playoffs entre equipos activos desde 2025. */
  playoffSeries: SeriesBetween[];
};

export default function CompararEquiposPageClient({ records, historyFacts, playoffSeries }: Props) {
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
          <>
            <CompareStatsPanel teams={teams} seasonProviderId={seasonProviderId} />
            <TeamHistoryHeadToHead codes={selected} facts={historyFacts} series={playoffSeries.filter((s) => selected.includes(s.a.code) && selected.includes(s.b.code))} />
          </>
        ) : (
          <CompareEmptyCard selected={selected} onToggle={toggleCompareTeam} />
        )}
      </div>
    </section>
  );
}
