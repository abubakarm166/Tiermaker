from django.contrib import admin
from .models import UploadedImage


@admin.register(UploadedImage)
class UploadedImageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "original_name", "file_size", "created_at")
    list_filter = ("created_at",)
    raw_id_fields = ("user",)
