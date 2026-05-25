type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const PRICE_CACHE_TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 5_000;

const cache = new Map<string, CacheEntry<unknown>>();

function cacheKey(prefix: string, value: string): string {
  return `${prefix}:${value}`;
}

function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) {
    return null;
  }

  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }

  return hit.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + PRICE_CACHE_TTL_MS
  });
}

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    console.log(`[PRICE] Request ${url}`);
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

function extractUsdPrice(payload: unknown, token: string): number {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid price payload");
  }

  const tokenPayload = (payload as Record<string, unknown>)[token];
  if (!tokenPayload || typeof tokenPayload !== "object") {
    throw new Error(`Missing token payload for ${token}`);
  }

  const usd = (tokenPayload as Record<string, unknown>).usd;
  if (typeof usd !== "number" || !Number.isFinite(usd)) {
    throw new Error(`Missing usd price for ${token}`);
  }

  return usd;
}

export async function getTokenPrice(token: string): Promise<number> {
  const normalizedToken = normalizeToken(token);
  const key = cacheKey("price", normalizedToken);
  const cached = getCached<number>(key);
  if (cached !== null) {
    console.log(`[PRICE] Cache hit for ${normalizedToken}`);
    return cached;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(normalizedToken)}&vs_currencies=usd`;
    const payload = await fetchJsonWithTimeout(url);
    const price = extractUsdPrice(payload, normalizedToken);
    setCached(key, price);
    console.log(`[PRICE] ${normalizedToken} = ${price}`);
    return price;
  } catch {
    throw new Error(`Price fetch failed for ${normalizedToken}`);
  }
}

export async function getMultiplePrices(tokens: string[]): Promise<Record<string, number>> {
  const normalized = Array.from(new Set(tokens.map((token) => normalizeToken(token)).filter((token) => token.length > 0)));
  if (normalized.length === 0) {
    return {};
  }

  const result: Record<string, number> = {};
  const missing: string[] = [];

  for (const token of normalized) {
    const cached = getCached<number>(cacheKey("price", token));
    if (cached !== null) {
      result[token] = cached;
    } else {
      missing.push(token);
    }
  }

  if (missing.length > 0) {
    const joined = missing.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(joined)}&vs_currencies=usd`;
    const payload = await fetchJsonWithTimeout(url);

    for (const token of missing) {
      const price = extractUsdPrice(payload, token);
      result[token] = price;
      setCached(cacheKey("price", token), price);
    }
  }

  console.log(`[PRICE] Batch result for ${normalized.join(", ")}`);
  return result;
}

export async function getPriceHistory(token: string, days: number): Promise<number[]> {
  const normalizedToken = normalizeToken(token);
  const normalizedDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 1;
  const key = cacheKey("history", `${normalizedToken}:${normalizedDays}`);
  const cached = getCached<number[]>(key);
  if (cached !== null) {
    console.log(`[PRICE] History cache hit for ${normalizedToken} (${normalizedDays}d)`);
    return cached;
  }

  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(normalizedToken)}/market_chart?vs_currency=usd&days=${normalizedDays}`;
  const payload = await fetchJsonWithTimeout(url);

  if (!payload || typeof payload !== "object") {
    throw new Error(`Price history fetch failed for ${normalizedToken}`);
  }

  const pricesRaw = (payload as Record<string, unknown>).prices;
  if (!Array.isArray(pricesRaw)) {
    throw new Error(`Price history fetch failed for ${normalizedToken}`);
  }

  const closes = pricesRaw
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) {
        return null;
      }
      const close = entry[1];
      return typeof close === "number" && Number.isFinite(close) ? close : null;
    })
    .filter((value): value is number => value !== null);

  if (closes.length === 0) {
    throw new Error(`Price history fetch failed for ${normalizedToken}`);
  }

  setCached(key, closes);
  console.log(`[PRICE] History loaded for ${normalizedToken} (${normalizedDays}d, ${closes.length} points)`);
  return closes;
}
