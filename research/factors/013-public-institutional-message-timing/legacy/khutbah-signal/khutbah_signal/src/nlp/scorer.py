"""
Transparent escalation scorer.
"""

import re
from typing import Dict, Any
from .keywords import TENSE, HOSTILE, WARCRY, CALM


def normalize(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_hits(text: str, terms: set) -> int:
    text = normalize(text)
    total = 0
    for term in terms:
        # Simple boundary-aware count
        pattern = r"(?<!\w)" + re.escape(term.lower()) + r"(?!\w)"
        total += len(re.findall(pattern, text))
    return total


def score_text(
    text: str,
    tense_w: float = 1.0,
    hostile_w: float = 2.5,
    warcry_w: float = 4.0,
    calm_penalty: float = 0.3,
    score_cap: float = 12.0,
) -> Dict[str, Any]:
    """
    Returns continuous score in [0, 1] + discrete level + hit counts.
    """
    text = normalize(text)
    if len(text) < 15:
        return _empty_result(len(text))

    tense = count_hits(text, TENSE)
    hostile = count_hits(text, HOSTILE)
    warcry = count_hits(text, WARCRY)
    calm = count_hits(text, CALM)

    raw = (tense_w * tense) + (hostile_w * hostile) + (warcry_w * warcry) - (calm_penalty * calm)
    score = max(0.0, min(1.0, raw / score_cap))

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


def _empty_result(length: int) -> Dict[str, Any]:
    return {
        "score": 0.0,
        "level": "calm",
        "tense_hits": 0,
        "hostile_hits": 0,
        "warcry_hits": 0,
        "calm_hits": 0,
        "raw_length": length,
    }
