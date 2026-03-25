'use client';

import { MatchType } from "@/match/types";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import MatchTeamBoxScoreWidget from "./MatchTeamBoxScoreWidget";

type Props = {
  match: MatchType;
  /** Refresh player box score periodically (e.g. live games). */
  usePolling?: boolean;
};

export default function MatchBoxScoreWidget({ match, usePolling = false }: Props) {
  return (
    <div className="py-[20px] md:py-[30px] lg:py-[50px]">
      <div className="hidden px-[10px] flex-row justify-between items-center md:flex">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            Box Score
          </h3>
        </div>
      </div>
      <TabGroup defaultIndex={0} className="md:-mt-[38px]">
        <TabList className="text-center space-x-[8px] mb-[36px]">
          <Tab className="border border-[#D5D5D5] cursor-pointer text-[15px] data-[selected]:border-[#0F171F] px-[8px] py-[6px] rounded-[100px] min-w-[150px] data-[selected]:bg-[#0F171F] data-[selected]:text-white">
            {match.visitorTeam.nickname}
          </Tab>
          <Tab className="border border-[#D5D5D5] cursor-pointer text-[15px] data-[selected]:border-[#0F171F] px-[8px] py-[6px] rounded-[100px] min-w-[150px] data-[selected]:bg-[#0F171F] data-[selected]:text-white">
            {match.homeTeam.nickname}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MatchTeamBoxScoreWidget
              matchProviderId={match.providerId}
              teamProviderId={match.visitorTeam.providerId}
              usePolling={usePolling}
            />
          </TabPanel>
          <TabPanel>
            <MatchTeamBoxScoreWidget
              matchProviderId={match.providerId}
              teamProviderId={match.homeTeam.providerId}
              usePolling={usePolling}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
