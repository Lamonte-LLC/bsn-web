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
