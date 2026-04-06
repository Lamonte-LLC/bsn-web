'use client';
/*
  wsc-blaze-widget.tsx
  wsc-web-sdk-app-nextjs

  Created by Adam Shwartz on 09/01/2024.

  WSCBlazeWidget Component:

  It manages the initialization, rendering, and customization of the widget based on provided props and the Blaze SDK. 

  Component Props:
  - widgetProps: Properties for configuring the Blaze SDK widget, such as ID, labels, order type, content type, theme, and width.
  
  Key Functionalities:
  - Dynamically initializes the Blaze SDK widget when both the Blaze SDK is ready and the onBlazeSDKConnect event is triggered.
  - Customizes the widget appearance based on the specified theme and Blaze SDK global theme.
  - Provides imperative handle functions for interacting with the Blaze SDK widget, including setting the theme, labels, content IDs, reloading, and adjusting the widget size.
*/

import { IPresetsApp, useTheme } from './hooks/theme';
import { useWscBlazeSDK } from './hooks/useWscBlazeSDK';
import {
  IWidgetTheme,
  IWidgetView,
  IWidgetViewOptions,
  MomentPlayerStyle,
  StoryPlayerStyle,
  ThemeType,
  VideoPlayerStyle,
} from '@wscsports/blaze-web-sdk';
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// Module-level flag: tracks whether onBlazeSDKConnect has already fired.
// Widgets that mount after the event won't miss it.
let blazeSDKConnected = false;

export type SizeState = {
  width: string;
  height: string;
};

export type IWSCWidgetActions = {
  setWidgetSize: (width: string, height: string) => void;
};

export type WSCBlazeWidgetProps = IWidgetViewOptions & {
  id: string;
  width: string;
  height?: string;
  style?: CSSProperties;
  onRender?: () => void;
};

const WSCBlazeWidget = forwardRef<
  Partial<IWSCWidgetActions>,
  WSCBlazeWidgetProps
