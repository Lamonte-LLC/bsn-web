'use client';

import { useEffect, useRef } from 'react';
import FullWidthLayout from '@/shared/components/layout/fullwidth/FullWidthLayout';

type Props = {
  matchProviderId: string;
};

export default function SportsRadarMatchPage({ matchProviderId }: Props) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://widget.eui.connect.sportradar.com/widget.js';
    script.dataset.type = 'fixtures';
    script.dataset.websiteId = '312';
    script.dataset.isStandalone = 'false';
    script.dataset.useNativeStyles = 'true';
    script.dataset.fixtureId = matchProviderId;

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [matchProviderId]);

  return (
    <FullWidthLayout>
      <div className="container mx-auto">
        <div ref={widgetRef} className="widget" />
      </div>
    </FullWidthLayout>
  );
}
