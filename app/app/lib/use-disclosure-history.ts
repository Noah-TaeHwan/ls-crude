import { useLayoutEffect, useMemo } from "react";
import { useLocation, useNavigationType } from "react-router";

/** 현재 탭의 SPA 방문 기록별 펼친 상세. 새로고침까지 보존하지 않는다. */
const disclosureHistory = new Map<string, Set<string>>();

/**
 * 목록 순서가 바뀌어도 상세를 구분할 수 있는 표시 키를 만든다.
 * @param detail 상세 요소.
 * @returns 고정 ID 또는 상위 영역 ID와 요약 문구.
 */
function disclosureKey(detail: HTMLDetailsElement): string {
  return detail.id || `${detail.parentElement?.closest("[id]")?.id}:${detail.querySelector(":scope > summary")?.textContent?.trim()}`;
}

/**
 * 뒤로·앞으로 이동할 때 상세를 스크롤 복원 전에 다시 펼친다.
 * @returns 저장된 방문 상태를 복원하는 탐색인지 여부.
 */
export function useDisclosureHistory(): boolean {
  const { key } = useLocation();
  const navigationType = useNavigationType();
  const saved = useMemo(() => navigationType === "POP" ? disclosureHistory.get(key) : undefined, [key, navigationType]);
  useLayoutEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    if (saved) {
      main.querySelectorAll<HTMLDetailsElement>("details").forEach((detail) => {
        detail.open = saved.has(disclosureKey(detail));
      });
    }
    const open = new Set([...main.querySelectorAll<HTMLDetailsElement>("details[open]")].map(disclosureKey));
    disclosureHistory.set(key, open);
    // 이동 뒤 cleanup에서는 React가 이미 open 속성을 바꿨을 수 있으므로 토글할 때 기록한다.
    const remember = (event: Event) => {
      if (!(event.target instanceof HTMLDetailsElement)) return;
      const id = disclosureKey(event.target);
      if (event.target.open) open.add(id);
      else open.delete(id);
    };
    main.addEventListener("toggle", remember, true);
    return () => main.removeEventListener("toggle", remember, true);
  }, [key, saved]);
  return saved !== undefined;
}
