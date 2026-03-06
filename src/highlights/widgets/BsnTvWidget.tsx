import { TopPerformancesType } from '../types';
import { getClient } from '@/apollo-client';
import { TOP_PERFORMANCES } from '@/graphql/highlights';
import BsnTvPlayer from '@/highlights/client/components/BsnTvPlayer';

type TopPerformancesResponse = {
  topPerformances: {
    items: TopPerformancesType[];
  };
};

const CHANNEL_ID = 'UCZOFf3DbBqAMSwmzYl8RPnA';
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function parseYoutubeRss(xml: string): TopPerformancesType[] {
  const entries: TopPerformancesType[] = [];
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
  for (const match of entryMatches) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<media:title>([\s\S]*?)<\/media:title>/)?.[1];
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
    if (!videoId || !title) continue;
    entries.push({
      videoId,
      title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      coverUrl: `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      playListId: '',
      publishedAt,
    });
  }
  return entries.slice(0, 5);
}

const fetchFromGraphQL = async (): Promise<TopPerformancesType[]> => {
  const { data, error } = await getClient().query<TopPerformancesResponse>({
    query: TOP_PERFORMANCES,
  });
  if (error) return [];
  return data?.topPerformances.items ?? [];
};

const fetchLatestVideos = async (): Promise<TopPerformancesType[]> => {
  try {
    const res = await fetch(YOUTUBE_RSS_URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`RSS ${res.status}`);
    const xml = await res.text();
    const items = parseYoutubeRss(xml);
    if (items.length > 0) return items;
    throw new Error('Empty RSS');
  } catch (err) {
    console.warn('YouTube RSS unavailable, falling back to GraphQL:', err);
    return fetchFromGraphQL();
  }
};

export default async function BsnTvWidget() {
  const items = await fetchLatestVideos();
  return (
    <div className="bg-[#0F171F] rounded-[18px]">
      <div className="px-[20px] py-[25px] lg:px-[50px] lg:py-[45px]">
        <div className="flex flex-row justify-between items-center mb-[26px] md:mb-[34px]">
          <div className="flex-1">
            <h3 className="text-[22px] text-white text-center md:text-left md:text-[32px]">
              BSN TV
            </h3>
            <p className="font-barlow font-medium text-[rgba(255,255,255,0.7)] text-center text-sm md:text-left md:text-[15px]">
              Lo más reciente en nuestro canal de YouTube
            </p>
          </div>
          <div className="hidden md:block">
            <a
              href="#"
              className="bg-[#FCFCFC] inline-block shadow-[0px_1px_2px_0px_#14181F0D] py-[12px] px-[20px] rounded-[12px] min-w-[212px] text-center"
            >
              <span className="text-base text-black">Ver canal en Youtube</span>
            </a>
          </div>
        </div>
        <BsnTvPlayer items={items} />
      </div>
    </div>
  );
}
