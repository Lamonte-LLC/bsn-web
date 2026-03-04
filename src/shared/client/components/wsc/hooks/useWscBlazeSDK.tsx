'use client';
/*
  useWscBlazeSDK.tsx
  wsc-web-sdk-app-nextjs
  Created by Adam Shwartz on 09/01/2024.
  
  useWscBlazeSDK Hook (Next.js Client-Side Loading):

  This custom hook is tailored for Next.js applications, providing a seamless integration of the Blaze SDK (Blaze Web SDK) on the client side. 
  It accounts for server-side rendering (SSR) to ensure proper functionality in a Next.js environment.

  Hook Logic:
  - Initializes state for the Blaze SDK instance and loading status using the useState hook.
  - Utilizes the useEffect hook to asynchronously load the Blaze SDK only on the client side during component mounting.
  - The loaded SDK instance is stored in state upon successful loading.
  - Components can check the readiness of the Blaze SDK through the 'isBlazeSDKReady' boolean.

  Usage:
  - Import this hook into Next.js components to effortlessly manage Blaze SDK integration on the client side.
  - Designed to prevent server-side rendering issues by checking for the presence of 'window' before attempting to import the SDK.

  Example Usage:
  const { blazeSDK, isBlazeSDKReady } = useWscBlazeSDK();
  // Access 'blazeSDK' for Blaze SDK instance and 'isBlazeSDKReady' for loading status.

  Note: The loading status is particularly useful for scenarios where components need to wait for the Blaze SDK to be fully loaded before executing certain actions.
*/
import { useEffect, useState } from "react";

export const useWscBlazeSDK = () => {
  const [blazeSDK, setBlazeSDK] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlazeSdk = async () => {
      try {
        if (typeof window !== "undefined") {
          const loadedBlazeSDK = (await import("@wscsports/blaze-web-sdk"))
            .default;
          setBlazeSDK(loadedBlazeSDK);
        }
      } catch (error) {
        console.error("Failed to load BlazeSDK:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlazeSdk();
  }, []);

  return {
    blazeSDK,
    // Only ready when loading is done AND the SDK actually loaded (not null due to an error)
    isBlazeSDKReady: !loading && !!blazeSDK,
  };
};
