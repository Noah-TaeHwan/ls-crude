# 시각화 설계: Oil Pulse 💓

**상태**: UI/UX 디자인 완료  
**기술**: React Router v8 + SVG 애니메이션  
**구현 기간**: 2주 (Phase 1-2)

---

## 컨셉

```
의료 심박동 모니터 ↔ 원유의 "맥박"

가로축: 시간 (1일/1주/1개월)
세로축: 유가 변화
색상: 신호 방향 (초록=롱, 빨강=숏)
움직임: 실시간 박동 애니메이션
```

## 레이아웃

```
┌─────────────────────────────────────┐
│ 🛢️ OIL PULSE                        │
│ LS CRUDE — 부엌이 바빠졌는가         │
├─────────────────────────────────────┤
│ 현재 가격: $72.45  ↑ 2.3%           │
├─────────────────────────────────────┤
│ 🟢 STRONG LONG  82/100  ↑           │
│ 모멘텀: 📈 가속중                   │
├─────────────────────────────────────┤
│           심박 파형 그래프            │
│    /\    /\    /\    /\             │
│   /  \  /  \  /  \  /  \            │
│  /    \/    \/    \/    \            │
│                                     │
│ 13:45  14:00  14:15  14:30         │
├─────────────────────────────────────┤
│ 📊 팩터별 강도 분석                  │
│ Oil Slice:        ▮▮▮▮ 85%         │
│ Whale Index:      ▮▮▮ 72%          │
│ Truth Social:     ▮▮▮ 58%          │
│ Wholesale-Log:    ▮▮▮▮ 81%         │
│ Renewable:        ▮ 15%            │
│ Financial ML:     ▮ 22%            │
├─────────────────────────────────────┤
│ 시간 범위: [1D] [1W] [1M] [3M] [YTD] │
│ 속도: ◀──────●──────▶ 민감도: ◀────● │
└─────────────────────────────────────┘
```

## 신호 표현 (Option D - 권장)

### 롱/숏 신호 4가지 차원

| 신호 | 색상 | 파형위치 | 박동속도 | 강도 |
|------|------|---------|---------|------|
| **STRONG LONG** | 🟢 초록 | 위쪽 | 빠름 | 진폭 크게 |
| **WEAK LONG** | 🟢 밝은 초록 | 중간 위쪽 | 중간 | 진폭 중간 |
| **NEUTRAL** | 🔵 파란색 | 중앙선 | 느림 | 진폭 작음 |
| **WEAK SHORT** | 🟡 노란색 | 중간 아래쪽 | 중간 | 진폭 중간 |
| **STRONG SHORT** | 🔴 빨강 | 아래쪽 | 빠름 | 진폭 크게 |

### 색상 코드 (다크 테마)

```css
--bg-primary: #09090b (zinc-950)
--bg-secondary: #18181b (zinc-900)
--bg-highlight: #27272a (zinc-800)

--pulse-strong-long:  #10b981 (emerald-500)
--pulse-weak-long:    #34d399 (emerald-400)
--pulse-neutral:      #60a5fa (blue-400)
--pulse-weak-short:   #f59e0b (amber-400)
--pulse-strong-short: #ef4444 (red-500)
```

## React 컴포넌트 구조

```
app/components/OilPulse/
├── OilPulse.tsx              # 메인 컨테이너
├── PulseWaveform.tsx         # SVG 파형 애니메이션
├── SignalIndicator.tsx       # 롱/숏 신호 표시
├── FactorBar.tsx             # 팩터별 강도 바
├── PulseControls.tsx         # 시간/속도 조절
└── OilPulse.module.css       # 스타일
```

### 주요 파일: OilPulse.tsx

```typescript
import React, { useState, useEffect } from 'react';

interface OilPulseProps {
  data: PulseData[];
  currentPrice: number;
  signal: SignalState;
  factors: FactorData[];
}

export function OilPulse({
  data, currentPrice, signal, factors
}: OilPulseProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1D');
  const [pulseSpeed, setPulseSpeed] = useState(1);
  const [sensitivity, setSensitivity] = useState(1);
  
  return (
    <div className="bg-zinc-950 p-6 rounded-lg">
      {/* 헤더 */}
      {/* 신호 표시 */}
      {/* 파형 */}
      {/* 팩터 분석 */}
      {/* 컨트롤 */}
    </div>
  );
}
```

