'use client';

import { useSyncExternalStore } from 'react';
import { MAX_COMPARE_TEAMS } from '@/team/components/compare/teams';

/**
 * Estado compartido entre el hero (subheader de FullWidthLayout) y el panel
 * (children). Mismo patrón useSyncExternalStore que useEstadisticasTab.
 */
type CompareSelectionState = {
  selected: string[];
  pickerOpen: boolean;
  seasonProviderId?: string;
};

let state: CompareSelectionState = {
  selected: [],
  pickerOpen: false,
  seasonProviderId: undefined,
};
const listeners = new Set<() => void>();

const SERVER_SNAPSHOT: CompareSelectionState = {
  selected: [],
  pickerOpen: false,
  seasonProviderId: undefined,
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CompareSelectionState {
  return state;
}

function getServerSnapshot(): CompareSelectionState {
  return SERVER_SNAPSHOT;
}

function emit(next: CompareSelectionState) {
  state = next;
  listeners.forEach((l) => l());
}

export function toggleCompareTeam(code: string) {
  const { selected } = state;
  if (selected.includes(code)) {
    emit({ ...state, selected: selected.filter((c) => c !== code) });
    return;
  }
  if (selected.length >= MAX_COMPARE_TEAMS) return;
  emit({ ...state, selected: [...selected, code] });
}

export function setComparePickerOpen(open: boolean) {
  if (state.pickerOpen === open) return;
  emit({ ...state, pickerOpen: open });
}

export function setCompareSeason(seasonProviderId: string) {
  if (state.seasonProviderId === seasonProviderId) return;
  emit({ ...state, seasonProviderId });
}

export function useCompareSelection(): CompareSelectionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
