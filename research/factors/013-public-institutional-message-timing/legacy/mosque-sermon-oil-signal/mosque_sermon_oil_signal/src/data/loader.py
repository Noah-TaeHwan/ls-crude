"""
Data loading utilities.

For the demo we generate synthetic but stylistically plausible
sermon excerpts + a co-moving oil price / volatility series.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple


# ---------------------------------------------------------------------------
# Synthetic sermon corpus (public-style language only)
# ---------------------------------------------------------------------------

SAMPLE_SERMONS = [
    # Calm
    {
        "date": "2023-01-06",
        "country": "Saudi Arabia",
        "source": "synthetic",
        "text": "Brothers and sisters, this Friday we are reminded of the importance of patience, charity, and strengthening family bonds. Let us increase our prayers and help those in need during this blessed time."
    },
    {
        "date": "2023-01-13",
        "country": "UAE",
        "source": "synthetic",
        "text": "The Prophet taught us the value of knowledge and good character. We must raise our children with strong faith and moral values. May Allah accept our prayers."
    },
    # Tense
    {
        "date": "2023-03-10",
        "country": "Iran",
        "source": "synthetic",
        "text": "The unjust sanctions imposed on our nation are a form of economic warfare. The people must show resistance and self-reliance in the face of this oppression and hegemony."
    },
    {
        "date": "2023-03-17",
        "country": "Iran",
        "source": "synthetic",
        "text": "We will not surrender to the double standards of the powerful. Our resistance continues against those who seek to dominate the region through aggression."
    },
    # Hostile
    {
        "date": "2023-05-05",
        "country": "Iran",
        "source": "synthetic",
        "text": "The crusaders and the Zionist entity continue their plots against the Muslim world. The Great Satan and its allies must know that the people of resistance will never be defeated."
    },
    {
        "date": "2023-05-12",
        "country": "Iran",
        "source": "synthetic",
        "text": "The enemies of God and the Zionist occupation forces will face the consequences of their crimes. The Islamic nation stands firm against the kuffar and their aggression."
    },
    # Higher escalation (still public-style language)
    {
        "date": "2023-10-13",
        "country": "Iran",
        "source": "synthetic",
        "text": "The time has come for the oil weapon to be used against those who support the Zionist entity. The Strait of Hormuz is a vital artery and any threat to our interests will be met with strong retaliation."
    },
    {
        "date": "2023-10-20",
        "country": "Iran",
        "source": "synthetic",
        "text": "Jihad in the path of justice continues. The enemies who impose sanctions and attack our sacred sites will face the consequences. Oil as a weapon remains in the hands of the free nations."
    },
    # Return toward calm
    {
        "date": "2023-11-17",
        "country": "Saudi Arabia",
        "source": "synthetic",
        "text": "We call for peace, dialogue, and the protection of civilian lives. Let us pray for stability in the region and for the well-being of all people."
    },
    {
        "date": "2023-12-01",
        "country": "UAE",
        "source": "synthetic",
        "text": "Friday is a day of reflection and unity. We emphasize compassion, charity, and the importance of community service in our daily lives."
    },
    # Another tense period
    {
        "date": "2024-01-19",
        "country": "Iran",
        "source": "synthetic",
        "text": "The ongoing sanctions are an act of economic warfare. Our nation will continue its path of resistance and will not yield to foreign pressure or hegemony."
    },
    {
        "date": "2024-02-02",
        "country": "Iran",
        "source": "synthetic",
        "text": "The Zionist entity and its supporters must understand that the region will not accept continued aggression. Resistance is a legitimate right of the oppressed."
    },
]


def load_sample_sermons() -> pd.DataFrame:
    df = pd.DataFrame(SAMPLE_SERMONS)
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date").reset_index(drop=True)


def generate_synthetic_oil_series(
    start: str = "2023-01-01",
    end: str = "2024-03-01",
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate a daily oil price series with a few volatility spikes
    that roughly align with the higher-escalation sermon periods.
    """
    rng = np.random.default_rng(seed)
    dates = pd.bdate_range(start=start, end=end)
    n = len(dates)

    # Base random walk
    log_ret = rng.normal(0.0002, 0.012, n)
    # Inject higher vol around known escalation windows
    for i, d in enumerate(dates):
        if (d >= pd.Timestamp("2023-05-01") and d <= pd.Timestamp("2023-05-25")) or \
           (d >= pd.Timestamp("2023-10-10") and d <= pd.Timestamp("2023-11-05")):
            log_ret[i] *= 2.8
            log_ret[i] += rng.normal(0, 0.008)

    price = 80 * np.exp(np.cumsum(log_ret))
    vol_20 = pd.Series(log_ret).rolling(20).std() * np.sqrt(252)

    df = pd.DataFrame({
        "date": dates,
        "brent": price,
        "log_return": log_ret,
        "realized_vol_20d": vol_20.values,
    })
    return df.set_index("date")


def load_demo_data() -> Tuple[pd.DataFrame, pd.DataFrame]:
    sermons = load_sample_sermons()
    oil = generate_synthetic_oil_series()
    return sermons, oil
