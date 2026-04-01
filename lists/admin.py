from django.contrib import admin
from .models import TierList, TierListReaction


@admin.register(TierListReaction)
class TierListReactionAdmin(admin.ModelAdmin):
    list_display = ("tier_list", "user", "reaction_type")
    list_filter = ("reaction_type",)
    raw_id_fields = ("tier_list", "user")


@admin.register(TierList)
class TierListAdmin(admin.ModelAdmin):
    list_display = ("title", "template", "user", "visibility", "created_at")
    list_filter = ("visibility", "created_at")
    search_fields = ("title",)
    raw_id_fields = ("template", "user")
