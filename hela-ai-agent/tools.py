"""
tools.py — Agent tools for the HeLa AI Information Agent.

Provides three LangChain-compatible tools:
  1. hela_docs_scraper  — Scrapes helalabs.com & docs.helalabs.com, caches for 1 hour.
  2. hela_web_search    — Live web search via DuckDuckGo (free, no API key needed).
  3. hela_explorer      — Fetches on-chain data from HeLa's block explorer (helascan.io).
"""

import time
import requests
from bs4 import BeautifulSoup
from langchain_core.tools import tool
from duckduckgo_search import DDGS

# ---------------------------------------------------------------------------
# In-memory cache — stores scraped page content with a 1-hour TTL.
# Structure: { url: { "content": str, "timestamp": float } }
# ---------------------------------------------------------------------------
_SCRAPE_CACHE: dict = {}
_CACHE_TTL_SECONDS: int = 3600  # 1 hour


def _get_cached_or_scrape(url: str) -> str:
    """
    Return cached content for *url* if it is still fresh (< 1 hour old).
    Otherwise scrape the page, store the result in the cache, and return it.
    """
    now = time.time()
    cached = _SCRAPE_CACHE.get(url)
    if cached and (now - cached["timestamp"]) < _CACHE_TTL_SECONDS:
        return cached["content"]

    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            )
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Remove script / style noise
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        # Collapse excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        content = "\n".join(lines)

        # Cap content to avoid token blow-up
        if len(content) > 12000:
            content = content[:12000] + "\n\n[...content truncated for brevity]"

        _SCRAPE_CACHE[url] = {"content": content, "timestamp": now}
        return content

    except Exception as exc:
        return f"[Scraper Error] Failed to fetch {url}: {str(exc)}"


# ---------------------------------------------------------------------------
# TOOL 1 — HeLa Docs Scraper
# ---------------------------------------------------------------------------

# Target pages that cover the most important topics across HeLa's ecosystem
_HELA_PAGES: list[str] = [
    "https://helalabs.com",
    "https://docs.helalabs.com",
    "https://docs.helalabs.com/welcome-to-hela-network/quickstart/why-do-we-need",
    "https://docs.helalabs.com/welcome-to-hela-network/quickstart/consensus-mechanism",
    "https://docs.helalabs.com/hlusd/editor",
    "https://docs.helalabs.com/hlusd/markdown",
    "https://docs.helalabs.com/hlusd/stablecoin-governance",
    "https://docs.helalabs.com/ecosystem-overview/hela-tokenomics",
    "https://docs.helalabs.com/ecosystem-overview/publish-your-docs",
    "https://docs.helalabs.com/build-on-hela/hela-architecture",
    "https://docs.helalabs.com/build-on-hela/hela-runtime-evm",
    "https://docs.helalabs.com/network-endpoints-and-explorer/network-endpoints-and-explorer",
    "https://docs.helalabs.com/wallet/metamask",
    "https://docs.helalabs.com/hela-node/hela-guardian-node",
]


