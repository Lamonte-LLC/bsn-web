export const SITE_NAME = 'BSN';
export const DOMAIN_URL = 'https://www.bsnpr.com';
export const DEFAULT_MEDIA_PROVIDER = 'BSN App • YouTube';

export const MATCH_STATUS = {
  DELAYED: 'DELAYED',
  LOADED: 'LOADED',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  PERIOD_BREAK: 'PERIOD_BREAK',
  INTERRUPTED: 'INTERRUPTED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  FINISHED: 'FINISHED',
  /** Sportradar/DataCore: juego oficialmente cerrado (también en `providerFixtureStatus`). */
  CONFIRMED: 'CONFIRMED',
  PROTESTED: 'PROTESTED',
  COMPLETE: 'COMPLETE',
  DRAFT: 'DRAFT',
  BYE: 'BYE',
  SCHEDULED: 'SCHEDULED',
  POSTPONED: 'POSTPONED',
  ABANDONED: 'ABANDONED',
  WARMUP: 'WARMUP',
  PREMATCH: 'PREMATCH',
  ANTHEM: 'ANTHEM',
  ONCOURT: 'ONCOURT',
  STANDBY: 'STANDBY',
  COUNTDOWN: 'COUNTDOWN',
  /** Pre-en vivo / en espera: en la UI de partido se trata como tramo “live” (ver `isLiveMatchPageStatus`). */
  PENDING: 'PENDING',
  /** Synergy/Django; en UI se normaliza a `WARMUP` (ver `normalizeMatchStatus`). */
  WARM_UP: 'WARM_UP',
  ABOUT_TO_START: 'ABOUT_TO_START',
  ON_PITCH: 'ON_PITCH',
  IF_NEEDED: 'IF_NEEDED',
};

export const DATE_ISO_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_ISO_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_TIME_TZ_FORMAT = 'YYYY-MM-DD HH:mm:ss Z';

export const MATCH_DATE_SHORT_FORMAT = 'D MMM';
export const MATCH_DATE_FORMAT = 'ddd, D MMMM';
export const MATCH_DATE_FORMAT_SHORT_MONTH = 'ddd, D MMM';
export const MATCH_DATE_FULL_FORMAT = 'dddd, D [de] MMMM [de] YYYY';
export const MATCH_TIME_FORMAT = 'h:mm A';

export const PLAYER_BIRTHDAY_FORMAT = 'D/M/YYYY';
export const PLAYER_MATCH_DATE_FORMAT = 'D MMM, YYYY';
export const BSN_TV_DATE_FORMAT = 'MMMM D, YYYY';

/**
 * `seasonPlayerStatsConnection` / `TEAM_LEADERS_STATS_CONNECTION`.
 * Coherente con `SEASON_LEADER_COMPETITION_STATS_SYNC_LIMIT` en bsn-main (sync Synergy).
 */
export const SEASON_TEAM_LEADERS_CONNECTION_FIRST = 100;
/** Filas visibles por categoría en cajas de líderes (partido programado, ficha equipo). */
export const SEASON_TEAM_LEADERS_DISPLAY_TOP = 3;
