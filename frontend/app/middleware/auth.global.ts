const PUBLIC_ROUTES = ["/login", "/signup", "/recover-password"];

export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const token = useCookie("token");

  // No token — only allow public routes
  if (!token.value) {
    if (!PUBLIC_ROUTES.includes(_to.path)) return navigateTo("/login");
    return;
  }

  // Token exists — validate it
  try {
    const isValid = await checkValidToken(token.value);

    if (!isValid) {
      token.value = null;
      return navigateTo("/login");
    }

    if (PUBLIC_ROUTES.includes(_to.path)) {
      const fallback =
        !_from.path || PUBLIC_ROUTES.includes(_from.path) ? "/" : _from.path;
      return navigateTo(fallback);
    }
  } catch (error) {
    console.log("Error validating token:", error);
    token.value = null;
    return navigateTo("/login");
  }
});
