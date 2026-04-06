/**
 * Formats game clock strings for display.
 * APIs often return ISO-8601 durations (e.g. `PT12M30S`, `PT0M0S`) instead of `MM:SS`.
 */
export function formatGameClockDisplay(raw: string | undefined | null): string {
  if (raw == null || raw === '') {
    return '0:00';
  }

  const trimmed = raw.trim();

  // ISO 8601 duration (e.g. PT0M0S, PT12M0S, PT1M30.5S)
  const iso = trimmed.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i,
  );
  if (iso) {
    const hours = Number(iso[1] ?? 0) || 0;
    const minutes = Number(iso[2] ?? 0) || 0;
    const seconds = Number(iso[3] ?? 0) || 0;
    const totalSeconds = Math.floor(
      hours * 3600 + minutes * 60 + seconds,
    );
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }

  // Already looks like a clock (12:34, 1:05:30)
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((p) => p.trim());
    if (parts.length >= 2) {
      const last = parts[parts.length - 1] ?? '0';
      const prev = parts[parts.length - 2] ?? '0';
      const sec = Math.floor(Number.parseFloat(last)) || 0;
      const min = Number.parseInt(prev, 10) || 0;
      return `${min}:${sec.toString().padStart(2, '0')}`;
    }
  }

  return trimmed;
}

/**
 * Segundos restantes del reloj de posesión/juego para animar cuenta atrás entre polls del API.
 * Devuelve null si el valor no es parseable (se usa el texto formateado del servidor tal cual).
 */
export function parseGameClockToCountdownSeconds(
  raw: string | undefined | null,
): number | null {
  if (raw == null || raw === '') {
    return null;
  }

  const trimmed = raw.trim();

  const iso = trimmed.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i,
  );
  if (iso) {
    const hours = Number(iso[1] ?? 0) || 0;
    const minutes = Number(iso[2] ?? 0) || 0;
    const seconds = Number(iso[3] ?? 0) || 0;
    return Math.floor(hours * 3600 + minutes * 60 + seconds);
  }

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((p) => p.trim());
    if (parts.length >= 2) {
      const last = parts[parts.length - 1] ?? '0';
      const prev = parts[parts.length - 2] ?? '0';
      const sec = Math.floor(Number.parseFloat(last)) || 0;
      const min = Number.parseInt(prev, 10) || 0;
      return min * 60 + sec;
    }
  }

  return null;
}

export function formatCountdownSeconds(totalSeconds: number): string {
  const capped = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(capped / 60);
  const ss = capped % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}
