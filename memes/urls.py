from rest_framework.routers import DefaultRouter

from .views import MemeViewSet

router = DefaultRouter()
router.register(r"memes", MemeViewSet, basename="meme")

urlpatterns = router.urls

