from django.contrib import admin
from .models import Category, Template, TierRow, TemplateItem


class TierRowInline(admin.TabularInline):
    model = TierRow
    extra = 0


class TemplateItemInline(admin.TabularInline):
    model = TemplateItem
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "image")
    list_filter = ()
    search_fields = ("name",)


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "visibility", "created_by", "created_at")
    list_filter = ("visibility", "category")
    search_fields = ("title", "description")
    inlines = [TierRowInline, TemplateItemInline]
    raw_id_fields = ("created_by",)


@admin.register(TierRow)
class TierRowAdmin(admin.ModelAdmin):
    list_display = ("template", "label", "color", "order")


@admin.register(TemplateItem)
class TemplateItemAdmin(admin.ModelAdmin):
    list_display = ("template", "name", "order")
