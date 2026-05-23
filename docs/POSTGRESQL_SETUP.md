# PostgreSQL setup for TierMaker

This project uses **SQLite by default**. As soon as you set **`DATABASE_URL`** in `.env`, Django switches to **PostgreSQL** automatically (`config/settings.py` + `dj-database-url`).

You do **not** need to change Django settings by hand—only install PostgreSQL, create a database, set `.env`, and run migrations.

---

## Overview (end-to-end flow)

```mermaid
flowchart LR
  A[Install PostgreSQL] --> B[Create DB + user]
  B --> C[pip install deps incl. psycopg2-binary]
  C --> D[Set DATABASE_URL in .env]
  D --> E[python manage.py migrate]
  E --> F[runserver / seed / use app]
```

| Step | What it does |
|------|----------------|
| 1 | PostgreSQL server runs on your machine (port `5432`) |
| 2 | Database `tiermaker` + user with password |
| 3 | Python can talk to Postgres via `psycopg2-binary` |
| 4 | Django reads `DATABASE_URL` and uses Postgres instead of `db.sqlite3` |
| 5 | Tables are created/updated with migrations |
| 6 | App reads/writes Postgres like before |

---

## Prerequisites

- Python 3.11+ and project venv (see main [README](../README.md))
- Project dependencies: `pip install -r requirements.txt` (includes `dj-database-url` and `psycopg2-binary`)

---

## Step 1 — Install PostgreSQL

### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Check that the service is running:

```bash
sudo systemctl status postgresql
# If not active:
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Default superuser for local admin: **`postgres`** (OS user `postgres`).

### Linux (Fedora)

```bash
sudo dnf install -y postgresql-server postgresql
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Windows

1. Download the installer from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer; remember the **postgres** superuser password you choose.
3. Keep default port **5432**.
4. Optionally install **pgAdmin** (GUI) from the same installer.

Verify (Windows, if `psql` is on PATH):

```powershell
psql --version
```

---

## Step 2 — Create database and user

Use a dedicated user (not your personal OS login) for the app.

### Option A — Linux: `sudo -u postgres psql`

```bash
sudo -u postgres psql
```

In the `psql` prompt:

```sql
CREATE USER tiermaker_user WITH PASSWORD 'choose_a_strong_password';
CREATE DATABASE tiermaker OWNER tiermaker_user;
GRANT ALL PRIVILEGES ON DATABASE tiermaker TO tiermaker_user;
\q
```

### Option B — Windows: SQL Shell (psql) or pgAdmin

Open **SQL Shell (psql)** as installed with PostgreSQL, connect as `postgres`, then run the same SQL as above.

### Option C — One-liner from terminal (Linux)

```bash
sudo -u postgres psql -c "CREATE USER tiermaker_user WITH PASSWORD 'choose_a_strong_password';"
sudo -u postgres psql -c "CREATE DATABASE tiermaker OWNER tiermaker_user;"
```

### Test login

```bash
psql -h localhost -U tiermaker_user -d tiermaker
# Enter password when prompted. Then:
\conninfo
\q
```

