from django.db.models import Count
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

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

    def get_queryset(self):
        user = self.request.user
        qs = Template.objects.select_related("created_by", "category").prefetch_related(
            "tier_rows", "items"
        )
        if user.is_authenticated and user.is_admin:
            return qs
        return qs.filter(visibility=Template.Visibility.PUBLIC) | qs.filter(created_by=user)

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
