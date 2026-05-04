'use client';

import { useEffect, useRef } from 'react';
import { LiveMatchStream } from '../media/LiveMatchStream';
import { useSportRadarPlayerLinks } from '@/stats/client/widgets/useSportRadarPlayerLinks';

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
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [matchProviderId, matchStreamUrl]);

  useSportRadarPlayerLinks(widgetRef, { openInNewTab: true });

  return (
    <>
      {matchStreamUrl && (
        <div className="bg-[#0F171F]">
          <div className="container">
            <div className="py-[26px] mx-auto md:py-[40px] md:w-[688px]">
              <LiveMatchStream streamUrl={matchStreamUrl} />
            </div>
          </div>
        </div>
      )}
      <div ref={widgetRef} className="widget" />
    </>
  );
}
