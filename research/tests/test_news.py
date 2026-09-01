from __future__ import annotations

from pathlib import Path

from ls_crude.data.news import classify_headline, load_news_csv

FIXTURE = Path(__file__).parent / "fixtures" / "investing_headlines.csv"


def test_hormuz_and_korean_keywords() -> None:
    assert "hormuz" in classify_headline("Strait of Hormuz tanker traffic disrupted")
    assert "hormuz" in classify_headline("호르무즈 해협 유조선 리스크")


def test_inflation_policy_keywords() -> None:
    tags = classify_headline("US CPI inflation and Federal Reserve rate-cut odds")
    assert "inflation_policy" in tags
    assert "hormuz" not in tags


def test_other_when_unrelated() -> None:
    assert classify_headline("RSI oversold bounce talk") == ["other"]


def test_headline_can_carry_both_tags() -> None:
    tags = classify_headline("Hormuz tanker traffic jumps as US CPI inflation prints hot")
    assert "hormuz" in tags
    assert "inflation_policy" in tags


def test_investing_csv_fixture_tags_both_themes() -> None:
    news = load_news_csv(FIXTURE)
    tagged = {row.title: row.tags for row in news.itertuples()}
    hormuz_title = "Strait of Hormuz tanker traffic in focus after Iran-Israel strikes"
    cpi_title = "US CPI inflation eases but Federal Reserve stays cautious"
    assert "hormuz" in tagged[hormuz_title]
    assert "inflation_policy" in tagged[cpi_title]
    assert news["source"].eq("investing.com").all()
