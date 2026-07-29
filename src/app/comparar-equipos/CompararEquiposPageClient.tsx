'use client';

import { type ReactNode } from 'react';
import { useTeamStats } from '@/team/client/hooks/teams';
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

/**
 * Recolecta las stats de una lista de equipos llamando `useTeamStats` (hook
 * existente) una vez por instancia. La recursión respeta la regla de hooks:
 * cada instancia del componente llama exactamente un hook, y el número de
 * instancias solo cambia cuando cambia la selección (remonta el subárbol).
 */
function StatsCollector({
  codes,
  records,
  collected = [],
  children,
}: {
  codes: string[];
  records: Record<string, TeamRecord>;
  collected?: CompareTeamData[];
  children: (teams: CompareTeamData[]) => ReactNode;
}) {
  const code = codes[0];
  const { data, loading } = useTeamStats(code);

  const entry: CompareTeamData = {
    code,
    loading,
    stats: data?.seasonStats,
    record: records[code],
  };

  const next = [...collected, entry];

  if (codes.length === 1) {
    return <>{children(next)}</>;
  }

  return (
    <StatsCollector codes={codes.slice(1)} records={records} collected={next}>
      {children}
    </StatsCollector>
  );
}

export default function CompararEquiposPageClient({ records }: Props) {
  const { selected } = useCompareSelection();
  const hasComparison = selected.length >= MIN_COMPARE_TEAMS;

  return (
    <section className="container -mt-[62px] mb-[24px] lg:-mt-[86px] lg:mb-[44px]">
      <div className="mx-auto max-w-[1120px]">
        {hasComparison ? (
          <StatsCollector
            key={selected.join('-')}
            codes={selected}
            records={records}
          >
            {(teams) => <CompareStatsPanel teams={teams} />}
          </StatsCollector>
        ) : (
          <CompareEmptyCard selected={selected} onToggle={toggleCompareTeam} />
        )}
      </div>
    </section>
  );
}
