import { emptyCaiView } from "./cai-view";
import { readCaiPublicView } from "./cai-view.server";
import { readExperimentSummary } from "./experiment-summary.server";
import { readResearchIntake } from "./research-intake.server";
import { readResearchLedger } from "./research-ledger.server";
import { readTankerArrivals } from "./tanker-arrivals.server";
import { readVisibility } from "./visibility.server";
import { readCushingWeather } from "./cushing-weather.server";

/**
 * /research와 /history가 같은 통합 연구 기록을 그리도록 공통 데이터를 읽는다.
 * CAI 공개 adapter 실패는 빈 상태로 격리하고, 나머지 영역은 독립적으로 읽는다.
 * @returns 현재 CAI와 진행 후보·보관 기록, 갱신 관측.
 */
export async function readResearchRecord() {
  const [visibility, tankers, weather, cai] = await Promise.all([
    readVisibility(),
    readTankerArrivals(),
    readCushingWeather(),
    readCaiPublicView().catch(() => emptyCaiView()),
  ]);
  return {
    visibility,
    tankers,
    weather,
    checkedAt: new Date().toISOString(),
    cai,
    experiments: readExperimentSummary(),
    intake: readResearchIntake(),
    ledger: readResearchLedger(),
  };
}
