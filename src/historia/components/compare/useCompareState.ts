'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
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
  /** True while the server resolves a new `?p=` after adding, removing or clearing players. */
  pending: boolean;
  /** The player keys being requested while `pending`, so the hero can draw the outcome before it arrives. */
  pendingKeys: string[] | null;
};

let state: CompareState = { pickerOpen: false, scopes: {}, pending: false, pendingKeys: null };
const SERVER_SNAPSHOT: CompareState = { pickerOpen: false, scopes: {}, pending: false, pendingKeys: null };
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

/** A change resolved faster than this reads as a flash; the skeleton stays up to here so the wait is legible. */
const MIN_PENDING_MS = 900;
let pendingSince = 0;
let holdTimer: ReturnType<typeof setTimeout> | null = null;

export function setComparePending(pending: boolean, keys: string[] | null = null) {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  if (pending) {
    pendingSince = Date.now();
    if (state.pending && state.pendingKeys === keys) return;
    emit({ ...state, pending: true, pendingKeys: keys });
    return;
  }
  if (!state.pending) return;
  const left = MIN_PENDING_MS - (Date.now() - pendingSince);
  if (left <= 0) {
    emit({ ...state, pending: false, pendingKeys: null });
    return;
  }
  holdTimer = setTimeout(() => {
    holdTimer = null;
    emit({ ...state, pending: false, pendingKeys: null });
  }, left);
}

export function useCompareState(): CompareState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_SNAPSHOT);
}

/** Adds, removes or replaces players by rewriting `?p=`; the server resolves the new set. */
export function useCompareNavigation(keys: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  // The navigation runs as a transition so the page knows it's waiting on the server and can show it.
  const [isPending, startTransition] = useTransition();
  // Only the hook instance that started the change clears it: this hook runs in several components at once, and
  // the others are never pending, so an unguarded effect would clear the flag the moment it is set.
  const startedHere = useRef(false);
  useEffect(() => {
    if (isPending) {
      startedHere.current = true;
      return;
    }
    if (!startedHere.current) return;
    startedHere.current = false;
    setComparePending(false);
  }, [isPending]);
  const go = useCallback(
    (next: string[]) => {
      const href = compareHref(next);
      setComparePending(true, next);
      startTransition(() => router.replace(href.startsWith(pathname) ? href : href, { scroll: false }));
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
