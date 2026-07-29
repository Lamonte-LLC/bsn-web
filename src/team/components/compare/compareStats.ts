import { TeamSeasonStatsType } from '@/team/types';

export type StatFormat = 'avg' | 'int' | 'pct';

export type CompareStat = {
  /** Sigla mostrada al centro de la fila: "PPJ" */
  code: string;
  /** Descripción bajo la sigla: "Puntos por juego" */
  label: string;
  /** Campo de `seasonStats` (TEAM_STATS). `null` = sin respaldo en el backend. */
  key: keyof TeamSeasonStatsType | null;
  format: StatFormat;
  /** false cuando el número más bajo es mejor (pérdidas, faltas). */
  higherIsBetter: boolean;
  /**
   * Solo para las filas de "Resumen Estadístico": el backend todavía no expone
   * estos campos, así que se leen de RESUMEN_FIXTURE. Ver nota en ese objeto.
   */
  fixtureKey?: keyof ResumenFixtureRow;
};

export type CompareSection = {
  id: string;
  title: string;
  /** Etiqueta corta para los tabs en mobile. */
  shortTitle: string;
  stats: CompareStat[];
};

export const COMPARE_SECTIONS: CompareSection[] = [
  {
    id: 'promedio',
    title: 'Promedio',
    shortTitle: 'Promedio',
    stats: [
      { code: 'PPJ', label: 'Puntos por juego', key: 'pointsAverage', format: 'avg', higherIsBetter: true },
      { code: 'ROPJ', label: 'Rebote ofensivo por juego', key: 'offensiveReboundsAverage', format: 'avg', higherIsBetter: true },
      { code: 'RDPJ', label: 'Rebote defensivo por juego', key: 'defensiveReboundsAverage', format: 'avg', higherIsBetter: true },
      { code: 'RPJ', label: 'Rebotes por juego', key: 'reboundsTotalAverage', format: 'avg', higherIsBetter: true },
      { code: 'APJ', label: 'Asistencias por juego', key: 'assistsAverage', format: 'avg', higherIsBetter: true },
      { code: 'FPJ', label: 'Faltas personales por juego', key: 'foulsPersonalAverage', format: 'avg', higherIsBetter: false },
      { code: 'ROB', label: 'Robadas por juego', key: 'stealsAverage', format: 'avg', higherIsBetter: true },
      { code: 'BPJ', label: 'Bloqueos por juego', key: 'blocksAverage', format: 'avg', higherIsBetter: true },
      { code: 'PER', label: 'Perdidas por juego', key: 'turnoversAverage', format: 'avg', higherIsBetter: false },
    ],
  },
  {
    id: 'tiros',
    title: 'Estadísticas de tiros',
    shortTitle: 'Tiros',
    stats: [
      { code: 'TC', label: 'Tiros convertidos', key: 'fieldGoalsMadeAverage', format: 'avg', higherIsBetter: true },
      { code: 'TI', label: 'Tiros intentados', key: 'fieldGoalsAttemptedAverage', format: 'avg', higherIsBetter: true },
      { code: 'TI%', label: 'Tiros porcentaje', key: 'fieldGoalsPercentage', format: 'pct', higherIsBetter: true },
      { code: '3PC', label: 'Tres puntos convertidos', key: 'threePointersMadeAverage', format: 'avg', higherIsBetter: true },
      { code: '3PI', label: 'Tres puntos intentados', key: 'threePointersAttemptedAverage', format: 'avg', higherIsBetter: true },
      { code: '3P%', label: 'Tres puntos porcentaje', key: 'threePointersPercentage', format: 'pct', higherIsBetter: true },
      { code: 'TLC', label: 'Tiros libres convertidos', key: 'freeThrowsMadeAverage', format: 'avg', higherIsBetter: true },
      { code: 'TL%', label: 'Tiro libre porcentaje', key: 'freeThrowsPercentage', format: 'pct', higherIsBetter: true },
    ],
  },
  {
    id: 'totales',
    title: 'Totales',
    shortTitle: 'Totales',
    stats: [
      { code: 'PTS', label: 'Puntos', key: 'points', format: 'int', higherIsBetter: true },
      { code: 'REB', label: 'Rebotes', key: 'reboundsTotal', format: 'int', higherIsBetter: true },
      { code: 'AST', label: 'Asistencias', key: 'assists', format: 'int', higherIsBetter: true },
      { code: 'REC', label: 'Robadas', key: 'steals', format: 'int', higherIsBetter: true },
      { code: 'BLQ', label: 'Bloqueos', key: 'blocks', format: 'int', higherIsBetter: true },
      { code: 'PE', label: 'Perdidas', key: 'turnovers', format: 'int', higherIsBetter: false },
    ],
  },
  {
    id: 'resumen',
    title: 'Resumen Estadístico',
    shortTitle: 'Resumen',
    stats: [
      { code: 'PP', label: 'Puntos en la pintura', key: null, fixtureKey: 'pointsInPaint', format: 'avg', higherIsBetter: true },
      { code: 'P2', label: 'Puntos de segunda oportunidad', key: null, fixtureKey: 'secondChancePoints', format: 'avg', higherIsBetter: true },
      { code: 'PC', label: 'Puntos contraataque', key: null, fixtureKey: 'fastBreakPoints', format: 'avg', higherIsBetter: true },
      { code: 'PB', label: 'Puntos desde el banquillo', key: null, fixtureKey: 'benchPoints', format: 'avg', higherIsBetter: true },
      { code: 'RAP', label: 'Asistencia perdida', key: null, fixtureKey: 'assistTurnover', format: 'avg', higherIsBetter: false },
    ],
  },
];

