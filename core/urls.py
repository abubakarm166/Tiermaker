from django.urls import path, include
from rest_framework.routers import DefaultRouter

from templates.views import CategoryViewSet, TemplateViewSet
from lists.views import TierListViewSet, MyListsView, FeedView

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"templates", TemplateViewSet, basename="template")
router.register(r"lists", TierListViewSet, basename="tierlist")

urlpatterns = [
    path("lists/feed/", FeedView.as_view(), name="lists_feed"),
    path("", include(router.urls)),
    path("users/me/lists/", MyListsView.as_view(), name="users_me_lists"),
]
