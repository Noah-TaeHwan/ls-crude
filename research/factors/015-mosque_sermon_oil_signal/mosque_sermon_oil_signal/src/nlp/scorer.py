"""
Simple, transparent escalation scorer for sermon text.
"""

import re
from typing import Dict, Tuple
from collections import Counter
from .keywords import (
    TENSE_KEYWORDS, HOSTILE_KEYWORDS, WARCRY_KEYWORDS, CALM_KEYWORDS
)


def normalize_text(text: str) -> str:
    """Basic normalization for matching."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Remove excess whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_keywords(text: str, keyword_set: set) -> int:
    text = normalize_text(text)
    count = 0
    for kw in keyword_set:
        # Word-boundary style matching where possible
        pattern = r"\b" + re.escape(kw.lower()) + r"\b"
        count += len(re.findall(pattern, text))
    return count


def score_sermon(text: str) -> Dict:
    """
    Returns a transparent escalation score and breakdown.

    Score interpretation (heuristic):
        0.0 – 0.25  → Calm
        0.25 – 0.50 → Tense
        0.50 – 0.75 → Hostile
        0.75 – 1.00 → War-cry / high escalation
    """
    text = normalize_text(text)
    if len(text) < 20:
        return {
            "score": 0.0,
            "level": "calm",
            "tense_hits": 0,
            "hostile_hits": 0,
            "warcry_hits": 0,
            "calm_hits": 0,
            "raw_length": len(text),
        }

    tense = count_keywords(text, TENSE_KEYWORDS)
    hostile = count_keywords(text, HOSTILE_KEYWORDS)
    warcry = count_keywords(text, WARCRY_KEYWORDS)
    calm = count_keywords(text, CALM_KEYWORDS)

    # Weighted score (war-cry terms dominate)
    raw = (1.0 * tense) + (2.5 * hostile) + (4.0 * warcry) - (0.3 * calm)
    # Normalize roughly to [0, 1] with a soft cap
    score = max(0.0, min(1.0, raw / 12.0))

    if score >= 0.75:
        level = "warcry"
    elif score >= 0.50:
        level = "hostile"
    elif score >= 0.25:
        level = "tense"
    else:
        level = "calm"

    return {
        "score": round(score, 3),
        "level": level,
        "tense_hits": tense,
        "hostile_hits": hostile,
        "warcry_hits": warcry,
        "calm_hits": calm,
        "raw_length": len(text),
    }


def score_batch(texts: list) -> list:
    return [score_sermon(t) for t in texts]
