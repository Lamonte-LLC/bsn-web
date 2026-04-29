import { formatDate } from '@/utils/date-formatter';
import { truncateText } from '@/utils/text';
import Link from 'next/link';

type LatestNewsItemProps = {
  slug: string;
  title: string;
  publishedAt: string;
  thumbnailUrl?: string;
};

export default function LatestNewsItem({
  slug,
  title,
  publishedAt,
  thumbnailUrl = '',
}: LatestNewsItemProps) {
  return (
    <div className="flex flex-row-reverse sm:flex-row gap-4 items-center justify-start">
      <div className="flex flex-col gap-2 flex-1">
        <Link href={`/noticias/${slug}`} className="flex-1">
          <h4 className="font-barlow font-medium text-sm/5 text-[rgba(15,23,31,0.7)]">
            {truncateText(title, 92)}
          </h4>
        </Link>
        <p
          className="font-barlow text-xs text-color-[rgba(15,23,31,0.7)] hidden"
          title={formatDate(publishedAt, 'LL')}
        >
          {formatDate(publishedAt, 'D')} de {formatDate(publishedAt, 'MMMM')}
        </p>
      </div>
      <figure>
        <Link href={`/noticias/${slug}`}>
          <img
            src={thumbnailUrl}
            alt={title}
            className="aspect-16/9 rounded-[8px] w-[105px] object-cover"
          />
        </Link>
      </figure>
    </div>
  );
}
