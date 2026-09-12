import guide from "../../public/cai-team-workflow.md?raw";

/**
 * 서버 실행 폴더와 관계없이 번들에 포함된 공동 작업 가이드를 내려준다.
 * @returns 한국어 Markdown 첨부 파일.
 */
export function loader() {
  return new Response(guide, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cai-team-workflow.md"',
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** @returns 가이드 수정 요청을 허용하지 않는 응답. */
export function action() {
  return new Response("이 가이드는 읽기 전용입니다.", { status: 405 });
}
