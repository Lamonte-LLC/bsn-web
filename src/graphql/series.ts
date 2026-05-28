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
            homeTeam {
              providerId
              code
              nickname
            }
            visitorTeam {
              providerId
              code
              nickname
            }
            status
          }
        }
      }
    }
  }
`;