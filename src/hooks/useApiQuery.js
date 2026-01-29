import { axiosInstance } from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useCrashReporter from "@/hooks/useCrashReporter";
import { readCookie } from "@/lib/readCookie";

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

    if (isExtensionError && retryCount < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1)),
      );
      return fetchApi({ url, params, axiosOptions }, retryCount + 1);
    }

    const customError = new Error(
      error?.response?.data?.message || error.message,
    );
    customError.status = error?.response?.status;
    customError.raw = error; // 👈 preserve original error

    throw customError;
  }
};

export function useApiQuery({
  url,
  queryKeys = [],
  params = {},
  options = {},
  axiosOptions = {},

  // 🔥 Crash reporting (optional)
  reportCrash = true,
  screenName,
  severity = "HIGH",
  userType = "Admin",
}) {
  const router = useRouter();
  const { reportCrash: sendCrash } = useCrashReporter();
  const userInfo = readCookie("userInfo");
  console.log("userInfo", userInfo);
  

  return useQuery({
    queryKey: [...queryKeys, params],

    queryFn: async () => {
      try {
        return await fetchApi({ url, params, axiosOptions });
      } catch (error) {
        const status = error?.status;

        console.log("error-log", error);
        

        // ----------------------------
        // 🔐 Auth handling
        // ----------------------------
        if (status === 401) {
          router.push("/");
          return;
        }

        // ----------------------------
        // 🚨 Auto crash reporting
        // ----------------------------
        if (reportCrash) {
          const normalizedError = {
            name: error.name,
            message: error.message, // 👈 "Admins is not defined"
            status: error.status,

            axios: {
              message: error.raw?.message,
              status: error.raw?.response?.status,
              responseMessage: error.raw?.response?.data?.message,
              url: error.raw?.config?.url,
              method: error.raw?.config?.method,
            },

            stack: error.stack,
          };
          try {
            await sendCrash({
              error: normalizedError,
              screenName,
              severity,
              userId: userInfo?.id,
              userType,
              request: {
                url,
                method: "GET",
                params,
              },
            });
          } catch {
            // NEVER recurse, NEVER toast
          }
        }

        throw error; // React Query handles retries
      }
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,

    ...options,
  });
}
