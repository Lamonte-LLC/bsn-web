import { gql } from '@apollo/client';

/**
 * Donde el partido expone `status`, varias queries también piden `providerFixtureStatus`
 * (estado crudo Sportradar/DataCore en el backend) para calendarios y `/partidos/[id]`
 * sin depender solo del `status` interno mapeado.
 */
export const COMPLETED_MATCHES = gql`
  query findCompletedMatches($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate) {
      id
      providerId
      startAt
      endAt
      status
      providerFixtureStatus
      homeTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
      }
      visitorTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
      }
      venue {
        name
      }
      overtimePeriods
      youtube
      isFinals
      phaseName
      gameNumber
      finalsDescription
    }
  }
`;

export const SCHEDULED_MATCHES = gql`
  query findScheduledMatches($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate) {
      id
      providerId
      startAt
      homeTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        ticketUrl
      }
      visitorTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        ticketUrl
      }
      venue {
        name
      }
      channel
      isFinals
      phaseName
      gameNumber
      finalsDescription
      status
      providerFixtureStatus
    }
  }
`;

export const RECENT_CALENDAR = gql`
  query getRecentCalendar($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate) {
      providerId
      startAt
      status
      providerFixtureStatus
      currentPeriod
      currentTime
      homeTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
        ticketUrl
      }
      visitorTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
        ticketUrl
      }
      venue {
        name
      }
      channel
      overtimePeriods
      youtube
      isFinals
      phaseName
      gameNumber
      finalsDescription
    }
  }
`;

export const MATCH = gql`
  query findMatch($geniusMatchId: Int!, $providerMatchId: String) {
    match(geniusMatchId: $geniusMatchId, providerMatchId: $providerMatchId) {
      id
      geniusId
      providerId
      startAt
      status
      providerFixtureStatus
      currentPeriod
      currentTime
      homeTeam {
        providerId
        code
        name
        nickname
        city
        color
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
        ticketUrl
      }
      visitorTeam {
        providerId
        code
        name
        nickname
        city
        color
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
        ticketUrl
      }
      venue {
        name
      }
      channel
      overtimePeriods
      youtube
      isFinals
      phaseName
      gameNumber
      finalsDescription
    }
  }
`;

/** Smaller payload for live scoreboard polling (avoids standings / ticket fields; interval set in hooks). */
export const MATCH_LIVE_SCOREBOARD = gql`
  query findMatchLiveScoreboard(
    $geniusMatchId: Int!
    $providerMatchId: String
  ) {
    match(geniusMatchId: $geniusMatchId, providerMatchId: $providerMatchId) {
      providerId
      startAt
      status
      currentPeriod
      currentTime
      homeTeam {
        providerId
        code
        name
        nickname
        city
        color
        score
      }
      visitorTeam {
        providerId
        code
        name
        nickname
        city
        color
        score
      }
      venue {
        name
      }
      overtimePeriods
    }
  }
`;

export const GET_PLAYOFFS = gql`
  query getPlayoffs {
    playoffs {
      title
      imageUrl
      isCurrent
    }
  }
`;

/**
 * Totales de equipo en `matchTeamsBoxscore` / panel tabbed.
 * Mantener alineado con el schema GraphQL desplegado: APIs antiguas no exponían
 * `defensiveRebounds` ni las métricas extendidas en `MatchTeamBoxscoreType` (Heroku 500).
 * Tras desplegar `bsn-main` actual, se pueden volver a añadir esos campos aquí.
 */
export const MATCH_TEAM_AGGREGATE_BOXSCORE_FIELDS = gql`
  fragment MatchTeamAggregateBoxscoreFields on MatchTeamBoxscoreType {
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
    reboundsTotal
    assists
    turnovers
    steals
    blocks
    foulsPersonal
    points
    twoPointersMade
    twoPointersAttempted
    twoPointersPercentage
  }
`;

/**
 * Filas jugador en box score. Omitimos `avatarUrl` y `defensiveRebounds` en jugador
 * hasta que producción exponga el mismo schema que bsn-main actual (evita GraphQL
 * "Cannot query field" en Heroku). El UI ya tolera null/undefined.
 */
