import { getClient } from '@/apollo-client';
import { LATEST_NEWS } from '@/graphql/news';
import type { NewsType } from '@/news/types';

/** Noticias para home: una sola query sirve hero (1) + sidebar (5). */
export const HOME_LATEST_NEWS_COUNT = 6;

type LatestNewsResponse = {
  news: {
    edges: { node: NewsType }[];
  };
};

export async function loadLatestNewsForHome(
  first: number = HOME_LATEST_NEWS_COUNT,
): Promise<NewsType[]> {
  const { data, error } = await getClient().query<LatestNewsResponse>({
    query: LATEST_NEWS,
    variables: { first },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }

  return data?.news.edges.map((edge) => edge.node) ?? [];
}
