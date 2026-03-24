"use client";

import { useEffect } from "react";

export function PwaRegister() {
  const swVersion = process.env.NEXT_PUBLIC_BUILD_TIME ?? "dev";

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(swVersion)}`).catch(() => {
        // Keep registration failures silent for end users.
      });
    });
  }, [swVersion]);

  return null;
}
