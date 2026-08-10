import { BOLETOS_TEAMS_META } from '@/app/boletos/teams';

export type CompareTeam = {
  code: string;
  /** Nombre corto: "Vaqueros" */
  nickname: string;
  /** Ciudad: "Bayamón" */
  city: string;
  /** Color de marca, tomado de BOLETOS_TEAMS_META (única fuente de hexes). */
  color: string;
};

/** Colores por código — reusa la metadata de /boletos en vez de duplicar hexes. */
const TEAM_COLOR: Record<string, string> = Object.fromEntries(
  BOLETOS_TEAMS_META.map((t) => [t.code, t.borderColor]),
);

/** Mismo orden alfabético por nombre corto que usa el footer del sitio. */
const TEAM_NAMES: { code: string; nickname: string; city: string }[] = [
  { code: 'SGE', nickname: 'Atléticos', city: 'San Germán' },
  { code: 'SCE', nickname: 'Cangrejeros', city: 'Santurce' },
  { code: 'ARE', nickname: 'Capitanes', city: 'Arecibo' },
  { code: 'CAG', nickname: 'Criollos', city: 'Caguas' },
  { code: 'CAR', nickname: 'Gigantes', city: 'Carolina' },
  { code: 'MAY', nickname: 'Indios', city: 'Mayagüez' },
  { code: 'PON', nickname: 'Leones', city: 'Ponce' },
  { code: 'GBO', nickname: 'Mets', city: 'Guaynabo' },
  { code: 'MAN', nickname: 'Osos', city: 'Manatí' },
  { code: 'QUE', nickname: 'Piratas', city: 'Quebradillas' },
  { code: 'AGU', nickname: 'Santeros', city: 'Aguada' },
  { code: 'BAY', nickname: 'Vaqueros', city: 'Bayamón' },
];

export const COMPARE_TEAMS: CompareTeam[] = TEAM_NAMES.map((t) => ({
  ...t,
  color: TEAM_COLOR[t.code] ?? '#7D7D7D',
}));

const BY_CODE: Record<string, CompareTeam> = Object.fromEntries(
  COMPARE_TEAMS.map((t) => [t.code, t]),
);

export function getCompareTeam(code: string): CompareTeam | undefined {
  return BY_CODE[code];
}

/** Máximo de equipos comparables a la vez (variación 4d del diseño). */
export const MAX_COMPARE_TEAMS = 4;
/** Mínimo para que aparezca la comparación. */
export const MIN_COMPARE_TEAMS = 2;
