'use client';

import { useSyncExternalStore } from 'react';

/** The two views of /jugadores: this season's rosters, and every player in the league's history. */
export type JugadoresTab = 'activos' | 'historicos';

let currentTab: JugadoresTab = 'activos';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setJugadoresTab(next: JugadoresTab) {
  if (currentTab === next) return;
  currentTab = next;
  listeners.forEach((l) => l());
}

export function isJugadoresTab(value: string | null | undefined): value is JugadoresTab {
  return value === 'activos' || value === 'historicos';
}

/** Same external-store pattern as /estadisticas: the hero (subheader) and the list share the tab. */
export function useJugadoresTab(): JugadoresTab {
  return useSyncExternalStore(subscribe, () => currentTab, () => 'activos');
}
