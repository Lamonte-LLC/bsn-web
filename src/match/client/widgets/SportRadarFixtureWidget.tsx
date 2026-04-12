'use client';

import { useEffect, useRef } from 'react';

type Props = { fixtureId: string };

export default function SportRadarFixtureWidget({ fixtureId }: Props) {
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
    script.dataset.fixtureId = fixtureId;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [fixtureId]);

  return <div ref={widgetRef} className="sport-radar-fixture-mobile-widget" />;
}
