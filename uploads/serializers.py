from rest_framework import serializers
from .models import UploadedImage


class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ("id", "file", "original_name", "file_size", "created_at")
        read_only_fields = ("original_name", "file_size", "created_at")
