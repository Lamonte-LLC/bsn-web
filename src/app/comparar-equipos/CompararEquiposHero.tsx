'use client';

import { useEffect } from 'react';
import { useSeasonConnection } from '@/season/client/hooks/season';
import CompareHero from '@/team/components/compare/CompareHero';
import CompareTeamPickerDialog from '@/team/components/compare/CompareTeamPickerDialog';
import type { TeamRecord } from '@/team/components/compare/types';
import {
  setComparePickerOpen,
  setCompareSeason,
  toggleCompareTeam,
  useCompareSelection,
} from './useCompareSelection';

type Props = {
  records: Record<string, TeamRecord>;
};

/** Subheader de la banda ink: hero + diálogo selector. */
export default function CompararEquiposHero({ records }: Props) {
  const { selected, pickerOpen, seasonProviderId } = useCompareSelection();
  const { seasons } = useSeasonConnection();

  useEffect(() => {
    if (seasonProviderId || seasons.length === 0) return;
    const current = seasons.find((s) => s.current) ?? seasons[0];
    setCompareSeason(current.providerId);
  }, [seasons, seasonProviderId]);

  const selectedSeason = seasons.find((s) => s.providerId === seasonProviderId);

  return (
    <>
      <CompareHero
        selected={selected}
        records={records}
        seasons={seasons}
        selectedSeasonProviderId={seasonProviderId}
        seasonName={selectedSeason?.name}
        onOpenPicker={() => setComparePickerOpen(true)}
        onSeasonChange={setCompareSeason}
        onRemove={toggleCompareTeam}
      />
      <CompareTeamPickerDialog
        open={pickerOpen}
        onClose={() => setComparePickerOpen(false)}
        selected={selected}
        onToggle={toggleCompareTeam}
      />
    </>
  );
}
