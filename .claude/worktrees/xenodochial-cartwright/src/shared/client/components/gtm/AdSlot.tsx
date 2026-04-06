'use client';

import { useEffect } from 'react';

type AdSlotProps = {
  adUnit: string;
  size: [number, number];
  elementId: string;
};

export default function AdSlot({ adUnit, size, elementId }: AdSlotProps) {
  useEffect(() => {
    // Each effect invocation gets its own slot variable and timeoutId.
    // Using a closure variable (not a ref) means the cleanup for *this*
    // mount always operates on *this* mount's slot — no cross-contamination
    // between React StrictMode's double-invoke cycles.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let slot: any = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    window.googletag = window.googletag || { cmd: [] };

    window.googletag.cmd.push(() => {
      // The 500 ms delay is intentional: it lets the GTM container finish
      // calling enableSingleRequest() / enableServices() before we define
      // and display the slot. Crucially, the cleanup calls clearTimeout(),
      // so in React StrictMode the timer is cancelled before it fires and
      // no slot is ever created during the fake unmount/remount cycle.
      timeoutId = setTimeout(() => {
        // Extra guard in case something else already claimed this div
        try {
          const existingSlots = window.googletag.pubads().getSlots() as any[];
          if (existingSlots.some((s: any) => s.getSlotElementId() === elementId)) {
            return;
          }
        } catch (_) {
          // pubads() not yet available — safe to continue
        }

        slot = window.googletag.defineSlot(adUnit, size, elementId);
        if (slot) {
          slot.addService(window.googletag.pubads());
          window.googletag.display(elementId);
        }
      }, 500);
    });

    return () => {
      // Cancel the pending timer — this is what prevents StrictMode from
      // defining a slot during the fake-unmount/remount cycle.
      clearTimeout(timeoutId);
      // Destroy the slot object (not the ID string) if it was created.
      window.googletag?.cmd?.push(() => {
        if (slot) {
          window.googletag.destroySlots([slot]);
        }
      });
    };
  }, [adUnit, size, elementId]);

  return <div id={elementId} style={{ minHeight: size[1] }}></div>;
}
