import {
  displayedProbabilities,
  type CaiForecastView,
  type CaiValidationView,
} from "~/lib/cai-view";

/**
 * ISO 8601 주차를 계산한다.
 * @param date YYYY-MM-DD 달력 날짜.
 * @returns ISO 주차 번호.
 */
function isoWeek(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1, d));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * ISO 시각 문자열에서 날짜 표기와 주차를 만든다. 시간대 변환은 하지 않는다.
 * @param value ISO 시각 또는 null.
 * @returns 표시용 날짜와 주차, 없으면 null.
 */
function dateInfo(value: string | null): { label: string; week: number } | null {
  const date = value === null ? null : value.slice(0, 10);
  if (date === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  return { label: `${y}년 ${m}월 ${d}일`, week: isoWeek(date) };
}

/**
 * 다음 기간 WTI 방향 카드를 그린다. 공개 승인 전이면 확률을 비우고,
 * 예시 확률로 보충하지 않는다.
 * @param props 검증된 forecast·validation 영역.
 * @returns 방향·기간·상태 카드.
 */
export function CaiForecast({
  forecast,
  validation,
}: {
  forecast: CaiForecastView;
  validation: CaiValidationView;
}) {
  const shown = displayedProbabilities(forecast);
  const published = shown !== null;
  const stateLabel = published
    ? validation.status === "INDEPENDENT_TESTED"
      ? "독립 검증 · 동결 참조"
      : "탐색 모델 · 독립 검증 전"
    : forecast.data_origin === "DEMO"
      ? "데모 · 미게시"
      : forecast.data_origin === "NO_DATA"
        ? "예측 미실행"
        : forecast.freshness === "STALE"
          ? "갱신 지연"
          : "예측 미실행";
  const origin = dateInfo(forecast.generated_at);
  const start = dateInfo(forecast.target_start);
  const end = dateInfo(forecast.target_end);
  const upPct = shown === null ? null : Math.round(shown.up * 1000) / 10;
  const notUpPct = upPct === null ? null : Math.round((100 - upPct) * 10) / 10;

  return (
    <section
      data-forecast-state={published ? "published" : "pending"}
      className="relative px-1 pt-5 pb-3 sm:px-5"
      aria-labelledby="cai-forecast-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="cai-forecast-title" className="text-xl font-semibold tracking-tight text-foreground">
          다음 기간 WTI 방향
        </h2>
        <span className="border border-primary/60 px-2 py-0.5 font-mono text-xs text-primary">
          {stateLabel}
        </span>
      </div>
      {published && upPct !== null && notUpPct !== null ? (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div data-up={String(upPct)}>
              <p className="text-sm text-muted-foreground">상승</p>
              <p className="mt-1 font-mono text-4xl text-watching">
                {upPct}
                <span className="text-sm">%</span>
              </p>
            </div>
            <div data-not-up={String(notUpPct)}>
              <p className="text-sm text-muted-foreground">하락·보합</p>
              <p className="mt-1 font-mono text-4xl">
                {notUpPct}
                <span className="text-sm">%</span>
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>
              {origin === null ? (
                "기준 시각 확인 중"
              ) : (
                <>
                  기준 <time dateTime={forecast.generated_at ?? undefined}>{origin.label}</time> (W
                  {origin.week})
                </>
              )}
            </p>
            <p>
              {start === null || end === null ? (
                "대상 기간 확인 중"
              ) : (
                <>
                  대상{" "}
                  <time dateTime={forecast.target_start ?? undefined}>
                    {start.label} (W{start.week})
                  </time>
                  {" – "}
                  <time dateTime={forecast.target_end ?? undefined}>
                    {end.label} (W{end.week})
                  </time>
                </>
              )}
            </p>
            <p className="font-mono text-xs">
              모델 {forecast.model_id ?? "—"} · 학습 {forecast.trained_run_id ?? "—"}
              {forecast.target_definition === null ? "" : ` · 정의 ${forecast.target_definition}`}
            </p>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            확률은 공개가 승인된 모델의 결과입니다. 기준일과 예측 기간은 해당 결과에 기록된 날짜입니다.
          </p>
        </div>
      ) : (
        <div className="empty-state mt-4">
          <h3>아직 예측하지 않습니다.</h3>
          <p>1차 프로젝트는 과거 실험용 지수와 회고 비교 결과로 종료했습니다. 현재 날짜의 예측 확률과 독립 예측력 검증은 후속 연구입니다.</p>
        </div>
      )}
    </section>
  );
}
