import { getClient } from '@/apollo-client';
import { DOMAIN_URL, SITE_NAME } from '@/constants';
import { SINGLE_NEWS } from '@/graphql/news';
import { NewsType } from '@/news/types';
import LatestNewsWidget from '@/news/widgets/LatestNewsWidget';
import AdSlot from '@/shared/client/components/gtm/AdSlot';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { formatDate } from '@/utils/date-formatter';
import { stripHtmlTags } from '@/utils/html';
import { Metadata } from 'next';
import Link from 'next/link';

const NEWS_PER_PAGE = 1;

type LatestNewsResponse = {
  news: {
    edges: { node: NewsType }[];
  };
};

const fetchSingleNews = async (slug: string): Promise<NewsType[]> => {
  const { data, error } = await getClient().query<LatestNewsResponse>({
    query: SINGLE_NEWS,
    variables: { first: NEWS_PER_PAGE, slug },
    fetchPolicy: 'network-only',
    context: { fetchOptions: { cache: 'no-store' } },
  });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data?.news.edges.map((edge: { node: NewsType }) => edge.node) ?? [];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchSingleNews(slug);
  const news = data[0];

  return {
    title: `BSN - ${news?.title}`,
    description: stripHtmlTags(news?.excerpt ?? ''),
    openGraph: {
      title: `BSN - ${news?.title}`,
      description: stripHtmlTags(news?.excerpt ?? ''),
      url: `${DOMAIN_URL}/noticias/${slug}`,
      type: 'article',
      publishedTime: news?.publishedAt,
      images: news?.imageUrl ? [{ url: news.imageUrl }] : [],
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: `BSN - ${news?.title}`,
      description: stripHtmlTags(news?.excerpt ?? ''),
      images: news?.imageUrl ? [news.imageUrl] : [],
    },
  };
}

export default async function DetalleNoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data: NewsType[] = await fetchSingleNews(slug);
  return (
    <FullWidthLayout>
      <div className="pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="container">
          <div className="mb-4">
            <ul className="flex flex-wrap gap-2">
              {data[0]?.tags?.map((tag) => (
                <li key={`tag-${tag.slug}`}>
                  <span className="text-[13px] text-[rgba(49,49,50,0.8)] uppercase md:text-[15px]">
                    {tag.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4 md:mb-10">
            <h1 className="font-barlow font-bold text-[23px]/7 text-[#0F171F] md:text-[36px]/11">
              {data[0]?.title}
            </h1>
          </div>
          <div className="mb-8 md:mb-10">
            <p className="font-barlow font-medium text-[15px] text-[rgba(49,49,50,0.8)]">
              {formatDate(data[0]?.publishedAt, 'D')} de{' '}
              {formatDate(data[0]?.publishedAt, 'MMMM')}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-8 lg:gap-16">
            <div className="col-span-12 lg:col-span-8">
              <figure className="mb-8 md:mb-10">
                <div
                  className="border border-[rgba(125,125,125,0.4)] pt-[53.20%] bg-cover bg-no-repeat bg-center rounded-[12px]"
                  style={{
                    backgroundImage: `url(${data[0]?.imageUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'})`,
                  }}
                />
              </figure>
              <div className="mb-8 md:mb-15">
                <div
                  className="font-barlow [&_p]:mb-5 [&_p:last-child]:mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-5"
                  dangerouslySetInnerHTML={{ __html: data[0]?.content ?? '' }}
                />
              </div>
              <div>
                <Link
                  href="/noticias"
                  className="border border-[#D9D3D3] rounded-[12px] px-[30px] py-[12px] inline-flex items-center"
                >
                  <span className="text-base text-black">Ver más noticias</span>
                </Link>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="mb-15 md:mb-5">
                <LatestNewsWidget />
              </div>
              <div className="mb-10">
                <div className="flex justify-center">
                  <AdSlot
                    adUnit="/23296921845/300-250"
                    size={[300, 250]}
                    elementId="news-gpt-ad-300-250-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
}
