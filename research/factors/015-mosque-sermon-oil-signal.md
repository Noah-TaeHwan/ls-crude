# 015 — Gulf Mosque Sermon (Khutbah) Sentiment & Volatility Signal

**상태**: 📋 **평가 및 연구 프로토타입 (Research Prototype)**  
**스타일**: 지정학적 대안 데이터 (Geopolitical Alternative NLP Data)  
**신호 유형**: ↕ 변동성(OVX) 및 지정학적 꼬리위험 조기 경보 (Early-Warning Signal)  
**가중치**: 1.0 (정성적 지정학 조기 경보)  
**데이터 소스**: 걸프국(사우디, 이란, UAE 등) 정부/종교 포털 공개 금요 설교(Khutbah) 공식 아카이브 및 공개 방송 자막 (Public Only)

---

## 🎯 가설 (Core Thesis)

1. **걸프만 종교 담화의 정치·지정학적 보정 (Calibrated Discourse)**:
   - 사우디아라비아, 이란, UAE 등 주요 산유국의 금요 대예배 설교(*Khutbah*)는 국가 종교부나 지도부의 기조와 밀접하게 조율됨.
   - 서방 제재, 군사적 긴장, 호르무즈 해협 위기 직전 **설교 내 반서방/반이스라엘/‘석유 무기화’/저항 관련 수사학의 급증**이 역사적으로 선행 관측됨.

2. **유가 변동성(OVX) 및 지정학 리스크 연동**:
   - 대중 미디어 보도 이전 현지 종교 담화의 강도 변화를 정량화하여 **호르무즈 해협 해상 위험, 원유 수송 위험 프리미엄, 원유 내재변동성(OVX)의 조기 경보 지표**로 활용.

---

## 📊 에스컬레이션 4단계 스코어링 (4-Level Escalation Scoring)

| 레벨 | 상태 | 텍스트 특성 | 예시 키워드 (Arabic / EN) |
|---|---|---|---|
| **Level 1** | **Calm** | 일상적 교리, 도덕적 권면 | 표준 종교 테마, 평화 |
| **Level 2** | **Tense** | 정책 비판, 경제 제재 언급 | "부당한 제재", "인내와 저항" |
| **Level 3** | **Hostile** | 강한 반서방/외교적 비난 수사 | "외세 개입", "적대적 세력" |
| **Level 4** | **War-cry** | 직접적 분쟁/석유 무기화 언급 | "석유는 무기다", "지하드", "결사항전" |

---

## 💡 신호 생성 알고리즘 (Signal Logic)

```python
# 1. 아랍어/영어 키워드 기반 주간 에스컬레이션 점수 산출
weekly_sermon_score = compute_khutbah_escalation_score(sermons_corpus)

# 2. 4주 롤링 Z-Score 및 변화 가속도(Delta)
sermon_z = zscore(weekly_sermon_score, window=4)
sermon_delta = weekly_sermon_score - weekly_sermon_score.shift(1)

# 3. 유가 변동성 조기 경보 신호 생성
if sermon_z > 2.0 and sermon_delta > 1.5:
    geopolitical_oil_risk_flag = "HIGH_VOLATILITY_ALERT" # 유가 변동성 급등 대비
```

---

## ⚖️ 데이터 윤리 및 엄격한 원칙 (Ethical & Compliance Rules)

- **공개 데이터(Public Data Only) 원칙**: 정부 포털 및 공영 방송 아카이브에서 공식 제공되는 공개 설교문/자막만 수집하며, 비공개 또는 사적 녹음물은 절대 수집하지 않음.
- **단독 매매 신호 금지**: 종교 담화 신호는 노이즈가 클 수 있으므로 **AIS 선박 데이터, 위성 재고, Oil Slice 뉴스 신호와 결합된 교차 검증용(Confirmation Tool)**으로만 활용.
- **모델 확장성**: 단순 렉시콘(Lexicon) 기반에서 향후 아랍어 특화 트랜스포머(CAMeL Tools, AraBERT)로 고도화 가능.

---

## 🚀 구현 계획

- [ ] 공개 아카이브 파서 및 아랍어 텍스트 정규화 모듈 (`research/src/ls_crude/data/sermon_loader.py`)
- [ ] 에스컬레이션 렉시콘 매칭 스코어러 및 AraBERT 파이프라인
- [ ] CBOE OVX(원유 변동성 지수) 및 Brent 꼬리위험과의 선행 상관성 백테스트

---

**작성일**: 2026-09-02  
**위치**: `research/factors/015-mosque-sermon-oil-signal.md` (원본 아카이브: `015-mosque_sermon_oil_signal.zip`)
