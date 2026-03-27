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

export function isLiveMatch(matchStatus?: string): boolean {
  if (matchStatus == null) {
    return false;
  }
  return [
    MATCH_STATUS.IN_PROGRESS,
    MATCH_STATUS.PERIOD_BREAK,
    MATCH_STATUS.PENDING,
    MATCH_STATUS.READY,
  ].includes(matchStatus.toUpperCase());
}

export function isCompletedMatch(matchStatus?: string): boolean {
  if (matchStatus == null) {
    return false;
  }
  return [MATCH_STATUS.COMPLETE, MATCH_STATUS.FINISHED].includes(
    matchStatus.toUpperCase(),
  );
}
