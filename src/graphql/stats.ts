import { gql } from '@apollo/client';

export const SEASON_TOP_PLAYER_LEADER_STATS_BY_CATEGORY = gql`
  query getSeasonTopPlayerLeaderStatsByCategory(
    $statsCode: String!
    $first: Int!
  ) {
    seasonPlayerStatsConnection(statsCode: $statsCode, first: $first) {
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

export const PLAYOFFS_LEADERS_STATS_CONNECTION = gql`
  query getSeasonTeamLeaderPlayerStats($first: Int!) {
    pointsLeaders: seasonPlayerStatsConnection(
      statsCode: "POINTS_AVG"
      playoffs: true
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
    reboundsLeaders: seasonPlayerStatsConnection(
      statsCode: "REBOUNDS_AVG"
      playoffs: true
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
    assistsLeaders: seasonPlayerStatsConnection(
      statsCode: "ASSISTS_AVG"
      playoffs: true
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
    blocksLeaders: seasonPlayerStatsConnection(
      statsCode: "BLOCKS_AVG"
      playoffs: true
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
    stealsLeaders: seasonPlayerStatsConnection(
      statsCode: "STEALS_AVG"
      playoffs: true
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
    fieldGoalsLeaders: seasonPlayerStatsConnection(
      statsCode: "FIELD_GOALS_AVG"
      playoffs: true
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

export const SEASON_TEAM_STATS_EXTENDED = gql`
  query getSeasonTeamStatsExtended(
    $seasonProviderId: String
    $first: Int!
    $after: String
  ) {
    seasonTeamStatsExtendedConnection(
      seasonProviderId: $seasonProviderId
      first: $first
      after: $after
    ) {
      edges {
        node {
          season {
            providerId
            name
          }
          team {
            providerId
            code
            name
            nickname
            city
            colorPrimary
          }
          stats {
            points
            pointsInThePaint
            pointsInThePaintAverage
            pointsInThePaintMade
            pointsInThePaintAttempted
            pointsSecondChance
            pointsSecondChanceAverage
            pointsSecondChanceMade
            pointsSecondChanceAttempted
            pointsFastBreak
            pointsFastBreakAverage
            pointsFastBreakMade
            pointsFastBreakAttempted
            pointsFromBench
            pointsFromBenchAverage
            pointsAverage
            fieldGoalsMade
            fieldGoalsMadeAverage
            fieldGoalsAttempted
            fieldGoalsAttemptedAverage
            fieldGoalsPercentage
            twoPointsMade
            twoPointsMadeAverage
            twoPointsAttempted
            twoPointsAttemptedAverage
            twoPointsPercentage
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
            assists
            assistsAverage
            assistsTurnoverRatio
            turnovers
            turnoversAverage
            steals
            stealsAverage
            blocks
            blocksAverage
            blocksReceived
            blocksReceivedAverage
            foulsPersonal
            foulsPersonalAverage
            foulsTotal
            foulsTechnical
            foulsUnsportsmanlike
            foulsDrawn
            foulsDrawnAverage
            dunks
            dunksAverage
          }
        }
      }
    }
  }
`;

export const SEASON_PLAYER_STATS_EXTENDED = gql`
  query getSeasonPlayerStatsExtended(
    $teamCode: String
    $seasonProviderId: String
    $playoffs: Boolean
    $first: Int!
    $after: String
  ) {
    seasonPlayerStatsExtendedConnection(
      teamCode: $teamCode
      seasonProviderId: $seasonProviderId
      playoffs: $playoffs
      first: $first
      after: $after
    ) {
      edges {
        node {
          season {
            providerId
            name
          }
          team {
            providerId
            code
            name
            nickname
            city
            colorPrimary
          }
          player {
            providerId
            name
            nickname
            avatarUrl
            height
            weight
            dob
            nationality
          }
          stats {
            games
            gamesAvg
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

export const HEAD_TO_HEAD_TEAM_STATS_EXTENDED = gql`
  query getHeadToHeadTeamStatsExtended(
    $teamCodes: [String!]!
    $seasonProviderId: String
  ) {
    headToHeadTeamStats(
      teamCodes: $teamCodes
      seasonProviderId: $seasonProviderId
    ) {
      season {
        providerId
        name
      }
      team {
        providerId
        code
        name
        nickname
        city
        colorPrimary
      }
      stats {
        points
        pointsInThePaint
        pointsInThePaintAverage
        pointsInThePaintMade
        pointsInThePaintAttempted
        pointsSecondChance
        pointsSecondChanceAverage
        pointsSecondChanceMade
        pointsSecondChanceAttempted
        pointsFastBreak
        pointsFastBreakAverage
        pointsFastBreakMade
        pointsFastBreakAttempted
        pointsFromBench
        pointsFromBenchAverage
        pointsAverage
        fieldGoalsMade
        fieldGoalsMadeAverage
        fieldGoalsAttempted
        fieldGoalsAttemptedAverage
        fieldGoalsPercentage
        twoPointsMade
        twoPointsMadeAverage
        twoPointsAttempted
        twoPointsAttemptedAverage
        twoPointsPercentage
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
        assists
        assistsAverage
        assistsTurnoverRatio
        turnovers
        turnoversAverage
        steals
        stealsAverage
        blocks
        blocksAverage
        blocksReceived
        blocksReceivedAverage
        foulsPersonal
        foulsPersonalAverage
        foulsTotal
        foulsTechnical
        foulsUnsportsmanlike
        foulsDrawn
        foulsDrawnAverage
        dunks
        dunksAverage
      }
    }
  }
`;
