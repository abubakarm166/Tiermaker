from django.db import migrations, models
from django.db.models import CharField


def _column_exists(cursor, table, column, vendor):
    if vendor == "sqlite":
        cursor.execute(f"PRAGMA table_info({table})")
        return any(row[1] == column for row in cursor.fetchall())
    cursor.execute(
        """
        SELECT 1 FROM information_schema.columns
        WHERE table_name = %s AND column_name = %s
        """,
        [table, column],
    )
    return cursor.fetchone() is not None


def _unique_on_column_exists(cursor, table, column):
    cursor.execute(
        """
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
        WHERE t.relname = %s
          AND a.attname = %s
          AND c.contype = 'u'
        """,
        [table, column],
    )
    return cursor.fetchone() is not None


def _backfill_usernames(User):
    from accounts.usernames import generate_random_username, username_from_x_handle

    for user in User.objects.all().order_by("id"):
        if user.username:
            continue
        if user.x_username:
            username = username_from_x_handle(user.x_username)
        else:
            username = generate_random_username()
        User.objects.filter(pk=user.pk).update(username=username)


def apply_username_field(apps, schema_editor):
    """Add username column, backfill values, then add a single unique constraint."""
    connection = schema_editor.connection
    User = apps.get_model("accounts", "User")
    table = User._meta.db_table
    vendor = connection.vendor

    if vendor == "postgresql":
        with connection.cursor() as cursor:
            if not _column_exists(cursor, table, "username", vendor):
                cursor.execute(
                    f"ALTER TABLE {table} ADD COLUMN username varchar(30) NOT NULL DEFAULT ''"
                )

        _backfill_usernames(User)

        with connection.cursor() as cursor:
            if not _unique_on_column_exists(cursor, table, "username"):
                cursor.execute("DROP INDEX IF EXISTS accounts_user_username_6088629e_like")
                cursor.execute("DROP INDEX IF EXISTS accounts_user_username_6088629e")
                cursor.execute("DROP INDEX IF EXISTS accounts_user_username_like")
                cursor.execute("DROP INDEX IF EXISTS accounts_user_username_idx")
                cursor.execute(
                    f"ALTER TABLE {table} ADD CONSTRAINT accounts_user_username_key UNIQUE (username)"
                )
            cursor.execute(f"ALTER TABLE {table} ALTER COLUMN username DROP DEFAULT")
        return

    with connection.cursor() as cursor:
        has_column = _column_exists(cursor, table, "username", vendor)

    temp_field = CharField(max_length=30, blank=True, default="")
    temp_field.set_attributes_from_name("username")
    temp_field.model = User

    if not has_column:
        schema_editor.add_field(User, temp_field)

    _backfill_usernames(User)

    final_field = CharField(max_length=30, unique=True)
    final_field.set_attributes_from_name("username")
    final_field.model = User
    schema_editor.alter_field(User, temp_field, final_field)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_twitter_fields"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(apply_username_field, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="username",
                    field=models.CharField(default="", max_length=30),
                    preserve_default=False,
                ),
                migrations.AlterField(
                    model_name="user",
                    name="username",
                    field=models.CharField(max_length=30, unique=True),
                ),
            ],
        ),
    ]
