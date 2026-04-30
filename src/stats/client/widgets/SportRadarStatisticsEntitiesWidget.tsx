'use client';

import { useEffect, useRef } from 'react';
import { useSportRadarPlayerLinks } from './useSportRadarPlayerLinks';

export default function SportRadarStatisticsEntitiesWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://widget.eui.connect.sportradar.com/widget.js';
    script.dataset.type = 'statistics_entities';
    script.dataset.websiteId = '312';
    script.dataset.useNativeStyles = 'false';
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  useSportRadarPlayerLinks(widgetRef);

  return <div className="widget widget-entities" ref={widgetRef} />;
}
