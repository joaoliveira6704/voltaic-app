export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const userCookie = useCookie("user");
  const token = useCookie("token");

  // 1. Allow access to login page
  if (_to.path === "/login") return;

  // 2. Check if cookies exist
  if (!userCookie.value || !token.value) {
    return navigateTo("/login");
  }

  // 3. Await the async validation
  try {
    const isValid = await checkValidToken(token.value);

    if (!isValid) {
      userCookie.value = null;
      token.value = null;
      return navigateTo("/login");
    }
  } catch (error) {
    // Handle API errors (e.g., server down) by redirecting to login
    console.log("Error validating token:", error);
    return navigateTo("/login");
  }
});
