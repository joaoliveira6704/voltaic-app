const fetchAuth = async <T>(token: string): Promise<T | null> => {
  const config = useRuntimeConfig();
  try {
    return await $fetch<T>(
      `${config.public.apiBaseUrl}/api/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
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
