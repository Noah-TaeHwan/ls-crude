# Oil Pulse — 시각화 디자인

**제안일**: 2026-09-02  
**상태**: UI/UX 디자인 안  
**테마**: 심장박동 그래프 형식의 실시간 유가 "맥박" 시각화

---

## 컨셉: Oil Pulse 💓

```
의료기구의 심박동 모니터링 그래프처럼
원유의 "기름 맥박"을 실시간으로 표현

- 가로축: 시간 (1일, 1주, 1개월)
- 세로축: 유가 변화 (달러/배럴)
- 색상: 신호 강도 (파란색 심장 → 붉은색 맥박)
- 움직임: 실시간 업데이트 (시뮬레이션 또는 라이브 데이터)
```

---

## 디자인 스펙

### 1. 메인 컴포넌트: OilPulse

#### 레이아웃

```
┌─────────────────────────────────────────────┐
│  🛢️ OIL PULSE                               │
│  LS CRUDE — 부엌이 바빠졌는가               │
├─────────────────────────────────────────────┤
│                                             │
│  [최근 가격] $72.45 ↑ 2.3%                 │
│  [신호]     STRONG LONG  (4.2/5)            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│     /\      /\      /\      /\              │
│    /  \    /  \    /  \    /  \             │  ← 심장박동 파형
│   /    \  /    \  /    \  /    \            │
│  /      \/      \/      \/                  │
│                                             │
│  [13:45]  [14:00]  [14:15]  [14:30]        │
│                                             │
├─────────────────────────────────────────────┤
│ 📊 상세 팩터 분석                            │
│                                             │
│ Oil Slice (호르무즈+CPI):     ▮▮▮▮ 85%      │
│ Whale Index (고래 포지):      ▮▮▮▮ 72%      │
│ Truth Social (트럼프):         ▮▮▮ 58%       │
│ Wholesale-Logistics (경기):   ▮▮▮▮ 81%      │
│ Renewable Displacement:       ▮ 15%        │
│ Financial Demand (ML):        ▮ 22%        │
│                                             │
├─────────────────────────────────────────────┤
│ 시간 범위:                                  │
│ [1D] [1W] [1M] [3M] [YTD] [ALL]            │
│                                             │
│ 신호 범위:                                  │
│ Pulse Speed: ◀─────●───────▶  (빠름↔느림)  │
│ Sensitivity: ◀──●─────────▶  (높음↔낮음)   │
└─────────────────────────────────────────────┘
```

### 2. 색상 코드 (다크 테마)

```css
/* 배경 */
--bg-primary: #09090b (zinc-950)
--bg-secondary: #18181b (zinc-900)
--bg-highlight: #27272a (zinc-800)

/* 파형 (기본 상태) */
--pulse-neutral: #60a5fa (blue-400)

/* 신호 상태별 색상 */
--pulse-strong-long:  #10b981 (emerald-500)      ↑ 강한 매수
--pulse-weak-long:    #34d399 (emerald-400)      ↑ 약한 매수
--pulse-neutral:      #60a5fa (blue-400)         ↔ 중립
--pulse-weak-short:   #f59e0b (amber-400)        ↓ 약한 매도
--pulse-strong-short: #ef4444 (red-500)          ↓ 강한 매도

/* 팩터 강도 시각화 */
--factor-strong: #10b981 (진한 초록)
--factor-medium: #60a5fa (파란색)
--factor-weak:   #6b7280 (회색)
```

### 3. 애니메이션

#### 심장박동 파형 (SVG Path Animation)

