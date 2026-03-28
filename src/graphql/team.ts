import { gql } from '@apollo/client';

export const TEAM_DETAIL = gql`
  query getTeam($code: String!) {
    team(code: $code) {
      providerId
      name
      nickname
      code
      city
      group
      colorPrimary
      streamUrl
      ticketUrl
      socialInstagramUrl
      socialFacebookUrl
      socialYoutubeUrl
      socialXUrl
      socialTiktokUrl
      socialWebsiteUrl
      competitionStandings {
        positionInGroup
        won
        lost
        drawn
        percentageWon
        homeWins
        homeLosses
        awayWins
        awayLosses
        pointsAverage
        reboundsTotalAverage
        assistsAverage
        fieldGoalsPercentage
      }
    }
  }
`;

/**
 * Calendario reciente/próximo del equipo: incluye `providerFixtureStatus` en cada partido
 * para alinear filas finalizado/en vivo con el backend (igual que liga).
 */
export const TEAM_RECENT_CALENDAR = gql`
  query getTeamRecentCalendar(
    $code: String!
    $date: String
    $first: Int!
    $after: String
  ) {
    teamRecentCalendarConnection(
      code: $code
      date: $date
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          startAt
          providerId
          homeTeam {
            code
            score
          }
          visitorTeam {
            code
            score
          }
          overtimePeriods
          status
          providerFixtureStatus
        }
      }
    }
  }
`;

/** Igual que `TEAM_RECENT_CALENDAR`: estado del proveedor en el nodo para UI consistente. */
export const TEAM_UPCOMING_CALENDAR = gql`
  query getTeamUpcomingCalendar(
    $code: String!
    $date: String
    $first: Int!
    $after: String
  ) {
    teamUpcomingCalendarConnection(
      code: $code
      date: $date
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          startAt
          providerId
          homeTeam {
            code
            nickname
            city
            ticketUrl
            competitionStandings {
              won
              lost
            }
          }
          visitorTeam {
            code
            nickname
            city
            ticketUrl
            competitionStandings {
              won
              lost
            }
          }
          status
          providerFixtureStatus
          channel
        }
      }
    }
  }
`;

export const TEAM_PLAYERS_CONNECTION = gql`
  query getTeamPlayers($code: String!, $seasonProviderId: String, $first: Int!, $after: String) {
    teamRostersConnection(code: $code, seasonProviderId: $seasonProviderId, first: $first, after: $after) {
      edges {
        node {
          player {
            providerId
            name
            nickname
            avatarUrl
            dob
            height
            weight
          }
          playingPosition
          jerseyNumber
          status
        }
      }
    }
  }
`;

export const TEAM_PLAYERS_STATS_CONNECTION = gql`
  query getTeamPlayersStats($code: String!, $first: Int!, $after: String) {
    teamPlayersStatsConnection(code: $code, first: $first, after: $after) {
      edges {
        node {
          providerId
          name
          nickname
          avatarUrl
          playingPosition
          stats {
            games
            minutes
            points
            pointsAvg
            fieldGoalsMade
            fieldGoalsMadeAvg
            fieldGoalsAttempted
            fieldGoalsAttemptedAvg
            fieldGoalsPercentage
            threePointersMade
            threePointersMadeAvg
            threePointersAttempted
            threePointersAttemptedAvg
            threePointersPercentage
            freeThrowsMade
            freeThrowsMadeAvg
            freeThrowsAttempted
            freeThrowsAttemptedAvg
            freeThrowsPercentage
            offensiveRebounds
            offensiveReboundsAvg
            defensiveRebounds
            defensiveReboundsAvg
            reboundsTotal
            reboundsTotalAvg
            assists
            assistsAvg
            turnovers
            turnoversAvg
            steals
            stealsAvg
            blocks
            blocksAvg
            foulsPersonal
            foulsPersonalAvg
            plusMinusPointsAvg
          }
          seasonRoster {
            jerseyNumber
            playingPosition
          }
          seasonStats {
            games
            minutes
            minutesAvg
            points
            pointsAvg
            fieldGoalsMade
            fieldGoalsMadeAvg
            fieldGoalsAttempted
            fieldGoalsAttemptedAvg
            fieldGoalsPercentage
            threePointersMade
            threePointersMadeAvg
            threePointersAttempted
            threePointersAttemptedAvg
            threePointersPercentage
            freeThrowsMade
            freeThrowsMadeAvg
            freeThrowsAttempted
            freeThrowsAttemptedAvg
            freeThrowsPercentage
            offensiveRebounds
            offensiveReboundsAvg
            defensiveRebounds
            defensiveReboundsAvg
            reboundsTotal
            reboundsTotalAvg
            assists
            assistsAvg
            turnovers
            turnoversAvg
            steals
            stealsAvg
            blocks
            blocksAvg
            foulsPersonal
            foulsPersonalAvg
            plusMinusPointsAvg
          }
        }
      }
    }
  }
`;

export const TEAM_LEADERS_BASIC_STATS_CONNECTION = gql`
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

export const TEAM_LEADERS_STATS_CONNECTION = gql`
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
    blocksLeaders: seasonPlayerStatsConnection(
      statsCode: "BLOCKS_AVG"
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
    stealsLeaders: seasonPlayerStatsConnection(
      statsCode: "STEALS_AVG"
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
    fieldGoalsLeaders: seasonPlayerStatsConnection(
      statsCode: "FIELD_GOALS_AVG"
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

export const TEAM_STATS = gql`
  query getTeamStats($code: String!) {
    team(code: $code) {
      providerId
      code
      name
      nickname
      seasonStats {
        points
        pointsAverage
        assists
        assistsAverage
        fieldGoalsMade
        fieldGoalsMadeAverage
        fieldGoalsAttempted
        fieldGoalsAttemptedAverage
        fieldGoalsPercentage
        threePointersMade
        threePointersMadeAverage
        threePointersAttempted
        threePointersAttemptedAverage
        threePointersPercentage
        freeThrowsMade
        freeThrowsMadeAverage
        freeThrowsAttempted
        freeThrowsAttemptedAverage
        freeThrowsPercentage
        offensiveRebounds
        offensiveReboundsAverage
        defensiveRebounds
        defensiveReboundsAverage
        reboundsTotal
        reboundsTotalAverage
        turnovers
        turnoversAverage
        steals
        stealsAverage
        blocks
        blocksAverage
        foulsPersonal
        foulsPersonalAverage
      }
    }
  }
`;
