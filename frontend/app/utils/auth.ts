export const checkValidToken = async (token: string): Promise<boolean> => {
  const config = useRuntimeConfig();
  try {
    const data = await $fetch<{ valid: boolean }>(
      `${config.public.apiBaseUrl}/api/auth/validate-token`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("Token validation response:", data);
    return data?.valid || false;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const checkIsAdmin = async (token: string): Promise<boolean> => {
  const config = useRuntimeConfig();
  try {
    const data = await $fetch<{ isAdmin: boolean }>(
      `${config.public.apiBaseUrl}/api/auth/validate-token`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("Is admin response:", data);
    return data?.isAdmin || false;
  } catch (error) {
    console.error("Is admin error:", error);
    return false;
  }
};
