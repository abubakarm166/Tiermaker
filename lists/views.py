from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.http import HttpResponse
from django.core.files.base import ContentFile
from django.utils import timezone

from core.lookups import SlugOrPkLookupMixin
from core.permissions import IsNotBannedUser
from .models import TierList, TierListReaction
from .serializers import TierListSerializer, TierListDetailSerializer, TierListWriteSerializer
from .permissions import IsOwnerOrAdminList
from .export_service import export_tier_list_to_png


class TierListViewSet(SlugOrPkLookupMixin, viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrAdminList]

    def get_permissions(self):
        # Public read; authenticated for create/edit/delete/export/react.
        if self.action in ("list", "retrieve", "related"):
            return [AllowAny()]
        return [IsAuthenticated(), IsNotBannedUser(), IsOwnerOrAdminList()]

    def get_queryset(self):
        user = self.request.user
        qs = TierList.objects.select_related("template", "user").prefetch_related(
            "reactions", "template__tier_rows", "template__items"
        )
        if getattr(user, "is_authenticated", False) and getattr(user, "is_admin", False):
            return qs
        if getattr(user, "is_authenticated", False):
            # Include own (private/public) + public by others
            return qs.filter(user=user) | qs.filter(visibility=TierList.Visibility.PUBLIC).exclude(user=user)
        # Anonymous: public only
        return qs.filter(visibility=TierList.Visibility.PUBLIC)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return TierListWriteSerializer
        if self.action == "retrieve":
            return TierListDetailSerializer
        return TierListSerializer

    def perform_create(self, serializer):
        tier_list = serializer.save(user=self.request.user)
        self._refresh_thumbnail(tier_list)

    def perform_update(self, serializer):
        tier_list = serializer.save()
        self._refresh_thumbnail(tier_list)

    def _refresh_thumbnail(self, tier_list: TierList) -> None:
        """
        Generate a thumbnail image representing the current tier list.
        This is used for feed/related cards so each list has a unique image.
        """
        try:
            tier_list = TierList.objects.prefetch_related(
                "template__tier_rows", "template__items"
            ).get(pk=tier_list.pk)
            png_bytes = export_tier_list_to_png(tier_list)
            from PIL import Image
            import io

            im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
            # Shrink first, then crop to exactly 4:3 from top-left (tier labels sit left;
            # wide boards were saved as short strips and looked broken in card grids).
            target_w, target_h = 1600, 1200
            im.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
            w, h = im.size
            if w > 0 and h > 0:
                want_aspect = 4.0 / 3.0
                cur = w / float(h)
                if cur > want_aspect + 0.01:
                    new_w = int(round(h * want_aspect))
                    im = im.crop((0, 0, new_w, h))
                elif cur < want_aspect - 0.01:
                    new_h = int(round(w / want_aspect))
                    im = im.crop((0, 0, w, new_h))
            out = io.BytesIO()
            im.save(out, format="JPEG", quality=82, optimize=True)
            out.seek(0)
            tier_list.thumbnail.save(
                f"tierlist-{tier_list.pk}.jpg",
                ContentFile(out.getvalue()),
                save=True,
            )
        except Exception:
            # Thumbnail generation should never block list creation/update.
            return

    def check_owner_or_admin(self, request, tier_list):
        """Raise PermissionDenied if the current user is not the owner and not admin."""
        if not getattr(request.user, "is_admin", False) and tier_list.user_id != request.user.id:
            raise PermissionDenied("Only the owner of this list can edit or delete it.")

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_owner_or_admin(request, instance)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_owner_or_admin(request, instance)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_owner_or_admin(request, instance)
        return super().destroy(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if (
            instance.visibility == TierList.Visibility.PRIVATE
            and (not getattr(user, "is_authenticated", False) or instance.user_id != user.id)
            and not getattr(user, "is_admin", False)
        ):
            raise PermissionDenied("This list is private.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Anonymous users should see public lists; authenticated users see public + their own.
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=["post"], url_path="export")
    def export(self, request, pk=None):
        tier_list = self.get_object()
        if tier_list.visibility == TierList.Visibility.PRIVATE and tier_list.user_id != request.user.id and not request.user.is_admin:
            raise PermissionDenied("This list is private.")
        tier_list = TierList.objects.prefetch_related(
            "template__tier_rows", "template__items"
        ).get(pk=tier_list.pk)
        png_bytes = export_tier_list_to_png(tier_list)
        response = HttpResponse(png_bytes, content_type="image/png")
        response["Content-Disposition"] = 'attachment; filename="tierlist-%s.png"' % pk
        return response

    @action(detail=True, methods=["post"], url_path="react")
    def react(self, request, pk=None):
        """Set or clear the current user's reaction. Body: { \"reaction_type\": \"like\" } or null to remove."""
        tier_list = self.get_object()
        if tier_list.visibility == TierList.Visibility.PRIVATE and tier_list.user_id != request.user.id and not request.user.is_admin:
            raise PermissionDenied("This list is private.")
        reaction_type = request.data.get("reaction_type") if request.data else None
        if reaction_type is not None and reaction_type not in [c[0] for c in TierListReaction.ReactionType.choices]:
            raise ValidationError({"reaction_type": "Must be one of: like, love, laugh, wow, sad."})
        TierListReaction.objects.filter(tier_list=tier_list, user=request.user).delete()
        if reaction_type:
            TierListReaction.objects.create(tier_list=tier_list, user=request.user, reaction_type=reaction_type)
        tier_list = TierList.objects.prefetch_related("reactions").select_related("template", "user").get(pk=tier_list.pk)
        tier_list._reaction_counts = None
        tier_list._my_reaction = reaction_type
        from collections import Counter
        tier_list._reaction_counts = dict(Counter(r.reaction_type for r in tier_list.reactions.all()))
        serializer = TierListSerializer(tier_list, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="related")
    def related(self, request, pk=None):
        """
        GET /api/lists/{id}/related/ - other public lists created from the same template.
        Query params:
          - limit: int (default 6, max 12)
        """
        tier_list = self.get_object()
        try:
            limit = int(request.query_params.get("limit", "6"))
        except ValueError:
            limit = 6
        limit = max(1, min(limit, 12))

        qs = (
            TierList.objects.filter(
                template_id=tier_list.template_id,
                visibility=TierList.Visibility.PUBLIC,
            )
            .exclude(pk=tier_list.pk)
            .select_related("template", "user")
            .prefetch_related("reactions")
            .order_by("-created_at")[:limit]
        )
        serializer = TierListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class FeedView(APIView):
    """GET /api/lists/feed/ - recent public tier lists for the New Tier Lists page."""
    permission_classes = [AllowAny]

    def get(self, request):
        from datetime import timedelta

        from .serializers import TierListSerializer
        from rest_framework.pagination import PageNumberPagination

        period = (request.query_params.get("period") or "").strip().lower()
        try:
            page_size = int(request.query_params.get("page_size", "50"))
        except ValueError:
            page_size = 50
        page_size = max(1, min(page_size, 50))

        qs = (
            TierList.objects.filter(visibility=TierList.Visibility.PUBLIC)
            .select_related("template", "user")
            .prefetch_related("reactions")
            .order_by("-created_at")
        )

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_yesterday = today_start - timedelta(days=1)
        start_week = today_start - timedelta(days=now.weekday())

        if period == "today":
            qs = qs.filter(created_at__gte=today_start)
        elif period == "yesterday":
            qs = qs.filter(created_at__gte=start_yesterday, created_at__lt=today_start)
        elif period in ("this_week", "thisweek"):
            qs = qs.filter(created_at__gte=start_week)

        paginator = PageNumberPagination()
        paginator.page_size = page_size
        page = paginator.paginate_queryset(qs, request)
        serializer = TierListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class MyListsView(APIView):
    """GET /api/users/me/lists/ - current user's tier lists only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = TierList.objects.filter(user=request.user).select_related("template")
        serializer = TierListSerializer(qs, many=True)
        return Response(serializer.data)
