import { DELETE } from "@/constants/apiMethods";
import { axiosInstance } from "@/lib/axiosInstance";
import { readCookie } from "@/lib/readCookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const apiCall = async ({ url, method, data, config = {} }, retryCount = 0) => {
  const maxRetries = 3;

  try {
    const axiosConfig =
      method === DELETE
        ? { params: data, ...config }
        : { data: data || {}, ...config };

    const response = await axiosInstance({ url, method, ...axiosConfig });
    return response.data;
  } catch (error) {
    const isExtensionError = error.message?.includes(
      "Request interrupted by browser extension"
    );

    // Retry if it's an extension error and we haven't exceeded max retries
    if (isExtensionError && retryCount < maxRetries) {
      console.warn(
        `Extension interference detected, retrying... (${
          retryCount + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      ); // Exponential backoff
      return apiCall({ url, method, data, config }, retryCount + 1);
    }

    console.error("API Error:", error);
    throw new Error(
      error?.response?.data?.message || error.message || "Something went wrong!"
    );
  }
};

export function useApiMutation({
  url,
  method,
  invalidateKey = null,
  config = {},
  isToast = true,
}) {
  const queryClient = useQueryClient();

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
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      const isAuthenticated = readCookie("isAuthenticated");
      queryClient.setQueryData(["isLoggedIn"], isAuthenticated);
    },
  });
}
