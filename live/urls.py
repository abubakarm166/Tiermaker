from django.urls import path

from . import views

urlpatterns = [
    path(
        "templates/<int:template_id>/events/",
        views.LiveEventsForTemplateView.as_view(),
        name="live_events_for_template",
    ),
    path("events/browse/", views.LiveEventBrowseView.as_view(), name="live_event_browse"),
    path("events/landing-preview/", views.LiveEventLandingPreviewView.as_view(), name="live_event_landing_preview"),
    path("events/", views.LiveEventCreateView.as_view(), name="live_event_create"),
    path("events/<uuid:token>/", views.LiveEventDetailView.as_view(), name="live_event_detail"),
    path("events/<uuid:token>/state/", views.LiveEventStateView.as_view(), name="live_event_state"),
    path("events/<uuid:token>/join/", views.LiveEventJoinView.as_view(), name="live_event_join"),
    path("events/<uuid:token>/next-item/", views.LiveNextItemView.as_view(), name="live_event_next_item"),
    path("events/<uuid:token>/vote/", views.LiveVoteSubmitView.as_view(), name="live_event_vote"),
    path("events/<uuid:token>/host/end/", views.LiveHostEndView.as_view(), name="live_host_end"),
    path("events/<uuid:token>/host/pause/", views.LiveHostPauseView.as_view(), name="live_host_pause"),
    path("events/<uuid:token>/host/resume/", views.LiveHostResumeView.as_view(), name="live_host_resume"),
]
