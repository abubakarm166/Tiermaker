"""
Django settings for TierMaker backend.
Supports SQLite (default) and PostgreSQL via DATABASE_URL.
"""
import os
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

from dotenv import load_dotenv
load_dotenv(BASE_DIR / ".env")

# Security
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
DEBUG = os.environ.get("DEBUG", "True").lower() in ("true", "1", "yes")
# Comma-separated; required in production (e.g. EC2 public IP and/or domain)
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if h.strip()
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "corsheaders",
    # Local
    "accounts",
    "templates",
    "lists",
    "uploads",
    "memes",
    "live",
    "core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Custom User
AUTH_USER_MODEL = "accounts.User"

# Database - SQLite default; PostgreSQL if DATABASE_URL set
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
if os.environ.get("DATABASE_URL"):
    try:
        import dj_database_url
        DATABASES["default"] = dj_database_url.config(conn_max_age=600)
    except ImportError:
        pass

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static and media
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # Public read by default; specific endpoints enforce auth for write actions.
        "rest_framework.permissions.AllowAny",
        # If an authenticated user is banned, deny access.
        "core.permissions.IsNotBannedUser",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "300/hour",
        "user": "3000/hour",
        "login": "30/hour",
        "register": "20/hour",
        "token_refresh": "120/hour",
        "password_reset": "5/hour",
        "password_reset_confirm": "20/hour",
        "landing_live": "120/hour",
    },
}

# SimpleJWT
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# CORS (tune for production)
CORS_ALLOW_ALL_ORIGINS = DEBUG
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ORIGINS", "").split(",")

# Upload limits (5MB)
MAX_UPLOAD_SIZE = 5 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

# Image processing (Pillow)
IMAGE_MAX_SIZE = (1200, 1200)
IMAGE_QUALITY = 85

# Password reset links in email (Next.js app origin)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# Email — configure via .env (never commit EMAIL_HOST_PASSWORD).
# Gmail: use an App Password (Google Account → Security → 2-Step Verification → App passwords).
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "").strip()
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "").strip()
EMAIL_HOST = os.environ.get("EMAIL_HOST", "").strip()
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() in ("true", "1", "yes")

# If SMTP is fully configured, use it; otherwise console (safe default — never connect with empty creds).
if os.environ.get("EMAIL_BACKEND", "").strip():
    EMAIL_BACKEND = os.environ["EMAIL_BACKEND"].strip()
elif EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    # Allow omitting EMAIL_HOST for Gmail (defaults below).
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

if EMAIL_BACKEND == "django.core.mail.backends.smtp.EmailBackend" and not EMAIL_HOST:
    EMAIL_HOST = "smtp.gmail.com"

DEFAULT_FROM_EMAIL = (
    os.environ.get("DEFAULT_FROM_EMAIL", "").strip() or EMAIL_HOST_USER or "noreply@localhost"
)

# X (Twitter) OAuth 2.0 — see docs/TWITTER_OAUTH_SETUP.md
TWITTER_CLIENT_ID = os.environ.get("TWITTER_CLIENT_ID", "").strip()
TWITTER_CLIENT_SECRET = os.environ.get("TWITTER_CLIENT_SECRET", "").strip()
# Must match exactly what you register in the X Developer Portal (include trailing slash if Django expects it).
_default_twitter_callback = f"{FRONTEND_URL}/api/auth/twitter/callback/"
TWITTER_CALLBACK_URL = os.environ.get("TWITTER_CALLBACK_URL", _default_twitter_callback).strip()
TWITTER_OAUTH_SCOPES = os.environ.get(
    "TWITTER_OAUTH_SCOPES",
    "users.read tweet.read offline.access",
).strip()
TWITTER_OAUTH_EMAIL_DOMAIN = os.environ.get("TWITTER_OAUTH_EMAIL_DOMAIN", "oauth.thetiermaker.local").strip()

# OAuth state stored in session between /twitter/start/ and /twitter/callback/
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
