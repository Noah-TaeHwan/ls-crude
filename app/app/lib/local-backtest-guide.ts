/** 실행 진입점이 아직 없음을 알리는 고정 안내. */
export const LOCAL_BACKTEST_NO_RUN =
  "이 화면과 저장소에는 실행 가능한 백테스트 진입점이 아직 없습니다. 로컬 분석 준비 후 구현 담당자에게 인계합니다.";

/** 룩어헤드 한 줄. 웹 카피와 문서가 같은 문장을 쓴다. */
export const LOOKAHEAD_GUARD =
  "신호는 그날 알고, 손익은 다음날 CL. 같은 날 종가를 신호에 넣지 않습니다.";

/** 로컬 분석 준비·백테스트 인계 카드 한 단계. */
export interface LocalBacktestStep {
  /** 카드 제목 */
  title: string;
  /** 한 줄 설명 */
  body: string;
  /** 터미널에 붙일 명령. 없으면 생략 */
  command?: string;
}

/** 비개발자가 Cursor에서 준비하고 인계하는 순서. */
export const LOCAL_BACKTEST_STEPS: readonly LocalBacktestStep[] = [
  {
    title: "Cursor로 연다",
    body: "왼쪽 파일 목록에 research/ 와 app/ 이 보이면 맞습니다.",
  },
  {
    title: "가상환경",
    body: "터미널을 열고 아래를 그대로 붙입니다. Windows면 source 대신 .venv\\Scripts\\activate 입니다.",
    command:
      "cd research\npython -m venv .venv\nsource .venv/bin/activate\npip install -r requirements.txt\npip install -e .",
  },
  {
    title: "pytest",
    body: "통과한 상태로 인계합니다. 실패하면 다음으로 가지 않고, 성과 숫자를 적어 두지 않습니다.",
    command: "pytest",
  },
  {
    title: "시드 가격",
    body: "Yahoo CL=F 수업용 고정본입니다. Investing.com에서 가격을 긁지 않습니다.",
  },
  {
    title: "date, value",
    body: "후보 CSV 컬럼은 date, value만. 날짜는 YYYY-MM-DD. Sharpe·적중률 칸은 넣지 않습니다. 웹 업로드 칸은 없습니다.",
  },
  {
    title: "인샘플만",
    body: "2015-01-01 ~ 2023-12-31. 2024-01-01 이후는 후보를 고를 때 보지 않습니다. 아웃샘플은 후보를 잠근 뒤 한 번만 엽니다.",
  },
];
