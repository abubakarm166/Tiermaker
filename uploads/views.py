import os
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.core.files.base import ContentFile

from .models import UploadedImage
from .serializers import UploadedImageSerializer
from .services import optimize_image

MAX_UPLOAD_SIZE = getattr(settings, "MAX_UPLOAD_SIZE", 5 * 1024 * 1024)
ALLOWED_EXTENSIONS = getattr(
    settings, "ALLOWED_IMAGE_EXTENSIONS", (".jpg", ".jpeg", ".png", ".webp")
)


class UploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file") or request.FILES.get("image")
        if not file:
            return Response(
                {"detail": "No file provided. Use 'file' or 'image' form field."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ext = os.path.splitext(file.name or "")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return Response(
                {"detail": f"Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > MAX_UPLOAD_SIZE:
            return Response(
                {"detail": f"File size must not exceed {MAX_UPLOAD_SIZE // (1024*1024)}MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data, content_type = optimize_image(file)
        except Exception as e:
            return Response(
                {"detail": "Invalid or corrupted image."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        original_name = getattr(file, "name", "") or "image"
        ext = ".jpg" if content_type == "image/jpeg" else ".png"
        name = os.path.basename(original_name)
        if not name.lower().endswith(ext):
            name = os.path.splitext(name)[0] + ext
        upload = UploadedImage(
            user=request.user,
            original_name=original_name,
            file_size=len(data),
        )
        upload.file.save(name, ContentFile(data), save=True)
        serializer = UploadedImageSerializer(upload)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
