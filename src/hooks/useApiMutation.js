import { DELETE } from "@/constants/apiMethods";
import { axiosInstance } from "@/lib/axiosInstance";
import { readCookie } from "@/lib/readCookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useCrashReporter from "@/hooks/useCrashReporter";

const apiCall = async ({ url, method, data, config = {} }) => {
  try {
    const axiosConfig =
      method === DELETE
        ? { params: data, ...config }
        : { data: data || {}, ...config };

    const response = await axiosInstance({ url, method, ...axiosConfig });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;

    const customError = new Error(message);
    customError.status = status;
    customError.raw = error; // 👈 preserve original error

    throw customError;
  }
};

export function useApiMutation({
  url,
  method,
  invalidateKey = null,
  config = {},

  // 🔥 Crash reporting options
  reportCrash = true,
  screenName,
  severity = "HIGH",
  userType = "Admin",

  isToast = true,
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reportCrash: sendCrash } = useCrashReporter();
  const userInfo = readCookie("userInfo");

  return useMutation({
    mutationFn: (data) => apiCall({ url, method, data, config }),

    onSuccess: (data) => {
      if (isToast) {
        toast.success(data?.message || "Action successful!");
      }

      if (invalidateKey) {
        queryClient.invalidateQueries(invalidateKey);
      }
    },

    onError: async (error, variables) => {
      if (isToast) {
        toast.error(error.message);
      }

      // ----------------------------
      // ✅ AUTO CRASH REPORTING
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
              method,
              body: variables,
            },
          });
        } catch {
          // NEVER recurse, NEVER toast
        }
      }

      if (error.status === 401) {
        router.push("/");
      }
    },

    onSettled: () => {
      const isAuthenticated = readCookie("isAuthenticated");
      queryClient.setQueryData(["isLoggedIn"], isAuthenticated);
    },
  });
}
