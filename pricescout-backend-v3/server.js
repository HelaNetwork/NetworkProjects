require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const Shopping = require("./services/shoppingService");
const History  = require("./services/priceHistoryService");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, apiKeySet: !!process.env.SERPAPI_KEY, time: new Date().toISOString() });
});

app.post("/compare", async (req, res) => {
  const { title, asin, price, site } = req.body;
  if (!title) return res.status(400).json({ success: false, error: "title required" });
  console.log(`\n[API] Compare: ${title.substring(0,60)}`);
  try {
    const data = await Shopping.compare({
      title, asin,
      currentPrice: parseFloat(price) || 0,
      currentSite:  site || ""
    });
    const key = asin || title;
    if (data.results?.length) History.recordPrices(key, data.results);
    res.json({ success: true, data });
  } catch(e) {
    console.error("[API] Error:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/history", (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ success: false, error: "key required" });
  const history = History.getHistory(key);
  res.json({ success: true, data: history });
});

app.get("/deal", (req, res) => {
  const { key, price } = req.query;
  if (!key || !price) return res.status(400).json({ success: false, error: "key and price required" });
  const verdict = History.analyseDeal(key, parseFloat(price));
  res.json({ success: true, data: verdict });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PriceScout Pro backend running on http://localhost:${PORT}`);
  console.log(`   SERPAPI_KEY: ${process.env.SERPAPI_KEY ? "✅ Set" : "❌ NOT SET"}`);
});