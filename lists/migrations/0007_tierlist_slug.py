from django.db import migrations, models

from core.slugs import build_slug


def populate_slugs(apps, schema_editor):
    TierList = apps.get_model("lists", "TierList")
    for obj in TierList.objects.all().iterator():
        obj.slug = build_slug(obj.title, obj.pk)
        obj.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("lists", "0006_add_tierlist_thumbnail"),
    ]

    operations = [
        migrations.AddField(
            model_name="tierlist",
            name="slug",
            field=models.SlugField(blank=True, db_index=True, max_length=270, unique=True),
        ),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]
