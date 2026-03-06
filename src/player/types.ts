export type PlayerStatsType = {
  games: number;
  minutes: number;
  points: number;
  pointsAvg: number;
  fieldGoalsMadeAvg: number;
  fieldGoalsAttemptedAvg: number;
  fieldGoalsPercentage: number;
  threePointersMadeAvg: number;
  threePointersAttemptedAvg: number;
  threePointersPercentage: number;
  freeThrowsMadeAvg: number;
  freeThrowsAttemptedAvg: number;
  freeThrowsPercentage: number;
  offensiveReboundsAvg: number;
  defensiveReboundsAvg: number;
  reboundsTotalAvg: number;
  assistsAvg: number;
  turnoversAvg: number;
  stealsAvg: number;
  blocksAvg: number;
  foulsPersonalAvg: number;
  plusMinusPointsAvg: number;
}

export type PlayerMatchStatsType = {
  minutes: number;
  points: number;
  reboundsTotal: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
};

export type TeamType = {
  providerId: string;
  nickname: string;
  code: string;
  score: string;
};

export type PlayerMatchType = {
  match: {
    providerId: string;
    startAt: string;
    homeTeam: TeamType;
    visitorTeam: TeamType;
  };
  oponentTeam: {
    providerId: string;
    code: string;
    nickname: string;
  };
  stats: PlayerMatchStatsType;
};

export type PlayerMatchesConnectionType = {
  playerMatchesConnection: {
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
    edges: { node: PlayerMatchType }[];
  };
};

export type PlayerType = {
  providerId: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  playingPosition: string;
  height: number;
  weight: number;
  dob: string;
  nationality: string;
  shirtNumber: number;
  team: {
    code: string;
    name: string;
    nickname: string;
    colorPrimary: string;
  };
  stats?: PlayerStatsType;
  seasonStats?: PlayerStatsType;
};
