'use client';

import { useEffect, useRef } from 'react';
import WSCBlazeWidget, {
  IWSCWidgetActions,
  WSCBlazeWidgetProps,
} from '@/shared/client/components/wsc/WSCBlazeWidget';
import { useWscBlazeSDK } from '@/shared/client/components/wsc/hooks/useWscBlazeSDK';
import { useScreenDetector } from '@/shared/client/components/wsc/hooks/useScreenDetector';

type WSCHomeStoriesProps = {
  label?: string;
};

export default function WSCHomeStories({ label = 'home-stories' }: WSCHomeStoriesProps) {
  const widgetRowRectangleRef = useRef<IWSCWidgetActions>(null);
  const { isMobile, isTablet, isDesktop } = useScreenDetector();
  const { isBlazeSDKReady } = useWscBlazeSDK();

  const widgetRowRectangleProps: WSCBlazeWidgetProps = {
    id: 'home-stories-container-row-rectangle',
    labels: label,
    orderType: 'RecentlyUpdatedFirst',
    contentType: 'story',
    theme: 'row-rectangle',
    width: '100%',
  };

  function updateWidgetSizes() {
    widgetRowRectangleRef.current?.setWidgetSize(
      widgetRowRectangleProps.width,
      isMobile ? '175px' : isTablet ? '225px' : '250px',
    );
  }

  useEffect(() => {
    if (isBlazeSDKReady) {
      updateWidgetSizes();
    }
    // eslint-disable-next-line
  }, [isMobile, isTablet, isDesktop, isBlazeSDKReady]);

  if (!isBlazeSDKReady) {
    return null; // Optionally, you can return a loading indicator here
  }

  return (
    <WSCBlazeWidget ref={widgetRowRectangleRef} {...widgetRowRectangleProps} />
  );
}
