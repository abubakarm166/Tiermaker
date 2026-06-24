from django.utils.text import slugify


def build_slug(text: str, pk: int) -> str:
    """Build a URL slug from text plus numeric id suffix for uniqueness."""
    base = slugify(text or "")[:200] or "item"
    return f"{base}-{pk}"


def assign_slug_if_missing(instance, source_field: str) -> None:
    """Set slug on instance after save when empty (stable once set)."""
    if instance.slug:
        return
    text = getattr(instance, source_field, "") or ""
    slug = build_slug(text, instance.pk)
    type(instance).objects.filter(pk=instance.pk).update(slug=slug)
    instance.slug = slug
