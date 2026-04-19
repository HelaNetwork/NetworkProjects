# Supabase setup for PayStream

PayStream uses **Supabase Auth** so users can sign in as **HR** or **Employee**. Follow these steps.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose organization, name the project (e.g. `paystream`), set a database password, and pick a region.
4. Wait for the project to be ready.

---

## 2. Get your API keys

1. In the Supabase dashboard, open **Project Settings** (gear icon).
2. Go to **API**.
3. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## 3. Configure Auth (Email provider)

1. In the dashboard, go to **Authentication** → **Providers**.
2. Enable **Email** (it’s usually on by default).
3. (Optional) For quick testing without email verification:
   - Go to **Authentication** → **Providers** → **Email**.
   - Turn **OFF** “Confirm email” so new users are signed in immediately after sign up.
4. (Optional) Under **URL Configuration**, set **Site URL** to your app URL (e.g. `http://localhost:3000` for local dev).

---

## 4. Environment variables

In the frontend project root (`paystream-frontend`), create or edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your **Project URL** and **anon public** key from step 2.

---

## 5. How roles (HR / Employee) work

- On **sign up**, the app sends `role: 'hr'` or `role: 'employee'` in **user metadata** (Supabase `signUp` option `data: { role }`).
- That value is stored in `user.user_metadata.role`.
- The app reads it after login and redirects to **HR Dashboard** or **Employee Portal** and uses it for access control.

No extra tables are required for this flow. If you later want a `profiles` table (e.g. display name, avatar), you can add it and sync from `auth.users`.

---

## 6. Run the app

```bash
cd paystream-frontend
npm install
npm run dev
```

Open `http://localhost:3000`. You should see the login/landing page. Choose **HR** or **Employee**, then sign up or log in with email and password.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| "Invalid API key" or no session | `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Restart `npm run dev` after changing env. |
| Email confirmation required | In Supabase: Authentication → Providers → Email → disable "Confirm email" for testing. |
| Redirect not working | In Supabase: Authentication → URL Configuration → set **Site URL** to `http://localhost:3000` (or your production URL). |
