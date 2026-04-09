'use client';

import { useEffect, useRef } from 'react';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';

type Props = {
  matchProviderId: string;
  matchStreamUrl?: string;
};

export default function SportsRadarMatchPage({ matchProviderId, matchStreamUrl }: Props) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://widget.eui.connect.sportradar.com/widget.js';
    script.dataset.type = 'fixtures';
    script.dataset.websiteId = '312';
    script.dataset.isStandalone = 'false';
    script.dataset.useNativeStyles = 'false';
    script.dataset.fixtureId = matchProviderId;

    let observer: MutationObserver | null = null;

    script.onload = () => {
      if (!matchStreamUrl) return;

      const inject = () => {
        const banner = container.querySelector('.sw-fixture-banner');
        if (!banner || banner.querySelector('.bsn-stream-container')) return;

        const divContainer = document.createElement('div');
        divContainer.className = 'bsn-stream-container container pb-[26px] mx-auto md:pb-[40px] md:w-[688px]';
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'relative w-full aspect-video bg-black rounded-[8px] overflow-hidden';
        const video = document.createElement('video');
        video.src = matchStreamUrl;
        video.className = 'w-full h-full';
        video.controls = true;
        video.playsInline = true;
        videoWrapper.appendChild(video);
        divContainer.appendChild(videoWrapper);
        banner.appendChild(divContainer);
      };

      setTimeout(() => {
        inject();
        observer = new MutationObserver(inject);
        observer.observe(container, { childList: true, subtree: true });
      }, 2000);
    };

    container.appendChild(script);

    return () => {
      observer?.disconnect();
      container.innerHTML = '';
    };
  }, [matchProviderId, matchStreamUrl]);

  return (
    <FullWidthLayout>
      <div ref={widgetRef} className="widget" />
    </FullWidthLayout>
  );
}
