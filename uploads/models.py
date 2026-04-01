from django.db import models
from django.conf import settings


class UploadedImage(models.Model):
    """Metadata for uploaded images (e.g. for template items)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_images",
    )
    file = models.ImageField(upload_to="uploads/%Y/%m/")
    original_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