```svg
<!-- SVG 파형 예시 -->
<svg viewBox="0 0 1000 200" className="oil-pulse-wave">
  <path
    d="M 0,100 L 50,100 L 60,50 L 70,150 L 80,100 L 150,100 L 160,80 L 170,120 L 180,100 L 250,100 L..."
    stroke="#10b981"
    strokeWidth="3"
    fill="none"
    vectorEffect="non-scaling-stroke"
    className="animate-pulse-draw"
  />
  
  <!-- 신호 방향 표시 -->
  <circle cx="950" cy="60" r="15" fill="#10b981" className="animate-pulse-beat" />
</svg>

/* CSS 애니메이션 */
@keyframes pulse-beat {
  0%   { r: 15; opacity: 1; }
  50%  { r: 20; opacity: 0.7; }
  100% { r: 15; opacity: 1; }
}

@keyframes pulse-draw {
  0%   { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
}

.animate-pulse-beat {
  animation: pulse-beat 0.8s ease-in-out infinite;
}

.animate-pulse-draw {
  stroke-dasharray: 1000;
  animation: pulse-draw linear infinite;
  animation-duration: calc(var(--pulse-speed, 5s) * 1);
}
```

### 4. 롱/숏 신호 표현 (아이디어 여러 개)

#### Option A: 색상 + 방향 화살표

```
STRONG LONG  ↑  🟢
  Pulse 명도/채도 최대 (진한 초록, 반짝임)
  ▲ 화살표 위로
  모멘텀 표시: 위쪽 파형이 더 크고 빠름

WEAK LONG    ↗  🟢
  Pulse 약간 밝음 (밝은 초록)
  ↗ 대각 화살표
  
NEUTRAL      ↔  🔵
  Pulse 파란색 (중립)
  ↔ 양옆 화살표
  
WEAK SHORT   ↘  🟡
  Pulse 약간 어두움 (노란색)
  ↘ 대각 화살표

STRONG SHORT ↓  🔴
  Pulse 명도 최소 (진한 빨강, 반짝임)
  ▼ 화살표 아래로
  모멘텀 표시: 아래쪽 파형이 더 크고 빠름
```

#### Option B: 파형 방향 + 높이

```
LONG: 파형이 중앙선보다 위로 (Waveform above centerline)
SHORT: 파형이 중앙선보다 아래로 (Waveform below centerline)

강도: 파형의 진폭 (Amplitude)
- Strong: 振幅 30px
- Weak:   振幅 15px
- Neutral: 진폭 0-5px (거의 일직선)
```

#### Option C: 박동 속도 + 강도

```
STRONG LONG:   빠르고 큰 박동 (BPM 높음, 진폭 큼)
WEAK LONG:     중간 박동
NEUTRAL:       느리고 작은 박동
WEAK SHORT:    역방향 느린 박동
STRONG SHORT:  역방향 빠르고 큰 박동

시각적 효과:
- 박동 속도 = BPM 수치 (비트/분)
- 박동 강도 = Amplitude (진폭)
- 방향 = 색상 + 파형 위치
```

#### Option D: 혼합 (권장 ⭐)

```
색상 (신호 방향):
  🟢 LONG (초록)
  🟡 NEUTRAL (노란색/파란색)
  🔴 SHORT (빨강)

파형 위치 (신호 강도):
  위쪽 파형 = 강함 (Strong)
  중앙 파형 = 중간 (Medium)
  아래쪽 파형 = 약함 (Weak)

박동 속도 (모멘텀):
  빠름 = 신호 강도 증가 중 (모멘텀 ↑)
  느림 = 신호 강도 감소 중 (모멘텀 ↓)

숫자 표시:
  [STRONG LONG] 82/100 ↑+5
  [Signal Strength] [Trend]
```

---

## React 컴포넌트 스트럭처

### 파일 구조

```
app/
├── components/
│   ├── OilPulse/
│   │   ├── OilPulse.tsx           (메인 컴포넌트)
│   │   ├── PulseWaveform.tsx      (SVG 파형 그래프)
│   │   ├── SignalIndicator.tsx    (롱/숏 신호 표시)
│   │   ├── FactorBar.tsx          (팩터별 강도 바)
│   │   ├── PulseControls.tsx      (시간 범위, 속도 조절)
│   │   └── OilPulse.module.css    (스타일)
│   │
│   └── ui/
│       ├── alert.tsx               (기존)
│       └── pulse-badge.tsx         (NEW: 신호 표시용)
│
└── routes/
    └── home.tsx                    (OilPulse 임베딩)
```

