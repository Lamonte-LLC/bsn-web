import Link from 'next/link';
import LatestNewsItem from '../components/latest-news/LatestNewsItem';
import { NewsType } from '../types';
import { getClient } from '@/apollo-client';
import { LATEST_NEWS } from '@/graphql/news';

const NEWS_PER_PAGE = 6;

type LatestNewsResponse = {
  news: {
    edges: { node: NewsType }[];
  };
};

const fetchLatestNews = async (): Promise<NewsType[]> => {
  const { data, error } = await getClient().query<LatestNewsResponse>({
    query: LATEST_NEWS,
    variables: { first: NEWS_PER_PAGE },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  const latestNews = data?.news.edges.map((edge: { node: NewsType }) => edge.node) ?? [];
  return latestNews.slice(1);
};

export default async function LatestNewsWidget() {
  const data: NewsType[] = await fetchLatestNews();
  return (
    <div className="flex-1 rounded-[12px] bg-white sm:shadow-[0px_1px_3px_0px_#14181F0A] sm:border sm:border-[#EAEAEA]">
      <div className="flex flex-row justify-between items-center sm:px-[30px] sm:pt-[24px]">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Lo último en el BSN
          </h3>
        </div>
      </div>
      <div className="py-[20px] space-y-5 sm:px-[30px]">
        {data.map((item) => (
          <LatestNewsItem
            key={`latest-news-${item.id}`}
            slug={item.slug}
            title={item.title}
            publishedAt={item.publishedAt}
            thumbnailUrl={item.imageUrl}
          />
        ))}
      </div>
      <div className="sm:pb-[20px] sm:px-[30px]">
        <Link
          href="/noticias"
          className="bg-[#FCFCFC] block border border-[#D9D3D3] rounded-[12px] px-[12px] py-[9px] text-center shadow-[0px_1px_2px_0px_#14181F0D]"
        >
          <span className="font-special-gothic-condensed-one text-base text-black">
            Ver más noticias
          </span>
        </Link>
      </div>
    </div>
  );
}
