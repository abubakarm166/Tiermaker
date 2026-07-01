from django.db import migrations, models


def backfill_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    from accounts.usernames import assign_username_for_user

    for user in User.objects.filter(username="").order_by("id"):
        assign_username_for_user(user)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_twitter_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="username",
            field=models.CharField(blank=True, db_index=True, default="", max_length=30),
        ),
        migrations.RunPython(backfill_usernames, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(db_index=True, max_length=30, unique=True),
        ),
    ]
