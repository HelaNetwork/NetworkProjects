const fs   = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../data/priceHistory.json");

function ensureDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDB() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) return {};
  try   { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
}

function saveDB(db) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function recordPrices(productKey, results) {
  if (!productKey || !results?.length) return;
  const db    = loadDB();
  const key   = productKey.substring(0, 120).trim();
  const today = new Date().toISOString().split("T")[0];
  const ts    = Date.now();
  if (!db[key]) db[key] = { entries: [] };
  const snapshot = { date: today, ts, prices: {} };
  for (const r of results) {
    if (r.available && r.price > 0) snapshot.prices[r.siteName] = r.price;
  }
  if (!Object.keys(snapshot.prices).length) return;
  const existingIdx = db[key].entries.findIndex(e => e.date === today);
  if (existingIdx >= 0) db[key].entries[existingIdx] = snapshot;
  else db[key].entries.push(snapshot);
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  db[key].entries = db[key].entries.filter(e => e.ts >= cutoff);
  saveDB(db);
}

function getHistory(productKey) {
  if (!productKey) return [];
  const db  = loadDB();
  const key = productKey.substring(0, 120).trim();
  if (!db[key]) return [];
  return db[key].entries
    .sort((a, b) => a.ts - b.ts)
    .map(e => ({
      date:        e.date,
      ts:          e.ts,
      prices:      e.prices,
      lowestPrice: Math.min(...Object.values(e.prices))
    }));
}

function analyseDeal(productKey, currentPrice) {
  const history = getHistory(productKey);
  if (history.length < 2) {
    return {
      verdict: "NEW", label: "⏳ Tracking Started",
      color: "#6366f1", confidence: "low",
      reason: "Not enough history yet — we just started tracking this product."
    };
  }
  const lows    = history.map(h => h.lowestPrice).filter(Boolean);
  const allTime = Math.min(...lows);
  const recent7 = history.slice(-7).map(h => h.lowestPrice).filter(Boolean);
  const avg7    = recent7.length ? recent7.reduce((a,b)=>a+b,0)/recent7.length : currentPrice;
  const avg30   = lows.reduce((a,b)=>a+b,0)/lows.length;
  const dropPct = ((avg7 - currentPrice) / avg7) * 100;

  if (currentPrice <= allTime * 1.02) return {
    verdict: "BEST", label: "🏆 All-Time Low Price!",
    color: "#16a34a", confidence: "high",
    reason: `Lowest price recorded in ${history.length} days of tracking.`
  };
  if (dropPct >= 8) return {
    verdict: "GOOD", label: `🔥 ${Math.round(dropPct)}% Below 7-Day Average`,
    color: "#ea580c", confidence: "high",
    reason: `7-day average was ₹${Math.round(avg7).toLocaleString("en-IN")}. Current price is lower.`
  };
  if (dropPct >= 3) return {
    verdict: "FAIR", label: "👍 Slightly Below Average",
    color: "#ca8a04", confidence: "medium",
    reason: `Marginally below recent average of ₹${Math.round(avg7).toLocaleString("en-IN")}.`
  };
  if (dropPct <= -8) return {
    verdict: "HIGH", label: `📈 ${Math.round(Math.abs(dropPct))}% Above Average — Wait!`,
    color: "#dc2626", confidence: "high",
    reason: `7-day average was ₹${Math.round(avg7).toLocaleString("en-IN")}. Consider waiting.`
  };
  return {
    verdict: "TYPICAL", label: "😐 Typical Price",
    color: "#64748b", confidence: "medium",
    reason: `Near 30-day average of ₹${Math.round(avg30).toLocaleString("en-IN")}.`
  };
}

module.exports = { recordPrices, getHistory, analyseDeal };