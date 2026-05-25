# Trovia - Quick Start Guide

Welcome to **Trovia**, a decentralized AI agent marketplace on HeLa Chain!

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Visit [http://localhost:3000](http://localhost:3000)

**That's it! The app is running.** ✨

---

## 📋 What You Can Do Now

### Without Configuration
- ✅ Browse all pages and routes
- ✅ View agent details
- ✅ Use wallet connect button (MetaMask)
- ✅ Interact with agent chat interface
- ✅ Fill out forms

### With Configuration (Optional)
Add your Gemini API key to `.env.local` to enable real AI responses:

1. Get API key from [Google AI Studio](https://aistudio.google.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```
3. Restart dev server

---

## 📍 Key Pages to Visit

| Page | URL | Purpose |
|------|-----|---------|
| Landing | http://localhost:3000 | Hero, features, CTAs |
| Marketplace | http://localhost:3000/marketplace | Browse 6 agent types |
| Agent Detail | http://localhost:3000/agent/1 | Agent info + activation form |
| Agent Chat | http://localhost:3000/agent/3/run | Chat with agent (demo) |
| Dashboard | http://localhost:3000/dashboard | Your active agents |
| Publish | http://localhost:3000/publish | List a new agent |

---

## 🎨 Design System

**Color Scheme:**
- Primary: White (`#ffffff`)
- Background: Black (`#000000`)
- Accent: Red/Live Signal (`#FF3B3B`)

**Typography:**
- Headlines: Bebas Neue
- Body: Space Grotesk
- Code: JetBrains Mono

**Layout:**
- Dark mode by default
- Responsive grid layouts
- 24px dot grid background

---

## 🏗️ Project Structure

```
app/                  ← Pages and routes
components/          ← Reusable React components
lib/                 ← Utilities and types
api/                 ← Backend routes
types/               ← TypeScript definitions
```

See `PROJECT_STRUCTURE.md` for full details.

---

## 💻 Common Commands

```bash
# Development
npm run dev              # Start dev server (hot reload)

# Production
npm run build           # Create optimized build
npm start              # Run production server

# Quality checks
npm run lint           # Check code with ESLint
```

---

## 🔌 Integration Points

### Smart Contracts
The frontend is ready to connect to:
- `AgentRegistry` - Stores agents
- `AgentEscrow` - Handles payments
- `AgentExecutor` - Logs executions

Update contract addresses in `.env.local` once deployed.

### MetaMask
The `<WalletConnect />` component handles:
- Wallet connection
- Network switching to HeLa (Chain ID: 8668)
- Address display

### Gemini AI
Two interactive agents use Gemini:
- **Social Sentinel** (Agent 3) - Content reply generator
- **Business Assistant** (Agent 7) - Business Q&A

Visit `/agent/3/run` or `/agent/7/run` to test.

---

## ❓ FAQ

**Q: Why is the dev server slow on first load?**  
A: It's compiling. After first load, hot reload is instant.

**Q: Can I use this without MetaMask?**  
A: Yes! Most pages work. Only smart contract interactions need MetaMask.

**Q: Where do I add my API keys?**  
A: Copy `.env.example` to `.env.local` and fill in values.

**Q: How do I deploy this?**  
A: Use Vercel (recommended) or any Node.js hosting. See `README.md`.

---

## 📚 Learn More

- **Development Guide**: See `DEVELOPMENT.md`
- **Full Documentation**: See `README.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`

---

## 🐛 Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```

### Styles not showing?
```bash
rm -rf .next
npm run dev
```

### Module not found?
Make sure imports use `@/components/...` format.

---

## 🎯 Next Steps

1. **Explore the code**: Open files in `components/` and `app/`
2. **Test the UI**: Visit all pages and interact with forms
3. **Read the docs**: Check `README.md` and `DEVELOPMENT.md`
4. **Connect wallet**: Install MetaMask and test wallet connection
5. **Deploy**: Push to Vercel when ready

---

## 📞 Support

- **Issues**: Check GitHub issues or create one
- **Questions**: Ask in team chat
- **Documentation**: See README.md and DEVELOPMENT.md

---

**Built with ❤️ for DevClash 2026**

Happy hacking! 🚀
