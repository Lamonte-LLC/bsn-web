'use client';
/*
  wsc-blaze-widget.tsx
  wsc-web-sdk-app-nextjs

  Created by Adam Shwartz on 09/01/2024.

  WSCBlazeSDK Component:

  WSCBlazeSDK, utilizes the useWscBlazeSDK hook to initialize the Blaze SDK using the provided API key. 
  It dynamically imports the Blaze SDK and initializes it with the specified API key. 
  Additionally, you can set up global features around the application, 

  Component Props:
  - apiKey: A string representing the API key required for Blaze SDK initialization.

  Key Functionalities:
  - Utilizes the useWscBlazeSDK hook to manage Blaze SDK initialization and readiness.
  - Options for additional SDK configurations, such as sending analytics, setting Do Not Track, external user ID, and geolocation, are provided in the comments but are currently commented out for simplicity.
  - Sets up an event listener for analytics events using the analytics service.

  Usage:
  <WSCBlazeSDK apiKey="<YOUR_API_KEY>" />

  Note: This component should be used at the top level of your React application to ensure the Blaze SDK is initialized globally. Ensure to replace "<YOUR_API_KEY>" with the actual Blaze SDK API key.
*/

import { useWscBlazeSDK } from "./hooks/useWscBlazeSDK";
import { useEffect } from "react";

interface WSCBlazeSDKProps {
  apiKey: string;
}

const WSCBlazeSDK: React.FC<WSCBlazeSDKProps> = ({apiKey}) => {
  const { blazeSDK, isBlazeSDKReady } = useWscBlazeSDK();

  const initializeSDK = async () => {
    try {
      if(isBlazeSDKReady){
        await blazeSDK.Initialize(apiKey);
  
        //BlazeSDK.setDoNotTrack(false);
        //BlazeSDK.setExternalUserId('1234')
        //BlazeSDK.setGeoLocation('US')
      }
      
    } catch (error) {
      console.error("Blaze SDK initialization failed:", error);
    }
  };

  useEffect(() => {
    const initializeAndListen = async () => {
      await initializeSDK();
    };

    initializeAndListen();
    // eslint-disable-next-line
  }, [isBlazeSDKReady]); 

  return null;
};

export default WSCBlazeSDK;
