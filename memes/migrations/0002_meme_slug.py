from django.db import migrations, models

from core.slugs import build_slug


def populate_slugs(apps, schema_editor):
    Meme = apps.get_model("memes", "Meme")
    for obj in Meme.objects.all().iterator():
        text = (obj.title or "").strip() or "meme"
        obj.slug = build_slug(text, obj.pk)
        obj.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("memes", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="meme",
            name="slug",
            field=models.SlugField(blank=True, db_index=True, max_length=140, unique=True),
        ),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]
