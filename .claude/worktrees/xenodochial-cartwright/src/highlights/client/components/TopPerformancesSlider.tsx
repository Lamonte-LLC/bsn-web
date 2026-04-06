'use client';

import YouTube from 'react-youtube';
import { TopPerformancesType } from '@/highlights/types';
import DefaultSlider from '@/shared/client/components/slider/DefaultSlider';

type Props = {
  items: TopPerformancesType[];
};

export default function TopPerformancesSlider({ items }: Props) {
  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  return (
    <DefaultSlider
      data={items}
      render={(item) => (
        <div className="flex flex-col gap-4 items-start justify-start px-2">
          <div className="relative w-full pt-[75%] overflow-hidden rounded-lg">
            <YouTube videoId={item.videoId} opts={youtubeOpts} className="absolute top-0 left-0 w-full h-full" />
          </div>
          <p className="font-barlow text-base">{item.title}</p>
        </div>
      )}
    />
  );
}
