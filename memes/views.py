import base64
import os
from typing import Any

from django.core.files.base import ContentFile
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from uploads.services import optimize_image

from .models import Meme
from .serializers import MemeCreateSerializer, MemeDetailSerializer, MemeListSerializer


class MemeViewSet(viewsets.ModelViewSet):
    """
    Public gallery + authenticated creation.

    - list/retrieve: AllowAny
    - create: IsAuthenticated
    - update/destroy: only author (or staff)
    - remix: IsAuthenticated (creates a new Meme pointing to parent)
    """

    queryset = Meme.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        if self.action in ("create", "remix"):
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return MemeCreateSerializer
        if self.action in ("update", "partial_update"):
            return MemeCreateSerializer
        if self.action == "retrieve":
            return MemeDetailSerializer
        return MemeListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def _coerce_snapshot(self, value: Any):
        # When sent as multipart/form-data, snapshot may come through as a string.
        if isinstance(value, str):
            try:
                import json

                return json.loads(value)
            except Exception:
                return {}
        if isinstance(value, dict):
            return value
        return {}

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["snapshot"] = self._coerce_snapshot(data.get("snapshot"))
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        meme: Meme = serializer.save(author=request.user)

        # If preview is provided as a dataURL string (common from canvas), accept it.
        preview_data_url = request.data.get("preview_data_url")
        if preview_data_url and not meme.preview:
            try:
                header, b64 = str(preview_data_url).split(",", 1)
                raw = base64.b64decode(b64)
                # Optimize to jpg/png
                content, content_type = optimize_image(ContentFile(raw))
                ext = ".jpg" if content_type == "image/jpeg" else ".png"
                name = (meme.title or f"meme-{meme.id}").strip().replace(" ", "-") or f"meme-{meme.id}"
                name = os.path.basename(name) + ext
                meme.preview.save(name, ContentFile(content), save=True)
            except Exception:
                pass

        out = MemeDetailSerializer(meme, context={"request": request}).data
        headers = self.get_success_headers(out)
        return Response(out, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        meme: Meme = self.get_object()
        if meme.author_id and meme.author_id != request.user.id and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        if "snapshot" in data:
            data["snapshot"] = self._coerce_snapshot(data.get("snapshot"))
        serializer = self.get_serializer(meme, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        meme = serializer.save()
        return Response(MemeDetailSerializer(meme, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def remix(self, request, pk=None):
        parent: Meme = self.get_object()
        data = request.data.copy()
        data["parent"] = parent.id
        data["snapshot"] = self._coerce_snapshot(data.get("snapshot", parent.snapshot))
        serializer = MemeCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        meme: Meme = serializer.save(author=request.user, parent=parent)
        return Response(MemeDetailSerializer(meme, context={"request": request}).data, status=201)

