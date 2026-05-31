import { useCookie, useRuntimeConfig } from "#app";

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

let refreshPromise: Promise<ApiResponse<{ token: string; refreshToken: string }>> | null =
  null;

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = import.meta.server ? config.apiBaseUrl : config.public.apiBaseUrl;

  const unwrap = <T>(res: any): T => {
    if (res && typeof res === "object" && "status" in res && res.status === "success") {
      return (res.data ?? res) as T;
    }
    return res as T;
  };

  return {
    api: async <T = any>(
      url: string,
      opts: Record<string, any> = {},
    ): Promise<T> => {
      const token = useCookie("token");
      const refreshTokenCookie = useCookie("refreshToken");

      const doFetch = () =>
        $fetch<ApiResponse<T>>(`${baseUrl}${url}`, {
          ...opts,
          headers: {
            ...(opts.headers || {}),
            ...(token.value
              ? { Authorization: `Bearer ${token.value}` }
              : {}),
          },
        }).then((res) => unwrap<T>(res));

      try {
        return await doFetch();
      } catch (error: any) {
        if (error?.response?.status !== 401 || !refreshTokenCookie.value) {
          throw error;
        }

        if (!refreshPromise) {
          const userCookie = useCookie("user");
          refreshPromise = $fetch<ApiResponse<{ token: string; refreshToken: string }>>(
            `${baseUrl}/api/users/refresh`,
            {
              method: "POST",
              body: { refreshToken: refreshTokenCookie.value },
            },
          )
            .then((res) => {
              const data = unwrap<{ token: string; refreshToken: string }>(res);
              token.value = data.token;
              refreshTokenCookie.value = data.refreshToken;
              return res;
            })
            .catch((err) => {
              token.value = null;
              refreshTokenCookie.value = null;
              userCookie.value = null;
              throw err;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return doFetch();
      }
    },
  };
};
