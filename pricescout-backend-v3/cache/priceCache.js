const Database  = require("../utils/database");
const CACHE_TTL = (parseInt(process.env.CACHE_TTL_HOURS) || 4) * 60 * 60 * 1000;

const makeKey = k => k.toLowerCase().replace(/\s+/g, "_").substring(0, 80);

function get(key) {
  try {
    const row = Database.getCacheRow(makeKey(key));
    if (!row) return null;
    if (Date.now() - row.cached_at > CACHE_TTL) return null;
    return JSON.parse(row.data);
  } catch { return null; }
}

function set(key, _, data) {
  try {
    Database.setCacheRow(makeKey(key), key, JSON.stringify(data));
  } catch (e) {
    console.error("[Cache] set error:", e.message);
  }
}

module.exports = { get, set };
