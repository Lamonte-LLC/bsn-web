import { NewsType } from '../types';
import { getClient } from '@/apollo-client';
import { LATEST_NEWS } from '@/graphql/news';
import { stripHtmlTags } from '@/utils/html';
import Link from 'next/link';

const NEWS_PER_PAGE = 1;

type LatestNewsResponse = {
  news: {
    edges: { node: NewsType }[];
  };
};

const fetchTopNews = async (): Promise<NewsType[]> => {
  const { data, error } = await getClient().query<LatestNewsResponse>({
    query: LATEST_NEWS,
    variables: { first: NEWS_PER_PAGE },
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.news.edges.map((edge: { node: NewsType }) => edge.node) ?? [];
};

export default async function TopNewsWidget() {
  const data: NewsType[] = await fetchTopNews();
  return (
    <Link
      href={`/noticias/${data[0]?.slug || ''}`}
      className="block cursor-pointer"
    >
      <div className="relative">
        <div
          className="border border-[rgba(125,125,125,0.4)] pt-[53.20%] bg-cover bg-no-repeat bg-center rounded-[12px]"
          style={{ backgroundImage: `url(${data[0]?.imageUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'})` }}
        />
        <div className="md:absolute md:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_0.01%,rgba(0,0,0,0.8)_60%)] bottom-0 left-0 right-0 px-[5px] py-[15px] rounded-b-[12px] md:p-[40px]">
          <h2 className="font-barlow font-bold text-[19px]/6 tracking-[0px] md:text-[34px]/9 md:text-white">
            {data[0]?.title}
          </h2>
          {data[0]?.excerpt && (
            <div className="font-barlow font-medium text-sm text-[rgba(0,0,0,0.6)] md:text-base md:text-[rgba(255,255,255,0.8)] mt-[15px]">
              {stripHtmlTags(data[0].excerpt)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
