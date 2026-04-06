import Link from 'next/link';

import LatestNewsItem from '@/news/components/latest-news/LatestNewsItem';
import type { NewsType } from '@/news/types';

type Props = {
  articles: NewsType[];
};

export default function LatestNewsSidebar({ articles }: Props) {
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
        {articles.map((item) => (
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
