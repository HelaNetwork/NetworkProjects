# HeLa AI Agent 🔗

> An AI-powered information agent for **HeLa Labs** — fetches real-time data from HeLa's website, documentation, news feeds, and block explorer, then returns clean summarised answers via a premium chat interface.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.45-FF4B4B?style=flat-square&logo=streamlit&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?style=flat-square&logo=chainlink&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-3.0_Flash_Preview-4285F4?style=flat-square&logo=google&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Live Docs Scraper** | Scrapes `helalabs.com` and `docs.helalabs.com` with 1-hour caching |
| **Web Search** | Real-time search for HeLa news, announcements, and social via DuckDuckGo (FREE) |
| **Block Explorer** | Fetches on-chain stats from `helascan.io` with web-search fallback |
| **Gemini 3.0 Flash** | Powered by Google's fast, free-tier LLM for accurate, well-formatted answers |
| **Session-only Keys** | Users enter their own API key — never saved to disk |
| **Premium Dark UI** | Custom CSS dark theme with HeLa branding, chat bubbles, and animations |
| **Source Badges** | Every answer shows where the data came from |
| **Error Handling** | Graceful fallbacks — the app never crashes |

---

## 📁 Project Structure

```
HEla/
├── app.py              # Streamlit frontend — UI, CSS, chat logic
├── agent.py            # LangChain agent — ReAct agent with Gemini
├── tools.py            # Custom tools — scraper, search, explorer
├── requirements.txt    # Pinned Python dependencies
├── .env.example        # Shows which API keys are needed
└── README.md           # This file
```

---

## 🔑 Prerequisites

You need only **ONE** API key — and it's **FREE**:

| Key | Where to get it | Free tier? |
|---|---|---|
| **Google Gemini API Key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ✅ Yes — generous free tier |

> **No Tavily or Anthropic keys needed!** Web search uses DuckDuckGo (completely free, no API key required).

---

## 🚀 Run Locally — Step by Step

### 1. Clone or download this project

```bash
git clone <your-repo-url>
cd HEla
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the app

```bash
streamlit run app.py
```

### 5. Use the app

1. The app opens in your browser at `http://localhost:8501`
2. Enter your **Gemini API key** in the sidebar (get one free at [aistudio.google.com](https://aistudio.google.com/apikey))
3. Type a question like **"What is HeLa staking?"** or **"Latest HeLa news"**
4. The agent fetches live data and returns a formatted answer with sources

---

## ☁️ Deploy on Streamlit Cloud — Step by Step

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "HeLa AI Agent v1.0"
git remote add origin https://github.com/YOUR_USERNAME/hela-ai-agent.git
git push -u origin main
```

### 2. Deploy on Streamlit Cloud

1. Go to [share.streamlit.io](https://share.streamlit.io/)
2. Click **"New app"**
3. Connect your GitHub repository
4. Set:
   - **Repository:** `YOUR_USERNAME/hela-ai-agent`
   - **Branch:** `main`
   - **Main file path:** `app.py`
5. Click **"Deploy"**

### 3. That's it!

- No environment variables needed on the server — users enter their own API key at runtime
- The app URL will look like: `https://your-app-name.streamlit.app`
- Share the URL with your users

---

## 🔧 Customisation Guide

### Change the LLM model
In `agent.py`, modify the `model` parameter:
```python
llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",  # Change to gemini-2.0-pro, gemini-2.0-flash-lite, etc.
    ...
)
```

### Add new scraping targets
In `tools.py`, add URLs to the `_HELA_PAGES` list and keyword mappings to `keyword_url_map`.

### Modify the theme
In `app.py`, edit the CSS variables in the `:root` block:
```css
--hela-teal: #1D9E75;        /* Primary accent */
--bg-primary: #0B0F19;       /* Background */
--bg-secondary: #111827;     /* Secondary background */
```

---

## 💰 Cost Comparison

| Provider | Model | Free Tier | Paid Cost |
|---|---|---|---|
| **Google Gemini** ✅ | Gemini 3.0 Flash Preview | ✅ 15 RPM, 1M tokens/min | Very cheap |
| ~~Anthropic~~ | ~~Claude Sonnet~~ | ~~$5 credit only~~ | ~~$3/$15 per MTok~~ |
| ~~Tavily~~ | ~~Web Search~~ | ~~1K searches/mo~~ | ~~$50+/mo~~ |

**This project now runs entirely FREE** using Google Gemini + DuckDuckGo! 🎉

---

## 🛡️ Security Notes

- **No API keys are stored on disk** — keys live in Streamlit session state only
- **No `.env` file is read** — the `.env.example` is purely for documentation
- **Keys are cleared** when the user closes their browser tab
- **Each user provides their own key** — no shared credentials

---

## 📝 License

This project is provided as-is for commercial use by the purchaser.

---

<div align="center">
  <strong>Built with ❤️ for HeLa Labs</strong>
</div>
