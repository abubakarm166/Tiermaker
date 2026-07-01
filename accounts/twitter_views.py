"""Twitter / X login: start OAuth and handle callback."""
from __future__ import annotations

import secrets
import urllib.parse

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .twitter_oauth import (
    build_authorize_url,
    exchange_code_for_token,
    fetch_twitter_profile,
    generate_pkce,
    twitter_configured,
)
from .usernames import username_from_x_handle

User = get_user_model()

SESSION_STATE_KEY = "twitter_oauth_state"
SESSION_VERIFIER_KEY = "twitter_oauth_verifier"
SESSION_NEXT_KEY = "twitter_oauth_next"


def _safe_next_path(raw: str | None) -> str:
    if not raw or not raw.startswith("/") or raw.startswith("//") or "://" in raw:
        return "/templates"
    return raw


def _twitter_email(twitter_id: str) -> str:
    domain = getattr(settings, "TWITTER_OAUTH_EMAIL_DOMAIN", "oauth.thetiermaker.local")
    return f"x_{twitter_id}@{domain}"


def get_or_create_user_from_twitter(profile: dict) -> User:
    twitter_id = str(profile["id"])
    username = (profile.get("username") or "").strip()
    x_username = username or (profile.get("name") or "user")[:50]

    user = User.objects.filter(twitter_id=twitter_id).first()
    if user:
        if user.is_banned:
            raise ValueError("banned")
        updates = []
        if username and user.x_username != username:
            user.x_username = username
            updates.append("x_username")
        if not user.username:
            user.username = username_from_x_handle(x_username)
            updates.append("username")
        if updates:
            updates.append("updated_at")
            user.save(update_fields=updates)
        return user

    email = _twitter_email(twitter_id)
    user = User.objects.filter(email__iexact=email).first()
    if user:
        if user.is_banned:
            raise ValueError("banned")
        user.twitter_id = twitter_id
        user.x_username = x_username
        user.set_unusable_password()
        fields = ["twitter_id", "x_username", "password", "updated_at"]
        if not user.username:
            user.username = username_from_x_handle(x_username)
            fields.append("username")
        user.save(update_fields=fields)
        return user

    return User.objects.create_user(
        email=email,
        password=None,
        twitter_id=twitter_id,
        x_username=x_username,
        username=username_from_x_handle(x_username),
    )


def issue_tokens_for_user(user: User) -> tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


class TwitterOAuthStartView(APIView):
    """GET /api/auth/twitter/start/ — redirect browser to X authorization."""

    permission_classes = [AllowAny]

    def get(self, request):
        if not twitter_configured():
            return redirect(
                f"{settings.FRONTEND_URL.rstrip('/')}/login?error=twitter_not_configured"
            )
        state = secrets.token_urlsafe(32)
        verifier, challenge = generate_pkce()
        request.session[SESSION_STATE_KEY] = state
        request.session[SESSION_VERIFIER_KEY] = verifier
        request.session[SESSION_NEXT_KEY] = _safe_next_path(request.query_params.get("next"))
        request.session.modified = True
        url = build_authorize_url(state=state, code_challenge=challenge)
        return HttpResponseRedirect(url)


class TwitterOAuthCallbackView(APIView):
    """GET /api/auth/twitter/callback/ — X redirects here after user approves."""

    permission_classes = [AllowAny]

    def get(self, request):
        frontend = settings.FRONTEND_URL.rstrip("/")
        err = request.query_params.get("error")
        if err:
            desc = request.query_params.get("error_description", err)
            q = urllib.parse.urlencode({"error": "twitter_denied", "message": desc})
            return redirect(f"{frontend}/auth/callback?{q}")

        code = request.query_params.get("code")
        state = request.query_params.get("state")
        saved_state = request.session.pop(SESSION_STATE_KEY, None)
        verifier = request.session.pop(SESSION_VERIFIER_KEY, None)
        next_path = _safe_next_path(request.session.pop(SESSION_NEXT_KEY, None))

        if not code or not state or not saved_state or state != saved_state or not verifier:
            return redirect(f"{frontend}/auth/callback?error=twitter_invalid_state")

        try:
            token_payload = exchange_code_for_token(code=code, code_verifier=verifier)
            access = token_payload.get("access_token")
            if not access:
                raise ValueError("No access token from X.")
            profile = fetch_twitter_profile(access)
            user = get_or_create_user_from_twitter(profile)
            jwt_access, jwt_refresh = issue_tokens_for_user(user)
        except ValueError as e:
            if str(e) == "banned":
                return redirect(f"{frontend}/auth/callback?error=account_banned")
            msg = str(e) if e else "twitter_failed"
            if "403" in msg and "Forbidden" in msg:
                msg = (
                    "X API returned Forbidden (403). Ensure TWITTER_OAUTH_SCOPES includes "
                    "users.read tweet.read, save .env, restart the backend, then sign in again."
                )
            q = urllib.parse.urlencode({"error": "twitter_failed", "message": msg[:400]})
            return redirect(f"{frontend}/auth/callback?{q}")
        except Exception:
            return redirect(f"{frontend}/auth/callback?error=twitter_failed")

        q = urllib.parse.urlencode(
            {
                "access": jwt_access,
                "refresh": jwt_refresh,
                "next": next_path,
            }
        )
        return redirect(f"{frontend}/auth/callback?{q}")
