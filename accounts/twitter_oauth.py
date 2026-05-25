"""Twitter / X OAuth 2.0 (Authorization Code + PKCE) helpers."""
from __future__ import annotations

import base64
import hashlib
import secrets
import urllib.error
import urllib.parse
import urllib.request
import json
from typing import Any

from django.conf import settings

# Authorize on x.com (current X docs); token/API stay on api.twitter.com
TWITTER_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize"
TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
TWITTER_USERS_ME_URL = "https://api.twitter.com/2/users/me"


def twitter_configured() -> bool:
    return bool(
        getattr(settings, "TWITTER_CLIENT_ID", "")
        and getattr(settings, "TWITTER_CLIENT_SECRET", "")
        and getattr(settings, "TWITTER_CALLBACK_URL", "")
    )


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def generate_pkce() -> tuple[str, str]:
    """Return (code_verifier, code_challenge)."""
    verifier = _b64url(secrets.token_bytes(32))
    challenge = _b64url(hashlib.sha256(verifier.encode("ascii")).digest())
    return verifier, challenge


def build_authorize_url(*, state: str, code_challenge: str) -> str:
    params = {
        "response_type": "code",
        "client_id": settings.TWITTER_CLIENT_ID,
        "redirect_uri": settings.TWITTER_CALLBACK_URL,
        "scope": getattr(settings, "TWITTER_OAUTH_SCOPES", "users.read tweet.read"),
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    authorize_base = getattr(settings, "TWITTER_AUTHORIZE_URL", TWITTER_AUTHORIZE_URL)
    return f"{authorize_base}?{urllib.parse.urlencode(params)}"


def _http_post_form(url: str, data: dict[str, str], *, basic_auth: str | None = None) -> dict[str, Any]:
    body = urllib.parse.urlencode(data).encode("utf-8")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    if basic_auth:
        headers["Authorization"] = f"Basic {basic_auth}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(raw)
        except json.JSONDecodeError:
            detail = {"error": raw or e.reason}
        raise ValueError(detail) from e


def _http_get_json(url: str, access_token: str) -> dict[str, Any]:
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        raise ValueError(raw or e.reason) from e


def exchange_code_for_token(*, code: str, code_verifier: str) -> dict[str, Any]:
    client_id = settings.TWITTER_CLIENT_ID
    client_secret = settings.TWITTER_CLIENT_SECRET
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode("ascii")
    return _http_post_form(
        TWITTER_TOKEN_URL,
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.TWITTER_CALLBACK_URL,
            "code_verifier": code_verifier,
            "client_id": client_id,
        },
        basic_auth=basic,
    )


def fetch_twitter_profile(access_token: str) -> dict[str, Any]:
    # Minimal fields; profile_image_url is optional and not required for login.
    fields = "id,name,username"
    url = f"{TWITTER_USERS_ME_URL}?user.fields={urllib.parse.quote(fields)}"
    payload = _http_get_json(url, access_token)
    data = payload.get("data")
    if not data or not data.get("id"):
        raise ValueError("Could not read X profile.")
    return data
