# PriceScout Pro — Backend v3.0

## 🚀 Quick Start

### 1. Add your SerpApi key
Open `.env` and replace the placeholder:
```
SERPAPI_KEY=your_actual_key_here
```
Get a free key at → https://serpapi.com

### 2. Install dependencies
```
npm install
```

### 3. Start the server
```
node server.js
```

### 4. Verify it's working
Open in browser → http://localhost:3000/health

Should show:
```json
{ "status": "ok", "version": "3.0.0", "engine": "Google Shopping (SerpApi)", "apiKeySet": true }
```

---

## 📁 Folder Structure
```
backend/
├── .env                        ← PUT YOUR SERPAPI KEY HERE
├── package.json
├── server.js                   ← Main Express server
├── services/
│   └── shoppingService.js      ← Google Shopping logic (4-step method)
├── cache/
│   └── priceCache.js           ← 4-hour SQLite cache
└── utils/
    └── database.js             ← SQLite via sql.js (no install needed)
```

## 🔍 How the 4-Step Method Works
1. **Google Shopping Search** — searches `google_shopping` engine with cleaned query
2. **Best Match** — picks product with highest title similarity score
3. **All Sellers** — calls `google_product` API to get every store selling that product
4. **Sort & Mark** — sorts by price, marks cheapest as BEST DEAL

## 🏪 Supported Stores
Amazon.in · Flipkart · Croma · Reliance Digital · Tata CLiQ ·
Vijay Sales · Snapdeal · Meesho · Nykaa · AJIO · JioMart · Paytm Mall & more

## 📦 Dependencies
- express, cors, helmet — web server
- axios — HTTP calls to SerpApi
- dotenv — reads .env file
- sql.js — SQLite database (no native install)
