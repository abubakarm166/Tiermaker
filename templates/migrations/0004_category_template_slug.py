from django.db import migrations, models

from core.slugs import build_slug


def populate_slugs(apps, schema_editor):
    Category = apps.get_model("templates", "Category")
    for obj in Category.objects.all().iterator():
        obj.slug = build_slug(obj.name, obj.pk)
        obj.save(update_fields=["slug"])

    Template = apps.get_model("templates", "Template")
    for obj in Template.objects.all().iterator():
        obj.slug = build_slug(obj.title, obj.pk)
        obj.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("templates", "0003_add_template_thumbnail"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="slug",
            field=models.SlugField(blank=True, db_index=True, max_length=220, unique=True),
        ),
        migrations.AddField(
            model_name="template",
            name="slug",
            field=models.SlugField(blank=True, db_index=True, max_length=270, unique=True),
        ),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]
