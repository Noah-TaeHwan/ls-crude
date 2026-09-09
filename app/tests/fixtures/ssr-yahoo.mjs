import { readFileSync } from "node:fs";
/** 실제 중복 응답의 최소 재현 표본. 테스트 자식 프로세스에서만 사용한다. */
const fixture=JSON.parse(readFileSync(new URL("./yahoo-duplicate-tail.json",import.meta.url),"utf8"));
/** SSR 회귀 검사 전용 응답. 운영 앱과 연구 데이터에서는 로드하지 않는다. */
const fetchLive = globalThis.fetch;
/** @param input 요청 주소. @param init 요청 옵션. @returns 테스트 Yahoo 응답 또는 기존 fetch 결과. */
globalThis.fetch = async (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith("https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?")) {
    return Response.json(fixture.body);
  }
  return fetchLive(input, init);
};
