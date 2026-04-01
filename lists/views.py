from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.http import HttpResponse

from .models import TierList, TierListReaction
from .serializers import TierListSerializer, TierListDetailSerializer, TierListWriteSerializer
from .permissions import IsOwnerOrAdminList
from .export_service import export_tier_list_to_png


class TierListViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrAdminList]

    def get_queryset(self):
        user = self.request.user
        qs = TierList.objects.select_related("template", "user").prefetch_related(
            "reactions", "template__tier_rows", "template__items"
        )
        if user.is_admin:
            return qs
        return qs.filter(user=user) | qs.filter(
            visibility=TierList.Visibility.PUBLIC
        ).exclude(user=user)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return TierListWriteSerializer
        if self.action == "retrieve":
            return TierListDetailSerializer
        return TierListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def check_owner_or_admin(self, request, tier_list):
        """Raise PermissionDenied if the current user is not the owner and not admin."""
        if not request.user.is_admin and tier_list.user_id != request.user.id:
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
        if instance.visibility == TierList.Visibility.PRIVATE and instance.user_id != request.user.id and not request.user.is_admin:
            raise PermissionDenied("This list is private.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not request.user.is_admin:
            queryset = queryset.filter(user=request.user)
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


class FeedView(APIView):
    """GET /api/lists/feed/ - recent public tier lists for the New Tier Lists page."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import TierListSerializer
        from rest_framework.pagination import PageNumberPagination
        qs = (
            TierList.objects.filter(visibility=TierList.Visibility.PUBLIC)
            .select_related("template", "user")
            .prefetch_related("reactions")
            .order_by("-created_at")
        )
        paginator = PageNumberPagination()
        paginator.page_size = 20
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
