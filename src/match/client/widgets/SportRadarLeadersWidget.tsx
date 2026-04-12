'use client';

import { useEffect, useRef } from 'react';

export default function SportRadarLeadersWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://widget.eui.connect.sportradar.com/widget.js';
    script.dataset.type = 'statistics_leaders';
    script.dataset.websiteId = '312';
    script.dataset.useNativeStyles = 'false';
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div ref={widgetRef} />;
}
