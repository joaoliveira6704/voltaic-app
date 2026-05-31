const fetchAuth = async <T>(token: string): Promise<T | null> => {
  const config = useRuntimeConfig();
  try {
    const res = await $fetch<any>(
      `${config.public.apiBaseUrl}/api/users/verify`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return (res?.data ?? res) as T;
  } catch (error) {
    console.error("Auth check error:", error);
    return null;
  }
};

export const checkValidToken = async (token: string): Promise<boolean> => {
  const data = await fetchAuth<{ valid: boolean }>(token);
  return data?.valid || false;
};

export const checkIsAdmin = async (token: string): Promise<boolean> => {
  const data = await fetchAuth<{ isAdmin: boolean }>(token);
  return data?.isAdmin || false;
};
