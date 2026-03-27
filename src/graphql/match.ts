import { gql } from '@apollo/client';

export const COMPLETED_MATCHES = gql`
  query findCompletedMatches($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate) {
      id
      providerId
      startAt
      endAt
      status
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
    }
  }
`;

export const RECENT_CALENDAR = gql`
  query getRecentCalendar($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate) {
      providerId
      startAt
      status
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

export const MATCH_STATUS = gql`
  query findMatchStatus($geniusMatchId: Int!, $providerMatchId: String) {
    match(geniusMatchId: $geniusMatchId, providerMatchId: $providerMatchId) {
      id
      geniusId
      providerId
      startAt
      status
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

export const MATCH_TEAMS_BOXSCORE = gql`
  query findMatchTeamBoxscore($geniusMatchId: Int!, $providerMatchId: String) {
    matchTeamsBoxscore(
      geniusMatchId: $geniusMatchId
      providerMatchId: $providerMatchId
    ) {
      id
      providerId
      homeTeam {
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
      }
      visitorTeam {
        name
        nickname
        code
        competitionStandings {
          won
          lost
        }
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
        points
        foulsPersonal
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
        points
        foulsPersonal
        twoPointersMade
        twoPointersAttempted
        twoPointersPercentage
      }
    }
  }
`;

export const MATCH_TEAM_PLAYERS_BOXSCORE = gql`
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
        assists
        fieldGoalsMade
        fieldGoalsAttempted
        fieldGoalsPercentage
        threePointersMade
        threePointersAttempted
        threePointersPercentage
        freeThrowsMade
        freeThrowsAttempted
        freeThrowsPercentage
        foulsPersonal
        steals
        blocks
        turnovers
        plusMinusPoints
      }
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
          homeTeam {
            code
            score
          }
          visitorTeam {
            code
            score
          }
          status
        }
      }
    }
  }
`;
