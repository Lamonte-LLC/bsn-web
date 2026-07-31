import { MATCH_STATUS } from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import type { SeasonHeadToHeadMatchType } from '@/team/types';

export type Meeting = {
  /** Código del ganador. */
  winner: string;
  /** Código del perdedor. */
  loser: string;
  winnerScore: number;
  loserScore: number;
  /** "lun, 13 jul, 2026". */
  date: string;
  /** providerId del partido, para enlazar a /partidos/[id]. */
  matchProviderId: string;
};

/** Convierte un partido finalizado en un `Meeting` (ganador siempre primero). */
function toMeeting(match: SeasonHeadToHeadMatchType): Meeting {
  const { homeTeam, visitorTeam, startAt, providerId } = match;
  const [winner, loser] =
    homeTeam.score >= visitorTeam.score
      ? [homeTeam, visitorTeam]
      : [visitorTeam, homeTeam];

  return {
    winner: winner.code,
    loser: loser.code,
    winnerScore: winner.score,
    loserScore: loser.score,
    date: formatDate(startAt, 'ddd, D MMM, YYYY'),
    matchProviderId: providerId,
  };
}

/** Cruces entre `a` y `b`, del más reciente al más antiguo. */
export function getMeetings(
  matches: SeasonHeadToHeadMatchType[],
  a: string,
  b: string,
): Meeting[] {
  return matches
    .filter(
      (match) =>
        [match.homeTeam.code, match.visitorTeam.code].sort().join('-') ===
        [a, b].sort().join('-'),
    )
    .sort((x, y) => (x.startAt < y.startAt ? 1 : -1))
    .map(toMeeting);
}

/** Récord del cruce "2-1" visto desde el equipo `a`. */
export function crossRecord(
  matches: SeasonHeadToHeadMatchType[],
  a: string,
  b: string,
): string {
  const meetings = getMeetings(matches, a, b);
  const winsA = meetings.filter((m) => m.winner === a).length;
  return `${winsA}-${meetings.length - winsA}`;
}