export const MATCH_PLAYER_BOXSCORE_ROW_FIELDS = gql`
  fragment MatchPlayerBoxscoreRowFields on MatchPlayersBoxscoreType {
    player {
      providerId
      name
      nickname
      shirtNumber
      playingPosition
    }
    boxscore {
      minutes
      points
      reboundsTotal
      offensiveRebounds
      isStarter
      assists
      fieldGoalsMade
      fieldGoalsAttempted
      fieldGoalsPercentage
      threePointersMade
      threePointersAttempted
      threePointersPercentage
      twoPointersMade
      twoPointersAttempted
      twoPointersPercentage
      freeThrowsMade
      freeThrowsAttempted
      freeThrowsPercentage
      foulsPersonal
      foulsDrawn
      steals
      blocks
      turnovers
      plusMinusPoints
    }
  }
`;

export const MATCH_LIVE_TEAMS_BOXSCORE = gql`
  query findMatchLiveTeamsBoxscore(
    $geniusMatchId: Int!
    $providerMatchId: String
  ) {
    matchTeamsBoxscore(
      geniusMatchId: $geniusMatchId
      providerMatchId: $providerMatchId
    ) {
      id
      providerId
      homeTeam {
        providerId
        name
        nickname
        code
        color
      }
      visitorTeam {
        providerId
        name
        nickname
        code
        color
      }
      homeTeamBoxscore {
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
        reboundsTotal
        assists
        turnovers
        steals
        blocks
        foulsPersonal
        points
        twoPointersMade
        twoPointersAttempted
        twoPointersPercentage
      }
      visitorTeamBoxscore {
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
        reboundsTotal
        assists
        turnovers
        steals
        blocks
        foulsPersonal
        points
        twoPointersMade
        twoPointersAttempted
        twoPointersPercentage
      }
    }
  }
`;

export const MATCH_TEAMS_BOXSCORE = gql`
  ${MATCH_TEAM_AGGREGATE_BOXSCORE_FIELDS}
  query findMatchTeamBoxscore($geniusMatchId: Int!, $providerMatchId: String) {
    matchTeamsBoxscore(
      geniusMatchId: $geniusMatchId
      providerMatchId: $providerMatchId
    ) {
      id
      providerId
      homeTeam {
        providerId
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      visitorTeam {
        providerId
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      homeTeamBoxscore {
        ...MatchTeamAggregateBoxscoreFields
      }
      visitorTeamBoxscore {
        ...MatchTeamAggregateBoxscoreFields
      }
    }
  }
`;

export const MATCH_TEAM_PLAYERS_BOXSCORE = gql`
  ${MATCH_PLAYER_BOXSCORE_ROW_FIELDS}
  query findMatchTeamPlayersBoxscore(
    $geniusMatchId: Int!
    $geniusTeamId: Int!
    $providerMatchId: String
    $providerTeamId: String
  ) {
    matchPlayersBoxscore(
      geniusMatchId: $geniusMatchId
      geniusTeamId: $geniusTeamId
      providerMatchId: $providerMatchId
      providerTeamId: $providerTeamId
    ) {
      ...MatchPlayerBoxscoreRowFields
    }
  }
`;

/** Same player/boxscore selection as `MATCH_TEAM_PLAYERS_BOXSCORE`, one HTTP round-trip for both teams. */
export const MATCH_BOTH_TEAMS_PLAYERS_BOXSCORE = gql`
  ${MATCH_PLAYER_BOXSCORE_ROW_FIELDS}
  query findMatchBothTeamsPlayersBoxscore(
    $geniusMatchId: Int!
    $providerMatchId: String
    $visitorProviderTeamId: String!
    $homeProviderTeamId: String!
  ) {
    visitorPlayers: matchPlayersBoxscore(
      geniusMatchId: $geniusMatchId
      geniusTeamId: 0
      providerMatchId: $providerMatchId
      providerTeamId: $visitorProviderTeamId
    ) {
      ...MatchPlayerBoxscoreRowFields
    }
    homePlayers: matchPlayersBoxscore(
      geniusMatchId: $geniusMatchId
      geniusTeamId: 0
      providerMatchId: $providerMatchId
      providerTeamId: $homeProviderTeamId
    ) {
      ...MatchPlayerBoxscoreRowFields
    }
  }
`;

/**
 * Single round-trip for extended tabbed box score: team aggregates + both rosters.
 * Replaces 1× teams boxscore + 2× duplicate teams queries + 1× dual players query.
 */
