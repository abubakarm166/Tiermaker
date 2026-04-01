import django_filters
from .models import Template


class TemplateFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category_id")
    tags = django_filters.CharFilter(method="filter_tags")
    visibility = django_filters.ChoiceFilter(choices=Template.Visibility.choices)
    ordering = django_filters.OrderingFilter(
        fields={
            "created_at": "created_at",
            "-created_at": "-created_at",
            "newest": "-created_at",
        }
    )

    class Meta:
        model = Template
        fields = ["category", "tags", "visibility"]

    def filter_tags(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(tags__contains=[value])
