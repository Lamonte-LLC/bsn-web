import Link from 'next/link';

import type { NewsType } from '@/news/types';
import { stripHtmlTags } from '@/utils/html';

type Props = {
  article?: NewsType;
};

export default function TopNewsHero({ article }: Props) {
  return (
    <Link
      href={`/noticias/${article?.slug || ''}`}
      className="block cursor-pointer"
    >
      <div className="relative">
        <div
          className="border border-[rgba(125,125,125,0.4)] pt-[53.20%] bg-cover bg-no-repeat bg-center rounded-[12px]"
          style={{
            backgroundImage: `url(${article?.imageUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'})`,
          }}
        />
        <div className="md:absolute md:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_0.01%,rgba(0,0,0,0.8)_60%)] bottom-0 left-0 right-0 px-[5px] py-[15px] rounded-b-[12px] md:p-[40px]">
          <h2 className="font-barlow font-bold text-[19px]/6 tracking-[0px] md:text-[34px]/9 md:text-white">
            {article?.title}
          </h2>
          {article?.excerpt && (
            <div className="font-barlow font-medium text-sm text-[rgba(0,0,0,0.6)] md:text-base md:text-[rgba(255,255,255,0.8)] mt-[15px]">
              {stripHtmlTags(article.excerpt)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
