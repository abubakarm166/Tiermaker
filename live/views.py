"""REST API for TierMaker Live voting sessions."""
from __future__ import annotations

import random

from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from core.permissions import IsNotBannedUser
from templates.models import Template, TemplateItem

from .models import LiveEvent, LiveParticipantProgress, LiveVote
from .serializers import (
    LiveEventCardSerializer,
    LiveEventCreateSerializer,
    LiveEventSummarySerializer,
    NextItemSerializer,
)
from .services import build_live_state, can_join_event, score_for_tier_vote, voting_allowed


def _resolve_event(token):
    return get_object_or_404(LiveEvent.objects.select_related("template", "host"), invite_token=token)


def _voted_item_ids_for_session(event: LiveEvent, session_key: str) -> list[int]:
    return list(
        LiveVote.objects.filter(live_event=event, session_key=session_key).values_list(
            "template_item_id", flat=True
        )
    )


def _first_unvoted_index(event: LiveEvent, session_key: str, ids: list[int]) -> int | None:
    voted = set(_voted_item_ids_for_session(event, session_key))
    for idx, iid in enumerate(ids):
        if iid not in voted:
            return idx
    return None


def _ensure_full_item_queue(progress: LiveParticipantProgress, event: LiveEvent) -> list[int]:
    """Rebuild shuffled queue if empty, incomplete, or out of sync with template items."""
    template_ids = list(event.template.items.order_by("order").values_list("id", flat=True))
    if not template_ids:
        return []
    stored = list(progress.item_ids_ordered or [])
    if set(stored) != set(template_ids) or len(stored) != len(template_ids):
        ids = list(template_ids)
        random.shuffle(ids)
        progress.item_ids_ordered = ids
        progress.save(update_fields=["item_ids_ordered"])
        return ids
    return stored


def _sync_progress_current_index(progress: LiveParticipantProgress, event: LiveEvent, session_key: str) -> None:
    ids = progress.item_ids_ordered or []
    next_idx = _first_unvoted_index(event, session_key, ids)
    progress.current_index = len(ids) if next_idx is None else next_idx
    progress.save(update_fields=["current_index"])


def _maybe_activate(event: LiveEvent):
    now = timezone.now()
    if event.status == LiveEvent.Status.ENDED:
        return
    if now > event.ends_at:
        event.status = LiveEvent.Status.ENDED
        event.save(update_fields=["status", "updated_at"])
        return
    if event.status == LiveEvent.Status.SCHEDULED and now >= event.starts_at:
        event.status = LiveEvent.Status.LIVE
        event.save(update_fields=["status", "updated_at"])


class LiveEventCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]
    serializer_class = LiveEventCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            LiveEventSummarySerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        event = serializer.save(host=self.request.user)
        now = timezone.now()
        if now > event.ends_at:
            event.status = LiveEvent.Status.ENDED
        elif event.starts_at <= now <= event.ends_at:
            event.status = LiveEvent.Status.LIVE
        else:
            event.status = LiveEvent.Status.SCHEDULED
        event.save(update_fields=["status"])


class LiveEventDetailView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def get(self, request, token):
        event = _resolve_event(token)
        _maybe_activate(event)
        event.refresh_from_db()
        ser = LiveEventSummarySerializer(event)
        state = build_live_state(event)
        tier_rows = [
            {"label": r.label, "color": r.color, "order": r.order}
            for r in event.template.tier_rows.order_by("order")
        ]
        return Response(
            {
                **ser.data,
                "template_id": event.template_id,
                "host_email": event.host.email if event.host_id else None,
                "tier_rows": tier_rows,
                "summary": {
                    "total_votes": state["total_votes"],
                    "total_participants": state["total_participants"],
                    "locked": state["locked"],
                },
            }
        )


class LiveEventStateView(APIView):
    """Poll for aggregate board + stats."""

    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def get(self, request, token):
        event = _resolve_event(token)
        _maybe_activate(event)
        return Response(build_live_state(event))


