/** Response shape of the SEASON_LEADER_SUGGESTIONS query (graphql/player.ts). No imports, safe from client components. */
export type SeasonLeaderSuggestionEdge = {
  node: {
    player: {
      providerId: string;
      avatarUrl: string | null;
      name: string;
      playingPosition: string;
      teamCode: string;
      teamName: string;
      teamColor: string;
    };
    value: number;
  };
};