@tool
def hela_docs_scraper(query: str) -> str:
    """
    Scrape official HeLa Labs websites for information.

    Use this tool when the user asks about HeLa's features, architecture,
    tokenomics, staking, HLUSD stablecoin, consensus mechanism, wallets,
    nodes, roadmap, grants, or any topic covered in HeLa's official docs.

    Args:
        query: The user's question about HeLa Labs.

    Returns:
        Concatenated text content from relevant HeLa pages.
    """
    query_lower = query.lower()

    # Map keywords to the most relevant page URLs so we don't scrape everything
    keyword_url_map: dict[str, list[str]] = {
        "tokenomics": [
            "https://docs.helalabs.com/ecosystem-overview/hela-tokenomics",
            "https://helalabs.com",
        ],
        "hlusd": [
            "https://docs.helalabs.com/hlusd/editor",
            "https://docs.helalabs.com/hlusd/markdown",
            "https://docs.helalabs.com/hlusd/stablecoin-governance",
        ],
        "stablecoin": [
            "https://docs.helalabs.com/hlusd/editor",
            "https://docs.helalabs.com/hlusd/markdown",
        ],
        "consensus": [
            "https://docs.helalabs.com/welcome-to-hela-network/quickstart/consensus-mechanism",
        ],
        "architecture": [
            "https://docs.helalabs.com/build-on-hela/hela-architecture",
        ],
        "evm": [
            "https://docs.helalabs.com/build-on-hela/hela-runtime-evm",
        ],
        "wallet": [
            "https://docs.helalabs.com/wallet/metamask",
        ],
        "metamask": [
            "https://docs.helalabs.com/wallet/metamask",
        ],
        "node": [
            "https://docs.helalabs.com/hela-node/hela-guardian-node",
        ],
        "guardian": [
            "https://docs.helalabs.com/hela-node/hela-guardian-node",
        ],
        "roadmap": [
            "https://docs.helalabs.com/ecosystem-overview/publish-your-docs",
        ],
        "grant": [
            "https://docs.helalabs.com/ecosystem-overview/hela-accelerate-grant-program",
        ],
        "explorer": [
            "https://docs.helalabs.com/network-endpoints-and-explorer/network-endpoints-and-explorer",
        ],
        "endpoint": [
            "https://docs.helalabs.com/network-endpoints-and-explorer/network-endpoints-and-explorer",
        ],
        "faucet": [
            "https://docs.helalabs.com/network-endpoints-and-explorer/images-and-media",
        ],
    }

    # Determine which pages to scrape based on keywords in the query
    urls_to_scrape: list[str] = []
    for keyword, urls in keyword_url_map.items():
        if keyword in query_lower:
            urls_to_scrape.extend(urls)

    # Always include the two main pages as a baseline
    if not urls_to_scrape:
        urls_to_scrape = [
            "https://helalabs.com",
            "https://docs.helalabs.com",
        ]

    # De-duplicate while preserving order
    seen: set[str] = set()
    unique_urls: list[str] = []
    for u in urls_to_scrape:
        if u not in seen:
            seen.add(u)
            unique_urls.append(u)

    # Scrape each URL and collect results
    results: list[str] = []
    for url in unique_urls[:5]:  # Limit to 5 pages per query to control token usage
        content = _get_cached_or_scrape(url)
        results.append(f"--- Source: {url} ---\n{content}")

    combined = "\n\n".join(results)
    return f"[hela_docs_scraper] Scraped {len(unique_urls)} page(s).\n\n{combined}"


# ---------------------------------------------------------------------------
# TOOL 2 — HeLa Web Search (DuckDuckGo — FREE, no API key needed)
# ---------------------------------------------------------------------------

@tool
def hela_web_search(query: str) -> str:
    """
    Search the live web for the latest HeLa Labs news, announcements,
    partnerships, social media updates, and market information.

    Use this tool when the user asks about recent news, price data,
    partnerships, community updates, or anything NOT covered in the
    static official docs.

    Args:
        query: The search query (automatically prefixed with "HeLa Labs").

    Returns:
        A formatted string of search results with titles, URLs, and snippets.
    """
    try:
        # Prefix the query to keep results HeLa-focused
        search_query = f"HeLa Labs blockchain {query}"

        # Use DuckDuckGo search — completely free, no API key needed
        with DDGS() as ddgs:
            results = list(ddgs.text(search_query, max_results=5))

        if not results:
            return "[hela_web_search] No results found for this query."

        # Format the results into a clean readable block
        output_parts: list[str] = []

        for idx, result in enumerate(results, start=1):
            title = result.get("title", "No title")
            url = result.get("href", result.get("link", ""))
            snippet = result.get("body", result.get("snippet", "No snippet available."))
            output_parts.append(
                f"{idx}. {title}\n   URL: {url}\n   {snippet}\n"
            )

        return "[hela_web_search] Results:\n\n" + "\n".join(output_parts)

    except Exception as exc:
        return f"[hela_web_search] Search failed: {str(exc)}"


# ---------------------------------------------------------------------------
# TOOL 3 — HeLa Block Explorer
# ---------------------------------------------------------------------------

