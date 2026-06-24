from rest_framework import serializers

from .models import Meme


class MemeListSerializer(serializers.ModelSerializer):
    author_email = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(source="parent.id", read_only=True)

    class Meta:
        model = Meme
        fields = (
            "id",
            "slug",
            "title",
            "preview",
            "author_email",
            "parent_id",
            "created_at",
            "updated_at",
        )

    def get_author_email(self, obj: Meme):
        return getattr(obj.author, "email", None)


class MemeDetailSerializer(serializers.ModelSerializer):
    author_email = serializers.SerializerMethodField()
    parent_id = serializers.IntegerField(source="parent.id", read_only=True)

    class Meta:
        model = Meme
        fields = (
            "id",
            "slug",
            "title",
            "snapshot",
            "preview",
            "author_email",
            "parent_id",
            "created_at",
            "updated_at",
        )

    def get_author_email(self, obj: Meme):
        return getattr(obj.author, "email", None)


class MemeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meme
        fields = ("title", "snapshot", "preview", "parent")