class LiveEventJoinView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def post(self, request, token):
        event = _resolve_event(token)
        _maybe_activate(event)
        ok, msg = can_join_event(event)
        if not ok:
            return Response({"detail": msg}, status=status.HTTP_403_FORBIDDEN)

        # One stable session per (event, user); voting APIs require auth.
        session_key = f"u{request.user.pk}"
        user = request.user

        progress, created = LiveParticipantProgress.objects.get_or_create(
            live_event=event,
            session_key=session_key,
            defaults={
                "user": user,
                "item_ids_ordered": [],
                "current_index": 0,
            },
        )
        if not progress.user_id:
            progress.user = user
            progress.save(update_fields=["user"])
        _ensure_full_item_queue(progress, event)
        _sync_progress_current_index(progress, event, session_key)

        return Response({"session_key": session_key, "joined": True})


class LiveNextItemView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def get(self, request, token):
        event = _resolve_event(token)
        _maybe_activate(event)
        ok, msg = voting_allowed(event)
        if not ok:
            return Response({"detail": msg}, status=status.HTTP_403_FORBIDDEN)

        session_key = request.query_params.get("session_key")
        if not session_key:
            return Response({"detail": "session_key required"}, status=400)

        progress = get_object_or_404(
            LiveParticipantProgress,
            live_event=event,
            session_key=session_key,
        )
        ids = _ensure_full_item_queue(progress, event)
        total = len(ids)
        voted_ids = _voted_item_ids_for_session(event, session_key)
        idx = _first_unvoted_index(event, session_key, ids)

        if idx is None:
            if progress.current_index != total:
                progress.current_index = total
                progress.save(update_fields=["current_index"])
            payload = {
                "done": True,
                "item": None,
                "progress_index": total,
                "progress_total": total,
                "queue_item_ids": ids,
                "voted_item_ids": voted_ids,
            }
            return Response(NextItemSerializer(payload).data)

        if progress.current_index != idx:
            progress.current_index = idx
            progress.save(update_fields=["current_index"])

        item_id = ids[idx]
        item = TemplateItem.objects.get(pk=item_id)
        img = item.image.url if item.image else None
        payload = {
            "done": False,
            "item": {"id": item.id, "name": item.name, "image": img},
            "progress_index": idx,
            "progress_total": total,
            "queue_item_ids": ids,
            "voted_item_ids": voted_ids,
        }
        return Response(NextItemSerializer(payload).data)


class LiveVoteSubmitView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def post(self, request, token):
        event = _resolve_event(token)
        _maybe_activate(event)
        ok, msg = voting_allowed(event)
        if not ok:
            return Response({"detail": msg}, status=status.HTTP_403_FORBIDDEN)

        session_key = request.data.get("session_key")
        if not session_key:
            return Response({"detail": "session_key required"}, status=400)

        skip = bool(request.data.get("skip"))
        tier_label = (request.data.get("tier_label") or "").strip()
        raw_item_id = request.data.get("template_item_id")
        if raw_item_id is None:
            return Response({"detail": "template_item_id is required."}, status=400)
        try:
            template_item_id = int(raw_item_id)
        except (TypeError, ValueError):
            return Response({"detail": "Invalid template_item_id."}, status=400)

        if not event.template.items.filter(pk=template_item_id).exists():
            return Response({"detail": "That item is not part of this template."}, status=400)

        progress = get_object_or_404(
            LiveParticipantProgress,
            live_event=event,
            session_key=session_key,
        )

        ids = _ensure_full_item_queue(progress, event)
        if not ids:
            return Response({"detail": "This template has no items to vote on."}, status=400)
        if template_item_id not in ids:
            return Response({"detail": "That item is not in this session."}, status=400)

        if LiveVote.objects.filter(
            live_event=event,
            template_item_id=template_item_id,
            session_key=session_key,
        ).exists():
            return Response({"detail": "Already voted on this item."}, status=400)

        if skip:
            LiveVote.objects.create(
                live_event=event,
                template_item_id=template_item_id,
                session_key=session_key,
                skipped=True,
                tier_label="",
                score_value=0,
            )
        else:
            labels = [r.label for r in event.template.tier_rows.order_by("order")]
            if tier_label not in labels:
                return Response({"detail": f"Invalid tier. Use one of: {labels}"}, status=400)
            score = score_for_tier_vote(event.template, tier_label)
            LiveVote.objects.create(
                live_event=event,
                template_item_id=template_item_id,
                session_key=session_key,
                skipped=False,
                tier_label=tier_label,
                score_value=score,
            )

        _sync_progress_current_index(progress, event, session_key)

        return Response({"ok": True, "next_index": progress.current_index})


