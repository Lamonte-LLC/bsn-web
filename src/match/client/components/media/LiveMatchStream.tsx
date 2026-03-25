'use client';

import { MatchLiveStreamVideo } from './MatchLiveStreamVideo';

type Props = {
  /** GraphQL `streamUrl` — HLS (.m3u8) or embed page (e.g. Castr `player.castr.com/...`). */
  streamUrl?: string | null;
};

function isLikelyHlsUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return u.includes('.m3u8') || u.includes('application/x-mpegurl');
}

/**
 * Renders the live stream from the API: HLS via hls.js, or iframe for player pages (Castr, etc.).
 */
export function LiveMatchStream({ streamUrl }: Props) {
  const src = streamUrl?.trim() ?? '';

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-[8px] overflow-hidden flex items-center justify-center text-center px-4 text-[rgba(255,255,255,0.5)] text-sm md:text-base">
        Transmisión no disponible.
      </div>
    );
  }

  if (isLikelyHlsUrl(src)) {
    return <MatchLiveStreamVideo src={src} />;
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-[8px] overflow-hidden">
      <iframe
        title="Transmisión en vivo"
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
