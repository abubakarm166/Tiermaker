#!/usr/bin/env python
"""
Seed script for TierMaker backend.
Run from project root: python scripts/seed_data.py
Or: python manage.py shell < scripts/seed_data.py
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from templates.models import Category, Template, TierRow, TemplateItem
from lists.models import TierList

User = get_user_model()

def main():
    # Create admin user
    admin_user, _ = User.objects.get_or_create(
        email="admin@example.com",
        defaults={"role": User.Role.ADMIN, "is_staff": True}
    )
    if not admin_user.check_password("adminpass"):
        admin_user.set_password("adminpass")
        admin_user.save()
    print("Admin user: admin@example.com / adminpass")

    # Create normal user
    user, _ = User.objects.get_or_create(
        email="user@example.com",
        defaults={"role": User.Role.USER}
    )
    if not user.check_password("userpass"):
        user.set_password("userpass")
        user.save()
    print("User: user@example.com / userpass")

    # Categories
    games, _ = Category.objects.get_or_create(name="Games")
    anime, _ = Category.objects.get_or_create(name="Anime")
    movies, _ = Category.objects.get_or_create(name="Movies")

    # Sample template
    template, created = Template.objects.get_or_create(
        title="Sample Tier List",
        created_by=user,
        defaults={
            "description": "A sample tier list template.",
            "category": games,
            "tags": ["games", "sample"],
            "visibility": Template.Visibility.PUBLIC,
        }
    )
    if created:
        TierRow.objects.bulk_create([
            TierRow(template=template, label="S", color="#ff7f7f", order=0),
            TierRow(template=template, label="A", color="#ffbf7f", order=1),
            TierRow(template=template, label="B", color="#ffff7f", order=2),
            TierRow(template=template, label="C", color="#7fff7f", order=3),
        ])
        for i, name in enumerate(["Item 1", "Item 2", "Item 3", "Item 4"]):
            TemplateItem.objects.create(template=template, name=name, order=i)
        print("Created sample template and tier rows/items.")

    # Sample tier list (ranking)
    TierList.objects.get_or_create(
        template=template,
        user=user,
        defaults={
            "title": "My ranking",
            "visibility": TierList.Visibility.PUBLIC,
            "tier_assignments": {"S": [1], "A": [2, 3], "B": [4]},
        }
    )
    print("Created sample tier list.")
    print("Done. Use admin@example.com / adminpass to access admin or list users.")


if __name__ == "__main__":
    main()
