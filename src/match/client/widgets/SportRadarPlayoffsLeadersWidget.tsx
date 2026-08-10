'use client';

import { useEffect, useRef } from 'react';

export default function SportRadarPlayoffsLeadersWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://widget.eui.connect.sportradar.com/widget.js';
    script.dataset.type = 'statistics_leaders';
    script.dataset.websiteId = '312';
    script.dataset.useNativeStyles = 'false';
    script.dataset.seasonId = '56485ec1-73ff-11f1-93ba-2384e3bab733';
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={widgetRef} />;
}
