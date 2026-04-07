export type MatchTeamCompetitorType = {
  providerId: string;
  code: string;
  name: string;
  nickname: string;
  city: string;
  color: string;
  score: string;
  competitionStandings?: {
    won: number;
    lost: number;
  },
  streamUrl?: string;
  ticketUrl?: string;
}

export type MatchVenueType = {
  name: string;
  nickname?: string;
  code?: string;
};

export type MatchPeriodType = {
  periodNumber: number;
  periodType: string;
  homeTeam: {
    score: number;
  };
  visitorTeam: {
    score: number;
  };
}

export type MatchTeamBoxScoreType = {
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowsPercentage: number;
  offensiveRebounds: number;
  reboundsTotal: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  foulsPersonal: number;
  points: number;
  twoPointersMade: number;
  twoPointersAttempted: number;
  twoPointersPercentage: number;
  pointsFromTurnover: number;
  pointsInThePaint: number;
  pointsSecondChance: number;
  pointsFastBreak: number;
  pointsFromBench: number;
  biggestLead: number;
  biggestScoringRun: number;
};

export type MatchType = {
  startAt: string;
  homeTeam: MatchTeamCompetitorType;
  visitorTeam: MatchTeamCompetitorType;
  providerId: string;
  status: string;
  /**
   * Estado del fixture según proveedor (GraphQL `providerFixtureStatus`); ej. CONFIRMED, IN_PROGRESS, FINISHED.
   * Complementa `status` (interno/mapeado) para UI y líderes alineados con el servidor.
   */
  providerFixtureStatus?: string | null;
  overtimePeriods?: number;
  currentPeriod?: string;
  currentTime?: string;
  youtube?: string;
  channel?: string;
  streamUrl?: string;
  ticketUrl?: string;
  mediaProvider?: string;
  isFinals?: boolean;
  finalsDescription?: string;
  venue?: MatchVenueType;
  periods?: MatchPeriodType[];
  homeTeamBoxscore?: MatchTeamBoxScoreType;
  visitorTeamBoxscore?: MatchTeamBoxScoreType;
};

export type MatchPlayByPlayTeamType = {
  id: string;
  providerId: string;
  name: string;
  nickname: string;
  code: string;
  colorPrimary: string;
}

export type MatchPlayByPlayPersonType = {
  id: string;
  providerId: string;
  name: string;
  nickname: string;
}

export type MatchPlayByPlayEventType = {
  eventId: string;
  team: MatchPlayByPlayTeamType | null;
  person: MatchPlayByPlayPersonType | null;
  eventClass: string;
  eventType: string;
  subType: string;
  eventTime: string;
  clock: string;
  periodId: number;
  period: number;
  periodType: string;
  success: boolean;
  x: number;
  y: number;
  playId: string;
  sequence: number;
  status: string;
  timestamp: string;
  scores: Record<string, string | number>;
  options: Record<string, string | number>;
}
