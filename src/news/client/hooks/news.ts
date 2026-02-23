import { LATEST_NEWS } from '@/graphql/news';
import { NewsType } from '@/news/types';
import { useQuery } from '@apollo/client/react';

const PAGE_SIZE = 9;

type NewsletterResponse = {
  news: {
    edges: {
      node: NewsType;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
  };
};

export function useNewsletter() {
  const { data, loading, error, fetchMore } = useQuery<NewsletterResponse>(
    LATEST_NEWS,
    {
      variables: { first: PAGE_SIZE },
    },
  );

  if (error) {
    console.error(error);
  }

  const items = data?.news.edges.map(edge => edge.node) ?? [];
  const hasMore = data?.news.pageInfo.hasNextPage ?? false;

  const loadMore = () => {
    fetchMore({
      variables: {
        first: PAGE_SIZE,
        after: data?.news.pageInfo.endCursor,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          news: {
            ...fetchMoreResult.news,
            edges: [...prev.news.edges, ...fetchMoreResult.news.edges],
          },
        };
      },
    });
  };

  return { data: items, loading, error, hasMore, loadMore };
}