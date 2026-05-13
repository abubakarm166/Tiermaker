from rest_framework import serializers

from templates.models import Template

from .models import LiveEvent


class LiveEventCreateSerializer(serializers.ModelSerializer):
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.all(),
        source="template",
        write_only=True,
    )

    class Meta:
        model = LiveEvent
        fields = (
            "title",
            "template_id",
            "starts_at",
            "ends_at",
            "visibility",
        )


class LiveEventSummarySerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source="template.title", read_only=True)
    invite_url_path = serializers.SerializerMethodField()

    class Meta:
        model = LiveEvent
        fields = (
            "id",
            "title",
            "invite_token",
            "invite_url_path",
            "starts_at",
            "ends_at",
            "visibility",
            "status",
            "template_title",
            "created_at",
        )

    def get_invite_url_path(self, obj):
        return f"/live/{obj.invite_token}"


class TemplateItemBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    image = serializers.CharField(allow_null=True)


class NextItemSerializer(serializers.Serializer):
    done = serializers.BooleanField()
    item = TemplateItemBriefSerializer(allow_null=True)
    progress_index = serializers.IntegerField()
    progress_total = serializers.IntegerField()
    queue_item_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    voted_item_ids = serializers.ListField(child=serializers.IntegerField(), required=False)


class LiveEventCardSerializer(serializers.ModelSerializer):
    """Compact card for browse hub (carousel rows)."""

    invite_url_path = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = LiveEvent
        fields = (
            "id",
            "title",
            "invite_token",
            "invite_url_path",
            "starts_at",
            "ends_at",
            "status",
            "vote_count",
            "participant_count",
            "item_count",
            "thumbnail_url",
        )

    def get_invite_url_path(self, obj):
        return f"/live/{obj.invite_token}"

    def get_vote_count(self, obj):
        return int(getattr(obj, "vote_count", 0) or 0)

    def get_participant_count(self, obj):
        return int(getattr(obj, "participant_count", 0) or 0)

    def get_item_count(self, obj):
        return int(getattr(obj, "item_count", 0) or 0)

    def get_thumbnail_url(self, obj):
        t = obj.template
        if getattr(t, "thumbnail", None) and t.thumbnail:
            try:
                return t.thumbnail.url
            except ValueError:
                pass
        fi = t.items.first()
        return fi.image.url if fi and fi.image else None
