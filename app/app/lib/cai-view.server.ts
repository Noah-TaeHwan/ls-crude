import snapshot from "../data/cai-public-view.json" with { type: "json" };
import { parseCaiPublicView, type CaiPublicView } from "./cai-view.ts";

/**
 * 승인된 실험용 공개 export를 검증해 읽는다. 계산·학습은 빌드나 요청 시 실행하지 않는다.
 * 과거 자료 모드와 공개시점 미확인을 유지하며 잘못된 값은 parser에서 비운다.
 * @returns 검증된 CAI 공개 화면.
 */
export async function readCaiPublicView(): Promise<CaiPublicView> {
  return parseCaiPublicView(snapshot);
}
