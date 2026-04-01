from rest_framework import serializers
from .models import TierList, TierListReaction
from templates.serializers import TemplateListSerializer, TemplateDetailSerializer


class TierListSerializer(serializers.ModelSerializer):
    template_detail = TemplateListSerializer(source="template", read_only=True)
    reaction_counts = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="user.email", read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = TierList
        fields = (
            "id",
            "template",
            "template_detail",
            "user",
            "user_email",
            "title",
            "visibility",
            "tier_assignments",
            "row_order",
            "label_overrides",
            "custom_rows",
            "created_at",
            "updated_at",
            "reaction_counts",
            "my_reaction",
            "can_edit",
        )
        read_only_fields = ("user",)

    def get_reaction_counts(self, obj):
        if hasattr(obj, "_reaction_counts"):
            return obj._reaction_counts
        reactions = getattr(obj, "reactions", None)
        if reactions is not None and hasattr(reactions, "all"):
            from collections import Counter
            obj._reaction_counts = dict(Counter(r.reaction_type for r in reactions.all()))
        else:
            from django.db.models import Count
            qs = TierListReaction.objects.filter(tier_list=obj).values("reaction_type").annotate(count=Count("id"))
            obj._reaction_counts = {r["reaction_type"]: r["count"] for r in qs}
        return obj._reaction_counts

    def get_my_reaction(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        if hasattr(obj, "_my_reaction"):
            return obj._my_reaction
        reactions = getattr(obj, "reactions", None)
        if reactions is not None and hasattr(reactions, "all"):
            r = next((x for x in reactions.all() if x.user_id == request.user.id), None)
            obj._my_reaction = r.reaction_type if r else None
        else:
            r = TierListReaction.objects.filter(tier_list=obj, user=request.user).first()
            obj._my_reaction = r.reaction_type if r else None
        return obj._my_reaction

    def get_can_edit(self, obj):
        """Return True when the current user is allowed to edit this list."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        if getattr(user, "is_admin", False):
            return True
        return obj.user_id == user.id


class TierListDetailSerializer(TierListSerializer):
    """Used for retrieve: includes full template with tier_rows and items so the tier grid can render."""
    template_detail = TemplateDetailSerializer(source="template", read_only=True)


class TierListWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TierList
        fields = ("id", "template", "title", "visibility", "tier_assignments", "row_order", "label_overrides", "custom_rows")
        read_only_fields = ("id",)

    def validate_row_order(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("row_order must be a list of tier labels.")
        if not all(isinstance(x, str) for x in value):
            raise serializers.ValidationError("row_order must contain strings (tier labels).")
        return value

    def validate_label_overrides(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("label_overrides must be a JSON object.")
        if not all(isinstance(k, str) and isinstance(v, str) for k, v in value.items()):
            raise serializers.ValidationError("label_overrides keys and values must be strings.")
        return value

    def validate_custom_rows(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("custom_rows must be a list.")
        for i, row in enumerate(value):
            if not isinstance(row, dict):
                raise serializers.ValidationError(f"custom_rows[{i}] must be an object.")
            if "label" not in row or not isinstance(row.get("label"), str):
                raise serializers.ValidationError(f"custom_rows[{i}] must have a string 'label'.")
            if "color" not in row or not isinstance(row.get("color"), str):
                raise serializers.ValidationError(f"custom_rows[{i}] must have a string 'color'.")
        return value

    def validate_tier_assignments(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("tier_assignments must be a JSON object.")
        for k, v in value.items():
            if not isinstance(v, list):
                raise serializers.ValidationError(
                    f"Values in tier_assignments must be arrays (e.g. \"{k}\": [1, 2])."
                )
            if not all(isinstance(x, int) for x in v):
                raise serializers.ValidationError(
                    "Item IDs in tier_assignments must be integers."
                )
        return value
