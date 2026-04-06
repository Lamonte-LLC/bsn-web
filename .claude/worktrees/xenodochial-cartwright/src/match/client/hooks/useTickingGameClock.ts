'use client';

import { useEffect, useState } from 'react';
import {
  formatCountdownSeconds,
  formatGameClockDisplay,
  parseGameClockToCountdownSeconds,
} from '@/utils/game-clock';

/**
 * Cuenta atrás local entre refrescos del API para que el reloj no pare “congelado” varios segundos.
 * Si el valor no es parseable como duración, se muestra solo el texto del servidor.
 */
export function useTickingGameClock(
  rawServerClock: string | undefined | null,
  shouldTick: boolean,
): string {
  const [seconds, setSeconds] = useState<number | null>(() => {
    if (!shouldTick) return null;
    return parseGameClockToCountdownSeconds(rawServerClock ?? undefined);
  });

  useEffect(() => {
    if (!shouldTick) {
      setSeconds(null);
      return;
    }
    setSeconds(parseGameClockToCountdownSeconds(rawServerClock ?? undefined));
  }, [rawServerClock, shouldTick]);

  useEffect(() => {
    if (!shouldTick) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s == null || s <= 0) return s;
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [shouldTick]);

  if (!shouldTick || seconds == null) {
    return formatGameClockDisplay(rawServerClock);
  }
  return formatCountdownSeconds(seconds);
}
