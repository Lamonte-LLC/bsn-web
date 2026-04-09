'use client';

/**
 * DEV/TESTING ONLY — renders the Sportradar fixture widget inline.
 *
 * On production this widget is injected by GTM (no code change needed there).
 * Before merging to main:
 *   1. Remove <SporTradarFixtureWidget> from CompletedMatchPage and LiveMatchPage.
 *   2. Delete this file.
 *   GTM will continue injecting the widget on production automatically.
 */

import { useEffect, useRef } from 'react';

type Props = {
  fixtureId: string;
};

const WIDGET_SRC = 'https://widget.eui.connect.sportradar.com/widget.js';
const WEBSITE_ID = '312';
const CONTAINER_ID = 'synergy-widget-fixture_detail';

export default function SporTradarFixtureWidget({ fixtureId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = document.getElementById(CONTAINER_ID);
    if (!existing || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.setAttribute('data-type', 'fixtures');
    script.setAttribute('data-website-id', WEBSITE_ID);
    script.setAttribute('data-is-standalone', 'false');
    script.setAttribute('data-use-native-styles', 'false');
    script.setAttribute('data-fixture-id', fixtureId);
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [fixtureId]);

  return (
    <div className="widget">
      <div id={CONTAINER_ID} ref={containerRef} />
    </div>
  );
}
