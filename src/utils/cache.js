// src/utils/cache.js
import NodeCache from 'node-cache';

export const CACHE_TTL = 60;
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 });

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry;
}

export function setCache(key, value, ttl = CACHE_TTL) {
  cache.set(key, value, ttl);
}

export function delCache(key) {
  cache.del(key);
}

export function clearCache() {
  cache.flushAll();
}

export default cache;
