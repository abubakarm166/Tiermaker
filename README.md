# TierMaker Backend

A production-ready Django REST backend for a TierMaker-like service (tier list templates and user rankings). Uses **email/password** authentication only (no social auth), **JWT (SimpleJWT)**, **SQLite** by default (optional PostgreSQL), **Pillow** for images, and **django-filter** for search/filtering.

## Tech Stack

- Python 3.11+
- Django 4.2+
- Django REST Framework
- SimpleJWT
- django-filter
- Pillow
- SQLite (default) / PostgreSQL (optional via `DATABASE_URL`)

## Project Structure

```
project/
  config/          # Django settings, urls, wsgi
  accounts/        # Custom User, JWT auth, admin user management
  templates/       # Tier list templates (Template, TierRow, TemplateItem)
  lists/           # User tier lists (TierList, export)
  uploads/         # Image upload & processing
  core/            # Shared permissions, API router
  scripts/         # Seed script
```

## Setup

### 1. Create virtual environment and install dependencies

```bash
cd D:\Tiermaking
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

### 2. Environment

Copy `.env.example` to `.env` and set at least `SECRET_KEY` for production:

```bash
copy .env.example .env
```

### 3. Database and migrations

If you have an existing `db.sqlite3` from a run that did not use the custom User model, remove it first so migrations apply in the correct order:

```bash
del db.sqlite3   # Windows
python manage.py migrate
```

### 4. (Optional) Seed data

```bash
python scripts/seed_data.py
```

Creates:

- **Admin:** `admin@example.com` / `adminpass`
- **User:** `user@example.com` / `userpass`
- Sample category, template with tier rows/items, and a tier list

### 5. Run locally

```bash
python manage.py runserver
```

- API base: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/`

Create a superuser for admin UI: `python manage.py createsuperuser` (use email as username).

## API Overview

### Authentication (no auth required for register/login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register (email, password) |
| POST | `/api/auth/login/` | Login → access + refresh JWT |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/auth/me/` | Current user (auth) |
| GET | `/api/auth/users/` | List all users (admin only) |
| PATCH | `/api/auth/users/{id}/` | Ban/unban, role (admin only) |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates/` | Create template |
| GET | `/api/templates/` | List (paginated, search, filter, order) |
| GET | `/api/templates/{id}/` | Detail |
| PUT | `/api/templates/{id}/` | Update (owner/admin) |
| DELETE | `/api/templates/{id}/` | Delete (owner/admin) |

**Query params:** `search`, `category`, `tags`, `visibility`, `ordering` (e.g. `newest`, `most_popular`).

### Tier Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lists/` | Create tier list |
| GET | `/api/lists/` | List (own; admin sees all) |
| GET | `/api/lists/{id}/` | Detail (private only for owner) |
| PUT | `/api/lists/{id}/` | Update (owner/admin) |
| DELETE | `/api/lists/{id}/` | Delete (owner/admin) |
| POST | `/api/lists/{id}/export/` | Export as PNG image |
| GET | `/api/users/me/lists/` | Current user's lists only |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/` | Upload image (form field `file` or `image`; jpg/png/webp, max 5MB); optimized with Pillow |

Use header: `Authorization: Bearer <access_token>` for all authenticated endpoints.

## Security

- JWT authentication; banned users cannot log in and are denied by `IsNotBannedUser`.
- Ownership/admin permissions on templates and lists; private content visible only to owner (or admin).
- Throttling: anon 100/hour, user 1000/hour (configurable in settings).
- File validation on upload (type and size).

## Database

- Default: **SQLite** (`db.sqlite3` in project root).
- **PostgreSQL:** set `DATABASE_URL` in `.env` (e.g. `postgres://user:pass@localhost:5432/tiermaker`) and ensure `dj-database-url` is installed.

## Frontend (Vite + React)

A Vite + React + TypeScript frontend is in the `frontend/` folder. It uses Tailwind CSS and talks to the Django API (with proxy in dev).

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:5173**
- In dev, Vite proxies `/api` and `/media` to `http://127.0.0.1:8000`, so start the Django server as well.

### Frontend features

- **Auth:** Login, register, JWT (access + refresh), logout
- **Templates:** List (search, order by newest/popular), detail, create, edit, delete
- **Tier lists:** Create from template, assign items to tiers (click to move), edit, delete, **Export as PNG**
- **My Lists:** View your tier lists
- **Image upload:** Upload item images when creating/editing templates (JPG/PNG/WebP, max 5MB)

### Build for production

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`. Serve it with your web server or point Django to it (e.g. `STATICFILES_DIRS` or a separate host).

## Production

- Set `DEBUG=False`, strong `SECRET_KEY`, and `ALLOWED_HOSTS`.
- Set `CORS_ORIGINS` if using a separate frontend.
- Use a production WSGI/ASGI server (e.g. Gunicorn + Nginx) and serve media/static appropriately.
