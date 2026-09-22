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
  query getPlayerSeasonStats(
    $geniusId: Int!
    $providerId: String
    $seasonProviderId: String
  ) {
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
  query getPlayerSeasonStats(
    $geniusId: Int!
    $providerId: String
    $seasonProviderId: String
  ) {
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
  query getPlayerMatches(
    $playerProviderId: String!
    $first: Int
    $after: String
  ) {
    playerMatchesConnection(
      playerProviderId: $playerProviderId
      first: $first
      after: $after
    ) {
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
  query getPlayerAllSeasonsAvgStatsConnection(
    $playerProviderId: String!
    $first: Int
    $after: String
  ) {
    playerStatsConnection(
      playerProviderId: $playerProviderId
      first: $first
      after: $after
    ) {
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
  query getPlayerAllSeasonsTotalStatsConnection(
    $playerProviderId: String!
    $first: Int
    $after: String
  ) {
    playerStatsConnection(
      playerProviderId: $playerProviderId
      first: $first
      after: $after
    ) {
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

export const SEASON_LEADER_SUGGESTIONS = gql`
  query getSeasonLeaderSuggestions(
    $teamCode: String
    $first: Int
    $after: String
  ) {
    seasonPlayerStatsConnection(
      statsCode: "POINTS_AVG"
      teamCode: $teamCode
      first: $first
      after: $after
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
            teamColor
          }
          value
        }
      }
    }
  }
`;

export const PLAYER_SUGGESTIONS = gql`
  query getPlayerSuggestions($search: String, $first: Int, $after: String) {
    playersConnection(search: $search, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          providerId
          avatarUrl
          name
          nickname
          playingPosition
          height
          weight
          dob
          nationality
        }
      }
    }
  }
`;

export const PLAYER_COMPARISON = gql`
  query getPlayerComparison($providerId: String) {
    player(geniusId: 0, providerId: $providerId) {
      providerId
      name
      nickname
      avatarUrl
      statsBySeasonConnection(first: 99) {
        edges {
          node {
            season {
              providerId
              name
              year
              current
              isActive
              isPlayoffs
            }
            teams {
              providerId
              code
              name
              nickname
              colorPrimary
            }
            stats {
              games
              gamesAvg
              minutes
              minutesAvg
              points
              pointsAvg
              pointsInThePaint
              pointsInThePaintMade
              pointsInThePaintAttempted
              pointsSecondChance
              pointsSecondChanceMade
              pointsSecondChanceAttempted
              pointsFastBreak
              pointsFastBreakMade
              pointsFastBreakAttempted
              fieldGoalsMade
              fieldGoalsMadeAvg
              fieldGoalsAttempted
              fieldGoalsAttemptedAvg
              fieldGoalsPercentage
              twoPointsMade
              twoPointsMadeAvg
              twoPointsAttempted
              twoPointsAttemptedAvg
              twoPointsPercentage
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
              assistsTurnoverRatio
              turnovers
              turnoversAvg
              steals
              stealsAvg
              blocks
              blocksAvg
              foulsTotal
              foulsTechnical
              foulsUnsportsmanlike
              foulsDrawn
              foulsDrawnAvg
              foulsPersonal
              foulsPersonalAvg
              plusMinusPointsAvg
              efficiency
              indexOfSuccess
              doubleDouble
              draws
              dunks
              pir
            }
          }
        }
      }
      careerStats {
        games
        gamesAvg
        minutes
        minutesAvg
        points
        pointsAvg
        pointsInThePaint
        pointsInThePaintMade
        pointsInThePaintAttempted
        pointsSecondChance
        pointsSecondChanceMade
        pointsSecondChanceAttempted
        pointsFastBreak
        pointsFastBreakMade
        pointsFastBreakAttempted
        fieldGoalsMade
        fieldGoalsMadeAvg
        fieldGoalsAttempted
        fieldGoalsAttemptedAvg
        fieldGoalsPercentage
        twoPointsMade
        twoPointsMadeAvg
        twoPointsAttempted
        twoPointsAttemptedAvg
        twoPointsPercentage
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
        assistsTurnoverRatio
        turnovers
        turnoversAvg
        steals
        stealsAvg
        blocks
        blocksAvg
        foulsTotal
        foulsTechnical
        foulsUnsportsmanlike
        foulsDrawn
        foulsDrawnAvg
        foulsPersonal
        foulsPersonalAvg
        plusMinusPointsAvg
        efficiency
        indexOfSuccess
        doubleDouble
        draws
        dunks
        pir
      }
    }
  }
`;