>((widgetProps, ref) => {
  // Ref to the widget's DOM element
  const widgetRef = useRef<HTMLDivElement>(null);

  // State to track widget rendering status
  const [isWidgetRender, setIsWidgetRendered] = useState<boolean>(false);

  // State to hold the widget view reference
  const [widgetView, setWidgetView] = useState<IWidgetView | null>(null);

  // State to track whether the onBlazeSDKConnect event has been triggered
  const [onBlazeSDKConnect, setOnBlazeSDKConnect] = useState<boolean>(false);

  // State to manage widget size (width and height)
  const [size, setSize] = useState<SizeState>(() => ({
    width: widgetProps.width,
    height: widgetProps.height || '100%',
  }));

  // Access the current theme configuration
  const { blazeTheme } = useTheme();

  // Access Blaze SDK readiness status and instance
  const { blazeSDK, isBlazeSDKReady } = useWscBlazeSDK();

  // Trigger onRender callback when the widget is rendered
  useEffect(() => {
    if (isWidgetRender && typeof widgetProps.onRender === 'function') {
      widgetProps.onRender();
    }
  }, [isWidgetRender, widgetProps]);

  // Customize widget appearance based on theme changes
  useEffect(() => {
    const preset = widgetProps.theme as IPresetsApp;
    const viewPreset = widgetView?.getTheme();

    if (viewPreset && preset) {
      viewPreset.layoutStyle.labelStyle.color = blazeTheme[preset]
        .color as string;

      widgetView?.setTheme(viewPreset);
    }

    // eslint-disable-next-line
  }, [blazeTheme, widgetView]);

  // Dynamically create and initialize the Blaze SDK widget
  useEffect(() => {
    const createWidget = async () => {
      if (isBlazeSDKReady && onBlazeSDKConnect) {
        if (!widgetProps.labels) return;

        // If multiple labels are provided, use OR semantics via LabelBuilder.atLeastOneOf.
        // Single-label and non-array cases are passed through unchanged.
        let labelsParam = widgetProps.labels as unknown;

        if (Array.isArray(widgetProps.labels) && widgetProps.labels.length > 1) {
          const builder = blazeSDK.LabelBuilder();
          labelsParam = builder.atLeastOneOf(...widgetProps.labels);
        }

        const dataSource = blazeSDK.DataSourceBuilder().labels({
          labels: labelsParam as any,
          orderType: widgetProps.orderType,
          maxItems: widgetProps.maxItemsCount,
        });

        const widgetRowView = blazeSDK.WidgetRowView(widgetProps.id, {
          dataSource,
          contentType: widgetProps.contentType,
          theme: widgetProps.theme,
          delegates: widgetProps.delegates,
        });

        const theme = widgetRowView.getTheme();

        if (theme && widgetProps.theme) {
          const preset = widgetProps.theme as IPresetsApp;
          theme.layoutStyle.labelStyle.color = blazeTheme[preset]
            .color as string;

          widgetRowView.setTheme(theme);
        }

        setIsWidgetRendered(true);
        setWidgetView(widgetRowView);

        if (process.env.NEXT_PUBLIC_WSC_DEBUG === 'true') {
          // eslint-disable-next-line no-console
          console.debug('[WSC Blaze] WidgetRowView created', {
            widgetId: widgetProps.id,
            labels: widgetProps.labels,
            contentType: widgetProps.contentType,
            orderType: widgetProps.orderType,
            theme: widgetProps.theme,
            feedNote:
              'Blaze Feed /v1/stories uses a different ApiKey than NEXT_PUBLIC_WSC_API_KEY; validate labels via WSC dashboard or Feed API key.',
          });
        }
      }
    };

    createWidget();
  }, [
    blazeSDK,
    isBlazeSDKReady,
    onBlazeSDKConnect,
    widgetProps.id,
    widgetProps.labels,
    widgetProps.orderType,
    widgetProps.maxItemsCount,
    widgetProps.contentType,
    widgetProps.theme,
    widgetProps.delegates,
    blazeTheme,
  ]);

  // Set up event listener for the onBlazeSDKConnect event.
  // If the event already fired before this widget mounted, set state immediately.
  useEffect(() => {
    if (blazeSDKConnected) {
      setOnBlazeSDKConnect(true);
      return;
    }

    const handleBlazeSDKConnect = () => {
      blazeSDKConnected = true;
      setOnBlazeSDKConnect(true);
    };

    document.addEventListener('onBlazeSDKConnect', handleBlazeSDKConnect);

    return () => {
      document.removeEventListener('onBlazeSDKConnect', handleBlazeSDKConnect);
    };
  }, []);

  useImperativeHandle(ref, () => {
    return {
      setTheme: (
        theme:
          | IWidgetTheme<
              MomentPlayerStyle | StoryPlayerStyle | VideoPlayerStyle
            >
          | ThemeType,
      ) => {
        if (theme) {
          widgetView?.setTheme(
            theme as IWidgetTheme<
              MomentPlayerStyle | StoryPlayerStyle | VideoPlayerStyle
            >,
          );
        }
      },
      getTheme: () => {
        // First try to get the theme from the widget view
        if (widgetView?.getTheme()) {
          return widgetView.getTheme();
        }

        // If blazeSDK is available, try to get the theme from there
        if (blazeSDK && widgetProps.theme) {
          try {
            return blazeSDK.Theme(widgetProps.theme);
          } catch (error) {
            console.warn('Failed to get theme from BlazeSDK:', error);
          }
        }

        // If all else fails, return undefined
        return undefined;
      },
      reload: () => {
        widgetView?.reload();
      },
      setMaxItemsDisplaySize: (size: number) => {
        if (size) {
          widgetView?.setMaxItemsDisplaySize(size);
        }
      },
      setWidgetSize: (width: string, height: string) => {
        setSize({
          width,
          height,
        });
      },
      updateDataSource: () => {
        // Update the widget's data source based on the new labels or content id
      },
    };
  });

  return (
    <div
      ref={widgetRef}
      id={widgetProps.id}
      style={{
        height: size.height,
        width: size.width,
        ...widgetProps.style,
      }}
    ></div>
  );
});

WSCBlazeWidget.displayName = 'WSCBlazeWidget';

export default WSCBlazeWidget;
