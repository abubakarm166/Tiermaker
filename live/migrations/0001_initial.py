import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("templates", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="LiveEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("invite_token", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("starts_at", models.DateTimeField()),
                ("ends_at", models.DateTimeField()),
                (
                    "visibility",
                    models.CharField(
                        choices=[("PUBLIC", "Public"), ("PRIVATE", "Private")],
                        default="PUBLIC",
                        max_length=10,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("SCHEDULED", "Scheduled"),
                            ("LIVE", "Live"),
                            ("PAUSED", "Paused"),
                            ("ENDED", "Ended"),
                        ],
                        db_index=True,
                        default="SCHEDULED",
                        max_length=12,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "host",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="hosted_live_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "template",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="live_events",
                        to="templates.template",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="LiveParticipantProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("session_key", models.CharField(db_index=True, max_length=64)),
                ("item_ids_ordered", models.JSONField(default=list)),
                ("current_index", models.PositiveIntegerField(default=0)),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                (
                    "live_event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participant_progress",
                        to="live.liveevent",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="live_participant_sessions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("live_event", "session_key")},
            },
        ),
        migrations.CreateModel(
            name="LiveVote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("session_key", models.CharField(db_index=True, max_length=64)),
                ("skipped", models.BooleanField(default=False)),
                ("tier_label", models.CharField(blank=True, max_length=20)),
                ("score_value", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "live_event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="votes",
                        to="live.liveevent",
                    ),
                ),
                (
                    "template_item",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="live_votes",
                        to="templates.templateitem",
                    ),
                ),
            ],
            options={
                "unique_together": {("live_event", "template_item", "session_key")},
            },
        ),
    ]
