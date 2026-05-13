import uuid

from django.conf import settings
from django.db import models


class LiveEvent(models.Model):
    """Time-bound voting session tied to a tier list template."""

    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        LIVE = "LIVE", "Live"
        PAUSED = "PAUSED", "Paused"
        ENDED = "ENDED", "Ended"

    template = models.ForeignKey(
        "templates.Template",
        on_delete=models.CASCADE,
        related_name="live_events",
    )
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hosted_live_events",
    )
    title = models.CharField(max_length=255)
    invite_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["invite_token"]),
            models.Index(fields=["status", "ends_at"]),
        ]

    def __str__(self):
        return self.title


class LiveParticipantProgress(models.Model):
    """Per-participant shuffled queue of template items for voting."""

    live_event = models.ForeignKey(
        LiveEvent,
        on_delete=models.CASCADE,
        related_name="participant_progress",
    )
    session_key = models.CharField(max_length=64, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="live_participant_sessions",
    )
    item_ids_ordered = models.JSONField(default=list)
    current_index = models.PositiveIntegerField(default=0)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("live_event", "session_key")]
        indexes = [
            models.Index(fields=["live_event", "session_key"]),
        ]


class LiveVote(models.Model):
    """One vote per participant per template item (skip allowed)."""

    live_event = models.ForeignKey(
        LiveEvent,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    template_item = models.ForeignKey(
        "templates.TemplateItem",
        on_delete=models.CASCADE,
        related_name="live_votes",
    )
    session_key = models.CharField(max_length=64, db_index=True)
    skipped = models.BooleanField(default=False)
    tier_label = models.CharField(max_length=20, blank=True)
    score_value = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("live_event", "template_item", "session_key")]
        indexes = [
            models.Index(fields=["live_event", "template_item"]),
        ]
