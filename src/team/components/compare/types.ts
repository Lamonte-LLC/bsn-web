import { TeamSeasonStatsType } from '@/team/types';

export type TeamRecord = {
  won: number;
  lost: number;
  /** Posición dentro del grupo (1, 2, 3…), si el backend la provee. */
  position?: number;
  /** "Grupo A" / "Grupo B" según venga del backend. */
  groupName?: string;
};

export type CompareTeamData = {
  code: string;
  loading: boolean;
  stats?: TeamSeasonStatsType;
  record?: TeamRecord;
};
