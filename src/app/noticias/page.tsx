import { NewsType } from '@/news/types';
import { getClient } from '@/apollo-client';
import { LATEST_NEWS } from '@/graphql/news';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { stripHtmlTags } from '@/utils/html';
import NewsletterWidget from '@/news/client/containers/NewsletterWidget';
import Link from 'next/link';
import { formatDate } from '@/utils/date-formatter';

type LatestNewsResponse = {
  news: {
    edges: { node: NewsType }[];
  };
};

/** Sin orden garantizado en el API: pedimos un lote y usamos la más reciente por `publishedAt`. */
const HERO_NEWS_BATCH = 24;

async function fetchHeroNews(): Promise<NewsType | null> {
  const { data, error } = await getClient().query<LatestNewsResponse>({
    query: LATEST_NEWS,
    variables: { first: HERO_NEWS_BATCH },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  const nodes = data?.news.edges.map(({ node }) => node) ?? [];
  if (nodes.length === 0) return null;

  return [...nodes].sort(
    (a, b) =>
      new Date(b.publishedAt ?? 0).getTime() -
      new Date(a.publishedAt ?? 0).getTime(),
  )[0];
}

export default async function NoticiasPage() {
  const hero = await fetchHeroNews();

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
                  backgroundImage: `url(${hero?.imageUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'})`,
                }}
              ></figure>
              <div className="flex-1 bg-white lg:p-[40px] lg:border lg:border-[#EAEAEA] lg:rounded-r-[12px]">
                <div className="mb-3 md:mb-5">
                  <Link href={`/noticias/${hero?.slug || ''}`}>
                    <h1 className="font-barlow font-bold text-[rgba(15,23,31,0.9)] md:text-[32px]/9">
                      {hero?.title}
                    </h1>
                  </Link>
                </div>
                <div className="mb-5 md:mb-7">
                  <div
                    className="font-barlow text-sm text-[rgba(15,23,31,0.7)] md:text-base"
                    dangerouslySetInnerHTML={{
                      __html: stripHtmlTags(hero?.excerpt ?? ''),
                    }}
                  />
                </div>
                <div className="mb-5 md:mb-7">
                  <p className="font-barlow font-medium text-sm text-[rgba(15,23,31,0.6)]">
                    {formatDate(hero?.publishedAt, 'D')} de{' '}
                    {formatDate(hero?.publishedAt, 'MMMM')}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/noticias/${hero?.slug || ''}`}
                    className="border border-[#D9D3D3] inline-block shadow-[0px_1px_2px_0px_#14181F0D] text-center p-[9px] rounded-[12px] w-full md:w-[130px]"
                  >
                    <span className="text-[17px] text-black">Leer más</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <NewsletterWidget featuredNewsSlug={hero?.slug} />
        </div>
      </section>
    </FullWidthLayout>
  );
}
