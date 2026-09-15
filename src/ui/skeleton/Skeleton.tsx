import type { CSSProperties } from "react";

/**
 * 로딩 자리표시 블록.
 * 크기는 쓰는 쪽이 `className`(h-4 w-24 등)으로 준다 — 실제 요소와 같은 치수를 넣어야
 * 데이터가 도착해도 레이아웃이 흔들리지 않는다.
 */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-ink-5/12 ${className}`}
      style={style}
    />
  );
}
