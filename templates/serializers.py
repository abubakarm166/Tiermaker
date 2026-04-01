from rest_framework import serializers
from .models import Category, Template, TierRow, TemplateItem
from lists.models import TierList


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "image")


class CategoryWriteSerializer(serializers.ModelSerializer):
    """Accepts image as path string (e.g. from /api/upload/)."""
    image = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Category
        fields = ("id", "name", "image")

    @staticmethod
    def _normalize_image_path(value):
        if not value or not str(value).strip():
            return None
        s = str(value).strip()
        if s.startswith("/media/"):
            return s[7:]  # strip /media/
        return s

    def create(self, validated_data):
        image = self._normalize_image_path(validated_data.pop("image", None))
        return Category.objects.create(**validated_data, image=image)

    def update(self, instance, validated_data):
        image = validated_data.pop("image", None)
        if image is not None:
            instance.image = self._normalize_image_path(image)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TierRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = TierRow
        fields = ("id", "label", "color", "order")


class TemplateItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateItem
        fields = ("id", "name", "image", "order")


class TemplateItemWriteSerializer(serializers.Serializer):
    """Accepts image as file upload or path string (e.g. from /api/upload/)."""
    name = serializers.CharField()
    image = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    order = serializers.IntegerField(required=False, default=0)


class TemplateListSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)
    popularity = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = (
            "id",
            "title",
            "description",
            "category",
            "category_name",
            "tags",
            "visibility",
            "created_by",
            "created_by_email",
            "created_at",
            "updated_at",
            "popularity",
            "thumbnail",
        )

    def get_popularity(self, obj):
        return TierList.objects.filter(template=obj).count()

    def get_thumbnail(self, obj):
        if getattr(obj, "thumbnail", None) and obj.thumbnail:
            return obj.thumbnail.url
        items = getattr(obj, "items", None)
        if items is not None:
            first_item = items.first() if hasattr(items, "first") else (list(items)[0] if items else None)
            if first_item and getattr(first_item, "image", None) and first_item.image:
                return first_item.image.url
        return None


class TemplateDetailSerializer(serializers.ModelSerializer):
    tier_rows = TierRowSerializer(many=True, read_only=True)
    items = TemplateItemSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)
    popularity = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = (
            "id",
            "title",
            "description",
            "thumbnail",
            "category",
            "category_name",
            "tags",
            "visibility",
            "created_by",
            "created_by_email",
            "tier_rows",
            "items",
            "created_at",
            "updated_at",
            "popularity",
        )

    def get_popularity(self, obj):
        return TierList.objects.filter(template=obj).count()


class TemplateWriteSerializer(serializers.ModelSerializer):
    tier_rows = TierRowSerializer(many=True, required=False)
    items = TemplateItemWriteSerializer(many=True, required=False)
    thumbnail = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Template
        fields = (
            "id",
            "title",
            "description",
            "thumbnail",
            "category",
            "tags",
            "visibility",
            "tier_rows",
            "items",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        tier_rows_data = validated_data.pop("tier_rows", [])
        items_data = validated_data.pop("items", [])
        thumb = validated_data.pop("thumbnail", None)
        if thumb and not str(thumb).strip():
            thumb = None
        validated_data["created_by"] = self.context["request"].user
        validated_data["thumbnail"] = thumb
        template = Template.objects.create(**validated_data)
        for i, row in enumerate(tier_rows_data):
            row_data = {k: v for k, v in row.items() if k not in ("id", "order")}
            TierRow.objects.create(template=template, order=row.get("order", i), **row_data)
        for i, item in enumerate(items_data):
            img = item.get("image")
            if img and not img.strip():
                img = None
            TemplateItem.objects.create(
                template=template,
                name=item.get("name", ""),
                image=img,
                order=item.get("order", i),
            )
        return template

    def update(self, instance, validated_data):
        tier_rows_data = validated_data.pop("tier_rows", None)
        items_data = validated_data.pop("items", None)
        thumb = validated_data.pop("thumbnail", None)
        if thumb is not None:
            instance.thumbnail = thumb if (thumb and str(thumb).strip()) else None
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tier_rows_data is not None:
            instance.tier_rows.all().delete()
            for i, row in enumerate(tier_rows_data):
                row_data = {k: v for k, v in row.items() if k not in ("id", "order")}
                TierRow.objects.create(template=instance, order=row.get("order", i), **row_data)
        if items_data is not None:
            instance.items.all().delete()
            for i, item in enumerate(items_data):
                img = item.get("image")
                if img and not img.strip():
                    img = None
                TemplateItem.objects.create(
                    template=instance,
                    name=item.get("name", ""),
                    image=img,
                    order=item.get("order", i),
                )
        return instance