export type ResumenFixtureRow = {
  pointsInPaint: number;
  secondChancePoints: number;
  fastBreakPoints: number;
  benchPoints: number;
  assistTurnover: number;
};

/**
 * ⚠️ DATOS DE MUESTRA — NO SON REALES.
 *
 * La query TEAM_STATS no expone puntos en la pintura, de segunda oportunidad,
 * de contraataque, del banquillo ni asistencia perdida. Estas cifras existen
 * solo para que la sección "Resumen Estadístico" se pueda evaluar visualmente.
 *
 * Antes de publicar: pedir estos campos al backend, añadirlos a TEAM_STATS y
 * a TeamSeasonStatsType, cambiar `key: null` por el campo real en la sección
 * `resumen` de COMPARE_SECTIONS, y borrar este objeto completo.
 */
export const RESUMEN_FIXTURE: Record<string, ResumenFixtureRow> = {
  SGE: { pointsInPaint: 39.4, secondChancePoints: 11.8, fastBreakPoints: 13.2, benchPoints: 27.6, assistTurnover: 9.1 },
  SCE: { pointsInPaint: 42.7, secondChancePoints: 13.1, fastBreakPoints: 14.6, benchPoints: 30.2, assistTurnover: 8.4 },
  ARE: { pointsInPaint: 40.1, secondChancePoints: 12.4, fastBreakPoints: 12.9, benchPoints: 28.8, assistTurnover: 8.9 },
  CAG: { pointsInPaint: 41.6, secondChancePoints: 12.9, fastBreakPoints: 13.7, benchPoints: 29.4, assistTurnover: 8.7 },
  CAR: { pointsInPaint: 38.9, secondChancePoints: 11.2, fastBreakPoints: 12.1, benchPoints: 26.9, assistTurnover: 9.4 },
  MAY: { pointsInPaint: 40.8, secondChancePoints: 12.1, fastBreakPoints: 13.4, benchPoints: 28.1, assistTurnover: 8.8 },
  PON: { pointsInPaint: 40.8, secondChancePoints: 12.1, fastBreakPoints: 14.1, benchPoints: 31.0, assistTurnover: 8.2 },
  GBO: { pointsInPaint: 37.6, secondChancePoints: 10.9, fastBreakPoints: 11.8, benchPoints: 25.4, assistTurnover: 9.6 },
  MAN: { pointsInPaint: 39.2, secondChancePoints: 11.5, fastBreakPoints: 12.6, benchPoints: 27.1, assistTurnover: 9.2 },
  QUE: { pointsInPaint: 41.1, secondChancePoints: 12.7, fastBreakPoints: 13.9, benchPoints: 29.8, assistTurnover: 8.6 },
  AGU: { pointsInPaint: 38.4, secondChancePoints: 11.6, fastBreakPoints: 12.4, benchPoints: 26.3, assistTurnover: 9.3 },
  BAY: { pointsInPaint: 44.2, secondChancePoints: 13.5, fastBreakPoints: 12.6, benchPoints: 28.4, assistTurnover: 8.9 },
};

/** true si la sección no tiene respaldo real en el backend todavía. */
export function isFixtureSection(section: CompareSection): boolean {
  return section.stats.every((s) => s.key === null);
}

/** Valor crudo de un stat para un equipo, o null si no hay dato. */
export function getStatValue(
  stat: CompareStat,
  code: string,
  stats?: TeamSeasonStatsType,
): number | null {
  if (stat.key) {
    const value = stats?.[stat.key];
    return typeof value === 'number' ? value : null;
  }
  if (stat.fixtureKey) {
    const row = RESUMEN_FIXTURE[code];
    return row ? row[stat.fixtureKey] : null;
  }
  return null;
}

/** Formato de despliegue. Los porcentajes llegan como fracción 0–1. */
export function formatStatValue(
  value: number | null,
  format: StatFormat,
): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (format === 'pct') return `${(value * 100).toFixed(1)}%`;
  if (format === 'int') return String(Math.round(value));
  return value.toFixed(1);
}

/**
 * Índices de los equipos que ganan la categoría. Devuelve varios en caso de
 * empate y ninguno si todos los valores son iguales o faltan datos.
 */
export function getWinningIndexes(
  values: (number | null)[],
  higherIsBetter: boolean,
): number[] {
  const present = values.filter((v): v is number => v !== null);
  if (present.length < 2) return [];

  const best = higherIsBetter
    ? Math.max(...present)
    : Math.min(...present);

  // Todos iguales: nadie "gana" la categoría.
  if (present.every((v) => v === best)) return [];

  return values.reduce<number[]>((acc, v, i) => {
    if (v === best) acc.push(i);
    return acc;
  }, []);
}
