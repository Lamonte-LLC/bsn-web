export const DASH = '–';

/** Numbers render as-is; null renders as a dash, never as zero. */
export function fmt(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return DASH;
  return Number.isInteger(value) && decimals === 1 ? value.toFixed(1) : value.toFixed(decimals);
}

export function fmtInt(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return DASH;
  return new Intl.NumberFormat('es-PR').format(value);
}

export function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return DASH;
  return `${value.toFixed(1)}%`;
}

export function yearsLabel(fy: number, ly: number): string {
  return fy === ly ? String(fy) : `${fy} a ${ly}`;
}

export function initials(name: string): string {
  const clean = name.replace(/["'][^"']*["']/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = clean.split(' ').filter((p) => p.length > 1 || /[A-Za-z]/.test(p));
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[1][0] : '';
  return (first + last).toUpperCase();
}

export function normalizeSearch(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function decadeLabel(decade: number): string {
  return `${decade}s`;
}

export function formatGameDate(iso: string): string {
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat('es-PR', { day: 'numeric', month: 'short', timeZone: 'America/Puerto_Rico' }).format(d);
}
