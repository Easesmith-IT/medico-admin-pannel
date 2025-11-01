import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on actual API errors (4xx, 5xx)
        if (error?.response?.status >= 400) {
          return false;
        }

        // Retry up to 3 times for extension interference or network issues
        if (
          error?.message?.includes(
            "Request interrupted by browser extension"
          ) ||
          error?.message?.includes("Network Error") ||
          error?.code === "ECONNABORTED"
        ) {
          return failureCount < 3;
        }

        // Default retry behavior
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry mutations only for extension interference
        if (
          error?.message?.includes("Request interrupted by browser extension")
        ) {
          return failureCount < 2;
        }
        return false; // Don't retry other mutation errors
      },
      retryDelay: 1000,
    },
  },
});
