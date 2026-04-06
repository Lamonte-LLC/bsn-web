/*
  useScreenDetector.tsx
  wsc-web-sdk-app-nextjs

  Created by Adam Shwartz on 09/01/2024.

  useScreenDetector Hook:

  This custom hook, named useScreenDetector, is designed to dynamically detect and respond to changes in the viewport width. 
  It provides information about the current screen size, classifying it as mobile, tablet, or desktop.

  Hook Logic:
  - Initializes state for the viewport width using the useState hook, considering the initial width based on the client-side check.
  - Implements an event listener for the "resize" event to update the viewport width dynamically.
  - Ensures proper cleanup of the event listener when the component unmounts using the useEffect hook's cleanup function.

  Usage:
  - Import this hook into React components to effortlessly determine the current screen size and respond to changes.
  - The hook provides three boolean values: 'isMobile', 'isTablet', and 'isDesktop' to indicate the current screen classification.

  Example Usage:
  const { isMobile, isTablet, isDesktop } = useScreenDetector();
  // Access the boolean values to conditionally render components or apply styles based on the screen size.

  Note: This hook is particularly useful for creating responsive designs or adapting component behavior based on different device types.
*/
import { useEffect, useState } from "react";

export const useScreenDetector = () => {
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    } else {
      return 0; // or any default value you prefer
    }
  });

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowSizeChange);

      return () => {
        window.removeEventListener("resize", handleWindowSizeChange);
      };
    }
  }, []);

  const isMobile = width <= 768;
  const isTablet = width <= 1024;
  const isDesktop = width > 1024;

  return { isMobile, isTablet, isDesktop };
};
