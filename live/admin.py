from django.contrib import admin

from .models import LiveEvent, LiveParticipantProgress, LiveVote


@admin.register(LiveEvent)
class LiveEventAdmin(admin.ModelAdmin):
    list_display = ("title", "host", "status", "starts_at", "ends_at", "invite_token")
    list_filter = ("status", "visibility")
    search_fields = ("title", "invite_token")


@admin.register(LiveParticipantProgress)
class LiveParticipantProgressAdmin(admin.ModelAdmin):
    list_display = ("live_event", "session_key", "current_index", "joined_at")


@admin.register(LiveVote)
class LiveVoteAdmin(admin.ModelAdmin):
    list_display = ("live_event", "template_item", "session_key", "skipped", "tier_label", "score_value")
