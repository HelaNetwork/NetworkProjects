"""
market_data.py — Real-time and historical market data for NSE stocks.
Uses yfinance (free, no API key) + NSE India data.
Simulates intraday data for stocks not available via free APIs.
"""

import yfinance as yf
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
from typing import Optional
import logging

log = logging.getLogger(__name__)

# NSE symbol → Yahoo Finance suffix mapping
NSE_TO_YAHOO = {
    "RELIANCE":    "RELIANCE.NS",
    "TCS":         "TCS.NS",
    "HDFC":        "HDFCBANK.NS",
    "INFY":        "INFY.NS",
    "WIPRO":       "WIPRO.NS",
    "BHARTIARTL":  "BHARTIARTL.NS",
    "ICICIBANK":   "ICICIBANK.NS",
    "KOTAKBANK":   "KOTAKBANK.NS",
    "AXISBANK":    "AXISBANK.NS",
    "SBIN":        "SBIN.NS",
    "HINDUNILVR":  "HINDUNILVR.NS",
    "ITC":         "ITC.NS",
}

# India VIX proxy
INDIA_VIX_PROXY = "^VIX"

class MarketData:
    """Fetches OHLCV + fundamental data for NSE stocks."""

    def __init__(self):
        self.cache: dict = {}
        self.cache_ttl = 60  # seconds

    def get_price_history(
        self,
        symbol: str,
        period:   str = "3mo",
        interval: str = "1d"
    ) -> Optional[pd.DataFrame]:
        """
        Fetch OHLCV history for an NSE symbol.
        period:   1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y
        interval: 1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo
        """
        yahoo_sym = NSE_TO_YAHOO.get(symbol, f"{symbol}.NS")
        try:
            ticker = yf.Ticker(yahoo_sym)
            df = ticker.history(period=period, interval=interval)
            if df.empty:
                log.warning(f"No data for {symbol} ({yahoo_sym})")
                return None
            df.index = pd.to_datetime(df.index)
            df.columns = [c.lower() for c in df.columns]
            return df
        except Exception as e:
            log.error(f"Error fetching {symbol}: {e}")
            return self._generate_synthetic_data(symbol)

    def get_current_price(self, symbol: str) -> dict:
        """Get latest price snapshot."""
        yahoo_sym = NSE_TO_YAHOO.get(symbol, f"{symbol}.NS")
        try:
            ticker = yf.Ticker(yahoo_sym)
            info = ticker.fast_info
            hist = ticker.history(period="2d", interval="1d")
            
            if hist.empty:
                return self._synthetic_price(symbol)

            current = float(hist["Close"].iloc[-1])
            prev    = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
            change  = current - prev
            change_pct = (change / prev) * 100 if prev > 0 else 0.0

            return {
                "symbol":       symbol,
                "current_price": round(current, 2),
                "prev_close":    round(prev, 2),
                "change":        round(change, 2),
                "change_pct":    round(change_pct, 2),
                "currency":      "INR",
                "timestamp":     datetime.now().isoformat(),
                "market_cap":    getattr(info, "market_cap", None),
                "volume":        int(hist["Volume"].iloc[-1]) if not hist.empty else 0,
                "52w_high":      getattr(info, "year_high", None),
                "52w_low":       getattr(info, "year_low", None),
            }
        except Exception as e:
            log.error(f"Price fetch failed for {symbol}: {e}")
            return self._synthetic_price(symbol)

    def get_fundamentals(self, symbol: str) -> dict:
        """Get P/E, EPS, sector etc."""
        yahoo_sym = NSE_TO_YAHOO.get(symbol, f"{symbol}.NS")
        try:
            ticker = yf.Ticker(yahoo_sym)
            info   = ticker.info
            return {
                "pe_ratio":       info.get("trailingPE"),
                "eps":            info.get("trailingEps"),
                "sector":         info.get("sector"),
                "industry":       info.get("industry"),
                "market_cap":     info.get("marketCap"),
                "debt_to_equity": info.get("debtToEquity"),
                "roe":            info.get("returnOnEquity"),
                "revenue_growth": info.get("revenueGrowth"),
            }
        except Exception:
            return {}

    def get_market_breadth(self) -> dict:
        """Nifty 50 breadth — advance/decline, VIX."""
        try:
            nifty = yf.Ticker("^NSEI")
            vix   = yf.Ticker("^VIX")

            nifty_hist = nifty.history(period="2d", interval="1d")
            vix_hist   = vix.history(period="2d", interval="1d")

            nifty_price = float(nifty_hist["Close"].iloc[-1]) if not nifty_hist.empty else 0
            nifty_prev  = float(nifty_hist["Close"].iloc[-2]) if len(nifty_hist) > 1 else nifty_price
            vix_level   = float(vix_hist["Close"].iloc[-1])   if not vix_hist.empty  else 15.0

            return {
                "nifty50":       round(nifty_price, 2),
                "nifty_change":  round(nifty_price - nifty_prev, 2),
                "nifty_trend":   "BULLISH" if nifty_price > nifty_prev else "BEARISH",
                "india_vix":     round(vix_level, 2),
                "vix_sentiment": self._vix_to_sentiment(vix_level),
                "timestamp":     datetime.now().isoformat(),
            }
        except Exception:
            return {
                "nifty50": 22500.0,
                "india_vix": 13.5,
                "nifty_trend": "NEUTRAL",
                "vix_sentiment": "LOW_FEAR",
                "timestamp": datetime.now().isoformat(),
            }

    def _vix_to_sentiment(self, vix: float) -> str:
        if vix < 12:  return "VERY_LOW_FEAR"
        if vix < 16:  return "LOW_FEAR"
        if vix < 20:  return "MODERATE_FEAR"
        if vix < 28:  return "HIGH_FEAR"
        return "EXTREME_FEAR"

    def _generate_synthetic_data(self, symbol: str) -> pd.DataFrame:
        """Generate realistic synthetic OHLCV data when API unavailable."""
        base_prices = {
            "RELIANCE": 2850, "TCS": 3900, "HDFC": 1650,
            "INFY": 1420, "WIPRO": 490, "ICICIBANK": 1100,
        }
        base = base_prices.get(symbol, 1000)
        dates = pd.date_range(end=datetime.now(), periods=90, freq="D")
        np.random.seed(hash(symbol) % 1000)
        returns = np.random.normal(0.0005, 0.015, len(dates))
        prices  = base * np.cumprod(1 + returns)
        df = pd.DataFrame({
            "open":   prices * np.random.uniform(0.998, 1.002, len(dates)),
            "high":   prices * np.random.uniform(1.001, 1.025, len(dates)),
            "low":    prices * np.random.uniform(0.975, 0.999, len(dates)),
            "close":  prices,
            "volume": np.random.randint(1_000_000, 10_000_000, len(dates)),
        }, index=dates)
        return df

    def _synthetic_price(self, symbol: str) -> dict:
        base_prices = {
            "RELIANCE": 2850, "TCS": 3900, "HDFC": 1650,
            "INFY": 1420, "WIPRO": 490,
        }
        price = base_prices.get(symbol, 1000) * np.random.uniform(0.98, 1.02)
        return {
            "symbol": symbol,
            "current_price": round(price, 2),
            "prev_close": round(price * 0.995, 2),
            "change": round(price * 0.005, 2),
            "change_pct": 0.5,
            "currency": "INR",
            "timestamp": datetime.now().isoformat(),
            "52w_high": round(price * 1.2, 2),
            "52w_low":  round(price * 0.8, 2),
            "volume": 5_000_000,
        }


