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

export default async function Home() {
  const homeNews = await loadLatestNewsForHome();
  const heroArticle = homeNews[0];
  const sidebarArticles = homeNews.slice(1);

  return (
    <FullWidthLayout
      subheader={
        <section className="pb-[116px] lg:pt-[8px] lg:pb-[88px]">
          <div className="container relative">
            <RecentCalendarSliderWidget />
            <div className="absolute bg-[linear-gradient(-90deg,rgba(15,23,31,0.9)_21.8%,rgba(0,0,0,0)_96.31%)] top-0 bottom-0 right-0 w-[48px] md:w-[232px]"></div>
          </div>
        </section>
      }
    >
      <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      <section className="container mb-4 -mt-[95px] lg:mb-7 lg:-mt-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="mb-4 md:mb-8 lg:mb-10">
              <TopNewsHero article={heroArticle} />
            </div>
            <div className="mb-8 lg:mb-10">
              <div className="hidden justify-center xl:flex">
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
            <div className="mb-15 lg:hidden">
              <LatestNewsSidebar articles={sidebarArticles} />
            </div>
            <div className="mb-4 md:mb-8 lg:mb-17">
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
          </div>
          <div className="lg:col-span-4">
            <div className="hidden mb-15 md:mb-5 lg:block">
              <LatestNewsSidebar articles={sidebarArticles} />
            </div>
            <div className="mb-15 md:mb-10">
              <SeasonStandingsTableBasicGroupsWidget />
            </div>
            <div className="mb-10">
              <div className="flex justify-center">
                <AdSlot
                  adUnit="/23296921845/300-250"
                  size={[300, 250]}
                  elementId="home-gpt-ad-300-250-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <SeasonLeadersSection />
      <section className="container mb-[100px]">
        <div className="hidden justify-center py-[70px] xl:flex">
          <AdSlot
            adUnit="/23296921845/728-90-2"
            size={[728, 90]}
            elementId="home-gpt-ad-728-90-2"
          />
        </div>
        <div className="flex justify-center py-[40px] xl:hidden">
          <AdSlot
            adUnit="/23296921845/320-50-2"
            size={[320, 50]}
            elementId="home-gpt-ad-320-50-2"
          />
        </div>
        <BsnTvWidget />
      </section>
      <SponsorsSection />
    </FullWidthLayout>
  );
}
