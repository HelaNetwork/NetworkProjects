# ⬡ ChainGraph — Wallet-Native Social Network

A full-stack decentralized social network where your wallet is your identity. Built with React, Node.js, MongoDB, and MetaMask.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- MetaMask browser extension

---

### 1. Clone & Setup

```bash
# Install server dependencies
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Install client dependencies
cd ../client
npm install
cp .env.example .env
```

### 2. Start MongoDB
```bash
# Local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas — paste your connection string in server/.env
```

### 3. Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App opens on http://localhost:5173
```

---

## 🏗️ Project Structure

```
chain-social-graph/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar + mobile nav + WalletAvatar
│   │   │   ├── PostCard.jsx     # Post with likes & comments
│   │   │   ├── CreatePost.jsx   # New post form
│   │   │   ├── FollowButton.jsx # Follow/Unfollow with hover states
│   │   │   ├── SuggestedUsers.jsx
│   │   │   └── SearchModal.jsx  # Debounced user search
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Connect wallet page
│   │   │   ├── SetupProfile.jsx # First-time profile setup
│   │   │   ├── Home.jsx         # Personalized feed
│   │   │   ├── Explore.jsx      # Global feed
│   │   │   └── Profile.jsx      # User profile + edit
│   │   ├── store/
│   │   │   └── authStore.js     # Zustand auth (persisted)
│   │   └── utils/
│   │       ├── api.js           # Axios instance
│   │       └── helpers.js       # Address formatting, time, reputation
│
├── server/                     # Node.js + Express backend
│   ├── models/
│   │   ├── User.js              # Wallet, username, bio, followers
│   │   └── Post.js              # Content, likes, comments
│   ├── controllers/
│   │   ├── userController.js    # Auth, profile, search, suggestions
│   │   ├── postController.js    # CRUD, feed, explore, likes
│   │   └── followController.js  # Follow/unfollow graph
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   └── followRoutes.js
│   └── server.js
```

---

## 🔌 API Reference

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/auth` | Login or register with wallet |
| GET | `/api/users/:address` | Get user profile |
| PUT | `/api/users/:address` | Update profile |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/:address/suggestions` | Suggested users |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts/feed/:address` | Get personalized feed |
| GET | `/api/posts/explore` | Get all posts |
| GET | `/api/posts/user/:address` | Get user's posts |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| DELETE | `/api/posts/:id` | Delete post |

### Follow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/follow/follow` | Follow a user |
| POST | `/api/follow/unfollow` | Unfollow a user |
| GET | `/api/follow/:address/followers` | Get followers |
| GET | `/api/follow/:address/following` | Get following |

---

## 🎯 Core Features
- ✅ MetaMask wallet login (no email/password)
- ✅ User profiles with bio and reputation score
- ✅ Follow / Unfollow social graph
- ✅ Create posts (up to 500 chars)
- ✅ Personalized feed (following) + Global explore
- ✅ Like & comment system
- ✅ User search (by name or address)
- ✅ Suggested users
- ✅ Reputation scoring (based on followers)
- ✅ Gradient wallet avatars (deterministic by address)

---

## 🌐 Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect repo to Railway or Render
3. Set environment variables: `MONGO_URI`, `CLIENT_URL`, `PORT`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your deployed backend URL
2. Run `npm run build` → deploy `dist/` folder

---

## 🔑 Key Design Decisions

> "I designed a wallet-based identity system where users authenticate via MetaMask, and I built a social graph using MongoDB to manage relationships like followers and posts. I intentionally kept heavy data off-chain for scalability while using blockchain only for identity — giving us the best of both worlds."

- **Identity**: Wallet address = unique key, no passwords
- **Graph**: MongoDB arrays for O(1) follow checks
- **Feed**: `$in` query on following list — efficient and simple
- **Reputation**: Computed on save: `followers×3 + following×1`
- **Avatars**: Deterministic gradients from address — no uploads needed
