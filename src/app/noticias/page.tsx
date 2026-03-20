import { NewsType } from '@/news/types';
import { getClient } from '@/apollo-client';
import { LATEST_NEWS } from '@/graphql/news';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { stripHtmlTags } from '@/utils/html';
import NewsletterWidget from '@/news/client/containers/NewsletterWidget';
import Link from 'next/link';
import { formatDate } from '@/utils/date-formatter';

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

export default async function NoticiasPage() {
  const data: NewsType[] = await fetchTopNews();
  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pt-[23px] pb-[116px] lg:pt-[56px] lg:pb-[138px]">
          <div className="container">
            <div>
              <h2 className="text-center text-white text-[27px] md:text-[36px] lg:text-[42px]">
                Lo último en el BSN
              </h2>
            </div>
          </div>
        </section>
      }
    >
      <section>
        <div className="container">
          <div className="mb-11 -mt-[94px] lg:mb-18 lg:-mt-[84px]">
            <div className="flex flex-col lg:flex-row">
              <figure
                className="flex-shrink-0 bg-center bg-no-repeat bg-cover h-[214px] mb-[18px] rounded-[12px] md:h-[404px] lg:mb-0 lg:h-auto lg:w-[52%] lg:border lg:border-[rgba(159,159,159,0.4)] lg:rounded-r-[0px]"
                style={{
                  backgroundImage: `url(${data[0]?.imageUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'})`,
                }}
              ></figure>
              <div className="flex-1 bg-white lg:p-[40px] lg:border lg:border-[#EAEAEA] lg:rounded-r-[12px]">
                <div className="mb-3 md:mb-5">
                  <Link href={`/noticias/${data[0]?.slug || ''}`}>
                    <h1 className="font-barlow font-bold text-[rgba(15,23,31,0.9)] md:text-[32px]/9">
                      {data[0]?.title}
                    </h1>
                  </Link>
                </div>
                <div className="mb-5 md:mb-7">
                  <div
                    className="font-barlow text-sm text-[rgba(15,23,31,0.7)] md:text-base"
                    dangerouslySetInnerHTML={{
                      __html: stripHtmlTags(data[0]?.excerpt ?? ''),
                    }}
                  />
                </div>
                <div className="mb-5 md:mb-7">
                  <p className="font-barlow font-medium text-sm text-[rgba(15,23,31,0.6)]">
                    {formatDate(data[0]?.publishedAt, 'D')} de{' '}
                    {formatDate(data[0]?.publishedAt, 'MMMM')}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/noticias/${data[0]?.slug || ''}`}
                    className="border border-[#D9D3D3] inline-block shadow-[0px_1px_2px_0px_#14181F0D] text-center p-[9px] rounded-[12px] w-full md:w-[130px]"
                  >
                    <span className="text-[17px] text-black">Leer más</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <NewsletterWidget featuredNewsSlug={data[0]?.slug} />
        </div>
      </section>
    </FullWidthLayout>
  );
}
