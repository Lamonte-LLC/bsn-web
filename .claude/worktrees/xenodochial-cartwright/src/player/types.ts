export type PlayerStatsType = {
  games: number;
  gamesAvg: number;
  minutes: number;
  minutesAvg: number;
  points: number;
  pointsAvg: number;
  fieldGoalsMade: number;
  fieldGoalsMadeAvg: number;
  fieldGoalsAttempted: number;
  fieldGoalsAttemptedAvg: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersMadeAvg: number;
  threePointersAttempted: number;
  threePointersAttemptedAvg: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsMadeAvg: number;
  freeThrowsAttempted: number;
  freeThrowsAttemptedAvg: number;
  freeThrowsPercentage: number;
  offensiveRebounds: number;
  offensiveReboundsAvg: number;
  defensiveRebounds: number;
  defensiveReboundsAvg: number;
  reboundsTotal: number;
  reboundsTotalAvg: number;
  assists: number;
  assistsAvg: number;
  turnovers: number;
  turnoversAvg: number;
  steals: number;
  stealsAvg: number;
  blocks: number;
  blocksAvg: number;
  foulsPersonal: number;
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
  colorPrimary: string;
  score: string;
};

export type PlayerMatchType = {
  match: {
    providerId: string;
    startAt: string;
    homeTeam: TeamType;
    visitorTeam: TeamType;
  };
  opponentTeam: {
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

export type PlayerSeasonRosterType = {
  jerseyNumber: number;
  playingPosition: string;
  team?: TeamType;
};

export type PlayerType = {
  providerId: string;
  name: string;
  nickname: string;
  avatarUrl?: string | null;
  playingPosition: string;
  height: number;
  weight: number;
  dob: string;
  nationality: string;
  shirtNumber: number;
  team?: {
    code: string;
    name: string;
    nickname: string;
    colorPrimary: string;
  };
  stats?: PlayerStatsType;
  seasonStats?: PlayerStatsType;
  seasonRoster?: PlayerSeasonRosterType;
};
