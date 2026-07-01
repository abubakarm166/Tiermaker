from django.db import migrations, models

from core.migration_slug import apply_slug_field


def apply_meme_slug(apps, schema_editor):
    apply_slug_field(
        apps,
        schema_editor,
        app_label="memes",
        model_name="Meme",
        source_column="title",
        max_length=140,
        default_text="meme",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("memes", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(apply_meme_slug, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="meme",
                    name="slug",
                    field=models.SlugField(default="", max_length=140),
                    preserve_default=False,
                ),
                migrations.AlterField(
                    model_name="meme",
                    name="slug",
                    field=models.SlugField(max_length=140, unique=True),
                ),
            ],
        ),
    ]
