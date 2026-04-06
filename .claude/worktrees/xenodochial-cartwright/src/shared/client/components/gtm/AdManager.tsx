'use client';

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AdManager() {
  const pathname = usePathname();
  const servicesEnabled = useRef(false);
  const skipNextPathDestroy = useRef(true);

  // Enable GPT services once on initial mount
  useEffect(() => {
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      try {
        if (!servicesEnabled.current) {
          window.googletag.pubads().enableSingleRequest();
          window.googletag.enableServices();
          servicesEnabled.current = true;
        }
      } catch (e) {
        console.warn('AdManager: enableServices failed', e);
      }
    });
  }, []);

  // Destroy and refresh slots on route changes only (not on first paint).
  // Running destroySlots/refresh on mount races AdSlot's delayed defineSlot and can break GPT on mobile Safari.
  useEffect(() => {
    if (skipNextPathDestroy.current) {
      skipNextPathDestroy.current = false;
      return;
    }
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      try {
        window.googletag.destroySlots();
        window.googletag.pubads().refresh();
      } catch (e) {
        console.warn('AdManager: destroySlots/refresh failed', e);
      }
    });
  }, [pathname]);

  return null;
}
