import { gql } from '@apollo/client';

export const SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY = gql`
  query getSeasonTopPlayerLeaderStatsByCategory($statsCode: String!, $first: Int!) {
    seasonPlayerStatsConnection(
      statsCode: $statsCode
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            playingPosition
            teamCode
            teamName
          }
          value
        }
      }
    }
  }
`;

export const STANDINGS_TABLE_BASIC = gql`
  query getStandingsTable {
    standings {
      groups {
        name
        teams {
          name
          nickname
          code
          competitionStandings {
            won
            lost
            percentageWon
            homeWins
            homeLosses
            awayWins
            awayLosses
          }
        }
      }
    }
  }
`;

export const SEASON_TEAM_LEADER_PLAYER_STATS = gql`
  query getSeasonTeamLeaderPlayerStats($teamCode: String!, $first: Int!) {
    pointsLeaders: seasonPlayerStatsConnection(
      statsCode: "POINTS_AVG"
      teamCode: $teamCode
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            playingPosition
          }
          value
        }
      }
    }
    reboundsLeaders: seasonPlayerStatsConnection(
      statsCode: "REBOUNDS_AVG"
      teamCode: $teamCode
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            playingPosition
          }
          value
        }
      }
    }
    assistsLeaders: seasonPlayerStatsConnection(
      statsCode: "ASSISTS_AVG"
      teamCode: $teamCode
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            playingPosition
          }
          value
        }
      }
    }
  }
`;


export const MATCH_LEADERS_STATS = gql`
  query getMatchLeadersStats($matchProviderId: String!, $first: Int!) {
    pointsLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "POINTS"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            points
          }
        }
      }
    }
    reboundsLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "REBOUNDS"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            reboundsTotal
          }
        }
      }
    }
    assistsLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "ASSISTS"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            assists
          }
        }
      }
    }
    stealsLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "STEALS"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            steals
          }
        }
      }
    }
    blocksLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "BLOCKS"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            blocks
          }
        }
      }
    }
    threePointersMadeLeaders: matchLeadersConnection(
      matchProviderId: $matchProviderId
      statsCode: "THREE_POINTERS_MADE"
      first: $first
    ) {
      edges {
        node {
          player {
            providerId
            avatarUrl
            name
            shirtNumber
            playingPosition
            teamName
            teamCode
          }
          boxscore {
            threePointersMade
          }
        }
      }
    }
  }
`;
