const initSqlJs = require("sql.js");
const path = require("path");
const fs   = require("fs");

const DB_PATH = path.join(__dirname, "../pricescout.db.json");
let db = null;

async function init() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const saved = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    db = new SQL.Database(Buffer.from(saved.data));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      title      TEXT,
      site       TEXT,
      price      REAL,
      url        TEXT,
      recorded_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS price_cache (
      product_id TEXT PRIMARY KEY,
      title      TEXT,
      data       TEXT,
      cached_at  INTEGER
    );
  `);
  save();
  console.log("[DB] SQLite ready ✅");
}

function save() {
  if (db) fs.writeFileSync(DB_PATH, JSON.stringify({ data: Array.from(db.export()) }));
}

function savePriceHistory(productId, title, results) {
  if (!db) return;
  for (const r of results || []) {
    if (r.available && r.price) {
      db.run(
        "INSERT INTO price_history VALUES (null,?,?,?,?,?,?)",
        [productId, title, r.site, r.price, r.url || "", Date.now()]
      );
    }
  }
  save();
}

function getPriceHistory(productId) {
  if (!db) return { bysite: {}, stats: {} };
  const since = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
  const stmt  = db.prepare(
    "SELECT site, price, url, recorded_at FROM price_history WHERE product_id=? AND recorded_at>? ORDER BY recorded_at ASC"
  );
  stmt.bind([productId, since]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  const bysite = {};
  for (const r of rows) {
    (bysite[r.site] = bysite[r.site] || []).push({ price: r.price, date: r.recorded_at, url: r.url });
  }

  const stats = {};
  for (const [site, entries] of Object.entries(bysite)) {
    const prices = entries.map(e => e.price);
    stats[site] = {
      allTimeLow:  Math.min(...prices),
      allTimeHigh: Math.max(...prices),
      avgPrice:    Math.round(prices.reduce((a, b) => a + b) / prices.length),
      dataPoints:  prices.length,
      entries
    };
  }
  return { bysite, stats };
}

function getCacheRow(productId) {
  if (!db) return null;
  const s = db.prepare("SELECT data, cached_at FROM price_cache WHERE product_id=?");
  s.bind([productId]);
  const row = s.step() ? s.getAsObject() : null;
  s.free();
  return row;
}

function setCacheRow(productId, title, data) {
  if (!db) return;
  db.run(
    "INSERT OR REPLACE INTO price_cache VALUES (?,?,?,?)",
    [productId, title, data, Date.now()]
  );
  save();
}

module.exports = { init, savePriceHistory, getPriceHistory, getCacheRow, setCacheRow };
