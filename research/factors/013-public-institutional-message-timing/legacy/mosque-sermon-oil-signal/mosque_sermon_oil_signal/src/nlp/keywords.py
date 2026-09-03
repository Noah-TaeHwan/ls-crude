"""
Escalation keyword lexicon for Gulf Friday sermons.

Includes both Arabic script and common English transliterations / translations
that appear in public transcripts and news summaries.

This is a transparent, auditable starting point — not a production classifier.
"""

# Level 1 – Tense / political criticism
TENSE_KEYWORDS = {
    # English / transliteration
    "sanctions", "unjust sanctions", "economic warfare", "hegemony",
    "imperialism", "occupation", "resistance", "oppression",
    "double standards", "hypocrisy", "aggression",
    # Arabic
    "عقوبات", "حصار", "مقاومة", "ظلم", "استكبار", "احتلال",
    "هيمنة", "عدوان",
}

# Level 2 – Hostile rhetoric
HOSTILE_KEYWORDS = {
    "crusaders", "crusader", "zionist", "zionist entity", "zionism",
    "great satan", "enemy of islam", "enemies of god",
    "infidels", "kuffar", "taghut",
    "الصليبيين", "الصليبي", "الصهاينة", "الكيان الصهيوني",
    "الشيطان الأكبر", "أعداء الله", "كافرين", "طواغيت",
}

# Level 3 – High escalation / conflict language
WARCRY_KEYWORDS = {
    "jihad", "holy war", "oil as weapon", "oil weapon",
    "close the strait", "strait of hormuz", "blockade",
    "martyrdom", "revenge", "retaliation",
    "جهاد", "سلاح النفط", "مضيق هرمز", "إغلاق المضيق",
    "استشهاد", "انتقام", "رد فعل",
}

# Soft / calm religious vocabulary (for contrast)
CALM_KEYWORDS = {
    "friday", "prayer", "ramadan", "charity", "family", "morality",
    "patience", "faith", "quran", "sunnah", "prophet",
    "جمعة", "صلاة", "رمضان", "زكاة", "صبر", "إيمان", "قرآن",
}


def get_all_escalation_terms():
    return {
        "tense": TENSE_KEYWORDS,
        "hostile": HOSTILE_KEYWORDS,
        "warcry": WARCRY_KEYWORDS,
        "calm": CALM_KEYWORDS,
    }
