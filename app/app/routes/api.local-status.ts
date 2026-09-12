import { localStatusGuard } from "~/lib/local-status";
import { readLocalWorkStatus } from "~/lib/local-status.server";

/**
 * 로컬 개발 서버에서만 실행 현황 JSON을 돌려주는 자원 라우트.
 * 프로덕션 배포에서는 404로 감추고, 파일이 없으면 available=false만 돌려준다.
 * @returns 로컬 상태 JSON, 누락 표시 또는 404.
 */
export function loader() {
  const blocked = localStatusGuard(process.env.NODE_ENV);
  if (blocked !== null) return blocked;
  const status = readLocalWorkStatus();
  return Response.json(status ?? { available: false }, {
    headers: { "Cache-Control": "no-store" },
  });
}
