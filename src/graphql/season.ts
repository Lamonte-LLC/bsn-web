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

export const CURRENT_SEASON = gql`
  query getCurrentSeason {
    currentSeason {
      providerId
      name
      year
      startDate
      endDate
      current
    }
  }
`;

export const LAST_SEASON = gql`
  query getLastSeason {
    lastSeason {
      providerId
      name
      year
      startDate
      endDate
      current
    }
  }
`;

export const SEASON_PLAYERS_CONNECTION = gql`
  query getSeasonPlayers($first: Int!, $after: String) {
    seasonRostersConnection(first: $first, after: $after) {
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
          team {
            providerId
            nickname
            code
          }
          playingPosition
          jerseyNumber
          status
        }
      }
    }
  }
`;
