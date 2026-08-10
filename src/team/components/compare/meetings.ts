import { MATCH_STATUS } from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import type { SeasonHeadToHeadMatchType } from '@/team/types';

type MeetingTeam = {
  code: string;
  score: number;
  competitionStandings: { won: number };
};

export type Meeting = {
  /** Equipo visitante, se muestra a la izquierda. */
  visitor: MeetingTeam;
  /** Equipo local, se muestra a la derecha. */
  home: MeetingTeam;
  /** Código del equipo con mayor score, para resaltar su marcador. */
  winner: string;
  /** "lun, 13 jul, 2026". */
  date: string;
  /** providerId del partido, para enlazar a /partidos/[id]. */
  matchProviderId: string;
};

/** Convierte un partido finalizado en un `Meeting` (visitante siempre primero). */
function toMeeting(match: SeasonHeadToHeadMatchType): Meeting {
  const { homeTeam, visitorTeam, startAt, providerId } = match;
  const homeScore = Number(homeTeam.score);
  const visitorScore = Number(visitorTeam.score);

  return {
    visitor: {
      code: visitorTeam.code,
      score: visitorScore,
      competitionStandings: visitorTeam.competitionStandings,
    },
    home: {
      code: homeTeam.code,
      score: homeScore,
      competitionStandings: homeTeam.competitionStandings,
    },
    winner: homeScore >= visitorScore ? homeTeam.code : visitorTeam.code,
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
