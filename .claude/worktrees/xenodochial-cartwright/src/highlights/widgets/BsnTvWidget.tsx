import { TopPerformancesType } from '../types';
import BsnTvPlayer from '@/highlights/client/components/BsnTvPlayer';

/** BSN TV playlist (RSS + YouTube Data API v3). */
const BSN_TV_PLAYLIST_ID = 'PLe58A2MSZ7Qfq0jbRsHZeGmGrv4YLDcI7' as const;
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${BSN_TV_PLAYLIST_ID}`;
const YOUTUBE_FETCH_TIMEOUT_MS = 12_000;

type PlaylistItemsApiResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
  }>;
};

/** YouTube Data API v3 — server-only. Set `YOUTUBE_DATA_API_KEY` or `GOOGLE_API_KEY` (same GCP key works). */
async function fetchBsnTvVideosFromApi(): Promise<TopPerformancesType[]> {
  const apiKey =
    process.env.YOUTUBE_DATA_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    '';
  if (!apiKey) {
    return [];
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('playlistId', BSN_TV_PLAYLIST_ID);
  url.searchParams.set('maxResults', '5');
  url.searchParams.set('key', apiKey);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(YOUTUBE_FETCH_TIMEOUT_MS),
    });
  } catch (e) {
    console.warn('YouTube Data API playlistItems request failed:', e);
    return [];
  }
  if (!res.ok) {
    const body = await res.text();
    console.warn('YouTube Data API playlistItems failed:', res.status, body);
    return [];
  }

  const data = (await res.json()) as PlaylistItemsApiResponse & {
    error?: { message?: string; code?: number };
  };
  if (data.error) {
    console.warn('YouTube Data API error:', data.error.message ?? data.error);
    return [];
  }
  const out: TopPerformancesType[] = [];
  const seenIds = new Set<string>();

  for (const item of data.items ?? []) {
    const videoId =
      item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? '';
    if (!videoId || seenIds.has(videoId)) continue;
    seenIds.add(videoId);

    const title = item.snippet?.title ?? '';
    const publishedAt =
      item.contentDetails?.videoPublishedAt ??
      item.snippet?.publishedAt ??
      '';
    const thumb =
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.medium?.url ??
      item.snippet?.thumbnails?.default?.url ??
      `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    out.push({
      videoId,
      title,
      coverUrl: thumb,
      playListId: BSN_TV_PLAYLIST_ID,
      publishedAt,
    });
  }

  return out.slice(0, 5);
}

function parseYoutubeRss(xml: string): TopPerformancesType[] {
  const entries: TopPerformancesType[] = [];
  const seenIds = new Set<string>();
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
  for (const match of entryMatches) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<media:title>([\s\S]*?)<\/media:title>/)?.[1];
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
    if (!videoId || !title || seenIds.has(videoId)) continue;
    seenIds.add(videoId);
    entries.push({
      videoId,
      title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      coverUrl: `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      playListId: BSN_TV_PLAYLIST_ID,
      publishedAt,
    });
  }
  return entries.slice(0, 5);
}

const fetchLatestVideos = async (): Promise<TopPerformancesType[]> => {
  const fromApi = await fetchBsnTvVideosFromApi();
  if (fromApi.length > 0) {
    return fromApi;
  }

  try {
    const res = await fetch(YOUTUBE_RSS_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(YOUTUBE_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`RSS ${res.status}`);
    const xml = await res.text();
    return parseYoutubeRss(xml);
  } catch (err) {
    console.warn('YouTube RSS fallback unavailable:', err);
    return [];
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
              href={`https://www.youtube.com/watch?v=fvcPG7aKc9A&list=${BSN_TV_PLAYLIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FCFCFC] inline-block shadow-[0px_1px_2px_0px_#14181F0D] py-[12px] px-[20px] rounded-[12px] min-w-[212px] text-center"
            >
              <span className="text-base text-black">Ver canal en YouTube</span>
            </a>
          </div>
        </div>
        <BsnTvPlayer items={items} />
      </div>
    </div>
  );
}