# News sentiment fetcher
class NewsSentiment:
    """
    Fetches financial news and computes sentiment via Gemini.
    Free fallback uses keyword-based scoring when API unavailable.
    """

    POSITIVE_KEYWORDS = [
        "profit", "growth", "beat", "surge", "rally", "strong", "upgrade",
        "buy", "bullish", "record", "expand", "win", "partner", "deal",
        "raised", "dividend", "outperform", "positive", "gain",
    ]
    NEGATIVE_KEYWORDS = [
        "loss", "fall", "miss", "decline", "bearish", "downgrade", "sell",
        "weak", "risk", "penalty", "fine", "fraud", "drop", "cut", "slump",
    ]

    def get_sentiment(self, symbol: str, gemini_client=None) -> dict:
        """Get news sentiment for a stock symbol."""
        # Try to fetch from free API
        headlines = self._fetch_headlines(symbol)

        if gemini_client and headlines:
            score = self._gemini_sentiment(symbol, headlines, gemini_client)
        else:
            score = self._keyword_sentiment(headlines)

        return {
            "symbol":          symbol,
            "sentiment_score": round(score, 3),
            "sentiment_label": self._score_to_label(score),
            "headlines_used":  len(headlines),
            "headlines":       headlines[:3],
            "timestamp":       datetime.now().isoformat(),
        }

    def _fetch_headlines(self, symbol: str) -> list[str]:
        """Try to get recent headlines. Falls back to synthetic."""
        try:
            url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={symbol}.NS&region=IN&lang=en-IN"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                import xml.etree.ElementTree as ET
                root  = ET.fromstring(resp.content)
                items = root.findall(".//item/title")
                return [i.text for i in items[:10] if i.text]
        except Exception:
            pass
        # Synthetic headlines for demo
        return self._synthetic_headlines(symbol)

    def _keyword_sentiment(self, headlines: list[str]) -> float:
        if not headlines:
            return 0.0
        total = 0.0
        for h in headlines:
            h = h.lower()
            pos = sum(1 for kw in self.POSITIVE_KEYWORDS if kw in h)
            neg = sum(1 for kw in self.NEGATIVE_KEYWORDS if kw in h)
            total += (pos - neg) / max(pos + neg, 1)
        return max(-1.0, min(1.0, total / len(headlines)))

    def _gemini_sentiment(self, symbol: str, headlines: list[str], client) -> float:
        prompt = f"""Analyze these financial news headlines for {symbol} stock.
Return a single number between -1.0 (very negative) and +1.0 (very positive).
Just the number, nothing else.

Headlines:
{chr(10).join(f'- {h}' for h in headlines[:5])}"""
        try:
            resp = client.generate_content(prompt)
            return float(resp.text.strip())
        except Exception:
            return self._keyword_sentiment(headlines)

    def _score_to_label(self, score: float) -> str:
        if score >= 0.6:  return "STRONGLY_POSITIVE"
        if score >= 0.2:  return "POSITIVE"
        if score >= -0.2: return "NEUTRAL"
        if score >= -0.6: return "NEGATIVE"
        return "STRONGLY_NEGATIVE"

    def _synthetic_headlines(self, symbol: str) -> list[str]:
        templates = {
            "RELIANCE": [
                "Reliance Industries Q4 profit surges 12% on strong retail and digital growth",
                "JioCinema signs deal with IPL — positive for digital revenue",
                "Reliance Retail expands to 200 new cities",
            ],
            "TCS": [
                "TCS wins $500M deal with European banking consortium",
                "TCS Q4 revenue beats estimates on strong BFSI demand",
                "TCS announces 100% variable pay for employees — positive morale signal",
            ],
            "HDFC": [
                "HDFC Bank credit growth at 15% YoY, NPA stable",
                "HDFC Bank launches new UPI feature targeting 50M users",
            ],
            "INFY": [
                "Infosys raises FY27 revenue guidance to 8-10%",
                "Infosys AI division wins 3 Fortune 500 contracts",
            ],
        }
        return templates.get(symbol, [
            f"{symbol} reports quarterly results in line with estimates",
            f"{symbol} management confident about H2FY27 outlook",
        ])
