export type TeamPlayerStatsType = {
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
};

export type TeamPlayerSeasonRosterType = {
  jerseyNumber: number;
  playingPosition: string;
}

export type TeamPlayerType = {
  providerId: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  playingPosition?: string;
  height?: number;
  weight?: number;
  dob?: string;
  nationality?: string;
  shirtNumber?: number;
  stats?: TeamPlayerStatsType;
  seasonRoster?: TeamPlayerSeasonRosterType;
};

export type TeamCompetitionStandingType = {
  position: number;
  positionInGroup: number;
  won: number;
  lost: number;
  drawn: number;
  percentageWon: number;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
  pointsAverage: number;
  reboundsTotalAverage: number;
  assistsAverage: number;
  fieldGoalsPercentage: number;
  fieldGoalsMadeAverage: number;
  fieldGoalsAttemptedAverage: number;
  threePointersMadeAverage: number;
  threePointersAttemptedAverage: number;
  threePointersPercentage: number;
  freeThrowsMadeAverage: number;
  freeThrowsAttemptedAverage: number;
  freeThrowsPercentage: number;
  offensiveReboundsAverage: number;
  defensiveReboundsAverage: number;
  turnoversAverage: number;
  stealsAverage: number;
  blocksAverage: number;
  foulsPersonalAverage: number;
};

export type TeamType = {
  providerId: string;
  name: string;
  nickname?: string;
  code: string;
  city?: string;
  group?: string;
  streamUrl?: string;
  ticketUrl?: string;
  welcomeMessage?: string;
  warCryMessage?: string;
  competitionStandings?: TeamCompetitionStandingType;
  colorPrimary?: string;
  colorSecondary?: string;
  advSmallImageUrl?: string;
  advDefaultImageUrl?: string;
  socialInstagramUrl?: string;
  socialFacebookUrl?: string;
  socialYoutubeUrl?: string;
  socialXUrl?: string;
  socialTiktokUrl?: string;
  socialWebsiteUrl?: string;
};
