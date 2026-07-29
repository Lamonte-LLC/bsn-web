/**
 * ⚠️ DATOS DE MUESTRA — NO SON REALES.
 *
 * "Últimos encuentros" necesita el historial de juegos entre los equipos
 * seleccionados. No existe hoy una query de head-to-head (TEAM_RECENT_CALENDAR
 * trae el calendario de UN equipo, sin filtro por rival), así que esta sección
 * se alimenta de fixture para poder evaluar el diseño.
 *
 * Antes de publicar: crear el hook/query de enfrentamientos (o filtrar
 * TEAM_RECENT_CALENDAR por rival en un hook nuevo) y borrar este archivo.
 */

export type MeetingFixture = {
  /** Código del ganador. */
  winner: string;
  /** Código del perdedor. */
  loser: string;
  winnerScore: number;
  loserScore: number;
  /** "lun, 13 jul, 2026" — mismo formato corto usado en las tarjetas. */
  date: string;
  /** "2OT" cuando aplica. */
  note?: string;
};

/** Llave normalizada "AAA-BBB" con los códigos en orden alfabético. */
export function meetingKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

const M = (
  winner: string,
  loser: string,
  winnerScore: number,
  loserScore: number,
  date: string,
  note?: string,
): MeetingFixture => ({ winner, loser, winnerScore, loserScore, date, note });

/**
 * Un puñado de cruces de muestra. Cualquier par sin entrada muestra el estado
 * vacío de la sección ("No hay datos disponibles.").
 */
export const MEETINGS_FIXTURE: Record<string, MeetingFixture[]> = {
  [meetingKey('BAY', 'PON')]: [
    M('BAY', 'PON', 98, 91, 'lun, 13 jul, 2026'),
    M('PON', 'BAY', 105, 102, 'dom, 28 jun, 2026', '2OT'),
    M('PON', 'BAY', 90, 87, 'lun, 15 jun, 2026'),
    M('BAY', 'PON', 94, 88, 'sáb, 30 may, 2026'),
    M('BAY', 'PON', 85, 79, 'dom, 17 may, 2026'),
  ],
  [meetingKey('BAY', 'CAG')]: [
    M('BAY', 'CAG', 101, 95, 'sáb, 5 jul, 2026'),
    M('BAY', 'CAG', 97, 92, 'vie, 12 jun, 2026'),
    M('CAG', 'BAY', 88, 84, 'mar, 26 may, 2026'),
  ],
  [meetingKey('CAG', 'PON')]: [
    M('CAG', 'PON', 99, 92, 'dom, 21 jun, 2026'),
    M('PON', 'CAG', 96, 90, 'jue, 4 jun, 2026'),
    M('CAG', 'PON', 91, 89, 'lun, 18 may, 2026'),
  ],
  [meetingKey('BAY', 'GBO')]: [
    M('BAY', 'GBO', 104, 93, 'mié, 8 jul, 2026'),
    M('BAY', 'GBO', 92, 87, 'sáb, 20 jun, 2026'),
  ],
  [meetingKey('GBO', 'PON')]: [
    M('PON', 'GBO', 95, 88, 'vie, 3 jul, 2026'),
    M('GBO', 'PON', 90, 86, 'dom, 14 jun, 2026'),
  ],
  [meetingKey('CAG', 'GBO')]: [
    M('CAG', 'GBO', 93, 90, 'mar, 30 jun, 2026'),
    M('CAG', 'GBO', 89, 82, 'sáb, 6 jun, 2026'),
  ],
};

export function getMeetings(a: string, b: string): MeetingFixture[] {
  return MEETINGS_FIXTURE[meetingKey(a, b)] ?? [];
}

/** Récord del cruce "2-1" visto desde el equipo `a`. */
export function crossRecord(a: string, b: string): string {
  const meetings = getMeetings(a, b);
  const winsA = meetings.filter((m) => m.winner === a).length;
  return `${winsA}-${meetings.length - winsA}`;
}
