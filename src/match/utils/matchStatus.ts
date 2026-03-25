import { MATCH_STATUS } from '@/constants';

/** GraphQL / feed may send different casing. */
export function normalizeMatchStatus(status: string | undefined): string {
  return (status ?? '').trim().toUpperCase();
}

/** Partido en vivo en `/partidos/[id]` (stream + layout live). */
export function isLiveMatchPageStatus(status: string | undefined): boolean {
  const s = normalizeMatchStatus(status);
  return [
    MATCH_STATUS.IN_PROGRESS,
    MATCH_STATUS.PERIOD_BREAK,
    MATCH_STATUS.PENDING,
    MATCH_STATUS.READY,
  ].includes(s);
}
