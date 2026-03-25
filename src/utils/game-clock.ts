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
