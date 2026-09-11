**실시간 아님. ML/DL은 가중치 설명만, WTI 예측 아님.**

# CFAM meme engine

Not alpha. Does not reopen 091-B. Does not scrape Google.

## Why QSR is in here at all

Pentagon-pizza joke: field crews eat. 091-S already froze six Main St names.
Popular Times is **not** a public API we poll. The engine only reads
`qsr_observer.json` if a human typed the label they saw.

Weight is **0.15**. Auto legs (wiki + EIA move + EIA tightness) split the other 0.85 by 1/n.

PARK / KILL tracks are not in the average. Missing legs are dropped, not filled with 0.

## Record a QSR pinch

```bash
python research/programs/cushing-busy/engine/record_qsr.py
python research/programs/cushing-busy/engine/cfam_meme_engine.py --once
```

Type only the label on the Maps card. Then the 5-minute loop picks it up at weight 0.15.

## Run

```bash
python research/programs/cushing-busy/engine/cfam_meme_engine.py --once
python research/programs/cushing-busy/engine/cfam_meme_engine.py --interval 300
```

Copy the example observer file to `qsr_observer.json` to pinch the score.
Without that file the loop still updates every five minutes; wiki and EIA
just will not change until Wikimedia or Wednesday EIA does.

## 091 check

Same table as the factor card. This engine is a **meme overlay**, not a
promotion of S/U/Y into a WTI input.

## 091-A pinch

Hotel tax 12-month city packet + AVC40 2018 AADT=6336. See [../meme/091a/README.md](../meme/091a/README.md). Weight 0.05 on lodging percentile only. AVC waits for a second year.
## 091-H pinch
`how to get to cushing` monthly Trends, weight 0.05, zeros kept. See [../meme/091h/README.md](../meme/091h/README.md).
## 091-M pinch
City open jobs count, weight 0.05. [../meme/091m/README.md](../meme/091m/README.md).
## 091-U pinch
Industrial job count, weight 0.10. [../meme/091u/README.md](../meme/091u/README.md).
## 091-W pinch
AQI if printed, weight 0.05. [../meme/091w/README.md](../meme/091w/README.md).
## 091-V pinch
Permit flags, weight 0.10. [../meme/091v/README.md](../meme/091v/README.md).

## 091-X / 091-Y pinch
Weight 0.01 each when the pair prints.
