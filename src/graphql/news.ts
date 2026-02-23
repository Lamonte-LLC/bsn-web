import { gql } from '@apollo/client';

export const LATEST_NEWS = gql`
  query getLatestNews($search: String, $first: Int!, $after: String) {
    news(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          title
          slug
          excerpt
          publishedAt
          imageUrl
          url
          tags {
            slug
            name
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const SINGLE_NEWS = gql`
  query getSingleNews($slug: String!) {
    news(slug: $slug, first: 1) {
      edges {
        node {
          id
          title
          content
          slug
          excerpt
          publishedAt
          imageUrl
          url
          tags {
            slug
            name
          }
        }
      }
    }
  }
`;