### 컴포넌트 코드 스켈레톤

#### OilPulse.tsx (메인)

```typescript
import React, { useState, useEffect } from 'react';
import PulseWaveform from './PulseWaveform';
import SignalIndicator from './SignalIndicator';
import FactorBar from './FactorBar';
import PulseControls from './PulseControls';

interface OilPulseProps {
  data: PulseData[];  // 시계열 데이터
  currentPrice: number;
  priceChange: number;  // %
  signal: SignalState;  // 'strong_long' | 'weak_long' | 'neutral' | ...
  factors: FactorData[];
}

interface SignalState {
  direction: 'long' | 'short' | 'neutral';
  strength: 'strong' | 'weak';
  confidence: number;  // 0-100
  momentum: 'accelerating' | 'stable' | 'decelerating';
}

export function OilPulse({
  data,
  currentPrice,
  priceChange,
  signal,
  factors,
}: OilPulseProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1D');
  const [pulseSpeed, setPulseSpeed] = useState(1);  // 1-3 배속
  const [sensitivity, setSensitivity] = useState(1);  // 1-3 민감도
  
  return (
    <div className="oil-pulse-container bg-zinc-950 rounded-lg p-6 text-white">
      {/* 헤더 */}
      <div className="oil-pulse-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🛢️ OIL PULSE</h2>
            <p className="text-zinc-400 text-sm">LS CRUDE — 부엌이 바빠졌는가</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
            <p className={`text-lg ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      
      {/* 신호 표시 */}
      <SignalIndicator signal={signal} />
      
      {/* 파형 그래프 */}
      <PulseWaveform
        data={data}
        signal={signal}
        speed={pulseSpeed}
        sensitivity={sensitivity}
      />
      
      {/* 팩터 상세 분석 */}
      <div className="factors-section mt-6">
        <h3 className="text-lg font-semibold mb-4">📊 팩터 분석</h3>
        {factors.map((factor) => (
          <FactorBar key={factor.id} factor={factor} />
        ))}
      </div>
      
      {/* 컨트롤 */}
      <PulseControls
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        pulseSpeed={pulseSpeed}
        setPulseSpeed={setPulseSpeed}
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
      />
    </div>
  );
}
```

#### PulseWaveform.tsx (SVG 파형)

```typescript
import React, { useMemo } from 'react';

interface PulseWaveformProps {
  data: PulseData[];
  signal: SignalState;
  speed: number;  // 1-3
  sensitivity: number;  // 1-3
}

