"""
indicators.py — Full technical analysis suite for NSE stocks.
Uses pandas-ta for 20+ professional-grade indicators + candlestick patterns.
"""

import pandas as pd
import numpy as np
import pandas_ta as ta
from typing import Optional
import logging

log = logging.getLogger(__name__)


class TechnicalAnalysis:
    """Compute all technical indicators professional analysts use."""

    def compute_all(self, df: pd.DataFrame) -> dict:
        """
        Run the full indicator suite on OHLCV DataFrame.
        Returns a dict of all computed values (latest candle).
        """
        if df is None or len(df) < 30:
            return self._empty_indicators()

        df = df.copy()
        df.columns = [c.lower() for c in df.columns]

        results = {}

        # ── Trend ──────────────────────────────────────────────────────────
        results.update(self._trend(df))

        # ── Momentum ───────────────────────────────────────────────────────
        results.update(self._momentum(df))

        # ── Volatility ─────────────────────────────────────────────────────
        results.update(self._volatility(df))

        # ── Volume ─────────────────────────────────────────────────────────
        results.update(self._volume(df))

        # ── Candlestick Patterns ───────────────────────────────────────────
        results.update(self._candlestick_patterns(df))

        # ── Support / Resistance ───────────────────────────────────────────
        results.update(self._support_resistance(df))

        # ── Overall Signal ─────────────────────────────────────────────────
        results["overall_signal"]     = self._overall_signal(results)
        results["signal_strength"]    = self._signal_strength(results)
        results["trend_direction"]    = self._trend_direction(results)

        # Round all float values
        return {k: (round(v, 4) if isinstance(v, float) else v) for k, v in results.items()}

    # ── TREND ──────────────────────────────────────────────────────────────
    def _trend(self, df: pd.DataFrame) -> dict:
        close = df["close"]

        # SMAs
        sma9  = ta.sma(close, 9)
        sma21 = ta.sma(close, 21)
        sma50 = ta.sma(close, 50)
        sma200= ta.sma(close, 200) if len(df) >= 200 else pd.Series([None]*len(df))

        # EMAs
        ema9  = ta.ema(close, 9)
        ema21 = ta.ema(close, 21)

        # MACD
        macd_df = ta.macd(close, fast=12, slow=26, signal=9)
        macd_line   = macd_df.iloc[-1, 0] if macd_df is not None and not macd_df.empty else 0
        macd_signal = macd_df.iloc[-1, 1] if macd_df is not None and not macd_df.empty else 0
        macd_hist   = macd_df.iloc[-1, 2] if macd_df is not None and not macd_df.empty else 0

        # MACD crossover detection
        macd_crossover = "NONE"
        if macd_df is not None and len(macd_df) > 1:
            prev_hist = float(macd_df.iloc[-2, 2]) if not pd.isna(macd_df.iloc[-2, 2]) else 0
            curr_hist = float(macd_hist) if not pd.isna(macd_hist) else 0
            if prev_hist < 0 and curr_hist > 0:
                macd_crossover = "BULLISH_CROSSOVER"
            elif prev_hist > 0 and curr_hist < 0:
                macd_crossover = "BEARISH_CROSSOVER"

        # Ichimoku
        ichi = ta.ichimoku(df["high"], df["low"], close)
        ichi_signal = "NEUTRAL"
        if ichi is not None and len(ichi) > 0:
            try:
                span_a = ichi[0]["ISA_9"].iloc[-1] if "ISA_9" in ichi[0].columns else None
                if span_a and not pd.isna(span_a):
                    ichi_signal = "ABOVE_CLOUD" if float(close.iloc[-1]) > float(span_a) else "BELOW_CLOUD"
            except Exception:
                pass

        # Golden/Death cross
        golden_cross = death_cross = False
        if sma50 is not None and sma200 is not None:
            if not pd.isna(sma50.iloc[-1]) and not pd.isna(sma200.iloc[-1]):
                golden_cross = float(sma50.iloc[-1]) > float(sma200.iloc[-1])
                death_cross  = float(sma50.iloc[-1]) < float(sma200.iloc[-1])

        def safe(series):
            if series is None or series.empty: return None
            v = series.iloc[-1]
            return float(v) if not pd.isna(v) else None

        return {
            "sma_9":          safe(sma9),
            "sma_21":         safe(sma21),
            "sma_50":         safe(sma50),
            "sma_200":        safe(sma200),
            "ema_9":          safe(ema9),
            "ema_21":         safe(ema21),
            "macd":           float(macd_line)   if not pd.isna(macd_line)   else 0.0,
            "macd_signal":    float(macd_signal) if not pd.isna(macd_signal) else 0.0,
            "macd_histogram": float(macd_hist)   if not pd.isna(macd_hist)   else 0.0,
            "macd_crossover": macd_crossover,
            "ichimoku":       ichi_signal,
            "golden_cross":   golden_cross,
            "death_cross":    death_cross,
            "price_above_sma50":  safe(sma50) and float(close.iloc[-1]) > float(safe(sma50) or 0),
            "price_above_sma200": safe(sma200) and float(close.iloc[-1]) > float(safe(sma200) or 0),
        }

    # ── MOMENTUM ───────────────────────────────────────────────────────────
    def _momentum(self, df: pd.DataFrame) -> dict:
        close = df["close"]
        high  = df["high"]
        low   = df["low"]

        rsi14  = ta.rsi(close, 14)
        rsi21  = ta.rsi(close, 21)
        stoch  = ta.stoch(high, low, close)
        cci14  = ta.cci(high, low, close, 14)
        williams= ta.willr(high, low, close, 14)
        roc    = ta.roc(close, 10)

        def safe(series):
            if series is None or series.empty: return None
            v = series.iloc[-1]
            return float(v) if not pd.isna(v) else None

        rsi_val = safe(rsi14) or 50.0

        return {
            "rsi_14":        rsi_val,
            "rsi_21":        safe(rsi21),
            "rsi_zone":      self._rsi_zone(rsi_val),
            "stoch_k":       safe(stoch["STOCHk_14_3_3"]) if stoch is not None and "STOCHk_14_3_3" in stoch else None,
            "stoch_d":       safe(stoch["STOCHd_14_3_3"]) if stoch is not None and "STOCHd_14_3_3" in stoch else None,
            "cci_14":        safe(cci14),
            "williams_r":    safe(williams),
            "roc_10":        safe(roc),
        }

    # ── VOLATILITY ─────────────────────────────────────────────────────────
    def _volatility(self, df: pd.DataFrame) -> dict:
        close = df["close"]
        high  = df["high"]
        low   = df["low"]

        bb   = ta.bbands(close, 20, 2.0)
        atr  = ta.atr(high, low, close, 14)
        kelt = ta.kc(high, low, close, 20, 1.5)

        def safe(series):
            if series is None or series.empty: return None
            v = series.iloc[-1]
            return float(v) if not pd.isna(v) else None

        bb_upper = safe(bb["BBU_20_2.0"]) if bb is not None and "BBU_20_2.0" in bb else None
        bb_lower = safe(bb["BBL_20_2.0"]) if bb is not None and "BBL_20_2.0" in bb else None
        bb_mid   = safe(bb["BBM_20_2.0"]) if bb is not None and "BBM_20_2.0" in bb else None

        current = float(close.iloc[-1])
        bb_position = "MIDDLE"
        if bb_upper and bb_lower:
            pct = (current - bb_lower) / (bb_upper - bb_lower) if (bb_upper - bb_lower) > 0 else 0.5
            bb_position = "UPPER_BAND" if pct > 0.8 else ("LOWER_BAND" if pct < 0.2 else "MIDDLE")

        return {
            "bb_upper":      bb_upper,
            "bb_lower":      bb_lower,
            "bb_mid":        bb_mid,
            "bb_position":   bb_position,
            "atr_14":        safe(atr),
            "atr_pct":       round(safe(atr) / current * 100, 3) if safe(atr) else None,
        }

    # ── VOLUME ─────────────────────────────────────────────────────────────
    def _volume(self, df: pd.DataFrame) -> dict:
        close  = df["close"]
        volume = df["volume"]

        obv  = ta.obv(close, volume)
        vwap = ta.vwap(df["high"], df["low"], close, volume)

        avg_vol_20 = float(volume.rolling(20).mean().iloc[-1])
        curr_vol   = float(volume.iloc[-1])
        vol_ratio  = curr_vol / avg_vol_20 if avg_vol_20 > 0 else 1.0

        def safe(series):
            if series is None or series.empty: return None
            v = series.iloc[-1]
            return float(v) if not pd.isna(v) else None

        return {
            "obv":              safe(obv),
            "vwap":             safe(vwap),
            "volume_current":   int(curr_vol),
            "volume_avg_20d":   int(avg_vol_20),
            "volume_ratio":     round(vol_ratio, 2),
            "volume_spike":     vol_ratio > 1.5,
            "price_above_vwap": safe(vwap) and float(close.iloc[-1]) > float(safe(vwap) or 0),
        }

    # ── CANDLESTICK PATTERNS ───────────────────────────────────────────────
    def _candlestick_patterns(self, df: pd.DataFrame) -> dict:
        detected = []
        try:
            # pandas-ta candlestick patterns
            patterns = {
                "doji":         ta.cdl_doji(df["open"], df["high"], df["low"], df["close"]),
                "hammer":       ta.cdl_hammer(df["open"], df["high"], df["low"], df["close"]),
                "engulfing":    ta.cdl_engulfing(df["open"], df["high"], df["low"], df["close"]),
                "morning_star": ta.cdl_morningstar(df["open"], df["high"], df["low"], df["close"]),
                "evening_star": ta.cdl_eveningstar(df["open"], df["high"], df["low"], df["close"]),
                "shooting_star":ta.cdl_shootingstar(df["open"], df["high"], df["low"], df["close"]),
            }
            for name, series in patterns.items():
                if series is not None and not series.empty:
                    val = series.iloc[-1]
                    if not pd.isna(val) and val != 0:
                        bullish = val > 0
                        detected.append({
                            "pattern": name.upper(),
                            "type": "BULLISH" if bullish else "BEARISH",
                            "strength": abs(int(val))
                        })
        except Exception as e:
            log.debug(f"Candlestick detection error: {e}")

        return {
            "candlestick_patterns": detected,
            "pattern_count":        len(detected),
            "has_bullish_pattern":  any(p["type"] == "BULLISH" for p in detected),
            "has_bearish_pattern":  any(p["type"] == "BEARISH" for p in detected),
        }

    # ── SUPPORT / RESISTANCE ───────────────────────────────────────────────
    def _support_resistance(self, df: pd.DataFrame) -> dict:
        high  = df["high"].values
        low   = df["low"].values
        close = float(df["close"].iloc[-1])

        # Simple S/R: recent 20-day high/low
        resistance = float(np.max(high[-20:]))
        support    = float(np.min(low[-20:]))

        dist_to_res = (resistance - close) / close * 100
        dist_to_sup = (close - support)    / close * 100

        return {
            "resistance_20d":      round(resistance, 2),
            "support_20d":         round(support, 2),
            "dist_to_resistance":  round(dist_to_res, 2),
            "dist_to_support":     round(dist_to_sup, 2),
            "near_resistance":     dist_to_res < 2.0,
            "near_support":        dist_to_sup < 2.0,
        }

    # ── HELPERS ────────────────────────────────────────────────────────────
    def _rsi_zone(self, rsi: float) -> str:
        if rsi >= 70: return "OVERBOUGHT"
        if rsi >= 60: return "STRONG"
        if rsi >= 40: return "NEUTRAL"
        if rsi >= 30: return "WEAK"
        return "OVERSOLD"

    def _overall_signal(self, r: dict) -> str:
        bullish = 0
        bearish = 0

        if r.get("macd_crossover") == "BULLISH_CROSSOVER": bullish += 2
        if r.get("macd_crossover") == "BEARISH_CROSSOVER": bearish += 2
        if r.get("golden_cross"):          bullish += 2
        if r.get("death_cross"):           bearish += 2
        if r.get("rsi_zone") == "OVERSOLD":   bullish += 1
        if r.get("rsi_zone") == "OVERBOUGHT": bearish += 1
        if r.get("bb_position") == "LOWER_BAND": bullish += 1
        if r.get("bb_position") == "UPPER_BAND": bearish += 1
        if r.get("has_bullish_pattern"):   bullish += 1
        if r.get("has_bearish_pattern"):   bearish += 1
        if r.get("price_above_sma50"):     bullish += 1
        if r.get("volume_spike"):          bullish += 1
        if r.get("price_above_vwap"):      bullish += 1

        if bullish > bearish + 2: return "STRONG_BUY"
        if bullish > bearish:     return "BUY"
        if bearish > bullish + 2: return "STRONG_SELL"
        if bearish > bullish:     return "SELL"
        return "HOLD"

    def _signal_strength(self, r: dict) -> float:
        signals = [
            1 if r.get("macd_crossover") in ["BULLISH_CROSSOVER"] else -1 if r.get("macd_crossover") == "BEARISH_CROSSOVER" else 0,
            1 if r.get("golden_cross")        else -1 if r.get("death_cross") else 0,
            1 if r.get("rsi_zone") == "WEAK"  else -1 if r.get("rsi_zone") == "OVERBOUGHT" else 0,
            1 if r.get("has_bullish_pattern") else -1 if r.get("has_bearish_pattern") else 0,
            1 if r.get("price_above_sma50")   else -0.5,
        ]
        avg = np.mean(signals)
        return round((avg + 1) / 2, 3)  # Normalize 0-1

    def _trend_direction(self, r: dict) -> str:
        sig = r.get("overall_signal", "HOLD")
        if sig in ["STRONG_BUY", "BUY"]:   return "BULLISH"
        if sig in ["STRONG_SELL", "SELL"]:  return "BEARISH"
        return "NEUTRAL"

    def _empty_indicators(self) -> dict:
        return {
            "error": "insufficient_data",
            "overall_signal": "HOLD",
            "signal_strength": 0.5,
            "trend_direction": "NEUTRAL",
        }
