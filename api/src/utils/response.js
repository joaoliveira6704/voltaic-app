import { linkGroups } from "../config/links.js";

function matchLinks(req) {
  if (!req) return undefined;
  const role = req.user?.role;
  const path = (req.baseUrl + req.path).replace(/\/+$/, "") || "/";
  const method = req.method;

  const group = linkGroups.find((g) => {
    if (!g.match.methods.includes(method)) return false;
    const gParts = g.match.path.split("/");
    const pParts = path.split("/");
    if (gParts.length !== pParts.length) return false;
    return gParts.every((part, i) => part.startsWith(":") || part === pParts[i]);
  });

  if (!group) return undefined;

  const result = {};
  for (const [rel, link] of Object.entries(group.links)) {
    if (link.roles && (!role || !link.roles.includes(role))) continue;

    const paramKeys = [...link.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
    const unresolved = paramKeys.some((k) => !req.params?.[k]);
    if (unresolved) continue;

    let href = link.path;
    for (const [key, value] of Object.entries(req.params || {})) {
      href = href.replace(`:${key}`, value);
    }
    result[rel] = { href, method: link.method };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export const success = (res, { data, message, statusCode = 200, links }) => {
  const body = { status: "success" };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  body._links = links !== undefined ? links : matchLinks(res.req);
  return res.status(statusCode).json(body);
};

export const error = (res, { message, statusCode = 500, details }) => {
  const body = { status: "error", message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};
