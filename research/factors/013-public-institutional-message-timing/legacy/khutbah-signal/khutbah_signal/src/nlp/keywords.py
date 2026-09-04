"""
Auditable escalation lexicon for public Gulf sermon / religious discourse texts.

Contains both English/transliteration forms (common in translated or captioned
material) and Arabic script forms.

This is intentionally transparent so every hit can be inspected and challenged.
"""

TENSE = {
    # English / common transliteration
    "sanctions", "unjust sanctions", "economic warfare", "hegemony",
    "imperialism", "occupation", "resistance", "oppression",
    "double standards", "hypocrisy", "aggression", "pressure",
    "boycott", "embargo",
    # Arabic
    "عقوبات", "حصار", "مقاومة", "ظلم", "استكبار", "احتلال",
    "هيمنة", "عدوان", "ضغوط", "مقاطعة",
}

HOSTILE = {
    "crusaders", "crusader", "zionist", "zionist entity", "zionism",
    "great satan", "enemy of islam", "enemies of god", "enemies of islam",
    "infidels", "kuffar", "taghut", "arrogant powers",
    "الصليبيين", "الصليبي", "الصهاينة", "الكيان الصهيوني",
    "الشيطان الأكبر", "أعداء الله", "أعداء الإسلام",
    "كافرين", "طواغيت", "المستكبرين",
}

WARCRY = {
    "jihad", "holy war", "oil as weapon", "oil weapon", "weaponization of oil",
    "close the strait", "strait of hormuz", "blockade",
    "martyrdom", "revenge", "retaliation", "decisive response",
    "جهاد", "سلاح النفط", "مضيق هرمز", "إغلاق المضيق",
    "استشهاد", "انتقام", "رد حاسم", "رد فعل",
}

CALM = {
    "friday", "prayer", "ramadan", "charity", "family", "morality",
    "patience", "faith", "quran", "sunnah", "prophet", "mercy",
    "compassion", "community", "guidance",
    "جمعة", "صلاة", "رمضان", "زكاة", "صبر", "إيمان",
    "قرآن", "سنة", "رحمة", "هداية",
}


def get_lexicon():
    return {
        "tense": TENSE,
        "hostile": HOSTILE,
        "warcry": WARCRY,
        "calm": CALM,
    }
