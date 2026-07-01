from rest_framework import serializers

from .models import Meme


class MemeListSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    parent_id = serializers.IntegerField(source="parent.id", read_only=True)

    class Meta:
        model = Meme
        fields = (
            "id",
            "slug",
            "title",
            "preview",
            "author_username",
            "parent_id",
            "created_at",
            "updated_at",
        )


class MemeDetailSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    parent_id = serializers.IntegerField(source="parent.id", read_only=True)

    class Meta:
        model = Meme
        fields = (
            "id",
            "slug",
            "title",
            "snapshot",
            "preview",
            "author_username",
            "parent_id",
            "created_at",
            "updated_at",
        )


class MemeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meme
        fields = ("title", "snapshot", "preview", "parent")
