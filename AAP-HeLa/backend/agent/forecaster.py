"""
AAP — Forecasting Engine
Uses EMA-based forecasting with confidence bands.
Prophet is used if installed, else falls back to numpy EMA.
"""
from __future__ import annotations
import math, random, datetime
import numpy as np
from typing import TypedDict


class ForecastResult(TypedDict):
    symbol:     str
    asset_type: str
    horizon_days: int
    dates:       list[str]
    predicted:   list[float]
    upper_bound: list[float]
    lower_bound: list[float]
    trend:       str          # BULLISH | BEARISH | SIDEWAYS
    confidence:  float        # 0.0 – 1.0
    method:      str          # "prophet" | "ema"


class ForecastEngine:
    """Generates price forecasts using EMA (or Prophet when available)."""

    def forecast(
        self,
        symbol: str,
        asset_type: str = "EQUITY",
        horizon_days: int = 30,
        historical_prices: list[float] | None = None,
        current_price: float | None = None,
    ) -> ForecastResult:
        try:
            return self._prophet_forecast(symbol, asset_type, horizon_days, historical_prices, current_price)
        except Exception:
            return self._ema_forecast(symbol, asset_type, horizon_days, historical_prices, current_price)

    def _ema_forecast(
        self,
        symbol: str,
        asset_type: str,
        horizon_days: int,
        historical_prices: list[float] | None,
        current_price: float | None,
    ) -> ForecastResult:
        # Simulate historical prices if not provided
        if not historical_prices or len(historical_prices) < 10:
            base = current_price or self._default_price(symbol)
            historical_prices = self._simulate_history(base, 90)

        prices = np.array(historical_prices, dtype=float)
        span   = min(20, len(prices))

        # Exponential moving average
        alpha = 2.0 / (span + 1)
        ema   = float(prices[-1])
        for p in prices[-span:]:
            ema = alpha * p + (1 - alpha) * ema

        # Volatility (std of daily returns)
        returns = np.diff(prices) / prices[:-1]
        vol     = float(np.std(returns)) if len(returns) > 1 else 0.02

        # Trend from last N days
        trend_window = prices[-min(14, len(prices)):]
        slope = (trend_window[-1] - trend_window[0]) / len(trend_window) / trend_window[0]
        trend_label = "BULLISH" if slope > 0.002 else "BEARISH" if slope < -0.002 else "SIDEWAYS"

        # Project forward
        dates, predicted, upper, lower = [], [], [], []
        price = ema
        today = datetime.date.today()
        for i in range(1, horizon_days + 1):
            drift  = slope * price
            noise  = random.gauss(0, vol * price * 0.3)
            price  = max(price + drift + noise, price * 0.5)
            band   = vol * price * math.sqrt(i) * 1.65  # 90% CI

            dates.append((today + datetime.timedelta(days=i)).isoformat())
            predicted.append(round(price, 2))
            upper.append(round(price + band, 2))
            lower.append(round(max(price - band, 0), 2))

        confidence = max(0.3, 0.85 - vol * 5)

        return ForecastResult(
            symbol=symbol, asset_type=asset_type, horizon_days=horizon_days,
            dates=dates, predicted=predicted, upper_bound=upper, lower_bound=lower,
            trend=trend_label, confidence=round(confidence, 3), method="ema",
        )

    def _prophet_forecast(self, symbol, asset_type, horizon_days, historical_prices, current_price):
        from prophet import Prophet
        import pandas as pd

        base = current_price or self._default_price(symbol)
        hist = historical_prices or self._simulate_history(base, 90)
        today = datetime.date.today()
        dates_hist = [(today - datetime.timedelta(days=len(hist)-i)).isoformat() for i in range(len(hist))]
        df = pd.DataFrame({"ds": dates_hist, "y": hist})

        m = Prophet(daily_seasonality=False, weekly_seasonality=True)
        m.fit(df)
        future = m.make_future_dataframe(periods=horizon_days)
        forecast = m.predict(future).tail(horizon_days)

        dates     = [str(d.date()) for d in forecast["ds"]]
        predicted = [round(v, 2) for v in forecast["yhat"].tolist()]
        upper     = [round(v, 2) for v in forecast["yhat_upper"].tolist()]
        lower     = [round(max(v, 0), 2) for v in forecast["yhat_lower"].tolist()]

        slope = (predicted[-1] - predicted[0]) / len(predicted) / (predicted[0] or 1)
        trend = "BULLISH" if slope > 0.002 else "BEARISH" if slope < -0.002 else "SIDEWAYS"

        return ForecastResult(
            symbol=symbol, asset_type=asset_type, horizon_days=horizon_days,
            dates=dates, predicted=predicted, upper_bound=upper, lower_bound=lower,
            trend=trend, confidence=0.82, method="prophet",
        )

    def _simulate_history(self, base: float, days: int) -> list[float]:
        prices, price = [], base * 0.88
        for _ in range(days):
            price *= (1 + random.gauss(0.001, 0.018))
            prices.append(round(price, 2))
        return prices

    def _default_price(self, symbol: str) -> float:
        defaults = {
            "RELIANCE": 2850, "TCS": 3920, "HDFC": 1720, "INFY": 1480,
            "WIPRO": 510, "ICICIBANK": 1100, "KOTAKBANK": 1780, "BHARTIARTL": 1650,
            "bitcoin": 67000, "ethereum": 3200, "solana": 148, "bnb": 590,
        }
        return defaults.get(symbol, 1000.0)
