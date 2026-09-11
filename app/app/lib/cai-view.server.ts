import { emptyCaiView, type CaiPublicView } from "./cai-view.ts";

/**
 * 승인된 공개 export만 읽는 서버 경계. 미연결 상태에서는 빈 상태만 반환한다.
 * 소스 수집·학습·CFAM fallback·mock 내장을 호출하지 않는다.
 * 실제 export 경로는 UI-06에서 승인 run을 확인한 뒤 연결한다.
 * @returns 빈 CAI 공개 화면.
 */
export async function readCaiPublicView(): Promise<CaiPublicView> {
  return emptyCaiView();
}
