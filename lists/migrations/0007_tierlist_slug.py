from django.db import migrations, models

from core.migration_slug import apply_slug_field


def apply_tierlist_slug(apps, schema_editor):
    apply_slug_field(
        apps,
        schema_editor,
        app_label="lists",
        model_name="TierList",
        source_column="title",
        max_length=270,
        default_text="list",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("lists", "0006_add_tierlist_thumbnail"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(apply_tierlist_slug, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="tierlist",
                    name="slug",
                    field=models.SlugField(default="", max_length=270),
                    preserve_default=False,
                ),
                migrations.AlterField(
                    model_name="tierlist",
                    name="slug",
                    field=models.SlugField(max_length=270, unique=True),
                ),
            ],
        ),
    ]