export function PulseWaveform({
  data,
  signal,
  speed,
  sensitivity,
}: PulseWaveformProps) {
  // 신호별 색상
  const getWaveColor = () => {
    if (signal.direction === 'long') {
      return signal.strength === 'strong' ? '#10b981' : '#34d399';
    } else if (signal.direction === 'short') {
      return signal.strength === 'strong' ? '#ef4444' : '#f59e0b';
    }
    return '#60a5fa';
  };
  
  // SVG 경로 생성
  const svgPath = useMemo(() => {
    let path = `M 0,${150}`;  // 중앙선 시작
    
    data.forEach((point, i) => {
      const x = (i / data.length) * 1000;
      
      // 신호 방향에 따라 위/아래로
      const baseline = signal.direction === 'long' ? 100 : 200;
      const amplitude = sensitivity * (signal.strength === 'strong' ? 40 : 20);
      
      // 정현파 생성
      const wave = Math.sin((i / data.length) * Math.PI * 4) * amplitude;
      const y = baseline + wave;
      
      path += ` L ${x},${y}`;
    });
    
    return path;
  }, [data, signal, sensitivity]);
  
  return (
    <div className="pulse-waveform-container bg-zinc-900 rounded-lg p-4 my-6">
      <svg
        viewBox="0 0 1000 300"
        className="w-full h-40"
        style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }}
      >
        {/* 중앙선 */}
        <line x1="0" y1="150" x2="1000" y2="150" 
              stroke="#404040" strokeWidth="1" strokeDasharray="5,5" />
        
        {/* 파형 */}
        <path
          d={svgPath}
          stroke={getWaveColor()}
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          style={{
            animation: `pulse-draw linear infinite`,
            animationDuration: `${5 / speed}s`,
            filter: `drop-shadow(0 0 8px ${getWaveColor()})`,
          }}
        />
        
        {/* 박동 표시 (오른쪽 끝) */}
        <circle
          cx="950"
          cy={signal.direction === 'long' ? 80 : 220}
          r="8"
          fill={getWaveColor()}
          style={{
            animation: `pulse-beat ease-in-out infinite`,
            animationDuration: `${0.8 / speed}s`,
          }}
        />
      </svg>
      
      {/* 타임스탐프 */}
      <div className="flex justify-between text-xs text-zinc-500 mt-2">
        <span>{formatTime(data[0].timestamp)}</span>
        <span>{formatTime(data[Math.floor(data.length / 2)].timestamp)}</span>
        <span>{formatTime(data[data.length - 1].timestamp)}</span>
      </div>
      
      <style>{`
        @keyframes pulse-draw {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
        
        @keyframes pulse-beat {
          0%, 100% { r: 8; opacity: 1; }
          50% { r: 12; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
```

#### SignalIndicator.tsx

```typescript
import React from 'react';

interface SignalIndicatorProps {
  signal: SignalState;
}

export function SignalIndicator({ signal }: SignalIndicatorProps) {
  const labels = {
    strong_long: { text: 'STRONG LONG', emoji: '🟢', arrow: '↑' },
    weak_long: { text: 'WEAK LONG', emoji: '🟢', arrow: '↗' },
    neutral: { text: 'NEUTRAL', emoji: '🔵', arrow: '↔' },
    weak_short: { text: 'WEAK SHORT', emoji: '🟡', arrow: '↘' },
    strong_short: { text: 'STRONG SHORT', emoji: '🔴', arrow: '↓' },
  };
  
  const signalKey = `${signal.strength}_${signal.direction}` as keyof typeof labels;
  const label = labels[signalKey];
  
  return (
    <div className="signal-indicator bg-zinc-900 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{label.emoji}</span>
          <div>
            <p className="text-2xl font-bold">{label.text}</p>
            <p className="text-zinc-400">{label.arrow}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-3xl font-bold text-green-400">
            {signal.confidence}/100
          </p>
          <p className="text-sm text-zinc-400">신뢰도</p>
        </div>
      </div>
      
      {/* 모멘텀 표시 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-semibold">모멘텀:</span>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          signal.momentum === 'accelerating' ? 'bg-green-900 text-green-200' :
          signal.momentum === 'stable' ? 'bg-blue-900 text-blue-200' :
          'bg-red-900 text-red-200'
        }`}>
          {signal.momentum === 'accelerating' ? '📈 가속중' :
           signal.momentum === 'stable' ? '➡️ 안정' :
           '📉 감속중'}
        </div>
      </div>
    </div>
  );
}
```

#### FactorBar.tsx

```typescript
import React from 'react';

interface FactorData {
  id: string;
  name: string;
  value: number;  // 0-100
  contribution: 'strong' | 'medium' | 'weak';
  trend: 'up' | 'down' | 'stable';
}

interface FactorBarProps {
  factor: FactorData;
}

