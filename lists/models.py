from django.db import models
from django.conf import settings


class TierListReaction(models.Model):
    """One reaction per user per tier list (e.g. like, love, laugh)."""
    class ReactionType(models.TextChoices):
        LIKE = "like", "Like"
        LOVE = "love", "Love"
        LAUGH = "laugh", "Laugh"
        WOW = "wow", "Wow"
        SAD = "sad", "Sad"

    tier_list = models.ForeignKey(
        "TierList",
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tier_list_reactions",
    )
    reaction_type = models.CharField(max_length=10, choices=ReactionType.choices)

    class Meta:
        unique_together = [("tier_list", "user")]
        indexes = [models.Index(fields=["tier_list", "reaction_type"])]

    def __str__(self):
        return f"{self.user_id} {self.reaction_type} on list {self.tier_list_id}"


class TierList(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    template = models.ForeignKey(
        "templates.Template",
        on_delete=models.CASCADE,
        related_name="tier_lists",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tier_lists",
    )
    title = models.CharField(max_length=255)
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        db_index=True,
    )
    tier_assignments = models.JSONField(default=dict)  # e.g. {"S": [1, 3], "A": [2, 4]}
    row_order = models.JSONField(default=list, blank=True)  # e.g. ["S", "A", "B"] – display order of tier rows
    label_overrides = models.JSONField(default=dict, blank=True)  # e.g. {"S": "Best"} – custom display labels per row
    custom_rows = models.JSONField(default=list, blank=True)  # e.g. [{"label": "F", "color": "#0891b2"}] – rows added only to this list
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "visibility"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title
