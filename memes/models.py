from django.conf import settings
from django.db import models


class Meme(models.Model):
    """
    A shareable meme edit.

    - `snapshot` stores the editor state (Konva layer JSON) so others can remix it.
    - `preview` stores a rendered image for fast gallery loading.
    """

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="memes",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="remixes",
    )

    title = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True, db_index=True)
    snapshot = models.JSONField(default=dict)
    preview = models.ImageField(upload_to="memes/%Y/%m/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title or f"Meme {self.pk}"

