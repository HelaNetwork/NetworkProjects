# Financial Data Pipeline

This pipeline collects, processes, and stores financial market data and news, then provides processed features for an AI agent.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Get API keys:
   - Sign up for [NewsAPI](https://newsapi.org/) and get your API key.
   - Update `.env` with your `NEWSAPI_KEY`.

3. Configure symbols and paths in `.env` if needed.

## Run

To run the pipeline once:
```bash
python pipeline.py
```

The pipeline will:
- Collect market data from Yahoo Finance
- Collect news from NewsAPI
- Normalize and clean data
- Transform into features (technical indicators, sentiment)
- Store in SQLite database (`data_pipeline.db`)
- Export latest data to `../output/pipeline_output.json` for the AI agent

For continuous operation, the script includes a scheduler that runs every hour.

## Database Schema

- `market_data`: timestamp, Open, High, Low, Close, Volume, symbol, type, rsi, macd, macd_signal, trend_direction, volume_spike
- `news_data`: timestamp, type, title, content, url, sentiment, keyword_signal

## Integration with AI Agent

The pipeline outputs to `../output/pipeline_output.json`, which can be read by the Node.js backend or directly by the AI agent.

To merge with another system, import the processed data from the database or JSON file.