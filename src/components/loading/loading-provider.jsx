"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/react-query";

const LoadingContext = createContext(null);

const SHOW_DELAY_MS = 300;
const MIN_VISIBLE_MS = 360;
const SUCCESS_VISIBLE_MS = 1800;
const FAILURE_VISIBLE_MS = 4000;

const statusMeta = {
  syncing: { label: "Syncing live data", tone: "syncing" },
  refreshing: { label: "Refreshing intelligence", tone: "syncing" },
  processing: { label: "Processing operation", tone: "processing" },
  success: { label: "Sync complete", tone: "success" },
  failed: { label: "Sync failed", tone: "failed" },
  idle: { label: "System ready", tone: "idle" },
};

export function LoadingProvider({ children }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const fetchingCount = useIsFetching();
  const mutatingCount = useIsMutating();

  const [routeTransition, setRouteTransition] = useState(false);
  const [manualProcessing, setManualProcessing] = useState(0);
  const [visible, setVisible] = useState(false);
  const [lastSuccessAt, setLastSuccessAt] = useState(0);
  const [lastFailureAt, setLastFailureAt] = useState(0);

  const previousPathRef = useRef(pathname);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const visibleSinceRef = useRef(0);
  const routeTimeoutRef = useRef(null);

  const hasWork = fetchingCount > 0 || mutatingCount > 0 || routeTransition || manualProcessing > 0;

  useEffect(() => {
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== "updated") return;
      if (event?.query?.state?.status === "error") {
        setLastFailureAt(Date.now());
      }
      if (event?.query?.state?.status === "success") {
        setLastSuccessAt(Date.now());
      }
    });

    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      const mutationState = event?.mutation?.state;
      if (!mutationState) return;
      if (mutationState.status === "error") {
        setLastFailureAt(Date.now());
      }
      if (mutationState.status === "success") {
        setLastSuccessAt(Date.now());
      }
    });

    return () => {
      unsubscribeQuery?.();
      unsubscribeMutation?.();
    };
  }, [queryClient]);

  useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;
    if (routeTimeoutRef.current) {
      clearTimeout(routeTimeoutRef.current);
    }
    routeTimeoutRef.current = setTimeout(() => {
      setRouteTransition(false);
    }, 180);
    return () => {
      if (routeTimeoutRef.current) {
        clearTimeout(routeTimeoutRef.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (hasWork) {
      if (!visible) {
        showTimerRef.current = setTimeout(() => {
          visibleSinceRef.current = Date.now();
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
      return;
    }

    if (!visible) return;

    const elapsed = Date.now() - visibleSinceRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [hasWork, visible]);

  useEffect(
    () => () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (routeTimeoutRef.current) clearTimeout(routeTimeoutRef.current);
    },
    [],
  );

  const syncStatus = useMemo(() => {
    const now = Date.now();
    if (now - lastFailureAt < FAILURE_VISIBLE_MS) return "failed";
    if (manualProcessing > 0 || mutatingCount > 0) return "processing";
    if (routeTransition) return "syncing";
    if (fetchingCount > 0) return "refreshing";
    if (now - lastSuccessAt < SUCCESS_VISIBLE_MS) return "success";
    return "idle";
  }, [fetchingCount, lastFailureAt, lastSuccessAt, manualProcessing, mutatingCount, routeTransition]);

  const beginRouteTransition = () => setRouteTransition(true);
  const clearRouteTransition = () => setRouteTransition(false);

  const beginProcessing = () => {
    setManualProcessing((count) => count + 1);
  };

  const endProcessing = () => {
    setManualProcessing((count) => Math.max(count - 1, 0));
    setLastSuccessAt(Date.now());
  };

  const reportFailure = () => {
    setLastFailureAt(Date.now());
  };

  const value = useMemo(
    () => ({
      fetchingCount,
      mutatingCount,
      isBusy: hasWork,
      showTopProgress: visible,
      syncStatus,
      syncMeta: statusMeta[syncStatus],
      beginRouteTransition,
      clearRouteTransition,
      beginProcessing,
      endProcessing,
      reportFailure,
    }),
    [fetchingCount, hasWork, mutatingCount, syncStatus, visible],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used inside LoadingProvider");
  }
  return context;
}
