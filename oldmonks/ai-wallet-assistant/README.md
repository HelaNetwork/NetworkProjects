# AI Wallet Assistant

AI crypto security tool: Paste tx data → OpenAI analysis → Brutalist UI + persistent history.

## Structure
```
ai-wallet-assistant/
├── backend/     # Express + OpenAI API
│   ├── index.js
│   ├── .env.example
│   └── package.json
└── frontend/    # Next.js App Router
    ├── app/     # Pages, components
    ├── lib/     # History utils
    ├── TODO.md  # Feature complete ✅
    └── README.md
```

## Run Full Stack
1. Backend: `cd backend && cp .env.example .env && node index.js`
2. Frontend: `cd frontend && npm i && npm run dev`

## Recent Improvements (BLACKBOXAI)
- Backend OpenAI fully integrated ✅
- Frontend history auto-save (analyze/chat) ✅
- History details chat replay ✅
- Responsive brutalist UI ✅
- .env.example + bug fixes ✅

Test: Analyze drainer tx → Check /history.

**Production ready.** Deploy frontend Vercel, backend Railway.
