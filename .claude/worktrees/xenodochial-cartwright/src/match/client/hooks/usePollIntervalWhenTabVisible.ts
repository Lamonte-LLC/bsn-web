'use client';

import { useEffect, useState } from 'react';

function computeEffectivePollInterval(intervalMs: number): number {
  if (intervalMs <= 0) {
    return 0;
  }
  if (typeof document === 'undefined') {
    return intervalMs;
  }
  return document.visibilityState === 'visible' ? intervalMs : 0;
}

/**
 * Returns `intervalMs` while the browser tab is visible; 0 when hidden (or when `intervalMs` is 0).
 * Use for Apollo `pollInterval` on live match / boxscore queries so background tabs do not keep polling.
 */
export function usePollIntervalWhenTabVisible(intervalMs: number): number {
  const [effective, setEffective] = useState(() =>
    computeEffectivePollInterval(intervalMs),
  );

  useEffect(() => {
    function sync() {
      setEffective(computeEffectivePollInterval(intervalMs));
    }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [intervalMs]);

  return effective;
}
