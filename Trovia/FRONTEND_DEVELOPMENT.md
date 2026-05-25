# Trovia Development Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in your API keys:
```bash
cp .env.example .env.local
```

Update the following in `.env.local`:
- `NEXT_PUBLIC_GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com)
- Contract addresses once deployed

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Creating a New Page
1. Create a directory under `app/` (e.g., `app/my-page`)
2. Create `page.tsx` file
3. Import and use `TopNavBar` component
4. Use Tailwind classes for styling

### Creating a New Component
1. Create `.tsx` file in `components/` folder
2. Add `"use client"` at the top if it uses hooks/interactivity
3. Export as named export
4. Add TypeScript interfaces for props

### Adding a New API Route
1. Create directory under `app/api/` (e.g., `app/api/my-endpoint`)
2. Create `route.ts` file
3. Export `GET`, `POST`, `PUT`, etc. functions

Example:
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Your logic here
  return NextResponse.json({ success: true });
}
```

## Smart Contract Integration

The frontend is ready to integrate with the following smart contracts:

1. **AgentRegistry** - Stores and retrieves agents
2. **AgentEscrow** - Handles payments and activations
3. **AgentExecutor** - Logs execution results

See `lib/contracts.ts` for utility functions to interact with these contracts.

### MetaMask Integration

The `WalletConnect` component handles:
- Connecting wallet
- Displaying user address
- Switching to HeLa network (Chain ID: 8668)
- Getting network state

### Gemini API Integration

The `/api/gemini` route is set up to handle Gemini API calls. Currently returns mock data for development.

To enable real Gemini API:
1. Set `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`
2. The route will automatically use the real API

## Testing Pages

Navigate to these routes to test different features:

- `/` - Landing page
- `/marketplace` - Browse all agents
- `/agent/1` - Agent detail (with activation form)
- `/agent/3/run` or `/agent/7/run` - Chat interface
- `/dashboard` - User dashboard
- `/publish` - Publish new agent
- `/api/health` - Health check

## Available npm Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build           # Create optimized production build
npm start              # Start production server

# Linting
npm run lint           # Run ESLint to check code quality
```

## Styling Guide

### Tailwind Classes
Using custom colors defined in `tailwind.config.ts`:
```jsx
<div className="bg-background text-on-background border border-white/12">
  Content
</div>
```

### Common Classes
- `bg-black` - Black background
- `bg-background` - Dark background
- `bg-surface-container` - Container background
- `text-white` - White text
- `text-white/60` - White text with 60% opacity
- `border border-white/12` - White border with 12% opacity

### Typography
- `font-headline` - Large headings (Bebas Neue)
- `font-body` - Body text (Space Grotesk)
- `font-mono` - Code/monospace (JetBrains Mono)

### Responsive
- `md:` - Medium screen and up (768px)
- `lg:` - Large screen and up (1024px)

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Debugging

### Enable Debug Output
Set debug environment variable:
```bash
DEBUG=* npm run dev
```

### Check Build Errors
```bash
npm run build
```

### Lint Check
```bash
npm run lint
```

## Browser DevTools

### React DevTools
Install [React DevTools](https://react-devtools-tutorial.vercel.app/) extension to inspect components.

### MetaMask Debugging
- Open MetaMask and check network
- Verify connected wallet address
- Check transaction history for any failed txs

## Performance Tips

1. **Use `next/Image`** for image optimization
2. **Lazy load** components with `dynamic()` if needed
3. **Minimize** API calls - cache responses when appropriate
4. **Code split** large pages into smaller components

## Common Issues

### Port 3000 Already in Use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Module Not Found Error
Make sure imports use correct paths:
```typescript
// Good
import { Component } from "@/components/Component";

// Bad
import { Component } from "./components/Component";
```

### Tailwind Classes Not Applied
- Make sure file is in `app/` or `components/` directory
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes following the style guide
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-deploys on push

### Manual Deployment
```bash
npm run build
# Deploy the .next folder
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Gemini API](https://ai.google.dev)
- [ethers.js](https://docs.ethers.org/v6)

## Support

For issues or questions:
- Check existing GitHub issues
- Create new issue with clear description
- Include error messages and steps to reproduce

---

**Happy coding! 🚀**
