import Link from 'next/link';
import { formatDate } from '@/utils/date-formatter';
import { stripHtmlTags } from '@/utils/html';

type Props = {
  title: string;
  slug: string;
  thumbnailUrl?: string;
  excerpt?: string;
  publishedAt: string;
  tags?: {
    name: string;
    slug: string;
  }[];
};

export default function NewsItem({
  title,
  slug,
  thumbnailUrl = '',
  excerpt = '',
  publishedAt,
  tags = [],
}: Props) {
  return (
    <div className="flex flex-row gap-[15px] items-start justify-start md:gap-[25px]">
      <figure>
        <Link
          href={{
            pathname: `/noticias/${slug}`,
          }}
        >
          <img
            src={thumbnailUrl || 'https://dummyimage.com/600x400/cccccc/ffffff'}
            alt=""
            className="aspect-3/2 rounded-[10px] w-[96px] border border-[rgba(125,125,125,0.4)] object-cover md:w-[242px]"
          />
        </Link>
      </figure>
      <div className="flex flex-col gap-0 flex-1 md:gap-2">
        <div className="mb-1">
          <Link
            href={{
              pathname: `/noticias/${slug}`,
            }}
            className="flex-1"
          >
            <h4 className="font-barlow font-semibold text-sm text-[rgba(15,23,31,0.9)] md:font-bold md:text-[20px]">
              {title}
            </h4>
          </Link>
        </div>
        <div className="hidden md:block">
          <div className="font-barlow mb-1 text-sm text-[rgba(15,23,31,0.7)]">
            {stripHtmlTags(excerpt)}
          </div>
        </div>
        <p
          className="font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.6)] md:text-[13px]"
          title={formatDate(publishedAt, 'D [de] MMMM, YYYY')}
        >
          {formatDate(publishedAt, 'D [de] MMMM, YYYY')}
        </p>
      </div>
    </div>
  );
}
