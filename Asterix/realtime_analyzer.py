import sys
import os
import math
import pandas as pd

# Add directories to path so we can import from them
sys.path.append(r'c:\final\devclash\pipeline')
sys.path.append(r'c:\final\agent')

from pipeline import collect_market_data, collect_news_data, normalize_data, clean_data, transform_features, SYMBOLS
from agent import run_agent

def safe_float(val, default=0.0):
    if pd.isna(val):
        return default
    return float(val)

def run_realtime_analyzer():
    print("Starting real-time pre-crises analyzer...", flush=True)
    for symbol in SYMBOLS:
        print(f"\n[{symbol}] Collecting data...", flush=True)
        try:
            market_raw = collect_market_data(symbol)
            news_raw = collect_news_data(symbol)

            if market_raw.empty:
                print(f"[{symbol}] No market data found.", flush=True)
                continue

            market_norm, news_norm = normalize_data(market_raw, news_raw)

            market_clean = clean_data(market_norm, 'market')
            news_clean = clean_data(news_norm, 'news')

            market_features = transform_features(market_clean, 'market')
            news_features = transform_features(news_clean, 'news')

            if market_features.empty:
                print(f"[{symbol}] Not enough market data after cleaning.", flush=True)
                continue
            
            latest_market = market_features.iloc[-1]
            
            price_change_pct = safe_float(latest_market.get('trend_direction', 0.0)) * 100

            market_data_dict = {
                "price": safe_float(latest_market.get('Close')),
                "price_change_pct": price_change_pct,
                "volume": safe_float(latest_market.get('Volume')),
                "avg_volume": safe_float(market_features['Volume'].mean()),
                "rsi_14": safe_float(latest_market.get('rsi'), 50.0),
                "macd": safe_float(latest_market.get('macd'), 0.0),
                "macd_signal": safe_float(latest_market.get('macd_signal'), 0.0)
            }

            news_list = []
            if not news_features.empty:
                # Get the top 10 most recent news
                recent_news = news_features.sort_values(by='timestamp', ascending=False).head(10)
                for _, row in recent_news.iterrows():
                    date_str = row['timestamp'].strftime('%Y-%m-%d') if hasattr(row['timestamp'], 'strftime') else str(row['timestamp'])
                    news_list.append({
                        "title": row['title'],
                        "source": "NewsAPI",
                        "date": date_str[:10],
                        "body": str(row['content'])
                    })
            
            agent_input = {
                "ticker": symbol,
                "company_name": symbol,
                "market_data": market_data_dict,
                "news": news_list
            }

            print(f"[{symbol}] Running agent analysis...", flush=True)
            result = run_agent(agent_input)
            print(f"[{symbol}] Analysis complete! Score: {result.scores.crisis_score}/100. Expected Time: {result.expected_crisis_time}", flush=True)
        except Exception as e:
            print(f"[{symbol}] Error during analysis: {e}", flush=True)

if __name__ == "__main__":
    run_realtime_analyzer()
