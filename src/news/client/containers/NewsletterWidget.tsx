'use client';
import { useState, useEffect } from 'react';
import NewsItem from "../components/NewsItem";
import { useNewsletter } from "../hooks/news";

const TEAM_OPTIONS = [
  { label: 'Todas las noticias', slug: '' },
  { label: 'Atléticos de San Germán', slug: 'atleticos-de-san-german' },
  { label: 'Cangrejeros de Santurce', slug: 'cangrejeros-de-santurce' },
  { label: 'Capitanes de Arecibo', slug: 'capitanes-de-arecibo' },
  { label: 'Criollos de Caguas', slug: 'criollos-de-caguas' },
  { label: 'Gigantes de La C', slug: 'gigantes-de-carolina' },
  { label: 'Indios de Mayagüez', slug: 'indios-de-mayaguez' },
  { label: 'Leones de Ponce', slug: 'leones-de-ponce' },
  { label: 'Mets de Guaynabo', slug: 'mets-de-guaynabo' },
  { label: 'Osos de Manatí', slug: 'osos-de-manati' },
  { label: 'Piratas de Quebradillas', slug: 'piratas-de-quebradillas' },
  { label: 'Santeros de Aguada', slug: 'santeros-de-aguada' },
  { label: 'Vaqueros de Bayamón', slug: 'vaqueros-de-bayamon' },
];

// Tag slugs must match WordPress exactly (no accents, no special chars).

type Props = {
  featuredNewsSlug?: string;
};

const FILTERED_PAGE_SIZE = 10;
const FILTERED_LOAD_LIMIT = 54;

export default function NewsletterWidget({ featuredNewsSlug }: Props) {
  const { data, loading, hasMore, loadMore } = useNewsletter();
  const [teamFilter, setTeamFilter] = useState('');

  const handleTeamFilter = (slug: string) => {
    setTeamFilter(slug);
    setFilteredVisible(FILTERED_PAGE_SIZE);
  };
  const [filteredVisible, setFilteredVisible] = useState(FILTERED_PAGE_SIZE);

  // When a team filter is active, pre-load up to FILTERED_LOAD_LIMIT items
  // so the client-side filter has enough data to work with.
  useEffect(() => {
    if (teamFilter && hasMore && !loading && data.length < FILTERED_LOAD_LIMIT) {
      loadMore();
    }
  }, [teamFilter, hasMore, loading, data.length]);

  const filteredData = teamFilter
    ? data.filter((newsItem) =>
        newsItem.tags?.some((tag) => tag.slug === teamFilter),
      )
    : data;

  // Avoid showing the featured (hero) news item again in the list.
  const allDisplayed = filteredData.filter(
    (newsItem) => newsItem.slug !== featuredNewsSlug,
  );

  const displayedData = teamFilter ? allDisplayed.slice(0, filteredVisible) : allDisplayed;
  const hasMoreFiltered = teamFilter && filteredVisible < allDisplayed.length;

  return (
    <div>
      <div className="mb-5 md:mb-[38px] lg:mb-[58px]">
        <div className="flex flex-col gap-[12px] items-start justify-between md:flex-row md:items-center">
          <h3 className="text-[22px] text-[#0F171F] md:text-[32px]">
            Más noticias
          </h3>
          {/* Mobile: full-width dropdown, no label */}
          <div className="w-full md:hidden">
            <div className="relative">
              <select
                value={teamFilter}
                onChange={(e) => handleTeamFilter(e.target.value)}
                className="w-full h-[41px] pl-3 pr-8 bg-[#fafafa] border border-[#d4d4d4] rounded-[6px] font-barlow font-medium text-[14px] text-[rgba(15,23,31,0.9)] appearance-none outline-none cursor-pointer tracking-[-0.14px]"
              >
                {TEAM_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          {/* Desktop: label + dropdown */}
          <div className="hidden md:flex flex-row items-center gap-[10px]">
            <p className="font-barlow font-semibold text-[13px] tracking-[-0.13px] text-[rgba(15,23,31,0.5)] whitespace-nowrap">
              Filtrar por equipo
            </p>
            <div className="relative">
              <select
                value={teamFilter}
                onChange={(e) => handleTeamFilter(e.target.value)}
                className="h-[41px] pl-3 pr-8 bg-[#fafafa] border border-[#d4d4d4] rounded-[6px] font-barlow font-medium text-[14px] text-[rgba(15,23,31,0.9)] appearance-none outline-none cursor-pointer tracking-[-0.14px]"
              >
                {TEAM_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="rgba(15,23,31,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal rule — desktop only */}
        <hr className="hidden md:block mt-[13px] border-0 border-t border-[rgba(222,222,222,1)]" />
        <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)] mt-[15px] md:text-[14px] md:mt-[10px]">
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
        {(hasMore && !teamFilter) || hasMoreFiltered ? (
          <div className="mt-[40px] flex justify-center">
            <button
              onClick={teamFilter ? () => setFilteredVisible((v) => v + FILTERED_PAGE_SIZE) : loadMore}
              disabled={loading}
              className="cursor-pointer font-barlow font-semibold text-[15px] text-[#0F171F] border border-[#D9D3D3] px-[32px] py-[12px] rounded-[12px] shadow-[0px_1px_2px_0px_#14181F0D] mx-auto md:w-5/12"
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
