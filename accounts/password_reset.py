"""Password reset request + confirm (token email)."""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

User = get_user_model()


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        msg = {
            "detail": "If an account exists for that email, we sent password reset instructions.",
        }
        if not user:
            return Response(msg)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
        link = f"{base}/reset-password?uid={uid}&token={token}"
        subject = "Reset your TierMaker password"
        body = (
            f"Hi,\n\n"
            f"We received a request to reset the password for {user.email}.\n\n"
            f"Open this link in your browser (valid for a limited time):\n{link}\n\n"
            f"If you did not ask for this, you can ignore this email.\n"
        )
        try:
            send_mail(
                subject,
                body,
                getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost"),
                [user.email],
                fail_silently=False,
            )
        except Exception:
            if getattr(settings, "DEBUG", False):
                import logging

                logging.getLogger(__name__).exception("send_mail failed; reset link: %s", link)
            return Response(
                {"detail": "Could not send email right now. Try again later or contact support."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(msg)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset_confirm"

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        if not uid or not token or not new_password:
            return Response(
                {"detail": "uid, token, and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            pk = force_str(urlsafe_base64_decode(uid))
            if not pk.isdigit():
                raise ValueError("bad uid")
            user = User.objects.get(pk=int(pk), is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {"detail": e.messages[0] if e.messages else "Invalid password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "Your password has been reset. You can sign in now."})
