# EC2 Deployment Guide (Django API + Next.js Web)

This guide deploys the whole project on an **Ubuntu 22.04** EC2 instance:

- **Backend**: Django (Gunicorn) on `127.0.0.1:8000`
- **Frontend**: Next.js (Node) on `127.0.0.1:3000`
- **Reverse proxy**: Nginx → routes:
  - `/` → Next.js
  - `/api/` → Django
  - `/media/` → Django media files
  - `/static/` → Django static files
- **DB**: **SQLite** (default `db.sqlite3` in the project root — no separate database server)
- **SSL**: Let’s Encrypt (Certbot)

> Assumptions
> - Your repo lives at **`/var/www/Tiermaker`** (use this path everywhere: venv, systemd, Nginx, `collectstatic`, media).
> - Django project root is the repo root (has `manage.py`).
> - Next.js app is in: `web/`

If your structure is different, adjust the paths.

### Git clone: “Permission denied” in `/var/www`

`/var/www` is owned by root. Either:

```bash
sudo mkdir -p /var/www/Tiermaker
sudo chown -R ubuntu:ubuntu /var/www/Tiermaker
cd /var/www/Tiermaker
git clone https://github.com/YOUR_USER/YOUR_REPO.git .
```

Or clone with sudo then fix ownership:

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USER/YOUR_REPO.git Tiermaker
sudo chown -R ubuntu:ubuntu /var/www/Tiermaker
```

---

## 1) EC2 + DNS (one time)

1. Launch EC2: **Ubuntu 22.04**, at least **t3.small** recommended.
2. Security group inbound:
   - TCP **22** from your IP
   - TCP **80** from `0.0.0.0/0`
   - TCP **443** from `0.0.0.0/0`
3. (Recommended) Assign an Elastic IP.
4. Point your domain DNS (A record) to the instance public IP.

---

## 2) SSH into server

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_IP
```

---

## 3) Update OS + install packages

```bash
sudo apt-get update -y
sudo apt-get upgrade -y

sudo apt-get install -y \
  nginx \
  git \
  ufw \
  python3-pip python3-venv python3-dev \
  build-essential \
  certbot python3-certbot-nginx
```

Enable firewall **after** Nginx is installed (so the `Nginx Full` app profile exists). If you already enabled UFW without HTTP/HTTPS, add ports manually:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
# If you see: ERROR: Could not find a profile matching 'Nginx Full'
# use ports instead (works even before nginx profile is registered):
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

sudo ufw --force enable
sudo ufw status
```

---

## 4) Install Node.js (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node -v
npm -v
```

---

## 5) Create app user + folders

```bash
sudo mkdir -p /var/www/Tiermaker
sudo chown -R ubuntu:ubuntu /var/www/Tiermaker
```

Put your code in `/var/www/Tiermaker` (choose one):

### Option A: Git clone
```bash
cd /var/www
git clone YOUR_REPO_URL Tiermaker
cd Tiermaker
```

### Option B: Upload (SCP)
From your local machine:
```bash
scp -i /path/to/key.pem -r "D:\Tiermaking\*" ubuntu@YOUR_EC2_IP:/var/www/Tiermaker/
```

Optional shortcut for shells: `export APP=/var/www/Tiermaker` and use `$APP` in commands.

---

## 6) Backend (Django) environment + dependencies

Create a Python venv:

```bash
cd /var/www/Tiermaker
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip wheel
```

Install requirements:

### If you already have `requirements.txt`
```bash
pip install -r requirements.txt
```

### If you do NOT have `requirements.txt`
You must create one (recommended). Typical packages:
```bash
pip install django djangorestframework gunicorn pillow django-cors-headers
pip freeze > requirements.txt
```

Create backend env file:

```bash
sudo mkdir -p /etc/tiermaking
sudo nano /etc/tiermaking/backend.env
```

Example `backend.env` (EDIT VALUES):

```bash
DJANGO_SETTINGS_MODULE=config.settings
DJANGO_SECRET_KEY=CHANGE_ME
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=YOUR_DOMAIN,YOUR_EC2_IP,localhost,127.0.0.1

# SQLite: ensure Django settings use the default db.sqlite3 (or your path).
# Back up db.sqlite3 before deploys if you care about data.

# If you use JWT / auth settings add them here
```

Load env variables inside your Gunicorn service (below).

Run migrations + collectstatic:

```bash
cd /var/www/Tiermaker
source .venv/bin/activate

# Make sure Django can read env; for quick run you can export:
set -a
source /etc/tiermaking/backend.env
set +a

python manage.py migrate
python manage.py collectstatic --noinput
```

Create media/static directories:

```bash
sudo mkdir -p /var/www/Tiermaker/staticfiles
sudo mkdir -p /var/www/Tiermaker/media
sudo chown -R ubuntu:www-data /var/www/Tiermaker/staticfiles /var/www/Tiermaker/media
sudo chmod -R 775 /var/www/Tiermaker/staticfiles /var/www/Tiermaker/media
```

Paths are **case-sensitive**: `/var/www/Tiermaker` is not the same as `/var/www/tiermaking`. If you created dirs under the wrong name, either remove the mistaken folder (`sudo rm -rf /var/www/tiermaking`) when unused, or fix Nginx/systemd to point at `/var/www/Tiermaker` only.

---

## 7) Frontend (Next.js) environment + build

```bash
cd /var/www/Tiermaker/web
npm install
```

Create frontend env file:

```bash
sudo nano /etc/tiermaking/web.env
```

Example `web.env` (EDIT VALUES):