export const MATCH_TABBED_BOXSCORE_PANEL = gql`
  ${MATCH_TEAM_AGGREGATE_BOXSCORE_FIELDS}
  ${MATCH_PLAYER_BOXSCORE_ROW_FIELDS}
  query findMatchTabbedBoxscorePanel(
    $geniusMatchId: Int!
    $providerMatchId: String
    $visitorProviderTeamId: String!
    $homeProviderTeamId: String!
  ) {
    matchTeamsBoxscore(
      geniusMatchId: $geniusMatchId
      providerMatchId: $providerMatchId
    ) {
      id
      providerId
      homeTeam {
        providerId
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      visitorTeam {
        providerId
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      homeTeamBoxscore {
        ...MatchTeamAggregateBoxscoreFields
      }
      visitorTeamBoxscore {
        ...MatchTeamAggregateBoxscoreFields
      }
    }
    visitorPlayers: matchPlayersBoxscore(
      geniusMatchId: $geniusMatchId
      geniusTeamId: 0
      providerMatchId: $providerMatchId
      providerTeamId: $visitorProviderTeamId
    ) {
      ...MatchPlayerBoxscoreRowFields
    }
    homePlayers: matchPlayersBoxscore(
      geniusMatchId: $geniusMatchId
      geniusTeamId: 0
      providerMatchId: $providerMatchId
      providerTeamId: $homeProviderTeamId
    ) {
      ...MatchPlayerBoxscoreRowFields
    }
  }
`;

export const MATCH_PERIODS_BOXSCORE = gql`
  query findMatchPeriodsBoxscore(
    $geniusMatchId: Int!
    $providerMatchId: String
  ) {
    matchPeriods(
      geniusMatchId: $geniusMatchId
      providerMatchId: $providerMatchId
    ) {
      id
      providerId
      homeTeam {
        providerId
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      visitorTeam {
        providerId
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      periods {
        periodNumber
        periodType
        homeTeam {
          score
        }
        visitorTeam {
          score
        }
      }
    }
  }
`;

export const NEXT_SCHEDULED_MATCH_FOR_TEAM = gql`
  query findNextScheduledMatchForTeam($code: String!, $date: String!) {
    teamUpcomingCalendarConnection(code: $code, date: $date, first: 1) {
      edges {
        node {
          id
          startAt
          geniusId
          homeTeam {
            code
            nickname
            city
            competitionStandings {
              won
              lost
            }
          }
          visitorTeam {
            code
            nickname
            city
            competitionStandings {
              won
              lost
            }
          }
          status
          providerFixtureStatus
          channel
          ticketUrl
        }
      }
    }
  }
`;

export const TEAM_CALENDAR = gql`
  query getTeamCalendar($code: String!, $first: Int!) {
    teamCalendarConnection(code: $code, first: $first) {
      edges {
        node {
          providerId
          startAt
          homeTeam {
            name
            nickname
            code
            score
          }
          visitorTeam {
            name
            nickname
            code
            score
          }
          status
          providerFixtureStatus
          overtimePeriods
          youtube
        }
      }
    }
  }
`;

export const TEAM_LIVE_MATCH = gql`
  query getTeamLiveMatch($code: String!) {
    teamLiveMatch(code: $code) {
      id
      providerId
      startAt
      status
      providerFixtureStatus
      currentPeriod
      currentTime
      homeTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
      }
      visitorTeam {
        code
        name
        nickname
        city
        score
        competitionStandings {
          won
          lost
        }
        streamUrl
      }
      channel
      overtimePeriods
      isFinals
      finalsDescription
    }
  }
`;

export const HEAD_TO_HEAD_MATCHES = gql`
  # Antes el nodo repetía el campo status dos veces; quedó una sola y se añadió providerFixtureStatus.
  query getHeadToHeadMatches(
    $teamCodeA: String!
    $teamCodeB: String!
    $toDate: String
    $first: Int!
  ) {
    headToHeadMatchesConnection(
      teamCodeA: $teamCodeA
      teamCodeB: $teamCodeB
      toDate: $toDate
      first: $first
    ) {
      edges {
        node {
          id
          providerId
          startAt
          status
          providerFixtureStatus
          homeTeam {
            code
            score
          }
          visitorTeam {
            code
            score
          }
        }
      }
    }
  }
`;
