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
      { code: 'PER', label: 'Perdidas por juego', key: 'turnoversAverage', format: 'avg', higherIsBetter: false },
      { code: 'ROB', label: 'Robadas por juego', key: 'stealsAverage', format: 'avg', higherIsBetter: true },
      { code: 'BPJ', label: 'Bloqueos por juego', key: 'blocksAverage', format: 'avg', higherIsBetter: true },
      { code: 'MPJ', label: 'Mates por juego', key: 'dunksAverage', format: 'avg', higherIsBetter: true },
    ],
  },
  {
    id: 'tiros',
    title: 'Estadísticas de tiros',
    shortTitle: 'Tiros',
    stats: [
      { code: 'PPJ', label: 'Puntos por juego', key: 'pointsAverage', format: 'avg', higherIsBetter: true },
      { code: 'TC', label: 'Tiros convertidos', key: 'fieldGoalsMade', format: 'int', higherIsBetter: true },
      { code: 'TI', label: 'Tiros intentados', key: 'fieldGoalsAttempted', format: 'int', higherIsBetter: true },
      { code: 'TI%', label: 'Tiros porcentaje', key: 'fieldGoalsPercentage', format: 'pct', higherIsBetter: true },
      { code: '2PC', label: 'Dos puntos convertidos', key: 'twoPointsMade', format: 'int', higherIsBetter: true },
      { code: '2PI', label: 'Dos puntos intentados', key: 'twoPointsAttempted', format: 'int', higherIsBetter: true },
      { code: '2P%', label: 'Dos puntos porcentaje', key: 'twoPointsPercentage', format: 'pct', higherIsBetter: true },
      { code: '3PC', label: 'Tres puntos convertidos', key: 'threePointersMade', format: 'int', higherIsBetter: true },
      { code: '3PI', label: 'Tres puntos intentados', key: 'threePointersAttempted', format: 'int', higherIsBetter: true },
      { code: '3P%', label: 'Tres puntos porcentaje', key: 'threePointersPercentage', format: 'pct', higherIsBetter: true },
      { code: 'TLC', label: 'Tiros libres convertidos', key: 'freeThrowsMade', format: 'int', higherIsBetter: true },
      { code: 'TLI', label: 'Tiros libres intentados', key: 'freeThrowsAttempted', format: 'int', higherIsBetter: true },
      { code: 'TL%', label: 'Tiro libre porcentaje', key: 'freeThrowsPercentage', format: 'pct', higherIsBetter: true },
    ],
  },
  {
    id: 'totales',
    title: 'Totales',
    shortTitle: 'Totales',
    stats: [
      { code: 'PTS', label: 'Puntos', key: 'points', format: 'int', higherIsBetter: true },
      { code: 'RO', label: 'Rebote ofensivo', key: 'offensiveRebounds', format: 'int', higherIsBetter: true },
      { code: 'RD', label: 'Rebote defensivo', key: 'defensiveRebounds', format: 'int', higherIsBetter: true },
      { code: 'REB', label: 'Rebotes', key: 'reboundsTotal', format: 'int', higherIsBetter: true },
      { code: 'AST', label: 'Asistencias', key: 'assists', format: 'int', higherIsBetter: true },
      { code: 'TF', label: 'Faltas', key: 'foulsTotal', format: 'int', higherIsBetter: false },
      { code: 'FT', label: 'Faltas técnicas', key: 'foulsTechnical', format: 'int', higherIsBetter: false },
      { code: 'FA', label: 'Faltas antideportivas', key: 'foulsUnsportsmanlike', format: 'int', higherIsBetter: false },
      { code: 'FR', label: 'Faltas cometidas', key: 'foulsPersonal', format: 'int', higherIsBetter: false },
      { code: 'PE', label: 'Perdidas', key: 'turnovers', format: 'int', higherIsBetter: false },
      { code: 'REC', label: 'Robadas', key: 'steals', format: 'int', higherIsBetter: true },
      { code: 'BLQ', label: 'Bloqueos', key: 'blocks', format: 'int', higherIsBetter: true },
      { code: 'BR', label: 'Bloqueos recibidos', key: 'blocksReceived', format: 'int', higherIsBetter: true },
      { code: 'M', label: 'Mates', key: 'dunks', format: 'int', higherIsBetter: true },
    ],
  },
  {
    id: 'resumen',
    title: 'Resumen Estadístico',
    shortTitle: 'Resumen',
    stats: [
      { code: 'PTS', label: 'Puntos', key: 'points', format: 'int', higherIsBetter: true },
      { code: 'PP', label: 'Puntos en la pintura', key: 'pointsInThePaint', format: 'int', higherIsBetter: true },
      { code: 'P2', label: 'Puntos de segunda oportunidad', key: 'pointsSecondChance', format: 'int', higherIsBetter: true },
      { code: 'PC', label: 'Puntos contraataque', key: 'pointsFastBreak', format: 'int', higherIsBetter: true },
      { code: 'PB', label: 'Puntos desde el banquillo', key: 'pointsFromBench', format: 'int', higherIsBetter: true },
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
