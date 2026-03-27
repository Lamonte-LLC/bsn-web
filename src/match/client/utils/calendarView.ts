import { MATCH_STATUS } from '@/constants';
import { MatchType } from '@/match/types';
import { formatGameClockDisplay } from '@/utils/game-clock';
import moment from 'moment';

const EXCLUDED_CALENDAR_STATUSES = new Set([
  MATCH_STATUS.DRAFT,
  MATCH_STATUS.CANCELLED,
]);

/** Partidos con marcador final para listados de calendario */
export function isCalendarFinishedMatch(status: string | undefined): boolean {
  return (
    status === MATCH_STATUS.COMPLETE || status === MATCH_STATUS.FINISHED
  );
}

/** En vivo / no programado puro: muestra fila estilo Figma (no aplica a SCHEDULED/RESCHEDULED). */
export function isCalendarLiveMatch(status: string | undefined): boolean {
  if (!status) return false;
  const u = status.toUpperCase();
  if (isCalendarFinishedMatch(status)) return false;
  if (u === MATCH_STATUS.SCHEDULED || u === MATCH_STATUS.RESCHEDULED) {
    return false;
  }
  if (EXCLUDED_CALENDAR_STATUSES.has(u)) return false;
  return true;
}

/** Texto principal bajo el punto rojo (misma lógica que LiveMatchCard). */
export function getCalendarLivePrimaryLine(
  status: string | undefined,
  currentQuarter: string | undefined,
  currentTime: string | undefined,
  overtimePeriods = 0,
): string {
  const statusU = status?.toUpperCase() ?? '';
  const currentPeriodTime = formatGameClockDisplay(currentTime);
  let currentStatusLabel =
    overtimePeriods > 0 ? 'OT' : `Q${currentQuarter ?? ''}`;
  if (overtimePeriods > 1) {
    currentStatusLabel += `${overtimePeriods}`;
  }

  if (
    ![
      MATCH_STATUS.READY,
      MATCH_STATUS.PENDING,
      MATCH_STATUS.DELAYED,
      MATCH_STATUS.PERIOD_BREAK,
      MATCH_STATUS.INTERRUPTED,
      MATCH_STATUS.RESCHEDULED,
    ].includes(statusU)
  ) {
    return `${currentStatusLabel} – ${currentPeriodTime}`;
  }
  if (statusU === MATCH_STATUS.READY) return 'Por comenzar';
  if (statusU === MATCH_STATUS.PENDING) return 'En espera';
  if (statusU === MATCH_STATUS.DELAYED) return 'Atrasado';
  if (
    statusU === MATCH_STATUS.PERIOD_BREAK &&
    overtimePeriods === 0 &&
    currentQuarter === '2'
  ) {
    return 'Mediotiempo';
  }
  if (
    statusU === MATCH_STATUS.PERIOD_BREAK &&
    overtimePeriods === 0 &&
    currentQuarter !== '2'
  ) {
    return `Fin de Q${currentQuarter}`;
  }
  if (statusU === MATCH_STATUS.PERIOD_BREAK && overtimePeriods > 0) {
    return `Fin de OT${overtimePeriods > 1 ? overtimePeriods : ''}`;
  }
  if (statusU === MATCH_STATUS.INTERRUPTED) return 'Interrumpido';
  if (statusU === MATCH_STATUS.RESCHEDULED) return 'Reprogramado';
  return `${currentStatusLabel} – ${currentPeriodTime}`;
}

export function filterLeagueCalendarMatches(matches: MatchType[]): MatchType[] {
  return matches
    .filter((m) => !EXCLUDED_CALENDAR_STATUSES.has(m.status ?? ''))
    .sort((a, b) => moment(a.startAt).diff(moment(b.startAt)));
}

export function filterTeamCalendarMatches(
  matches: MatchType[],
  teamCode: string,
): MatchType[] {
  return filterLeagueCalendarMatches(matches).filter(
    (m) =>
      m.homeTeam.code === teamCode || m.visitorTeam.code === teamCode,
  );
}
