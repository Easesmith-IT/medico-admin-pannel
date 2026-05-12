"use client";

import { useEffect } from "react";

export const useUnsavedChangesWarning = (enabled) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);
};
