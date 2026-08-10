export type TopPlayerLeaderStatsType = {
  player: {
    providerId: string;
    avatarUrl?: string | null;
    name: string;
    playingPosition: string;
    teamCode: string;
    teamName: string;
  };
  value: number;
};

export type TeamStatsType = {
  points: number;
  pointsAverage: number;
  fieldGoalsMade: number;
  fieldGoalsMadeAverage: number;
  fieldGoalsAttempted: number;
  fieldGoalsAttemptedAverage: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersMadeAverage: number;
  threePointersAttempted: number;
  threePointersAttemptedAverage: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsMadeAverage: number;
  freeThrowsAttempted: number;
  freeThrowsAttemptedAverage: number;
  freeThrowsPercentage: number;
  offensiveRebounds: number;
  offensiveReboundsAverage: number;
  defensiveRebounds: number;
  defensiveReboundsAverage: number;
  reboundsTotal: number;
  reboundsTotalAverage: number;
  assists: number;
  assistsAverage: number;
  turnovers: number;
  turnoversAverage: number;
  steals: number;
  stealsAverage: number;
  blocks: number;
  blocksAverage: number;
  foulsPersonal: number;
  foulsPersonalAverage: number;
  foulsDrawn: number;
  foulsDrawnAverage: number;
};
