'use client';

import { useSyncExternalStore } from 'react';

export type EstadisticasTab = 'jugadores' | 'equipos';

let currentTab: EstadisticasTab = 'jugadores';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): EstadisticasTab {
  return currentTab;
}

function getServerSnapshot(): EstadisticasTab {
  return 'jugadores';
}

export function setEstadisticasTab(next: EstadisticasTab) {
  if (currentTab === next) return;
  currentTab = next;
  listeners.forEach((l) => l());
}

function isEstadisticasTab(value: string | null): value is EstadisticasTab {
  return value === 'jugadores' || value === 'equipos';
}

export function initEstadisticasTabFromParam(value: string | null) {
  if (isEstadisticasTab(value)) {
    setEstadisticasTab(value);
  }
}

export function useEstadisticasTab(): [EstadisticasTab, (next: EstadisticasTab) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setEstadisticasTab];
}
