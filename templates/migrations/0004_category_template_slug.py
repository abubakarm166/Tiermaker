from django.db import migrations, models

from core.migration_slug import apply_slug_field


def apply_category_slug(apps, schema_editor):
    apply_slug_field(
        apps,
        schema_editor,
        app_label="templates",
        model_name="Category",
        source_column="name",
        max_length=220,
        default_text="category",
        constraint_name="templates_category_slug_key",
    )


def apply_template_slug(apps, schema_editor):
    apply_slug_field(
        apps,
        schema_editor,
        app_label="templates",
        model_name="Template",
        source_column="title",
        max_length=270,
        default_text="template",
        constraint_name="templates_template_slug_key",
    )


class Migration(migrations.Migration):

    dependencies = [
        ("templates", "0003_add_template_thumbnail"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(apply_category_slug, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="category",
                    name="slug",
                    field=models.SlugField(default="", max_length=220),
                    preserve_default=False,
                ),
                migrations.AlterField(
                    model_name="category",
                    name="slug",
                    field=models.SlugField(max_length=220, unique=True),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(apply_template_slug, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="template",
                    name="slug",
                    field=models.SlugField(default="", max_length=270),
                    preserve_default=False,
                ),
                migrations.AlterField(
                    model_name="template",
                    name="slug",
                    field=models.SlugField(max_length=270, unique=True),
                ),
            ],
        ),
    ]
