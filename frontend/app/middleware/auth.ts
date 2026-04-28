export default defineNuxtRouteMiddleware((_to, _from) => {
  const userCookie = useCookie("user");
  const token = useCookie("token");

  if (_to.path === "/login") return;

  if (!userCookie.value || !token) {
    return navigateTo("/login");
  }

  const isValidToken = checkValidToken(token.value ?? "");

  if (!isValidToken) {
    userCookie.value = null;
    token.value = null;
    return navigateTo("/login");
  }
});
