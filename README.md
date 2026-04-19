# 💰 OpportuFind v3.0

Most accurate price comparison Chrome Extension — powered by Puppeteer.

---

## ✅ SETUP IN 3 STEPS

### STEP 1 — Install Backend (do once)
Open a terminal (Command Prompt / VS Code terminal):
```
cd pricescout-final/backend
npm install
```
⚠️ This downloads Chromium (~170MB) — takes 2-5 minutes, only once.

### STEP 2 — Start Backend (every time you want to use extension)
```
node server.js
```
You should see: 🚀 PriceScout backend running → http://localhost:3000

Keep this terminal OPEN while using the extension.

### STEP 3 — Load Extension in Chrome
1. Open Chrome → go to: chrome://extensions/
2. Turn ON "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the "extension" folder inside pricescout-final
5. Done! ✅

---

## HOW TO USE
1. Open any Amazon.in or Flipkart product page
2. Wait 5-15 seconds
3. Widget appears on right side with prices from all 3 sites!

---

## WHY IT'S ACCURATE
- Uses real Puppeteer browser (not HTML scraping)
- Saves price history in SQLite database
- Shows AI Deal Score ("Is this a good time to buy?")
- 4-hour cache makes repeat checks instant

---

## NEED HELP?
- Widget says "Backend offline"? → Run: node server.js in backend folder
- npm install fails? → Make sure Node.js is installed: https://nodejs.org
