'use client';
import { useState } from 'react';
import Tag from "@/shared/client/components/ui/Tag";
import NewsItem from "../components/NewsItem";
import { useNewsletter } from "../hooks/news";

const FILTER_PILLS = [
  { label: 'Todas', slug: null },
  { label: 'Oficial', slug: 'oficial' },
  { label: 'Cambios', slug: 'cambios' },
  { label: 'Fichajes', slug: 'fichajes' },
  { label: 'Recaps', slug: 'recaps' },
  { label: 'Playoffs', slug: 'playoffs' },
];

type Props = {
  featuredNewsSlug?: string;
};

export default function NewsletterWidget({ featuredNewsSlug }: Props) {
  const { data, loading, hasMore, loadMore } = useNewsletter();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredData = activeTag
    ? data.filter((newsItem) =>
        newsItem.tags?.some(
          (tag) =>
            tag.slug === activeTag ||
            tag.name.toLowerCase() === activeTag.toLowerCase(),
        ),
      )
    : data;

  // Avoid showing the featured (hero) news item again in the list.
  const displayedData = filteredData.filter(
    (newsItem) => newsItem.slug !== featuredNewsSlug,
  );

  return (
    <div>
      <div className="mb-5 md:mb-[38px] lg:mb-[58px]">
        <div className="flex flex-col gap-[12px] items-start justify-between mb-[24px] md:flex-row md:items-center md:mb-[14px]">
          <div>
            <h3 className="text-[22px] text-[#0F171F] md:text-[24px]">
              Más noticias
            </h3>
          </div>
          <div
            className="overflow-x-scroll w-full md:w-auto"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <ul className="flex flex-row gap-[6px] md:gap-[8px]">
              {FILTER_PILLS.map((pill) => (
                <li key={pill.label}>
                  <button onClick={() => setActiveTag(pill.slug)}>
                    <Tag
                      active={activeTag === pill.slug}
                      className="min-w-[75px]"
                    >
                      <span className="text-[15px]">{pill.label}</span>
                    </Tag>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)]">
          Mostrando {displayedData.length} noticias
        </p>
      </div>
      <div className="mb-12 md:mb-[80px] lg:mb-[114px]">
        <div className="space-y-[20px] md:space-y-[30px]">
          {displayedData.map((newsItem) => (
            <div key={`news-${newsItem.id}`}>
              <NewsItem
                title={newsItem.title}
                slug={newsItem.slug}
                thumbnailUrl={newsItem.imageUrl}
                excerpt={newsItem.excerpt}
                publishedAt={newsItem.publishedAt}
                tags={newsItem.tags ?? []}
              />
            </div>
          ))}
        </div>
        {hasMore && !activeTag && (
          <div className="mt-[40px] flex justify-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="cursor-pointer font-barlow font-semibold text-[15px] text-[#0F171F] border border-[#D9D3D3] px-[32px] py-[12px] rounded-[12px] shadow-[0px_1px_2px_0px_#14181F0D] mx-auto md:w-5/12"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
