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
