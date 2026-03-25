'use client';

import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
};

type Status = 'loading' | 'ready' | 'error';

export function MatchLiveStreamVideo({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [committedSrc, setCommittedSrc] = useState(src);
  const [status, setStatus] = useState<Status>('loading');

  if (committedSrc !== src) {
    setCommittedSrc(src);
    setStatus('loading');
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('ready'));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStatus('error');
      });
      return () => hls.destroy();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      const onCanPlay = () => setStatus('ready');
      const onError = () => setStatus('error');
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
      };
    }

    queueMicrotask(() => setStatus('error'));
  }, [src]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-[8px] overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <span className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <figure className="mb-4">
            <img src="/assets/images/stream-error.png" alt="" />
          </figure>
          <span className="text-[rgba(255,255,255,0.5)] text-base md:text-lg">
            Transmisión no disponible por el momento.
          </span>
        </div>
      )}
    </div>
  );
}
