'use client';
import Tag from "@/shared/client/components/ui/Tag";
import NewsItem from "../components/NewsItem";
import { useNewsletter } from "../hooks/news";

export default function NewsletterWidget() {
  const { data, loading, hasMore, loadMore } = useNewsletter();
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
              <li>
                <a href="#">
                  <Tag active={true} className="min-w-[75px]">
                    <span className="text-[15px]">Todas</span>
                  </Tag>
                </a>
              </li>
              <li>
                <a href="#">
                  <Tag className="min-w-[75px]">
                    <span className="text-[15px]">Oficial</span>
                  </Tag>
                </a>
              </li>
              <li>
                <a href="#">
                  <Tag className="min-w-[75px]">
                    <span className="text-[15px]">Cambios</span>
                  </Tag>
                </a>
              </li>
              <li>
                <a href="#">
                  <Tag className="min-w-[75px]">
                    <span className="text-[15px]">Fichajes</span>
                  </Tag>
                </a>
              </li>
              <li>
                <a href="#">
                  <Tag className="min-w-[75px]">
                    <span className="text-[15px]">Recaps</span>
                  </Tag>
                </a>
              </li>
              <li>
                <a href="#">
                  <Tag className="min-w-[75px]">
                    <span className="text-[15px]">Playoffs</span>
                  </Tag>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="font-barlow font-medium text-[13px] text-[rgba(15,23,31,0.6)]">
          Mostrando {data.length} noticias
        </p>
      </div>
      <div className="mb-12 md:mb-[80px] lg:mb-[114px]">
        <div className="space-y-[20px] md:space-y-[30px]">
          {data.map((newsItem, index) => (
            <div key={`news-${newsItem.id}`} className={index === 0 ? 'hidden' : ''}>
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
        {hasMore && (
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
