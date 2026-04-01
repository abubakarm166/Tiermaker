from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to="categories/%Y/%m/", blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Template(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = "PUBLIC", "Public"
        PRIVATE = "PRIVATE", "Private"

    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="templates/thumbnails/%Y/%m/", blank=True, null=True)
    category = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )
    tags = models.JSONField(default=list, blank=True)  # list of strings
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["visibility"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title


class TierRow(models.Model):
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="tier_rows",
    )
    label = models.CharField(max_length=20)
    color = models.CharField(max_length=7, default="#808080")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = [("template", "order")]

    def __str__(self):
        return f"{self.template.title} - {self.label}"


class TemplateItem(models.Model):
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="items",
    )
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to="template_items/%Y/%m/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name
