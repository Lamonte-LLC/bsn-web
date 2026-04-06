'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  title?: string;
  youtubeVideoId: string;
};

export default function MatchYoutubeVideoCard({
  title,
  youtubeVideoId,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handlePlay = useCallback(async () => {
    setPlaying(true);
    try {
      await overlayRef.current?.requestFullscreen();
    } catch {
      // Fullscreen not supported or denied — overlay still covers the screen
    }
  }, []);

  const handleClose = useCallback(() => {
    setPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && playing) {
        setPlaying(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [playing]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (playing) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [playing, handleClose]);

  return (
    <div className="border border-[#EAEAEA] flex-1 rounded-[12px] bg-white shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="px-[20px] pt-[20px] flex flex-row justify-between items-center lg:px-[30px] lg:pt-[24px]">
        <h3 className="text-[22px] text-black md:text-[24px]">
          {title ?? 'Resumen'}
        </h3>
      </div>
      <div className="p-[20px] lg:pt-[20px] lg:p-[30px]">
        <div className="rounded-[8px] overflow-hidden">
          <button
            type="button"
            aria-label="Reproducir video"
            className="relative w-full aspect-video block group cursor-pointer"
            onClick={handlePlay}
          >
            {/* Thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
              alt="Miniatura del video"
              className="w-full h-full object-cover"
            />
            {/* Play button overlay */}
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <figure className="shadow-lg group-hover:scale-110 transition-transform">
                <img
                  src="/assets/images/icons/icon-play-youtube.png"
                  width="48"
                />
              </figure>
            </span>
          </button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {playing && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <button
            type="button"
            aria-label="Cerrar video"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
            allow="autoplay; fullscreen; accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video max-h-screen"
            title="Resumen del partido"
          />
        </div>
      )}
    </div>
  );
}
