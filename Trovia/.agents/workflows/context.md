---
description: Project Context & Animation Implementation Details
---

# Trovia UI Animation Overhaul Context

## Current Status
We have successfully implemented an advanced, high-end "Antigravity-inspired" scroll animation and UI system for the Trovia AI Agent Marketplace.

## What Has Been Completed

### 1. Unified Scroll Animation System
- Implemented robust `IntersectionObserver`-based hooks (`useReveal`, `useStaggerReveal`) in `hooks/useScrollAnimation.ts`.
- All animations are **infinite/looping**: they trigger when elements enter the viewport, reset when they leave, and replay seamlessly upon re-entry.
- Consistent animation classes (`reveal-up`, `reveal-left`, `reveal-scale`, etc.) are now used globally across all 15 pages of the site (Landing, Marketplace, About, FAQ, Dashboard, Pricing, Roadmap, Publish, Blog, Contact, Help, Privacy, Terms, Security, Disclaimer, Cookies).

### 2. Antigravity-Style "Living" Particle Field
- Created a global, ambient particle background effect in `components/CursorParticles.tsx` and wrapped it in `components/ClientParticles.tsx` for SSR safety.
- **Physics Engine:** The field consists of ~300 white/silver/gray particles that constantly drift.
- **Cursor Interaction:** It is *not* a standard trail. It feels like a living fluid — as the cursor moves near the particles (within a 150px radius), they are naturally *pushed away* and displaced, creating a "clear zone", before gently springing back to their origins.
- **Networking:** Thin connection lines automatically form between nearby particles, enhancing the high-tech, decentralized agent vibe.
- **Performance:** Built natively on a `<canvas>` element using `requestAnimationFrame`, avoiding any heavy DOM manipulation or third-party physics libraries, ensuring a smooth 60fps experience.

### 3. Glassmorphic Hero Redesign
- The main "HeLa Chain" card on the hero section has been completely redesigned.
- Replaced the intrusive solid white block with a sleek, dark glassmorphic floating element (`hela-floating-card` class).
- Positioned perfectly in the bottom-right corner to avoid overlapping with the "START NOW" CTA.
- Integrated continuous subtle floating animations and a pulsing status dot.

## Next Workflow Steps
When resuming work, focus on the following:
1. **API Integration:** Connect the Gemini AI API to the agent execution routes using backend proxy routes.
2. **Web3 Connection:** Ensure the MetaMask wallet connection state triggers real on-chain transaction flows for the "Activate Agent" buttons.
3. **User Dashboard:** Wire up the mocked dashboard statistics with actual activity logs from the deployed smart contracts.
