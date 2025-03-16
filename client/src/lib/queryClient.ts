import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { api } from "./api";
import { AxiosError } from "axios";

// Helper function to handle errors from the API
async function handleApiError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a non-2xx status code
    const message = error.response.data || error.response.statusText;
    throw new Error(`${error.response.status}: ${message}`);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("Network error: No response received");
  } else {
    // Something happened in setting up the request
    throw new Error(`Error: ${error.message}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  try {
    const response = await api.request({
      method,
      url,
      data: data,
    });
    
    return response;
  } catch (error) {
    await handleApiError(error);
    return null; // Will never reach here because handleApiError throws an error
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const response = await api.get(queryKey[0] as string);
      return response.data as T;
    } catch (error) {
      if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          if (unauthorizedBehavior === "returnNull") {
            return null as T;
          }
        }
      }
      
      await handleApiError(error);
      return null; // Will never reach here because handleApiError throws an error
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
