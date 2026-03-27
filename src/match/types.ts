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
};

export type MatchType = {
  startAt: string;
  homeTeam: MatchTeamCompetitorType;
  visitorTeam: MatchTeamCompetitorType;
  providerId: string;
  status: string;
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