```bash
NODE_ENV=production
PORT=3000

# IMPORTANT: Next.js rewrites use this to proxy /api and /media to Django
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

Build:

```bash
cd /var/www/Tiermaker/web
set -a
source /etc/tiermaking/web.env
set +a

npm run build
```

---

## 8) systemd services (Gunicorn + Next.js)

### 8.1 Gunicorn service

```bash
sudo nano /etc/systemd/system/tiermaking-backend.service
```

Paste (adjust paths only if your app root is not `/var/www/Tiermaker`):

```ini
[Unit]
Description=Tiermaking Django Backend (Gunicorn)
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/Tiermaker
EnvironmentFile=/etc/tiermaking/backend.env
ExecStart=/var/www/Tiermaker/.venv/bin/gunicorn config.wsgi:application \
  --bind 127.0.0.1:8000 \
  --workers 3 \
  --timeout 120
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tiermaking-backend
sudo systemctl start tiermaking-backend
sudo systemctl status tiermaking-backend --no-pager
```

Logs:
```bash
sudo journalctl -u tiermaking-backend -n 200 --no-pager
```

### 8.2 Next.js service

```bash
sudo nano /etc/systemd/system/tiermaking-web.service
```

Paste:

```ini
[Unit]
Description=Tiermaking Next.js Web
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/Tiermaker/web
EnvironmentFile=/etc/tiermaking/web.env
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tiermaking-web
sudo systemctl start tiermaking-web
sudo systemctl status tiermaking-web --no-pager
```

Logs:
```bash
sudo journalctl -u tiermaking-web -n 200 --no-pager
```

---

## 9) Nginx reverse proxy config

```bash
sudo nano /etc/nginx/sites-available/tiermaking
```

Paste (EDIT `server_name`):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN YOUR_EC2_IP;

    client_max_body_size 50M;

    # Django static
    location /static/ {
        alias /var/www/Tiermaker/staticfiles/;
        access_log off;
        expires 30d;
    }

    # Django media
    location /media/ {
        alias /var/www/Tiermaker/media/;
        access_log off;
        expires 30d;
    }

    # Django API (proxied)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/tiermaking /etc/nginx/sites-enabled/tiermaking
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10) SSL (Let’s Encrypt)

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

Auto-renew test:
```bash
sudo certbot renew --dry-run
```

---

## 11) Django settings checklist (important)

In your Django `settings.py` ensure:

- `DEBUG = False`
- `ALLOWED_HOSTS = ["YOUR_DOMAIN", "YOUR_EC2_IP", ...]`
- `CSRF_TRUSTED_ORIGINS = ["https://YOUR_DOMAIN"]`
- Static/media:
  - `STATIC_URL = "/static/"`
  - `STATIC_ROOT = BASE_DIR / "staticfiles"`
  - `MEDIA_URL = "/media/"`
  - `MEDIA_ROOT = BASE_DIR / "media"`

If you use CORS:
- `CORS_ALLOWED_ORIGINS = ["https://YOUR_DOMAIN"]`

**SQLite:** the app user (`ubuntu`) must be able to read/write `db.sqlite3` in the project directory. If Gunicorn runs as `ubuntu`, keep the file owned by `ubuntu`.

---

## 12) Quick health checks

### Check services
```bash
sudo systemctl status tiermaking-backend --no-pager
sudo systemctl status tiermaking-web --no-pager
sudo systemctl status nginx --no-pager
```

### Check local ports
```bash
curl -I http://127.0.0.1:8000/api/
curl -I http://127.0.0.1:3000/
```

### Check public
```bash
curl -I http://YOUR_DOMAIN/
curl -I http://YOUR_DOMAIN/api/
```

---

## 13) Updating code (repeat whenever you deploy new changes)

```bash
cd /var/www/Tiermaker
git pull

# Backend
source /var/www/Tiermaker/.venv/bin/activate
pip install -r requirements.txt
set -a; source /etc/tiermaking/backend.env; set +a
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart tiermaking-backend

# Frontend
cd /var/www/Tiermaker/web
set -a; source /etc/tiermaking/web.env; set +a
npm install
npm run build
sudo systemctl restart tiermaking-web

sudo systemctl restart nginx
```

---

## 14) Common issues

### `npm error ENOENT` — `Could not read package.json` in `/var/www/Tiermaker/web`

The `web` folder on the server is empty or incomplete (no `package.json`). The repo expects **`web/package.json`** at the project root next to `manage.py`.

- Check: `ls -la /var/www/Tiermaker/web/package.json` — it must exist.
- Fix: deploy the full repo (including the entire `web/` tree), e.g. `git pull` from a remote that contains `web/`, or re-copy/rsync **`web/`** from your machine:  
  `scp -i key.pem -r "D:\Tiermaking\web" ubuntu@IP:/var/www/Tiermaker/`  
  (overwrites/adds `web` with `package.json`, `app/`, `public/`, etc.)

### “socket hang up” / `ECONNRESET` in Next.js proxy
- Django not running or crashed.
- Wrong `NEXT_PUBLIC_API_BASE` in `/etc/tiermaking/web.env`.

### 404 for `bootstrap.min.css.map`
- Safe to ignore (source map not shipped).

### Images/media not loading
- Ensure Nginx `/media/` points to `/var/www/Tiermaker/media/`
- Ensure Django saves uploads to `MEDIA_ROOT`
- Ensure file permissions allow Nginx to read `/var/www/Tiermaker/media`

### Permission denied for static/media
```bash
sudo chown -R ubuntu:www-data /var/www/Tiermaker/staticfiles /var/www/Tiermaker/media
sudo chmod -R 775 /var/www/Tiermaker/staticfiles /var/www/Tiermaker/media
sudo systemctl restart nginx
```

