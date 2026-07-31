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
      { code: 'PP', label: 'Puntos en la pintura', key: 'pointsInThePaintAverage', format: 'avg', higherIsBetter: true },
      { code: 'P2', label: 'Puntos de segunda oportunidad', key: 'pointsSecondChanceAverage', format: 'avg', higherIsBetter: true },
      { code: 'PC', label: 'Puntos contraataque', key: 'pointsFastBreakAverage', format: 'avg', higherIsBetter: true },
      { code: 'PB', label: 'Puntos desde el banquillo', key: 'pointsFromBenchAverage', format: 'avg', higherIsBetter: true },
      { code: 'RAP', label: 'Asistencia perdida', key: 'assistsTurnoverRatio', format: 'avg', higherIsBetter: false },
    ],
  },
];

/** Valor crudo de un stat para un equipo, o null si no hay dato. */
export function getStatValue(
  stat: CompareStat,
  stats?: TeamSeasonStatsType,
): number | null {
  if (!stat.key) return null;
  const value = stats?.[stat.key];
  return typeof value === 'number' ? value : null;
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
