"""
Data loading for sermons and (demo) oil series.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional


# ---------------------------------------------------------------------------
# Curated sample sermons (public-style language only)
# ---------------------------------------------------------------------------

SAMPLES = [
    {"date": "2023-01-06", "country": "Saudi Arabia", "source": "sample",
     "text": "Brothers and sisters, this Friday we are reminded of the importance of patience, charity, and strengthening family bonds. Let us increase our prayers and help those in need."},
    {"date": "2023-01-13", "country": "UAE", "source": "sample",
     "text": "The Prophet taught us the value of knowledge and good character. We must raise our children with strong faith and moral values. May Allah accept our prayers."},
    {"date": "2023-03-10", "country": "Iran", "source": "sample",
     "text": "The unjust sanctions imposed on our nation are a form of economic warfare. The people must show resistance and self-reliance in the face of this oppression and hegemony."},
    {"date": "2023-03-17", "country": "Iran", "source": "sample",
     "text": "We will not surrender to the double standards of the powerful. Our resistance continues against those who seek to dominate the region through aggression."},
    {"date": "2023-05-05", "country": "Iran", "source": "sample",
     "text": "The crusaders and the Zionist entity continue their plots against the Muslim world. The Great Satan and its allies must know that the people of resistance will never be defeated."},
    {"date": "2023-05-12", "country": "Iran", "source": "sample",
     "text": "The enemies of God and the Zionist occupation forces will face the consequences of their crimes. The Islamic nation stands firm against the kuffar and their aggression."},
    {"date": "2023-10-13", "country": "Iran", "source": "sample",
     "text": "The time has come for the oil weapon to be used against those who support the Zionist entity. The Strait of Hormuz is a vital artery and any threat to our interests will be met with strong retaliation."},
    {"date": "2023-10-20", "country": "Iran", "source": "sample",
     "text": "Jihad in the path of justice continues. The enemies who impose sanctions and attack our sacred sites will face the consequences. Oil as a weapon remains in the hands of the free nations."},
    {"date": "2023-11-17", "country": "Saudi Arabia", "source": "sample",
     "text": "We call for peace, dialogue, and the protection of civilian lives. Let us pray for stability in the region and for the well-being of all people."},
    {"date": "2023-12-01", "country": "UAE", "source": "sample",
     "text": "Friday is a day of reflection and unity. We emphasize compassion, charity, and the importance of community service in our daily lives."},
    {"date": "2024-01-19", "country": "Iran", "source": "sample",
     "text": "The ongoing sanctions are an act of economic warfare. Our nation will continue its path of resistance and will not yield to foreign pressure or hegemony."},
    {"date": "2024-02-02", "country": "Iran", "source": "sample",
     "text": "The Zionist entity and its supporters must understand that the region will not accept continued aggression. Resistance is a legitimate right of the oppressed."},
    {"date": "2024-04-05", "country": "Iran", "source": "sample",
     "text": "The arrogant powers and the Zionist entity will not succeed in their plots. Our people remain steadfast in the face of economic warfare and unjust sanctions."},
    {"date": "2024-06-14", "country": "Saudi Arabia", "source": "sample",
     "text": "This Friday we focus on the values of mercy, family, and social solidarity. Let us increase our charity and care for the less fortunate."},
]


def load_sample_sermons() -> pd.DataFrame:
    df = pd.DataFrame(SAMPLES)
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date").reset_index(drop=True)


def load_sermons_from_csv(path: str) -> pd.DataFrame:
    """
    Expected columns: date, country, text
    Optional: source
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Sermon file not found: {path}")
    df = pd.read_csv(path, parse_dates=["date"])
    required = {"date", "country", "text"}
    if not required.issubset(df.columns):
        raise ValueError(f"CSV must contain columns: {required}")
    return df.sort_values("date").reset_index(drop=True)


def load_sermons(path: Optional[str] = None) -> pd.DataFrame:
    if path is None:
        return load_sample_sermons()
    return load_sermons_from_csv(path)
