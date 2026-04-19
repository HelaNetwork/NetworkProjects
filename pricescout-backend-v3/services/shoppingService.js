const axios = require("axios");
const Cache = require("../cache/priceCache");

const SERPAPI_URL = "https://serpapi.com/search.json";
const getKey      = () => process.env.SERPAPI_KEY;

const MERCHANTS = {
  amazon:          { name:"Amazon.in",        color:"#FF9900" },
  flipkart:        { name:"Flipkart",          color:"#2874F0" },
  myntra:          { name:"Myntra",            color:"#FF3F6C" },
  croma:           { name:"Croma",             color:"#67B346" },
  reliancedigital: { name:"Reliance Digital",  color:"#E31837" },
  tatacliq:        { name:"Tata CLiQ",         color:"#6B1D8B" },
  vijaysales:      { name:"Vijay Sales",       color:"#E60000" },
  snapdeal:        { name:"Snapdeal",          color:"#E40046" },
  meesho:          { name:"Meesho",            color:"#F43397" },
  nykaa:           { name:"Nykaa",             color:"#FC2779" },
  ajio:            { name:"AJIO",              color:"#2D2D2D" },
  jiomart:         { name:"JioMart",           color:"#0A5C9B" },
  paytmmall:       { name:"Paytm Mall",        color:"#00BAF2" },
  sangeetha:       { name:"Sangeetha",         color:"#F97316" },
  poorvika:        { name:"Poorvika",          color:"#7C3AED" },
};

function getMerchant(source) {
  if (!source) return { name:"Unknown Store", color:"#6366f1" };
  const key = source.toLowerCase().replace(/[\s.]/g,"").replace(/\.in|\.com/g,"");
  for (const [k,v] of Object.entries(MERCHANTS)) {
    if (key.includes(k)) return v;
  }
  return { name: source, color:"#6366f1" };
}

// ── FIXED: Smart query builder ──
function buildQuery(title) {
  let q = title
    .replace(/\d+\.\d+\s*cm/gi, "")
    .replace(/\(?\d+\s*inch\)?/gi, "")
    .replace(/\d+%/g, "")
    .replace(/[-–—|]/g, " ")
    .replace(/\b(buy|online|india|price|best|new|latest|original|free|shipping|offer|deal|full|backlit|panel|series|ultima|wired|wireless|multimedia)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const model = title.match(/\b([A-Z]{1,6}[-]?[0-9]{2,8}[A-Z0-9]*)\b/);
  const words = q.split(" ").filter(w => w.length > 1).slice(0, 4);
  const finalQ = model ? `${words.join(" ")} ${model[1]}` : words.join(" ");
  return finalQ.trim();
}

// ── FIXED: Robust price parser — handles ₹5,206 / "5206.00" / 5206 ──
function parsePrice(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && val > 0) return val;
  const str = String(val)
    .replace(/[₹\u20B9Rs,\s]/g, "")
    .replace(/[^0-9.]/g, "")
    .trim();
  const n = parseFloat(str);
  return (!isNaN(n) && n > 0) ? n : null;
}

// ── FIXED: Extract price from shopping result (tries ALL fields) ──
function extractPrice(p) {
  const candidates = [
    p.price, p.extracted_price, p.base_price,
    p.total_price, p.new_price, p.original_price, p.sale_price
  ];
  for (const c of candidates) {
    const parsed = parsePrice(c);
    if (parsed) return parsed;
  }
  return null;
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const wa = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wb = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  let matches = 0;
  for (const w of wa) if (wb.has(w)) matches++;
  return Math.round((matches / Math.max(wa.size, wb.size, 1)) * 100);
}

function sortAndMark(results, currentSite, currentPrice) {
  // Always add current site if missing
  if (currentSite && currentPrice > 0 && !results.find(r => r.isCurrentSite)) {
    const m = getMerchant(currentSite);
    results.push({
      site: currentSite, siteName: m.name, color: m.color,
      price: currentPrice, url: null, productUrl: null,
      available: true, isBest: false, isCurrentSite: true,
      confidence: "exact", matchScore: 100
    });
  }
  results.sort((a, b) => a.price - b.price);
  const avail = results.filter(r => r.available && r.price);
  if (avail.length) results.forEach(r => r.isBest = r.siteName === avail[0].siteName);
  const prices = avail.map(r => r.price);
  const savingsInfo = prices.length > 1
    ? { savings: Math.max(...prices) - Math.min(...prices), minPrice: Math.min(...prices), maxPrice: Math.max(...prices) }
    : null;
  return { results, savingsInfo };
}

