import redis from "../services/redis.service.js";

export const get = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const set = async (key, data, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch {
    // fail silently
  }
};

export const del = async (key) => {
  try {
    await redis.del(key);
  } catch {
    // fail silently
  }
};

export const wrap = async (key, fn, ttl = 3600) => {
  const cached = await get(key);
  if (cached) return cached;
  const data = await fn();
  await set(key, data, ttl);
  return data;
};
