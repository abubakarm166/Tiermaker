from django.db.models.signals import post_save
from django.dispatch import receiver

from core.slugs import assign_slug_if_missing
from lists.models import TierList
from memes.models import Meme
from templates.models import Category, Template


@receiver(post_save, sender=Category)
def category_slug(sender, instance, **kwargs):
    assign_slug_if_missing(instance, "name")


@receiver(post_save, sender=Template)
def template_slug(sender, instance, **kwargs):
    assign_slug_if_missing(instance, "title")


@receiver(post_save, sender=TierList)
def tier_list_slug(sender, instance, **kwargs):
    assign_slug_if_missing(instance, "title")


@receiver(post_save, sender=Meme)
def meme_slug(sender, instance, **kwargs):
    if instance.slug:
        return
    from core.slugs import build_slug

    text = (instance.title or "").strip() or "meme"
    slug = build_slug(text, instance.pk)
    Meme.objects.filter(pk=instance.pk).update(slug=slug)
    instance.slug = slug