async function compare({ title, asin, currentPrice, currentSite }) {
  const cacheKey = asin || title;

  const cached = Cache.get(cacheKey);
  if (cached) {
    console.log("[Shop] ✅ Cache hit");
    return { ...cached, fromCache: true };
  }

  const query = buildQuery(title);
  console.log("[Shop] Cleaned query:", query);

  // ══ STEP 1: Google Shopping Search ══
  let products = [];
  try {
    const { data } = await axios.get(SERPAPI_URL, {
      params: {
        engine: "google_shopping", q: query,
        gl: "in", hl: "en", currency: "INR", num: 20,
        api_key: getKey()
      },
      timeout: 25000
    });
    products = data.shopping_results || [];
  } catch(e) {
    console.error("[Shop] Search failed:", e.message);
    return { results: buildCurrentOnly(currentSite, currentPrice), fromCache: false };
  }

  console.log("[Shop] Step 1 — Products:", products.length);
  if (!products.length) return { results: buildCurrentOnly(currentSite, currentPrice), fromCache: false };

  // ══ STEP 2: Find best matching product ══
  let bestProduct = products[0], bestScore = 0;
  for (const p of products.slice(0, 8)) {
    const score = similarity(title, p.title || "");
    if (score > bestScore) { bestScore = score; bestProduct = p; }
  }
  console.log(`[Shop] Step 2 — Best: "${(bestProduct.title||"").substring(0,55)}" score:${bestScore}`);

  // ══ STEP 3: Try google_product sellers ══
  let sellers = [];
  if (bestProduct.product_id) {
    try {
      const { data: pd } = await axios.get(SERPAPI_URL, {
        params: {
          engine: "google_product", product_id: bestProduct.product_id,
          gl: "in", hl: "en", api_key: getKey()
        },
        timeout: 20000
      });
      sellers = pd.sellers_results?.online_sellers || [];
      console.log("[Shop] Step 3 — Sellers:", sellers.length);
    } catch(e) {
      console.log("[Shop] Step 3 — google_product failed:", e.message);
    }
  }

  // ══ STEP 4: Build results ══
  const seen    = new Set();
  const results = [];

  if (sellers.length) {
    // Use seller data from google_product
    for (const s of sellers) {
      const price      = parsePrice(s.base_price) || parsePrice(s.total_price) || parsePrice(s.price);
      const productUrl = s.direct_link || s.link;
      if (!price || !productUrl) continue;
      const merchant = getMerchant(s.name || s.seller || "");
      if (seen.has(merchant.name)) continue;
      seen.add(merchant.name);
      const isCurrent = currentSite && (
        productUrl.toLowerCase().includes(currentSite.toLowerCase()) ||
        merchant.name.toLowerCase().includes(currentSite.toLowerCase())
      );
      results.push({
        site: merchant.name.toLowerCase().replace(/[\s.]/g,""),
        siteName: merchant.name, color: merchant.color,
        price: (isCurrent && currentPrice > 0) ? currentPrice : price,
        url: productUrl, productUrl,
        available: true, isBest: false,
        isCurrentSite: !!isCurrent,
        confidence: isCurrent ? "exact" : "google_shopping",
        matchScore: bestScore
      });
    }
  } else {
    // ── FIXED FALLBACK: Use shopping results directly ──
    console.log("[Shop] Step 4 — Fallback: reading prices from shopping results");
    for (const p of products) {
      const price = extractPrice(p);            // ← FIXED price extractor
      const url   = p.link || p.product_link;
      if (!price || !url) {
        console.log(`  [skip] ${p.source||"?"} — price:${p.price} parsed:${price} url:${!!url}`);
        continue;
      }
      const merchant = getMerchant(p.source || "");
      if (seen.has(merchant.name)) continue;
      seen.add(merchant.name);
      const isCurrent = currentSite && (
        url.toLowerCase().includes(currentSite.toLowerCase()) ||
        merchant.name.toLowerCase().includes(currentSite.toLowerCase())
      );
      results.push({
        site: merchant.name.toLowerCase().replace(/[\s.]/g,""),
        siteName: merchant.name, color: merchant.color,
        price: (isCurrent && currentPrice > 0) ? currentPrice : price,
        url, productUrl: url,
        available: true, isBest: false,
        isCurrentSite: !!isCurrent,
        confidence: isCurrent ? "exact" : "google_shopping",
        matchScore: bestScore
      });
    }
  }

  const { results: sorted, savingsInfo } = sortAndMark(results, currentSite, currentPrice);
  const output = { results: sorted, savingsInfo, fromCache: false };

  // Only cache if we got real results
  if (sorted.length > 1) Cache.set(cacheKey, null, output);
  console.log(`[Shop] ✅ Complete — ${sorted.length} stores found`);
  return output;
}

function buildCurrentOnly(site, price) {
  if (!site || !price) return [];
  const m = getMerchant(site);
  return [{
    site, siteName: m.name, color: m.color, price,
    url: null, productUrl: null,
    available: true, isBest: true, isCurrentSite: true,
    confidence: "exact", matchScore: 100
  }];
}

module.exports = { compare };