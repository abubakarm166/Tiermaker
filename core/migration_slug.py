"""Helpers for idempotent slug column migrations (PostgreSQL + SQLite)."""
from __future__ import annotations

from django.db.models import SlugField

from core.slugs import build_slug


def column_exists(cursor, table, column, vendor):
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


def unique_on_column_exists(cursor, table, column):
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


def _drop_postgres_slug_indexes(cursor, table):
    cursor.execute(
        """
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = %s AND indexname LIKE %s
        """,
        [table, "%slug%"],
    )
    for (index_name,) in cursor.fetchall():
        cursor.execute(f'DROP INDEX IF EXISTS "{index_name}"')


def _backfill_slug_rows(connection, table, source_column, max_length, default_text="item"):
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT id, {source_column}, slug FROM {table} ORDER BY id")
        rows = cursor.fetchall()

    updates = []
    for pk, source_value, slug in rows:
        current = (slug or "").strip()
        if current:
            continue
        text = (source_value or "").strip() or default_text
        slug_value = build_slug(text, pk)[:max_length]
        updates.append((slug_value, pk))

    with connection.cursor() as cursor:
        for slug_value, pk in updates:
            cursor.execute(
                f"UPDATE {table} SET slug = %s WHERE id = %s",
                [slug_value, pk],
            )


def apply_slug_field(
    apps,
    schema_editor,
    *,
    app_label,
    model_name,
    source_column,
    max_length,
    default_text="item",
    constraint_name=None,
):
    """Add slug column, backfill from source_column, then enforce UNIQUE."""
    connection = schema_editor.connection
    model = apps.get_model(app_label, model_name)
    table = model._meta.db_table
    vendor = connection.vendor
    constraint_name = constraint_name or f"{table}_slug_key"

    if vendor == "postgresql":
        with connection.cursor() as cursor:
            if not column_exists(cursor, table, "slug", vendor):
                cursor.execute(
                    f"ALTER TABLE {table} ADD COLUMN slug varchar({max_length}) NOT NULL DEFAULT ''"
                )

        _backfill_slug_rows(connection, table, source_column, max_length, default_text)

        with connection.cursor() as cursor:
            if not unique_on_column_exists(cursor, table, "slug"):
                _drop_postgres_slug_indexes(cursor, table)
                cursor.execute(
                    f"ALTER TABLE {table} ADD CONSTRAINT {constraint_name} UNIQUE (slug)"
                )
            cursor.execute(f"ALTER TABLE {table} ALTER COLUMN slug DROP DEFAULT")
        return

    with connection.cursor() as cursor:
        has_column = column_exists(cursor, table, "slug", vendor)

    temp_field = SlugField(max_length=max_length, blank=True, default="")
    temp_field.set_attributes_from_name("slug")
    temp_field.model = model

    if not has_column:
        schema_editor.add_field(model, temp_field)

    _backfill_slug_rows(connection, table, source_column, max_length, default_text)

    final_field = SlugField(max_length=max_length, unique=True)
    final_field.set_attributes_from_name("slug")
    final_field.model = model
    schema_editor.alter_field(model, temp_field, final_field)