def _host_only(request, event):
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    if event.host_id != request.user.id and not getattr(request.user, "is_admin", False):
        return Response({"detail": "Only the host can perform this action."}, status=status.HTTP_403_FORBIDDEN)
    return None


class LiveHostEndView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def post(self, request, token):
        event = _resolve_event(token)
        err = _host_only(request, event)
        if err:
            return err
        event.status = LiveEvent.Status.ENDED
        event.save(update_fields=["status", "updated_at"])
        return Response({"status": event.status})


class LiveHostPauseView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def post(self, request, token):
        event = _resolve_event(token)
        err = _host_only(request, event)
        if err:
            return err
        event.status = LiveEvent.Status.PAUSED
        event.save(update_fields=["status", "updated_at"])
        return Response({"status": event.status})


class LiveHostResumeView(APIView):
    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def post(self, request, token):
        event = _resolve_event(token)
        err = _host_only(request, event)
        if err:
            return err
        now = timezone.now()
        if now > event.ends_at:
            return Response({"detail": "Event end time has passed."}, status=400)
        event.status = LiveEvent.Status.LIVE
        event.save(update_fields=["status", "updated_at"])
        return Response({"status": event.status})


class LiveEventBrowseView(APIView):
    """Hub listing: ending soon, most voted, popular completed."""

    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def get(self, request):
        now = timezone.now()
        base = (
            LiveEvent.objects.filter(visibility=LiveEvent.Visibility.PUBLIC)
            .select_related("template")
            .prefetch_related("template__items")
        )

        # Counts via separate subqueries — multiple Count() on different FK relations in one
        # annotate() joins rows and inflates every count (e.g. 1 participant × 5 votes → "5 participants").
        _item_sub = (
            TemplateItem.objects.filter(template_id=OuterRef("template_id"))
            .values("template_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _vote_sub = (
            LiveVote.objects.filter(live_event_id=OuterRef("pk"), skipped=False)
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _participant_sub = (
            LiveParticipantProgress.objects.filter(live_event_id=OuterRef("pk"))
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )

        def annotate_cards(qs):
            return qs.annotate(
                vote_count=Coalesce(
                    Subquery(_vote_sub, output_field=IntegerField()),
                    Value(0),
                ),
                participant_count=Coalesce(
                    Subquery(_participant_sub, output_field=IntegerField()),
                    Value(0),
                ),
                item_count=Coalesce(
                    Subquery(_item_sub, output_field=IntegerField()),
                    Value(0),
                ),
            )

        active = annotate_cards(
            base.filter(ends_at__gt=now).exclude(status=LiveEvent.Status.ENDED)
        )
        completed = annotate_cards(
            base.filter(Q(status=LiveEvent.Status.ENDED) | Q(ends_at__lte=now))
        )

        ending_soon = active.order_by("ends_at")[:16]
        most_voted = active.order_by("-vote_count", "-participant_count")[:16]
        popular_completed = completed.order_by("-vote_count", "-participant_count")[:16]

        ser = LiveEventCardSerializer
        return Response(
            {
                "ending_soon": ser(ending_soon, many=True).data,
                "most_voted": ser(most_voted, many=True).data,
                "popular_completed": ser(popular_completed, many=True).data,
            }
        )


class LiveEventsForTemplateView(APIView):
    """Recent public live sessions that used this tier template."""

    permission_classes = [IsAuthenticated, IsNotBannedUser]

    def get(self, request, template_id):
        get_object_or_404(Template.objects.all(), pk=template_id)
        base = (
            LiveEvent.objects.filter(
                template_id=template_id,
                visibility=LiveEvent.Visibility.PUBLIC,
            )
            .select_related("template")
            .prefetch_related("template__items")
        )

        _item_sub = (
            TemplateItem.objects.filter(template_id=OuterRef("template_id"))
            .values("template_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _vote_sub = (
            LiveVote.objects.filter(live_event_id=OuterRef("pk"), skipped=False)
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _participant_sub = (
            LiveParticipantProgress.objects.filter(live_event_id=OuterRef("pk"))
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )

        def annotate_cards(qs):
            return qs.annotate(
                vote_count=Coalesce(
                    Subquery(_vote_sub, output_field=IntegerField()),
                    Value(0),
                ),
                participant_count=Coalesce(
                    Subquery(_participant_sub, output_field=IntegerField()),
                    Value(0),
                ),
                item_count=Coalesce(
                    Subquery(_item_sub, output_field=IntegerField()),
                    Value(0),
                ),
            )

        qs = annotate_cards(base).order_by("-created_at")[:24]
        return Response({"results": LiveEventCardSerializer(qs, many=True).data})


class LiveEventLandingPreviewView(APIView):
    """
    Public read-only list for the marketing homepage carousel.
    Voting still requires authentication on the live room routes.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "landing_live"

    def get(self, request):
        from collections import defaultdict

        now = timezone.now()
        base = (
            LiveEvent.objects.filter(visibility=LiveEvent.Visibility.PUBLIC)
            .select_related("template", "host")
            .prefetch_related("template__items")
        )

        _item_sub = (
            TemplateItem.objects.filter(template_id=OuterRef("template_id"))
            .values("template_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _vote_sub = (
            LiveVote.objects.filter(live_event_id=OuterRef("pk"), skipped=False)
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )
        _participant_sub = (
            LiveParticipantProgress.objects.filter(live_event_id=OuterRef("pk"))
            .values("live_event_id")
            .annotate(n=Count("id"))
            .values("n")[:1]
        )

        def annotate_cards(qs):
            return qs.annotate(
                vote_count=Coalesce(
                    Subquery(_vote_sub, output_field=IntegerField()),
                    Value(0),
                ),
                participant_count=Coalesce(
                    Subquery(_participant_sub, output_field=IntegerField()),
                    Value(0),
                ),
                item_count=Coalesce(
                    Subquery(_item_sub, output_field=IntegerField()),
                    Value(0),
                ),
            )

        active = annotate_cards(
            base.filter(ends_at__gt=now).exclude(status=LiveEvent.Status.ENDED)
        )
        events = list(active.order_by("-vote_count", "-participant_count", "-created_at")[:12])
        ids = [e.id for e in events]

        voters_map: dict[int, list[str]] = defaultdict(list)
        seen_u: dict[int, set[int]] = defaultdict(set)
        if ids:
            rows = (
                LiveParticipantProgress.objects.filter(live_event_id__in=ids, user__isnull=False)
                .select_related("user")
                .order_by("live_event_id", "-joined_at")
            )
            for r in rows:
                eid = r.live_event_id
                if len(voters_map[eid]) >= 5:
                    continue
                if r.user_id in seen_u[eid]:
                    continue
                seen_u[eid].add(r.user_id)
                em = r.user.email or ""
                voters_map[eid].append((em[0] if em else "?").upper())

        results = []
        for e in events:
            pc = int(getattr(e, "participant_count", 0) or 0)
            initials = voters_map.get(e.id, [])
            shown = len(initials)
            extra = max(0, pc - shown)
            host_email = e.host.email if e.host_id else ""
            host_display = host_email.split("@", 1)[0] if host_email and "@" in host_email else (host_email or "host")
            results.append(
                {
                    "id": e.id,
                    "title": e.title,
                    "invite_url_path": f"/live/{e.invite_token}",
                    "host_display": host_display,
                    "vote_count": int(getattr(e, "vote_count", 0) or 0),
                    "participant_count": pc,
                    "ends_at": e.ends_at,
                    "recent_voter_initials": initials,
                    "extra_voters": extra,
                }
            )

        return Response({"results": results})
