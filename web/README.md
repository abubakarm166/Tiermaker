# TierBuddy – Next.js App

This is the main Next.js app that combines:

- **Landing page** (from TierBuddy): Hero, stats, featured categories, rankings, recent work, how it works, choice, build CTA, and footer. Served at `/`.
- **Auth**: Login and register at `/login` and `/register`.
- **App** (from Tiermaking): Dashboard under `/app` with templates, categories, lists, and meme editor. Protected; redirects to `/login` when not authenticated.

## Run locally

1. **Backend**: Start your Django API (e.g. `python manage.py runserver` on port 8000).

2. **Env** (optional): Create `.env.local` and set:
   ```bash
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   ```
   If unset, the app assumes the API is at `http://localhost:8000` for rewrites.

3. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

- **Landing**: [http://localhost:3000](http://localhost:3000)
- **Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **App (after login)**: [http://localhost:3000/app](http://localhost:3000/app) → redirects to `/app/templates`.

## Structure

- `app/page.tsx` – Landing (TierBuddy)
- `app/login`, `app/register` – Auth
- `app/app/*` – Protected dashboard (Tiermaking): templates, categories, lists, meme-editor
- `components/landing/*` – TierBuddy landing sections
- `components/Layout.tsx`, `ProtectedApp.tsx` – App shell and auth guard
- `lib/api.ts` – API client (proxied to Django via rewrites)
- `contexts/AuthContext.tsx` – Auth state
- `styles/landing.css` – TierBuddy styles (from TierBuddy-main)
- `public/assets` – TierBuddy images

Template form, list form, list detail (full view), category form, and the full Meme Editor from the Vite app can be ported into the corresponding `app/app/...` routes as needed.
