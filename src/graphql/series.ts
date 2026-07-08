import { gql } from '@apollo/client';

export const PLAYOFFS_BRACKET_CONNECTION = gql`
  query getPlayoffsBracketConnection($first: Int, $after: String) {
    seriesConnection(first: $first, after: $after) {
      edges {
        node {
          name
          group
          round
          competitors {
            team {
              providerId
              code
              nickname
            }
            won
            position
          }
        }
      }
    }
  }
`;

export const PLAYOFFS_SERIES_CONNECTION = gql`
  query getSeriesConnection($first: Int, $after: String) {
    seriesConnection(first: $first, after: $after) {
      edges {
        node {
          providerId
          name
          group
          round
          status
          competitors {
            team {
              providerId
              code
              nickname
            }
            won
            lost
            drawn
          }
          matches {
            providerId
            startAt
            homeTeam {
              providerId
              code
              nickname
              score
            }
            visitorTeam {
              providerId
              code
              nickname
              score
            }
            status
          }
        }
      }
    }
  }
`;

export const PLAYOFFS_MATCHES = gql`
  query findPlayoffsMatches($fromDate: String!, $toDate: String!) {
    matches(fromDate: $fromDate, toDate: $toDate, playoffs: true) {
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
      }
      visitorTeam {
        code
        name
        nickname
        city
        score
      }
      channel
      overtimePeriods
      gameNumber
      isFinals
      series {
        providerId
        name
        group
        competitors {
          team {
            code
          }
          won
        }
      }
    }
  }
`;