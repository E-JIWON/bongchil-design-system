"use client";

import { useLayoutEffect, useRef } from "react";
import { blockCardSpec, lineSpec, renderEmbedSpec, type EmbedCardData, type EmbedSpec } from "../../lib/embed-markup";

/**
 * 링크 임베드 카드 — 표지 카드(책·링크·영상) · CD 카드(음악) · 본문 한 줄.
 *
 * 마크업은 React로 그리지 않고 `embed-markup`의 spec을 DOM으로 붙인다. 같은 spec이 발행 HTML에
 * 그대로 박제되기 때문에 — 화면에서 보는 카드와 저장된 글의 카드가 한 픽셀도 안 달라야 한다.
 * 그래서 움직임도 전부 CSS `:hover`다.
 *
 * `format="block"`은 줄에 혼자 놓인 링크(종류에 따라 표지 또는 CD가 자동으로 고른다),
 * `format="line"`은 문장 속 링크 — 『제목』 + 점선 + (저자).
 */
export function EmbedCard({
  data,
  format = "block",
  className,
}: {
  data: EmbedCardData;
  format?: "block" | "line";
  className?: string;
}) {
  const spec: EmbedSpec = format === "line" ? lineSpec(data) : blockCardSpec(data);
  return <EmbedSpecMount spec={spec} className={className} />;
}

/** spec을 그대로 DOM으로 붙인다 — spec을 직접 만든 곳(에디터 NodeView 등)에서 쓴다 */
export function EmbedSpecMount({ spec, className }: { spec: EmbedSpec; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const key = JSON.stringify(spec);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren(renderEmbedSpec(document, JSON.parse(key) as EmbedSpec));
  }, [key]);
  return <span ref={ref} className={className} />;
}
