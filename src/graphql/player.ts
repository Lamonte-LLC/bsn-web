import { gql } from '@apollo/client';

export const PLAYER_PROFILE = gql`
  query getPlayerProfile($geniusId: Int!, $providerId: String) {
    player(geniusId: $geniusId, providerId: $providerId) {
      providerId
      name
      nickname
      avatarUrl
      playingPosition
      height
      weight
      dob
      nationality
      shirtNumber
      team {
        code
        name
        nickname
        colorPrimary
      }
      stats {
        games
        minutes
        points
        pointsAvg
        fieldGoalsMadeAvg
        fieldGoalsAttemptedAvg
        fieldGoalsPercentage
        threePointersMadeAvg
        threePointersAttemptedAvg
        threePointersPercentage
        freeThrowsMadeAvg
        freeThrowsAttemptedAvg
        freeThrowsPercentage
        offensiveReboundsAvg
        defensiveReboundsAvg
        reboundsTotalAvg
        assistsAvg
        turnoversAvg
        stealsAvg
        blocksAvg
        foulsPersonalAvg
        plusMinusPointsAvg
      }
    }
  }
`;

export const PLAYER_SEASON_STATS = gql`
  query getPlayerSeasonStats($geniusId: Int!, $providerId: String, $seasonProviderId: String) {
    player(geniusId: $geniusId, providerId: $providerId) {
      providerId
      seasonStats(seasonProviderId: $seasonProviderId) {
        games
        minutes
        points
        pointsAvg
        fieldGoalsMadeAvg
        fieldGoalsAttemptedAvg
        fieldGoalsPercentage
        threePointersMadeAvg
        threePointersAttemptedAvg
        threePointersPercentage
        freeThrowsMadeAvg
        freeThrowsAttemptedAvg
        freeThrowsPercentage
        offensiveReboundsAvg
        defensiveReboundsAvg
        reboundsTotalAvg
        assistsAvg
        turnoversAvg
        stealsAvg
        blocksAvg
        foulsPersonalAvg
        plusMinusPointsAvg
      }
    }
  }
`;

export const PLAYER_MATCHES = gql`
  query getPlayerMatches($playerProviderId: String!, $first: Int, $after: String) {
    playerMatchesConnection(playerProviderId: $playerProviderId, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          match {
            providerId
            startAt
            homeTeam {
              providerId
              nickname
              code
              score
            }
            visitorTeam {
              providerId
              nickname
              code
              score
            }
          }
          opponentTeam {
            providerId
            code
            nickname
          }
          stats {
            minutes
            points
            reboundsTotal
            assists
            steals
            blocks
            fieldGoalsMade
            fieldGoalsAttempted
            threePointersMade
            threePointersAttempted
          }
        }
      }
    }
  }
`;