If connection fails, see [Troubleshooting](#troubleshooting) below.

---

## Step 3 — Python environment

From the **project root** (where `manage.py` lives):

```bash
cd /path/to/Tiermaker
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

Confirm the Postgres driver:

```bash
python -c "import psycopg2; print('psycopg2 OK')"
```

---

## Step 4 — Configure `.env`

Copy the example if you have not already:

```bash
cp .env.example .env
```

Edit **`.env`** and set (uncomment/adjust):

```env
DATABASE_URL=postgres://tiermaker_user:choose_a_strong_password@localhost:5432/tiermaker
```

**URL format:**

```
postgres://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

| Part | Example |
|------|---------|
| USERNAME | `tiermaker_user` |
| PASSWORD | your password (URL-encode special chars if needed) |
| HOST | `localhost` |
| PORT | `5432` |
| DATABASE_NAME | `tiermaker` |

**Special characters in password:** If the password contains `@`, `#`, `/`, etc., encode them for URLs (e.g. `@` → `%40`) or use a simpler password for local dev.

**Important:** While `DATABASE_URL` is set, Django **ignores** `db.sqlite3`. Remove or comment out `DATABASE_URL` to go back to SQLite.

---

## Step 5 — Apply migrations

With venv active and `.env` loaded (`python-dotenv` loads `.env` on startup):

```bash
python manage.py migrate
```

Expected: migrations apply with no errors. First run creates all tables (users, templates, lists, live, etc.).

Optional checks:

```bash
python manage.py showmigrations
python manage.py dbshell
```

In `dbshell` you should see a `postgres=#` or `tiermaker=>` prompt. Try:

```sql
\dt
```

Quit with `\q`.

---

## Step 6 — Create admin user and seed (optional)

```bash
python manage.py createsuperuser
```

Use **email** as the username field (custom User model).

Optional sample data:

```bash
python scripts/seed_data.py
```

---

## Step 7 — Run the project

**Backend:**

```bash
python manage.py runserver
```

**Frontend** (separate terminal):

```bash
cd web
npm install
npm run dev
```

API: `http://127.0.0.1:8000/api/`  
Admin: `http://127.0.0.1:8000/admin/`

---

## Moving existing data from SQLite (optional)

If you already used `db.sqlite3` and want to keep that data:

### Simple approach (small dev DB)

1. Keep a backup: `cp db.sqlite3 db.sqlite3.bak`
2. Export with Django (SQLite still active): comment out `DATABASE_URL`, then:

   ```bash
   python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > backup.json
   ```

3. Enable `DATABASE_URL` in `.env`, run `migrate` on empty Postgres.
4. Load:

   ```bash
   python manage.py loaddata backup.json
   ```

### Fresh start (easiest)

1. Set `DATABASE_URL`, run `migrate`, run `seed_data.py` or `createsuperuser`.
2. Ignore old SQLite file (or delete `db.sqlite3` after backup).

---

## Daily commands (cheat sheet)

| Task | Command |
|------|---------|
| Activate venv | `source .venv/bin/activate` |
| Run migrations | `python manage.py migrate` |
| New migration after model change | `python manage.py makemigrations` then `migrate` |
| Django DB shell | `python manage.py dbshell` |
| Postgres CLI as app user | `psql -h localhost -U tiermaker_user -d tiermaker` |
| Start Postgres (Linux) | `sudo systemctl start postgresql` |
| Stop Postgres (Linux) | `sudo systemctl stop postgresql` |

---

## GUI tools (optional)

- **pgAdmin** — full GUI (often installed with Windows Postgres)
- **DBeaver** — cross-platform, free
- **psql** — terminal (already installed with PostgreSQL)

Connect with the same host, port, database, user, and password as in `DATABASE_URL`.

---

## Troubleshooting

### `Authentication credentials were not provided` on upload/API

That is **JWT auth**, not Postgres. Sign in at `/login` first. See template/list pages that use `RequireAuth`.

### `ModuleNotFoundError: No module named 'psycopg2'`

```bash
pip install psycopg2-binary
# or
pip install -r requirements.txt
```

### `connection refused` on port 5432

- Postgres not running: `sudo systemctl start postgresql` (Linux)
- Wrong host/port in `DATABASE_URL`

### `password authentication failed`

- Wrong user/password in `DATABASE_URL`
- Reset password:

  ```bash
  sudo -u postgres psql -c "ALTER USER tiermaker_user WITH PASSWORD 'new_password';"
  ```

### `database "tiermaker" does not exist`

Create it (Step 2) or fix the database name in `DATABASE_URL`.

### `permission denied for schema public` (PostgreSQL 15+)

On PG 15+, grant schema rights:

```bash
sudo -u postgres psql -d tiermaker
```

```sql
GRANT ALL ON SCHEMA public TO tiermaker_user;
GRANT CREATE ON SCHEMA public TO tiermaker_user;
ALTER DATABASE tiermaker OWNER TO tiermaker_user;
\q
```

### Django still uses SQLite

- `DATABASE_URL` missing or typo in `.env`
- `.env` not in project root (same folder as `manage.py`)
- Restart `runserver` after changing `.env`
- `dj-database-url` not installed → `pip install dj-database-url`

### Verify which database Django uses

```bash
python manage.py shell -c "from django.conf import settings; print(settings.DATABASES['default'])"
```

You should see `ENGINE`: `django.db.backends.postgresql` and your database name.

---

## Production notes

- Use a strong `SECRET_KEY`, `DEBUG=False`, and real `ALLOWED_HOSTS`.
- Prefer `postgres://` with SSL in production if your host requires it (many PaaS set `DATABASE_URL` for you).
- Run `python manage.py migrate` on every deploy after pulling new migrations.
- Back up with `pg_dump`:

  ```bash
  pg_dump -h localhost -U tiermaker_user -d tiermaker -F c -f tiermaker_backup.dump
  ```

---

## Quick reference — minimal local setup (Linux)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER tiermaker_user WITH PASSWORD 'devpass123';"
sudo -u postgres psql -c "CREATE DATABASE tiermaker OWNER tiermaker_user;"

cd /path/to/Tiermaker
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

echo 'DATABASE_URL=postgres://tiermaker_user:devpass123@localhost:5432/tiermaker' >> .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Replace `devpass123` with your own password before any shared or production use.
