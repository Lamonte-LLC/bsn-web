import { MATCH_STATUS } from '@/constants';
import { MatchType } from '@/match/types';
import { isCompletedMatchForUi } from '@/match/utils/matchStatus';
import { formatGameClockDisplay } from '@/utils/game-clock';
import moment from 'moment';

const EXCLUDED_CALENDAR_STATUSES = new Set([
  MATCH_STATUS.DRAFT,
  MATCH_STATUS.CANCELLED,
]);

/**
 * Partidos con marcador final en listados de calendario.
 * Antes solo miraba `status` (COMPLETE/FINISHED); ahora también `providerFixtureStatus` vía `isCompletedMatchForUi`.
 */
export function isCalendarFinishedMatch(
  status: string | undefined,
  /** Opcional: estado Sportradar/DataCore en GraphQL; alinea filas “finalizado” con el backend. */
  providerFixtureStatus?: string | null,
): boolean {
  return isCompletedMatchForUi(status, providerFixtureStatus);
}

/**
 * En vivo u otro estado no programado “puro”: fila estilo calendario (no SCHEDULED/RESCHEDULED).
 * `providerFixtureStatus` evita mostrar fila “en vivo” si el fixture ya está cerrado en el proveedor.
 */
export function isCalendarLiveMatch(
  status: string | undefined,
  providerFixtureStatus?: string | null,
): boolean {
  if (!status) return false;
  const u = status.toUpperCase();
  if (isCalendarFinishedMatch(status, providerFixtureStatus)) return false;
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
      MATCH_STATUS.WARMUP,
      MATCH_STATUS.PREMATCH,
      MATCH_STATUS.ANTHEM,
      MATCH_STATUS.ONCOURT,
      MATCH_STATUS.STANDBY,
      MATCH_STATUS.COUNTDOWN,
      MATCH_STATUS.LOADED,
    ].includes(statusU)
  ) {
    return `${currentStatusLabel} – ${currentPeriodTime}`;
  }
  if (statusU === MATCH_STATUS.READY) return 'Por comenzar';
  if (statusU === MATCH_STATUS.PENDING) return 'En espera';
  if (
    [
      MATCH_STATUS.WARMUP,
      MATCH_STATUS.PREMATCH,
      MATCH_STATUS.ANTHEM,
      MATCH_STATUS.ONCOURT,
      MATCH_STATUS.STANDBY,
      MATCH_STATUS.COUNTDOWN,
      MATCH_STATUS.LOADED,
    ].includes(statusU)
  ) {
    return 'Por comenzar';
  }
  if (statusU === MATCH_STATUS.DELAYED) return 'Atrasado';
  // Descanso entre cuartos: Q2 suele ser medio tiempo; si no viene periodo, mostrar algo claro al usuario.
  if (statusU === MATCH_STATUS.PERIOD_BREAK && overtimePeriods === 0) {
    const q =
      currentQuarter != null && String(currentQuarter).trim() !== ''
        ? String(currentQuarter).trim()
        : '';
    if (q === '2') return 'Mediotiempo';
    if (q === '') return 'Descanso';
    return `Fin de Q${q}`;
  }
  if (statusU === MATCH_STATUS.PERIOD_BREAK && overtimePeriods > 0) {
    return `Fin de OT${overtimePeriods > 1 ? overtimePeriods : ''}`;
  }
  if (statusU === MATCH_STATUS.INTERRUPTED) return 'Interrumpido';
  if (statusU === MATCH_STATUS.RESCHEDULED) return 'Reprogramado';
  return `${currentStatusLabel} – ${currentPeriodTime}`;
}

/**
 * Línea central del marcador en vivo (header del partido): prioriza “Marcador final” cuando el API
 * ya cerró el juego (status o proveedor), luego estados como medio tiempo / por comenzar.
 */
export function getLiveScoreboardCenterLine(
  status: string | undefined,
  providerFixtureStatus: string | null | undefined,
  currentQuarter: string | undefined,
  currentTime: string | undefined,
  overtimePeriods = 0,
): string {
  if (isCompletedMatchForUi(status, providerFixtureStatus)) {
    return 'Marcador final';
  }
  return getCalendarLivePrimaryLine(
    status,
    currentQuarter,
    currentTime,
    overtimePeriods,
  );
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
