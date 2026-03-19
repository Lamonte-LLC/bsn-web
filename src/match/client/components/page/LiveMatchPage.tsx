'use client';

import { MatchType } from '@/match/types';
import LiveMatchScoreBoardWidget from '../../containers/LiveMatchScoreBoardWidget';
// import LiveMatchBasicBoxScoreBasicWidget from '../../containers/LiveMatchBoxScoreBasicWidget';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import MatchInfoCard from '@/match/components/MatchInfoCard';
import { DEFAULT_MEDIA_PROVIDER } from '@/constants';
import AdSlot from '@/shared/client/components/gtm/AdSlot';
import WSCBlazeSDK from '@/shared/client/components/wsc/WSCBlazeSDK';
import { MatchLiveStreamVideo } from '../media/MatchLiveStreamVideo';
import WSCBsnWidget from '@/highlights/client/components/WSCBsnWidget';

type Props = {
  match: MatchType;
};

export default function LiveMatchPage({ match }: Props) {
  return (
    <FullWidthLayout
      divider
      subheader={
        <section className="pb-[170px] md:pb-[310px]">
          <div className="container">
            <div className="mx-auto py-[32px] md:py-[42px] xl:py-[52px] lg:w-9/12 xl:w-8/12">
              <LiveMatchScoreBoardWidget matchProviderId={match.providerId} />
            </div>
          </div>
        </section>
      }
    >
      <WSCBlazeSDK apiKey={process.env.NEXT_PUBLIC_WSC_API_KEY || ''} />
      <div className="-mt-[170px] md:-mt-[316px]">
        <div className="container">
          <div className="mb-[26px] mx-auto md:mb-[40px] md:w-[688px]">
            <MatchLiveStreamVideo src={match.streamUrl ?? ''} />
          </div>
        </div>
      </div>
      <TabGroup>
        <TabList>
          <div className="container text-center space-x-[30px]">
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(0,0,0,0.5)] text-base md:text-[22px] data-selected:text-black data-selected:border-b-2 data-selected:border-b-black">
              En vivo
            </Tab>
            <Tab className="cursor-pointer outline-none py-[8px] text-[rgba(0,0,0,0.5)] text-base md:text-[22px] data-selected:text-black data-selected:border-b-2 data-selected:border-b-black">
              Box Score
            </Tab>
          </div>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 md:mt-[30px] lg:mt-[40px]">
                <div className="lg:col-span-8 lg:pr-16">
                  <div className="mb-6 md:mb-10 lg:mb-15">
                    <div className="flex flex-row justify-between items-center mb-[30px]">
                      <div>
                        <h3 className="text-[22px] text-black md:text-[24px]">
                          Highlights
                        </h3>
                      </div>
                    </div>
                    <div>
                      <WSCBsnWidget
                        id={`match-highlights-widget-${match.providerId}`}
                        labels={[`g-${match.providerId}`]}
                        orderType="RecentlyUpdatedFirst"
                        contentType="moment"
                      />
                    </div>
                  </div>
                  {/* <div className="mb-6 md:mb-10 lg:mb-15">
                    <LiveMatchBasicBoxScoreBasicWidget />
                  </div> */}
                </div>
                <div className="lg:col-span-4">
                  <div className="flex flex-col">
                    <div className="mb-[30px] order-last md:order-none md:mb-[40px]">
                      <MatchInfoCard
                        startAt={match.startAt}
                        venue={{ name: match.venue?.name ?? '' }}
                        channel={match.channel ?? DEFAULT_MEDIA_PROVIDER}
                        ticketUrl={match.homeTeam.ticketUrl}
                      />
                    </div>
                    <div className="mb-[30px] md:mb-[40px]">
                      <div className="hidden justify-center xl:flex">
                        <AdSlot
                          adUnit="/23296921845/300-250"
                          size={[300, 250]}
                          elementId={`match-gpt-ad-300-250-${match.providerId}`}
                        />
                      </div>
                      <div className="bg-[#F8F8F8] flex justify-center py-[15px] -mx-[1rem] md:mx-0 md:py-0 md:bg-transparent xl:hidden">
                        <AdSlot
                          adUnit="/23296921845/320-50"
                          size={[320, 50]}
                          elementId={`match-gpt-ad-320-50-${match.providerId}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </TabGroup>
    </FullWidthLayout>
  );
}
