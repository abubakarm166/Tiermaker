from django.shortcuts import get_object_or_404


class SlugOrPkLookupMixin:
    """Resolve detail routes by slug or legacy numeric id."""

    lookup_field = "slug"
    lookup_url_kwarg = "pk"

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        if str(lookup_value).isdigit():
            obj = get_object_or_404(queryset, pk=int(lookup_value))
        else:
            obj = get_object_or_404(queryset, slug=lookup_value)
        self.check_object_permissions(self.request, obj)
        return obj
