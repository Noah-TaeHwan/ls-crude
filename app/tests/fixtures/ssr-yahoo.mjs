/** SSR 회귀 검사 전용 응답. 운영 앱과 연구 데이터에서는 로드하지 않는다. */
const fetchLive = globalThis.fetch;
/** @param input 요청 주소. @param init 요청 옵션. @returns 테스트 Yahoo 응답 또는 기존 fetch 결과. */
globalThis.fetch = async (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith("https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?")) {
    return Response.json({chart:{error:null,result:[{
      meta:{symbol:"CL=F",currency:"USD",instrumentType:"FUTURE",dataGranularity:"1d"},
      timestamp:[1704110400,1704196800],
      indicators:{quote:[{open:[90,91],high:[95,95],low:[89,90],close:[91,92],volume:[0,0]}]},
    }]}});
  }
  return fetchLive(input, init);
};
