"""Username generation and validation for public display (keeps emails private)."""
from __future__ import annotations

import re
import secrets
import string

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

USERNAME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9_]{2,29}$")
_RESERVED = frozenset(
    {
        "admin",
        "api",
        "app",
        "help",
        "live",
        "login",
        "logout",
        "memes",
        "register",
        "root",
        "settings",
        "support",
        "system",
        "templates",
        "thetiermaker",
        "user",
    }
)


def normalize_username(raw: str) -> str:
    """Lowercase and strip; replace invalid chars with underscores."""
    s = re.sub(r"[^a-zA-Z0-9_]+", "_", (raw or "").strip().lower())
    s = re.sub(r"_+", "_", s).strip("_")
    if not s:
        return ""
    if not s[0].isalpha():
        s = f"u_{s}"
    return s[:30]


def validate_username_value(value: str, *, user_id: int | None = None) -> str:
    username = normalize_username(value)
    if not USERNAME_RE.match(username):
        raise ValidationError(
            "Username must be 3–30 characters, start with a letter, and use only letters, numbers, or underscores."
        )
    if username in _RESERVED:
        raise ValidationError("That username is not available.")
    User = get_user_model()
    qs = User.objects.filter(username__iexact=username)
    if user_id is not None:
        qs = qs.exclude(pk=user_id)
    if qs.exists():
        raise ValidationError("That username is already taken.")
    return username


def generate_random_username() -> str:
    """Generate a unique random username like tier_a3f9k2."""
    User = get_user_model()
    alphabet = string.ascii_lowercase + string.digits
    for _ in range(64):
        suffix = "".join(secrets.choice(alphabet) for _ in range(8))
        candidate = f"tier_{suffix}"
        if not User.objects.filter(username__iexact=candidate).exists():
            return candidate
    return f"tier_{secrets.token_hex(8)}"[:30]


def username_from_x_handle(handle: str) -> str:
    """Prefer X handle as username when valid and available."""
    base = normalize_username(handle.lstrip("@"))
    if not base or not USERNAME_RE.match(base) or base in _RESERVED:
        return generate_random_username()
    User = get_user_model()
    if not User.objects.filter(username__iexact=base).exists():
        return base
    for i in range(2, 1000):
        candidate = f"{base[:25]}_{i}"
        if len(candidate) >= 3 and not User.objects.filter(username__iexact=candidate).exists():
            return candidate
    return generate_random_username()


def assign_username_for_user(user, *, preferred: str | None = None) -> str:
    """Pick and persist a username for a user without one."""
    if user.username:
        return user.username
    if preferred:
        try:
            username = validate_username_value(preferred, user_id=user.pk)
        except ValidationError:
            username = username_from_x_handle(preferred)
    elif user.x_username:
        username = username_from_x_handle(user.x_username)
    else:
        username = generate_random_username()
    user.username = username
    user.save(update_fields=["username", "updated_at"])
    return username
