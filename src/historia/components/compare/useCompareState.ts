'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { compareHref, MAX_COMPARE_PLAYERS, type CompareScope } from '@/historia/lib/compare-players';

/**
 * State shared by the hero (subheader of FullWidthLayout) and the panel (children), same
 * useSyncExternalStore pattern as /comparar-equipos. The selection itself lives in the URL (?p=a,b), because
 * every player needs server-resolved data; only the picker and the scope are client state.
 */
type CompareState = {
  pickerOpen: boolean;
  /** Scope chosen per player key; a missing key uses the default computed from the players. */
  scopes: Record<string, CompareScope | undefined>;
};

let state: CompareState = { pickerOpen: false, scopes: {} };
const SERVER_SNAPSHOT: CompareState = { pickerOpen: false, scopes: {} };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(next: CompareState) {
  state = next;
  listeners.forEach((l) => l());
}

export function setPickerOpen(open: boolean) {
  if (state.pickerOpen === open) return;
  emit({ ...state, pickerOpen: open });
}

export function setCompareScope(key: string, scope: CompareScope | null) {
  const scopes = { ...state.scopes };
  if (scope === null) delete scopes[key];
  else scopes[key] = scope;
  emit({ ...state, scopes });
}

export function useCompareState(): CompareState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_SNAPSHOT);
}

/** Adds, removes or replaces players by rewriting `?p=`; the server resolves the new set. */
export function useCompareNavigation(keys: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const go = useCallback(
    (next: string[]) => {
      const href = compareHref(next);
      router.replace(href.startsWith(pathname) ? href : href, { scroll: false });
    },
    [router, pathname],
  );
  const add = useCallback(
    (key: string) => {
      if (keys.includes(key) || keys.length >= MAX_COMPARE_PLAYERS) return;
      go([...keys, key]);
    },
    [keys, go],
  );
  const remove = useCallback(
    (key: string) => {
      setCompareScope(key, null);
      go(keys.filter((k) => k !== key));
    },
    [keys, go],
  );
  /** Empties the comparison: every player out, every chosen scope forgotten. */
  const clear = useCallback(() => {
    keys.forEach((key) => setCompareScope(key, null));
    go([]);
  }, [keys, go]);
  return { add, remove, clear };
}
