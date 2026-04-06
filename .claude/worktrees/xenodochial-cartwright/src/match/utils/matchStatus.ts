import { MATCH_STATUS } from '@/constants';
import { MatchType } from '@/match/types';

/** Partido a tratar como “en vivo” en `next dev` (pruebas del layout live en `/partidos/[id]`). */
const DEV_FORCE_LIVE_MATCH_PROVIDER_ID =
  '85fbab5a-11ad-11f1-a6fa-ffcdd9747cbf';

/**
 * `yarn dev` / `NODE_ENV=development`: este `providerId` usa siempre la vista en vivo
 * (aunque el API diga finalizado o programado). No aplica en build de producción.
 */
export function isDevForcedLiveMatchPage(
  providerId: string | undefined | null,
): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    (providerId ?? '') === DEV_FORCE_LIVE_MATCH_PROVIDER_ID
  );
}

/*
 * Estados del fixture (Sportradar / Synergy Stats), según descripción operativa:
 *   SCHEDULED → PENDING: el estadístico empieza a configurar los equipos.
 *   PENDING → IN_PROGRESS: el partido comienza en Synergy Stats.
 *   IN_PROGRESS → FINISHED: el reloj llega a cero y el periodo final queda marcado como terminado.
 *   FINISHED → CONFIRMED: el estadístico confirma el resultado.
 *
 * En GraphQL: `status` puede ser el mapeo interno; `providerFixtureStatus` refleja el texto del proveedor.
 */
/**
 * Normaliza mayúsculas/espacios: el API o el feed pueden enviar distinto casing.
 * `WARM_UP` viene del modelo Django/Synergy; en la web el token histórico es `WARMUP`.
 */
export function normalizeMatchStatus(status: string | undefined): string {
  const s = (status ?? '').trim().toUpperCase();
  if (s === MATCH_STATUS.WARM_UP) return MATCH_STATUS.WARMUP;
  return s;
}

/** Igual que `normalizeMatchStatus` pero para el estado crudo del proveedor (`providerFixtureStatus`). */
function normalizeProviderFixtureStatus(s: string | null | undefined): string {
  return (s ?? '').trim().toUpperCase();
}

/**
 * Partido con resultado “final” para UI: ya terminó en cancha (`FINISHED` en proveedor) o confirmado
 * (`CONFIRMED`), o el `status` interno es COMPLETE/FINISHED. FINISHED y CONFIRMED ambos muestran marcador final;
 * CONFIRMED implica validación explícita del estadístico tras FINISHED.
 */
export function isCompletedMatchForUi(
  status: string | undefined,
  providerFixtureStatus?: string | null,
): boolean {
  const s = normalizeMatchStatus(status);
  const p = normalizeProviderFixtureStatus(providerFixtureStatus);
  if (s === MATCH_STATUS.COMPLETE || s === MATCH_STATUS.FINISHED) return true;
  if (p === MATCH_STATUS.CONFIRMED || p === MATCH_STATUS.FINISHED) return true;
  return false;
}

/**
 * Partido en vivo en `/partidos/[id]` (stream + layout live).
 * Si el proveedor ya marcó cierre (`providerFixtureStatus`), no se considera “en juego” aunque `status` vaya rezagado;
 * el layout live tras el final se resuelve con `shouldUseLiveMatchPageLayout`.
 */
export function isLiveMatchPageStatus(
  status: string | undefined,
  providerFixtureStatus?: string | null,
): boolean {
  if (isCompletedMatchForUi(status, providerFixtureStatus)) return false;
  const s = normalizeMatchStatus(status);
  return [
    MATCH_STATUS.IN_PROGRESS,
    MATCH_STATUS.PERIOD_BREAK,
    MATCH_STATUS.PENDING,
    MATCH_STATUS.READY,
    MATCH_STATUS.DELAYED,
    MATCH_STATUS.INTERRUPTED,
    MATCH_STATUS.WARMUP,
    MATCH_STATUS.PREMATCH,
    MATCH_STATUS.ANTHEM,
    MATCH_STATUS.ONCOURT,
    MATCH_STATUS.STANDBY,
    MATCH_STATUS.COUNTDOWN,
    MATCH_STATUS.LOADED,
    MATCH_STATUS.ABOUT_TO_START,
    MATCH_STATUS.ON_PITCH,
  ].includes(s);
}

/**
 * Layout “En vivo” (stream + pestañas): solo mientras el partido no está cerrado ni programado.
 * No usa `streamUrl`: el criterio es únicamente `status` + `providerFixtureStatus` (siempre hay stream en datos).
 */
export function shouldUseLiveMatchPageLayout(
  m: Pick<MatchType, 'status' | 'providerFixtureStatus' | 'providerId'>,
): boolean {
  if (isDevForcedLiveMatchPage(m.providerId)) {
    return true;
  }
  if (isScheduledMatchPageStatus(m.status, m.providerFixtureStatus)) {
    return false;
  }
  if (isCompletedMatchForUi(m.status, m.providerFixtureStatus)) {
    return false;
  }
  return isLiveMatchPageStatus(m.status, m.providerFixtureStatus);
}

/**
 * Vista “programado / reprogramado”: preview, H2H y líderes de temporada por equipo (no líderes del juego).
 * Excluye partidos ya cerrados según proveedor o `status` interno.
 */
export function isScheduledMatchPageStatus(
  status: string | undefined,
  providerFixtureStatus?: string | null,
): boolean {
  if (isCompletedMatchForUi(status, providerFixtureStatus)) return false;
  const s = normalizeMatchStatus(status);
  return (
    s === MATCH_STATUS.SCHEDULED ||
    s === MATCH_STATUS.RESCHEDULED ||
    s === MATCH_STATUS.IF_NEEDED
  );
}

/**
 * Estados no contemplados explícitamente (p. ej. POSTPONED, CANCELLED, valores nuevos del API):
 * mejor vista “programada” con datos del partido que pantalla vacía.
 */
export function shouldRenderScheduledMatchPageFallback(
  m: Pick<MatchType, 'status' | 'providerFixtureStatus' | 'providerId'>,
): boolean {
  if (isDevForcedLiveMatchPage(m.providerId)) return false;
  if (shouldUseLiveMatchPageLayout(m)) return false;
  if (isCompletedMatchForUi(m.status, m.providerFixtureStatus)) return false;
  if (isScheduledMatchPageStatus(m.status, m.providerFixtureStatus)) return false;
  return true;
}
