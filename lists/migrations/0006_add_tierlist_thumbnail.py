from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("lists", "0005_add_color_overrides"),
    ]

    operations = [
        migrations.AddField(
            model_name="tierlist",
            name="thumbnail",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="tierlists/thumbnails/%Y/%m/",
            ),
        ),
    ]

