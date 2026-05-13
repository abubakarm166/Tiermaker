"""Scoring and aggregate board state for live events."""
from __future__ import annotations

from collections import defaultdict
from typing import Any

from django.db.models import Avg, Count
from django.utils import timezone

from templates.models import Template, TemplateItem

from .models import LiveEvent

DEFAULT_LABEL_SCORES = {"S": 6, "A": 5, "B": 4, "C": 3, "D": 2, "F": 1}


def tier_scores_for_template(template: Template) -> dict[str, int]:
    """Map tier row label -> numeric score (highest tier = highest score)."""
    rows = list(template.tier_rows.order_by("order"))
    out: dict[str, int] = {}
    for i, row in enumerate(rows):
        label = row.label
        upper = label.strip().upper()
        if upper in DEFAULT_LABEL_SCORES:
            out[label] = DEFAULT_LABEL_SCORES[upper]
        else:
            # Fallback: order implies rank (first row best)
            out[label] = max(len(rows) - i, 1)
    return out


def score_for_tier_vote(template: Template, tier_label: str) -> int:
    scores = tier_scores_for_template(template)
    if tier_label in scores:
        return scores[tier_label]
    upper = tier_label.strip().upper()
    if upper in DEFAULT_LABEL_SCORES:
        return DEFAULT_LABEL_SCORES[upper]
    return 3


def ordered_tier_labels(template: Template) -> list[str]:
    return [r.label for r in template.tier_rows.order_by("order")]


def can_join_event(live_event) -> tuple[bool, str]:
    """Lobby join before start is allowed; only ended / past end blocked."""
    now = timezone.now()
    if live_event.status == LiveEvent.Status.ENDED:
        return False, "Event has ended."
    if now > live_event.ends_at:
        return False, "Event has expired."
    return True, ""


def voting_allowed(live_event) -> tuple[bool, str]:
    """Submit vote / advance item only when voting window is open."""
    now = timezone.now()
    ok, msg = can_join_event(live_event)
    if not ok:
        return False, msg
    if now < live_event.starts_at:
        return False, "Voting has not started yet."
    if live_event.status == LiveEvent.Status.PAUSED:
        return False, "Voting is paused."
    return True, ""


def assign_display_tier(avg: float | None, template: Template) -> str | None:
    """Map average score to a tier row label for the board."""
    labels = ordered_tier_labels(template)
    scores = tier_scores_for_template(template)
    if not labels or avg is None:
        return labels[-1] if labels else None
    numeric_scores = [scores.get(lb, 3) for lb in labels]
    # Highest score label wins when avg is close to it
    best = labels[0]
    best_diff = abs(avg - numeric_scores[0])
    for lb, sc in zip(labels, numeric_scores):
        d = abs(avg - sc)
        if d < best_diff:
            best_diff = d
            best = lb
    return best


def build_live_state(live_event) -> dict[str, Any]:
    """Aggregate votes into items + board + counters."""
    from .models import LiveParticipantProgress, LiveVote

    template = live_event.template
    template = Template.objects.prefetch_related("tier_rows", "items").get(pk=template.pk)
    item_ids = list(template.items.values_list("id", flat=True))

    votes_qs = LiveVote.objects.filter(live_event=live_event)
    skip_count = votes_qs.filter(skipped=True).count()
    substantive = votes_qs.filter(skipped=False)

    per_item: dict[int, dict[str, Any]] = {}
    labels = ordered_tier_labels(template)
    unranked_key = "unranked"
    for iid in item_ids:
        qs = substantive.filter(template_item_id=iid)
        agg = qs.aggregate(avg=Avg("score_value"), n=Count("id"))
        avg = agg["avg"]
        n = agg["n"] or 0
        avg_f = round(float(avg), 2) if avg is not None else None
        tier_display = assign_display_tier(avg_f, template) if avg_f is not None else None
        item = TemplateItem.objects.get(pk=iid)
        img = item.image.url if item.image else None
        per_item[iid] = {
            "item_id": iid,
            "name": item.name,
            "image": img,
            "average_score": avg_f,
            "vote_count": n,
            "display_tier": tier_display,
        }

    # Board: group item ids by display tier (no votes -> unranked)
    board: dict[str, list[int]] = defaultdict(list)
    for iid, row in per_item.items():
        if row.get("vote_count", 0) == 0:
            dt = unranked_key
        else:
            dt = row.get("display_tier") or (labels[-1] if labels else unranked_key)
        board[dt].append(iid)

    participants = LiveParticipantProgress.objects.filter(live_event=live_event).count()

    tier_vote_counts: dict[str, int] = {}
    for agg_row in substantive.values("tier_label").annotate(c=Count("id")):
        lbl = (agg_row["tier_label"] or "").strip()
        if lbl:
            tier_vote_counts[lbl] = agg_row["c"]

    now = timezone.now()
    locked = live_event.status == LiveEvent.Status.ENDED or now > live_event.ends_at
    voting_open, _reason = voting_allowed(live_event)

    return {
        "total_votes": substantive.count(),
        "total_participants": participants,
        "skip_count": skip_count,
        "tier_vote_counts": tier_vote_counts,
        "items": list(per_item.values()),
        "board": dict(board),
        "locked": locked,
        "voting_open": voting_open,
        "now": now.isoformat(),
    }
