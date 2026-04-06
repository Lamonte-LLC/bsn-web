'use client';

import { useEffect, useRef } from 'react';
import WSCBlazeWidget, {
  IWSCWidgetActions,
  WSCBlazeWidgetProps,
} from '@/shared/client/components/wsc/WSCBlazeWidget';
import { useWscBlazeSDK } from '@/shared/client/components/wsc/hooks/useWscBlazeSDK';
import { useScreenDetector } from '@/shared/client/components/wsc/hooks/useScreenDetector';

type Props = {
  /** DOM id for the Blaze container (use a unique id per page for Blaze plugin / debugging). */
  id?: string;
  /** Blaze label(s) for the widget; defaults to global moments UI. */
  labels?: string | string[];
  /** `story` for WSC Stories; `moment` for Moments (default elsewhere). */
  contentType?: 'story' | 'moment';
};

export default function WSCMoments({
  id = 'home-moments-container-row-rectangle',
  labels = 'moments-ui',
  contentType = 'moment',
}: Props) {
  const widgetRowRectangleRef = useRef<IWSCWidgetActions>(null);
  const { isMobile, isTablet, isDesktop } = useScreenDetector();
  const { isBlazeSDKReady } = useWscBlazeSDK();

  const widgetRowRectangleProps: WSCBlazeWidgetProps = {
    id,
    labels,
    orderType: 'RecentlyUpdatedFirst',
    contentType,
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
