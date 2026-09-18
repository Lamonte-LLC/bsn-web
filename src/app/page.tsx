import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import SeasonLeadersSection from '@/stats/widgets/season/SeasonLeadersSection';
import LatestNewsSidebar from '@/news/widgets/LatestNewsSidebar';
import RecentCalendarSliderWidget from '@/match/client/containers/RecentCalendarSliderWidget';
import SeasonStandingsTableBasicGroupsWidget from '@/stats/widgets/standings/table/SeasonStandingsTableBasicGroupsWidget';
import TopNewsHero from '@/news/widgets/TopNewsHero';
import { loadLatestNewsForHome } from '@/news/server/loadLatestNews';
import WSCBlazeSDK from '@/shared/client/components/wsc/WSCBlazeSDK';
import WSCHomeStories from '@/highlights/client/components/WSCHomeStories';
import WSCMoments from '@/highlights/client/components/WSCMoments';
import AdSlot from '@/shared/client/components/gtm/AdSlot';
import BsnTvWidget from '@/highlights/widgets/BsnTvWidget';
import SponsorsSection from '@/shared/components/sponsors/SponsorsSection';
import { SEASON_IN_PROGRESS } from '@/shared/constants/season';
import HistoriaSection from '@/historia/components/home/HistoriaSection';

export default async function Home() {
  const homeNews = await loadLatestNewsForHome();
  const heroArticle = homeNews[0];
  const sidebarArticles = homeNews.slice(1);

  // Off-season: sin #LaMásDura ni Highlights la columna izquierda queda corta.
  // Se estira a la altura de la fila y el ad horizontal se empuja al fondo con
  // `mt-auto`, para que su borde inferior cuadre con el del card
  // "Lo último en el BSN". En temporada la columna izquierda es la más alta,
  // así que vuelve al flujo normal con su margen de siempre.
  const mainColumnClass = SEASON_IN_PROGRESS
    ? 'lg:col-span-8'
    : 'lg:col-span-8 lg:flex lg:flex-col';
  const horizontalAdClass = SEASON_IN_PROGRESS
    ? 'mb-8 lg:mb-10'
    : 'mb-8 lg:mb-0 lg:mt-auto';
  const asideColumnClass = SEASON_IN_PROGRESS
    ? 'lg:col-span-4'
    : 'lg:col-span-4 lg:flex lg:flex-col';
  const newsSidebarClass = SEASON_IN_PROGRESS
    ? 'hidden mb-15 md:mb-5 lg:block'
    : 'hidden mb-15 md:mb-5 lg:mb-0 lg:flex lg:flex-1';

  return (
    <FullWidthLayout
      subheader={
        <section className="pb-[109px] lg:pb-[69px]">
          {SEASON_IN_PROGRESS && (
            <div className="container lg:pt-[8px]">
              <RecentCalendarSliderWidget />
              <a
                href="/playoffs"
                rel="noopener noreferrer"
                className="block mt-[12px] lg:mt-[22px]"
              >
                <img
                  src="/assets/ads/home-top-playoffs-mobile.png"
                  alt=""
                  width={1242}
                  height={212}
                  className="block md:hidden w-full h-auto max-w-full object-contain rounded-[12px] border border-[rgba(125,125,125,0.4)]"
                />
                <img
                  src="/assets/ads/home-top-playoffs-desktop.png"
                  alt=""
                  width={1920}
                  height={155}
                  className="hidden md:block w-full h-auto rounded-[12px] border border-[rgba(125,125,125,0.4)]"
                />
              </a>
            </div>
          )}
        </section>
      }
    >
      {SEASON_IN_PROGRESS && (
        <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      )}
      <section className="container mb-4 -mt-[95px] lg:mb-7 lg:-mt-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className={mainColumnClass}>
            <div className="mb-[6px] md:mb-8 lg:mb-[30px]">
              <TopNewsHero article={heroArticle} />
            </div>
            <div className={horizontalAdClass}>
              <div className="hidden xl:flex bg-[#F4F4F4] justify-center items-center px-4 py-[22px] rounded-[12px]">
                <AdSlot
                  adUnit="/23296921845/728-90"
                  size={[728, 90]}
                  elementId="home-gpt-ad-728-90-1"
                />
              </div>
              <div className="bg-[#F8F8F8] flex justify-center py-[15px] -mx-[1rem] md:mx-0 md:py-0 md:bg-transparent xl:hidden">
                <AdSlot
                  adUnit="/23296921845/320-50"
                  size={[320, 50]}
                  elementId="home-gpt-ad-320-50-1"
                />
              </div>
            </div>
            <div className="mb-[50px] lg:hidden lg:mb-15">
              <LatestNewsSidebar articles={sidebarArticles} />
            </div>
            {SEASON_IN_PROGRESS && (
              <>
                <div className="mb-[26px] md:mb-8 lg:mb-17">
                  <div className="flex flex-row justify-between items-center mb-4 md:mb-[26px]">
                    <div>
                      <h3 className="text-[22px] text-[#0F171F] md:text-[24px]">
                        #LaMásDura
                      </h3>
                    </div>
                  </div>
                  <div>
                    <WSCHomeStories />
                  </div>
                </div>
                <div className="mb-4 md:mb-8 lg:mb-17">
                  <div className="flex flex-row justify-between items-center mb-4 md:mb-[26px]">
                    <div>
                      <h3 className="text-[22px] text-[#0F171F] md:text-[24px]">
                        Highlights
                      </h3>
                    </div>
                  </div>
                  <div>
                    <WSCMoments />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={asideColumnClass}>
            <div className={newsSidebarClass}>
              <LatestNewsSidebar articles={sidebarArticles} />
            </div>
            {SEASON_IN_PROGRESS && (
              <div className="mt-[5px] mb-[48px] md:mt-0 md:mb-10">
                <SeasonStandingsTableBasicGroupsWidget />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="container">
        <BsnTvWidget />
        <div className="hidden xl:flex bg-[#F4F4F4] justify-center items-center px-4 py-[22px] rounded-[12px] my-[40px]">
          <AdSlot
            adUnit="/23296921845/728-90-2"
            size={[728, 90]}
            elementId="home-gpt-ad-728-90-2"
          />
        </div>
        <div className="bg-[#F8F8F8] flex justify-center py-[15px] -mx-[1rem] mt-[10px] mb-[20px] md:mx-0 md:py-0 md:bg-transparent md:mt-0 md:mb-0 xl:hidden">
          <AdSlot
            adUnit="/23296921845/320-50-2"
            size={[320, 50]}
            elementId="home-gpt-ad-320-50-2"
          />
        </div>
      </section>
      <HistoriaSection />
      <div className="mb-[100px]">
        <SeasonLeadersSection />
      </div>
      <SponsorsSection />
    </FullWidthLayout>
  );
}