# The public HeLa explorer is at helascan.io
_HELASCAN_API_BASE = "https://backend.helascan.io/api"


@tool
def hela_explorer(query: str) -> str:
    """
    Fetch on-chain data from the HeLa block explorer (helascan.io).

    Attempts to retrieve live blockchain statistics such as latest blocks,
    transactions, and network stats.  If the explorer API is unavailable,
    falls back to a web search via DuckDuckGo.

    Use this tool when the user asks about on-chain activity, block data,
    transaction stats, validators, or network performance.

    Args:
        query: The user's question about on-chain data.

    Returns:
        Formatted on-chain data or web-search fallback results.
    """
    explorer_data_parts: list[str] = []

    # --- Attempt 1: Try the helascan.io REST API ---
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
        }

        # Try the stats endpoint
        stats_url = f"{_HELASCAN_API_BASE}/v2/stats"
        stats_resp = requests.get(stats_url, headers=headers, timeout=10)

        if stats_resp.status_code == 200:
            stats = stats_resp.json()
            explorer_data_parts.append("=== HeLa Network Statistics ===")
            for key, value in stats.items():
                if isinstance(value, (str, int, float)):
                    readable_key = key.replace("_", " ").title()
                    explorer_data_parts.append(f"  {readable_key}: {value}")

        # Try latest blocks
        blocks_url = f"{_HELASCAN_API_BASE}/v2/blocks?type=block"
        blocks_resp = requests.get(blocks_url, headers=headers, timeout=10)

        if blocks_resp.status_code == 200:
            blocks_data = blocks_resp.json()
            items = blocks_data.get("items", blocks_data.get("data", []))
            if items:
                explorer_data_parts.append("\n=== Latest Blocks ===")
                for block in items[:5]:
                    block_num = block.get("height", block.get("number", "N/A"))
                    tx_count = block.get("tx_count", block.get("transactions_count", "N/A"))
                    timestamp = block.get("timestamp", "N/A")
                    explorer_data_parts.append(
                        f"  Block #{block_num} | Txns: {tx_count} | Time: {timestamp}"
                    )

        # Try latest transactions
        txns_url = f"{_HELASCAN_API_BASE}/v2/transactions"
        txns_resp = requests.get(txns_url, headers=headers, timeout=10)

        if txns_resp.status_code == 200:
            txns_data = txns_resp.json()
            items = txns_data.get("items", txns_data.get("data", []))
            if items:
                explorer_data_parts.append("\n=== Latest Transactions ===")
                for tx in items[:5]:
                    tx_hash = tx.get("hash", "N/A")
                    status = tx.get("status", tx.get("result", "N/A"))
                    value = tx.get("value", "N/A")
                    explorer_data_parts.append(
                        f"  Tx: {tx_hash[:20]}... | Status: {status} | Value: {value}"
                    )

    except Exception:
        # Explorer API is not reachable — will fall back below
        pass

    # If we got meaningful data from the explorer, return it
    if explorer_data_parts:
        return "[hela_explorer] Live on-chain data:\n\n" + "\n".join(explorer_data_parts)

    # --- Attempt 2: Scrape the explorer home page for summary stats ---
    try:
        content = _get_cached_or_scrape("https://helascan.io")
        if "[Scraper Error]" not in content and len(content) > 100:
            return (
                "[hela_explorer] Explorer page data:\n\n"
                f"{content[:6000]}"
            )
    except Exception:
        pass

    # --- Attempt 3: Fall back to free DuckDuckGo web search ---
    try:
        return hela_web_search.invoke({"query": f"HeLa blockchain on-chain {query}"})
    except Exception:
        pass

    return (
        "[hela_explorer] The HeLa block explorer API is currently unreachable "
        "and the fallback web search also failed. Please try again later."
    )


# ---------------------------------------------------------------------------
# Helper — returns all tools as a list for the agent to consume
# ---------------------------------------------------------------------------

def get_all_tools() -> list:
    """Return a list of all available LangChain tools."""
    return [hela_docs_scraper, hela_web_search, hela_explorer]
