'use client';

import { useCurrentSeason } from '@/season/client/hooks/season';
import CompareHero from '@/team/components/compare/CompareHero';
import CompareTeamPickerDialog from '@/team/components/compare/CompareTeamPickerDialog';
import type { TeamRecord } from '@/team/components/compare/types';
import {
  setComparePickerOpen,
  toggleCompareTeam,
  useCompareSelection,
} from './useCompareSelection';

type Props = {
  records: Record<string, TeamRecord>;
};

/** Subheader de la banda ink: hero + diálogo selector. */
export default function CompararEquiposHero({ records }: Props) {
  const { selected, pickerOpen } = useCompareSelection();
  const { data: currentSeason } = useCurrentSeason();

  return (
    <>
      <CompareHero
        selected={selected}
        records={records}
        seasonName={currentSeason?.name}
        onOpenPicker={() => setComparePickerOpen(true)}
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
