'use client';

import { useState, useRef, useEffect } from 'react';
import { TopPerformancesType } from '@/highlights/types';
import { BSN_TV_DATE_FORMAT } from '@/constants';
import { formatDate } from '@/utils/date-formatter';
import { truncateText } from '@/utils/text';

type Props = {
  items: TopPerformancesType[];
};

function thumbnailUrl(item: TopPerformancesType): string {
  const fromApi = item.coverUrl?.trim();
  if (fromApi) {
    return fromApi;
  }
  if (item.videoId) {
    return `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  }
  return '';
}

export default function BsnTvPlayer({ items }: Props) {
  const [selectedId, setSelectedId] = useState(items[0]?.videoId ?? '');
  const [autoplay, setAutoplay] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }
    setSelectedId((prev) =>
      prev && items.some((i) => i.videoId === prev) ? prev : (items[0]?.videoId ?? ''),
    );
  }, [items]);

  const selected = items.find((i) => i.videoId === selectedId) ?? items[0];
  const thumbnails = items.filter((i) => i.videoId !== selectedId);

  const handleSelect = (videoId: string) => {
    setSelectedId(videoId);
    setAutoplay(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const embedParams = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
    ...(autoplay ? { autoplay: '1' } : {}),
  });
  const embedSrc = selected?.videoId
    ? `https://www.youtube.com/embed/${selected.videoId}?${embedParams}`
    : '';

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <div className="lg:flex-1" ref={playerRef}>
        <div>
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border border-gray-500/40 lg:mb-6">
            <iframe
              key={selected?.videoId}
              src={embedSrc}
              title={selected?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
          <div>
            <h2 className="mb-2.5 font-barlow text-base font-semibold text-white lg:text-2xl lg:leading-7">
              {selected?.title || ''}
            </h2>
            <p className="font-barlow text-[13px] font-medium text-white/50">
              {formatDate(selected?.publishedAt, BSN_TV_DATE_FORMAT)}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="divide-y divide-white/20">
          {thumbnails.map((item) => (
            <div
              key={`highlight-${item.videoId}`}
              className="flex cursor-pointer flex-row gap-3.5 py-4 first:pt-0 last:pb-0"
              onClick={() => handleSelect(item.videoId)}
            >
              <figure className="relative aspect-video w-[45%] shrink-0 overflow-hidden rounded-md border border-gray-500/40">
                <img
                  src={thumbnailUrl(item)}
                  alt={item?.title || ''}
                  className="size-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />
                <img
                  src="/assets/images/icons/icon-play-youtube2.png"
                  alt=""
                  className="absolute bottom-2 right-2"
                />
              </figure>
              <div className="flex flex-col justify-center">
                <h3 className="mb-1.5 font-barlow text-[13px] font-medium leading-snug text-white/80">
                  {truncateText(item?.title || '', 70)}
                </h3>
                <p className="font-barlow text-xs font-medium text-white/50">
                  {formatDate(item?.publishedAt, BSN_TV_DATE_FORMAT)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
