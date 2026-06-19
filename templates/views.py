from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsNotBannedUser
from .models import Category, Template
from .serializers import (
    CategorySerializer,
    CategoryWriteSerializer,
    TemplateListSerializer,
    TemplateDetailSerializer,
    TemplateWriteSerializer,
)
from .permissions import IsOwnerOrAdminTemplate, IsAdminOrReadOnly
from .filters import TemplateFilter


class CategoryViewSet(viewsets.ModelViewSet):
    """List and retrieve categories; create/update/delete for admin only."""

    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Category.objects.annotate(
            template_count=Count("templates", distinct=True)
        ).order_by("-template_count", "name")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        categories = list(page) if page is not None else list(queryset)

        category_ids = [category.id for category in categories]
        samples_by_category: dict[int, list[str]] = {cid: [] for cid in category_ids}
        if category_ids:
            for category_id, title in (
                Template.objects.filter(
                    category_id__in=category_ids,
                    visibility=Template.Visibility.PUBLIC,
                )
                .order_by("category_id", "-created_at")
                .values_list("category_id", "title")
            ):
                bucket = samples_by_category.get(category_id)
                if bucket is not None and len(bucket) < 6:
                    bucket.append(title)

        for category in categories:
            category._sample_templates = samples_by_category.get(category.id, [])

        serializer = self.get_serializer(categories, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CategoryWriteSerializer
        return CategorySerializer


class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateDetailSerializer
    permission_classes = [IsOwnerOrAdminTemplate]
    filterset_class = TemplateFilter
    search_fields = ["title"]
    ordering_fields = ["created_at", "newest", "most_popular"]
    ordering = ["-created_at"]

    def get_permissions(self):
        # Public read; authenticated for create/edit/delete.
        if self.action in ("list", "retrieve", "tier_lists"):
            return [AllowAny()]
        return [IsAuthenticated(), IsNotBannedUser(), IsOwnerOrAdminTemplate()]

    def get_queryset(self):
        user = self.request.user
        qs = Template.objects.select_related("created_by", "category").prefetch_related(
            "tier_rows", "items"
        )
        if getattr(user, "is_authenticated", False) and getattr(user, "is_admin", False):
            return qs
        if getattr(user, "is_authenticated", False):
            return qs.filter(visibility=Template.Visibility.PUBLIC) | qs.filter(created_by=user)
        return qs.filter(visibility=Template.Visibility.PUBLIC)

    def get_serializer_class(self):
        if self.action == "list":
            return TemplateListSerializer
        if self.action in ("create", "update", "partial_update"):
            return TemplateWriteSerializer
        return TemplateDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        ordering = request.query_params.get("ordering", "-created_at")
        if ordering == "most_popular":
            queryset = queryset.annotate(
                _popularity=Count("tier_lists")
            ).order_by("-_popularity")
        elif ordering == "newest":
            queryset = queryset.order_by("-created_at")
        elif ordering and ordering != "most_popular":
            # Only apply if it's a real field (-created_at, created_at, etc.)
            queryset = queryset.order_by(ordering)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="tier-lists")
    def tier_lists(self, request, pk=None):
        """
        GET /api/templates/{id}/tier-lists/
        Public tier lists created from this template (community rankings), newest first.
        """
        from lists.models import TierList
        from lists.serializers import TierListSerializer

        template = self.get_object()
        qs = (
            TierList.objects.filter(
                template_id=template.pk,
                visibility=TierList.Visibility.PUBLIC,
            )
            .select_related("template", "user")
            .prefetch_related("reactions")
            .order_by("-created_at")
        )
        paginator = PageNumberPagination()
        paginator.page_size = 24
        page = paginator.paginate_queryset(qs, request)
        serializer = TierListSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)
