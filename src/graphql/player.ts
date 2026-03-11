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
      seasonRoster {
        jerseyNumber
        playingPosition
        team {
          providerId
          code
          name
          nickname
          colorPrimary
        }
      }
      seasonStats {
        pointsAvg
        reboundsTotalAvg
        assistsAvg
        fieldGoalsPercentage
      }
  }
  }
`;

export const PLAYER_SEASON_AVG_STATS = gql`
  query getPlayerSeasonStats($geniusId: Int!, $providerId: String, $seasonProviderId: String) {
    player(geniusId: $geniusId, providerId: $providerId) {
      providerId
      seasonStats(seasonProviderId: $seasonProviderId) {
        gamesAvg
        minutesAvg
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

export const PLAYER_SEASON_TOTAL_STATS = gql`
  query getPlayerSeasonStats($geniusId: Int!, $providerId: String, $seasonProviderId: String) {
    player(geniusId: $geniusId, providerId: $providerId) {
      providerId
      seasonStats(seasonProviderId: $seasonProviderId) {
        games
        minutes
        points
        threePointersMade
        reboundsTotal
        assists
        steals
        blocks
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


export const PLAYER_ALL_SEASONS_AVG_STATS = gql`
  query getPlayerAllSeasonsAvgStatsConnection($playerProviderId: String!, $first: Int, $after: String) {
    playerStatsConnection(playerProviderId: $playerProviderId, first: $first, after: $after) {
      edges {
        node {
          season {
            name
            year
          }
          team {
            providerId
            code
            name
            nickname
            colorPrimary
          }
          player {
            providerId
          }
          stats {
            gamesAvg
            minutesAvg
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
    }
  }
`;

export const PLAYER_ALL_SEASONS_TOTAL_STATS = gql`
  query getPlayerAllSeasonsTotalStatsConnection($playerProviderId: String!, $first: Int, $after: String) {
    playerStatsConnection(playerProviderId: $playerProviderId, first: $first, after: $after) {
      edges {
        node {
          season {
            name
            year
          }
          team {
            providerId
            code
            name
            nickname
            colorPrimary
          }
          player {
            providerId
          }
          stats {
            games
            minutes
            points
            fieldGoalsMade
            fieldGoalsAttempted
            fieldGoalsPercentage
            threePointersMade
            threePointersAttempted
            threePointersPercentage
            freeThrowsMade
            freeThrowsAttempted
            freeThrowsPercentage
            offensiveRebounds
            defensiveRebounds
            reboundsTotal
            assists
            turnovers
            steals
            blocks
            foulsPersonal
          }
        }
      }
    }
  }
`;