export function FactorBar({ factor }: FactorBarProps) {
  const getColor = () => {
    if (factor.contribution === 'strong') return 'bg-green-600';
    if (factor.contribution === 'medium') return 'bg-blue-600';
    return 'bg-gray-600';
  };
  
  const getTrendEmoji = () => {
    if (factor.trend === 'up') return '📈';
    if (factor.trend === 'down') return '📉';
    return '➡️';
  };
  
  return (
    <div className="factor-bar mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">
          {getTrendEmoji()} {factor.name}
        </span>
        <span className="text-sm font-bold">{factor.value}%</span>
      </div>
      <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500`}
          style={{ width: `${factor.value}%` }}
        />
      </div>
    </div>
  );
}
```

---

## 인터랙션 시나리오

### 시나리오 1: 강한 매수 신호 (Strong Long)

```
상황: Oil Slice + Whale Index + Truth Social 모두 강함

표현:
┌──────────────────────────┐
│ 🟢 STRONG LONG  82/100   │
│ ↑                        │
│                          │
│   /\    /\    /\         │  ← 위쪽 파형
│  /  \  /  \  /  \        │  ← 진한 초록
│ /    \/    \/    \       │  ← 빠른 박동 (Fast BPM)
│                          │
│ 모멘텀: 📈 가속중         │  ← 신호 강해지는 중
└──────────────────────────┘
```

### 시나리오 2: 약한 매도 신호 (Weak Short)

```
상황: Renewable Displacement 신호만 약함

표현:
┌──────────────────────────┐
│ 🟡 WEAK SHORT  38/100    │
│ ↘                        │
│                          │
│      /\      /\          │  ← 아래쪽 파형
│     /  \    /  \         │  ← 노란색 (약함)
│  \_/    \  /    \        │  ← 느린 박동
│          \/      \       │
│                          │
│ 모멘텀: ➡️ 안정           │  ← 신호 변화 없음
└──────────────────────────┘
```

### 시나리오 3: 중립 신호 (Neutral)

```
상황: 팩터들이 서로 상충 (일부 롱, 일부 숏)

표현:
┌──────────────────────────┐
│ 🔵 NEUTRAL  50/100       │
│ ↔                        │
│                          │
│      /\      /\          │  ← 중앙선 근처
│     /  \    /  \         │  ← 파란색 (중립)
│    /    \  /    \        │  ← 느린 박동
│   /      \/      \       │
│                          │
│ 모멘텀: 📉 감속중         │  ← 신호 약해지는 중
└──────────────────────────┘
```

---

## 시간대별 뷰

### 1D (1일) - 1시간 간격
```
├─ 09:30 ─ 10:30 ─ 11:30 ─ 12:30 ─ 13:30 ─ 14:30 ─ 15:30 ─┤
│ 시간별 Oil Pizza 신호 변화
│ 박동이 빠름 (고주파)
│ 노이즈 많음 → 민감도 조절 필요
```

### 1W (1주) - 일일 간격
```
├─ Mon ─ Tue ─ Wed ─ Thu ─ Fri ─ Sat ─ Sun ─┤
│ 일별 Oil Pizza 신호
│ 박동이 중간 정도
│ 주간 트렌드 명확
```

### 1M (1개월) - 주간 간격
```
├─ Week 1 ─ Week 2 ─ Week 3 ─ Week 4 ─┤
│ 주별 Oil Pizza 신호
│ 박동이 느림 (저주파)
│ 월간 트렌드 명확
```

---

## 구현 기술 스택

### 차트 라이브러리 옵션

| 라이브러리 | 장점 | 단점 | 적합성 |
|----------|------|------|--------|
| **D3.js** | 완전한 커스터마이징 | 학습곡선 높음 | ⭐⭐⭐⭐⭐ 최고 |
| **Recharts** | React 친화, 쉬움 | 커스터마이징 제한 | ⭐⭐⭐⭐ |
| **Visx** | React+D3 혼합 | 중간 난이도 | ⭐⭐⭐⭐ |
| **Chart.js** | 가볍고 빠름 | React 호환 약함 | ⭐⭐⭐ |
| **Plotly** | 상호작용 많음 | 무겁고 느림 | ⭐⭐ |

**추천: Visx 또는 D3.js** (심장박동 효과를 위해서는 완전한 제어 필요)

### 애니메이션 라이브러리

```
- Framer Motion: React 애니메이션 (선호)
- React Spring: 물리 기반 애니메이션
- CSS Animations: 간단한 효과 (파형 그리기, 박동)
```

### 데이터 실시간 업데이트

```
- WebSocket: 라이브 데이터 스트림
- Server-Sent Events (SSE): 단방향 업데이트
- Polling: 간단하지만 비효율적
- TanStack Query: 데이터 캐싱 & 동기화
```

---

## 추가 기능 (Phase 2)

### 1. 알림 (Notifications)

```javascript
// Oil Pulse가 특정 임계값 넘을 때
if (signal.strength === 'strong' && signal.direction === 'long') {
  notify({
    title: '🟢 강한 매수 신호 감지!',
    message: '팩터 분석 결과 강한 매수 신호가 나타났습니다.',
    sound: true,  // 비프음
  });
}
```

### 2. 모바일 반응형 (Responsive)

```css
@media (max-width: 768px) {
  .oil-pulse-container {
    padding: 4;  /* 패딩 줄임 */
  }
  
  .pulse-waveform-container {
    height: 150px;  /* 높이 줄임 */
  }
  
  .factors-section {
    grid-template-columns: 1fr;  /* 1열로 축소 */
  }
}
```

### 3. 다크/라이트 테마 전환

```typescript
// useTheme() hook
const { theme, toggleTheme } = useTheme();

// 색상 변수
const colors = {
  dark: {
    bg: '#09090b',
    pulse_long: '#10b981',
    pulse_short: '#ef4444',
  },
  light: {
    bg: '#f3f4f6',
    pulse_long: '#059669',
    pulse_short: '#dc2626',
  },
};
```

### 4. 내보내기 (Export)

```typescript
// PNG, SVG, CSV 내보내기
const exportChart = (format: 'png' | 'svg' | 'csv') => {
  if (format === 'png') {
    // html2canvas로 스크린샷
  } else if (format === 'svg') {
    // SVG 직접 다운로드
  } else {
    // CSV로 데이터 내보내기
  }
};
```

---

## 디자인 시안 요약

```
┌─────────────────────────────────────────────────┐
│                   OIL PULSE 💓                   │
│                                                 │
│  현재가격: $72.45 ↑2.3%                         │
│  신호: 🟢 STRONG LONG  82/100  ↑ 가속중         │
│                                                 │
│  ════════════════════════════════════════════   │  파형 (심장박동)
│  /\    /\    /\    /\    /\    /\              │  - 색상: 신호 방향
│ /  \  /  \  /  \  /  \  /  \  /  \             │  - 위치: 신호 강도
│/    \/    \/    \/    \/    \/    \             │  - 속도: 모멘텀
│                                                 │  - 반짝임: 실시간
│  Mon ─ Tue ─ Wed ─ Thu ─ Fri ─ Sat ─ Sun        │
│                                                 │
│  📊 팩터 분석                                   │
│  Oil Slice (호르무즈+CPI):     ▮▮▮▮▮▮ 85%     │
│  Whale Index (고래 포지):      ▮▮▮▮▮ 72%      │
│  Truth Social (트럼프):        ▮▮▮▮ 58%       │
│  Wholesale-Logistics (경기):   ▮▮▮▮▮▮ 81%    │
│  Renewable Displacement:       ▮ 15%          │
│  Financial Demand (ML):        ▮ 22%          │
│                                                 │
│  [1D] [1W] [1M] [3M] [YTD] [ALL]               │
│                                                 │
│  속도: ◀─────●────────▶  민감도: ◀────●─────▶  │
└─────────────────────────────────────────────────┘
```

---

## 다음 단계

### Phase 1: 기본 프로토타입 (1주)
```
✓ OilPulse 메인 컴포넌트
✓ PulseWaveform SVG
✓ SignalIndicator
✓ 정적 데이터로 UI 검증
```

### Phase 2: 인터랙션 (1주)
```
✓ 시간 범위 선택 (1D/1W/1M)
✓ 속도/민감도 조절
✓ 팩터 클릭 시 상세 정보 팝업
```

### Phase 3: 데이터 통합 (2주)
```
✓ Supabase 또는 API에서 실시간 데이터
✓ WebSocket 연결
✓ 라이브 Oil Pulse 업데이트
```

### Phase 4: 고도화 (2주)
```
✓ 알림 시스템
✓ 모바일 반응형
✓ 내보내기 기능
✓ 다크/라이트 테마
```

---

**Phase 1 프로토타입을 지금 바로 코딩해볼까요?**
