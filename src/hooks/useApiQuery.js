import { axiosInstance } from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const fetchApi = async ({ url, params, axiosOptions }, retryCount = 0) => {
  const maxRetries = 3;

  try {
    const response = await axiosInstance.get(url, {
      params,
      ...axiosOptions,
    });
    return response.data;
  } catch (error) {
    const isExtensionError = error.message?.includes(
      "Request interrupted by browser extension",
    );

    // Retry if it's an extension error and we haven't exceeded max retries
    if (isExtensionError && retryCount < maxRetries) {
      console.warn(
        `Extension interference detected, retrying... (${
          retryCount + 1
        }/${maxRetries})`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1)),
      ); // Exponential backoff
      return fetchApi({ url, params }, retryCount + 1);
    }

    console.error("API Error:", error);
    throw error;
  }
};

export function useApiQuery({
  url,
  queryKeys = [],
  params = {},
  options = {},
  axiosOptions = {},
}) {
  const router = useRouter();

  return useQuery({
    queryKey: [...queryKeys, params],
    // queryFn: () => fetchApi({ url, params, axiosOptions }),
    queryFn: async () => {
      try {
        return await fetchApi({ url, params, axiosOptions });
      } catch (error) {
        const status = error?.response?.status || error?.status;

        if (status === 401) {
          router.push("/");
          return; // must return or reject after redirect
        }

        throw error; // propagate for React Query retries, logging, etc.
      }
    },
    staleTime: 1000 * 60 * 5, // cache stays fresh for 5 min
    refetchOnWindowFocus: false, // prevent auto refetch on tab switch
    refetchOnMount: false, // don’t refetch immediately on mount
    retry: 1,
    ...options, // Allows passing additional options like staleTime, enabled, etc.
  });
}
