import { gql } from '@apollo/client';

export const SEASON_CONNECTION = gql`
  query getSeasonConnection($first: Int, $after: String) {
    seasonConnection(first: $first, after: $after) {
      edges {
        node {
          providerId
          name
          year
          startDate
          endDate
          current
        }
      }
    }
  }
`;