### SVG 애니메이션

```css
@keyframes pulse-draw {
  0%   { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
}

@keyframes pulse-beat {
  0%, 100% { r: 15; opacity: 1; }
  50% { r: 20; opacity: 0.6; }
}

.animate-pulse-beat {
  animation: pulse-beat 0.8s ease-in-out infinite;
}

.animate-pulse-draw {
  stroke-dasharray: 1000;
  animation: pulse-draw linear infinite;
  animation-duration: calc(var(--pulse-speed) * 5s);
}
```

## 기술 스택

| 계층 | 기술 | 이유 |
|------|------|------|
| **그래프** | Visx / D3.js | SVG 완전 제어 (심장박동 효과) |
| **애니메이션** | Framer Motion / CSS | 부드러운 박동 |
| **상태 관리** | React Context / Zustand | 실시간 신호 업데이트 |
| **데이터** | TanStack Query | 캐싱 & 동기화 |
| **스타일** | Tailwind CSS + CSS Modules | 기존 스택 |
| **실시간** | WebSocket / SSE | 라이브 데이터 |

## 구현 로드맵

### Phase 1️⃣: 정적 프로토타입 (1주)

- [ ] OilPulse 메인 컴포넌트
- [ ] PulseWaveform SVG (고정 데이터)
- [ ] SignalIndicator (4가지 신호 상태)
- [ ] FactorBar (6개 팩터)
- [ ] CSS 애니메이션

**목표**: 정적 데이터로 UI 검증

### Phase 2️⃣: 인터랙션 (1주)

- [ ] 시간 범위 선택 (1D/1W/1M)
- [ ] 속도/민감도 슬라이더
- [ ] 팩터 클릭 → 팝업 상세 정보
- [ ] 타임스탬프 표시

**목표**: 사용자 상호작용 가능

### Phase 3️⃣: 데이터 연동 (2주)

- [ ] Supabase API 연결
- [ ] WebSocket 실시간 업데이트
- [ ] 각 팩터별 실시간 신호 받기
- [ ] 라이브 Oil Pizza 계산

**목표**: 실시간 데이터 표시

### Phase 4️⃣: 고도화 (2주)

- [ ] 알림 시스템 (신호 변화)
- [ ] 모바일 반응형 디자인
- [ ] PNG/SVG/CSV 내보내기
- [ ] 다크/라이트 테마 전환

**목표**: 프로덕션 준비

## 차트 라이브러리 비교

| 라이브러리 | 장점 | 단점 | 추천도 |
|-----------|------|------|--------|
| **D3.js** | 완전한 커스터마이징 | 학습곡선 높음 | ⭐⭐⭐⭐⭐ |
| **Visx** | React+D3 혼합 | 중간 난이도 | ⭐⭐⭐⭐ |
| **Recharts** | 쉬움, 반응형 | 제한된 커스터마이징 | ⭐⭐⭐ |
| **Chart.js** | 가볍고 빠름 | React 호환 약함 | ⭐⭐ |

**추천**: **Visx** (D3의 파워 + React 친화성)

## 상호작용 예시

### 시나리오 1: STRONG LONG 신호

```
트리거: Oil Slice + Whale Index + Truth Social 모두 높음

표시:
🟢 STRONG LONG  82/100  ↑
   
    /\    /\    /\
   /  \  /  \  /  \  ← 위쪽 파형 (초록, 반짝임)
  /    \/    \/    \
   
모멘텀: 📈 가속중
```

### 시나리오 2: NEUTRAL 신호

```
트리거: 팩터들이 상충

표시:
🔵 NEUTRAL  50/100  ↔
   
        /\      /\     ← 중앙선 근처
       /  \    /  \
    \_/    \  /    \
       
모멘텀: ➡️ 안정
```

## 다음 단계

**이번주**: 
- Phase 1 프로토타입 시작 (정적 UI)
- Visx 학습

**다음주**:
- Phase 2 인터랙션 완성
- 실제 팩터 데이터 통합

---

**완전한 상세 설계는**: `docs/ui-design-oil-pulse.md` 참고
