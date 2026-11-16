"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** 붙일 자리 — 누른 버튼의 DOMRect, 요소 그대로, 또는 { top, bottom, left, right }만 있는 네모(줄 · 칸을 섞어 만든 자리) */
export type PopAnchor = Pick<DOMRect, "top" | "bottom" | "left" | "right"> | HTMLElement;

const rectOf = (a: PopAnchor) => (a instanceof HTMLElement ? a.getBoundingClientRect() : a);

/**
 * 누른 자리에 붙여 띄우는 판 — 버튼 없이 **부르는 쪽이 열고 닫는** 팝오버의 공용 껍데기.
 * (표 칸을 눌러 여는 셀렉트 · 달력처럼 트리거가 컴포넌트 밖에 있을 때)
 *
 * - 자리: anchor 바로 아래(gap). 아래가 모자라면 위로 뒤집고, 좌우는 화면 안으로 당긴다.
 *   판의 실제 높이를 재서 정한다 — 내용이 늦게 와서 높이가 바뀌면 다시 잰다.
 * - 닫기: 바깥을 누르거나 · Esc · 스크롤(판 안의 스크롤은 빼고)하면 `onClose`.
 * - 재질은 주지 않는다 — className으로 (`crayon-pop`, 유리 등).
 * - 기본은 제자리에 `position: fixed`로 그린다. 조상에 transform이 있어 자리가 어긋나면 `portal`.
 *   (`<dialog>` 안에서는 portal을 쓰지 말 것 — body로 나가면 top layer 밑에 깔린다)
 */
export function AnchoredPop({
  anchor,
  onClose,
  align = "left",
  gap = 4,
  edge = 8,
  width,
  portal = false,
  closeOnScroll = true,
  ignore,
  role,
  className = "",
  style,
  children,
}: {
  anchor: PopAnchor | null | undefined;
  onClose: () => void;
  /** left: anchor 왼쪽 선에 판 왼쪽을 · right: anchor 오른쪽 선에 판 오른쪽을 맞춘다 */
  align?: "left" | "right";
  /** anchor와 판 사이 틈(px) */
  gap?: number;
  /** 화면 가장자리에서 띄울 최소 여백(px) */
  edge?: number;
  /** 판 폭(px). 안 주면 내용 폭 */
  width?: number;
  portal?: boolean;
  closeOnScroll?: boolean;
  /** 바깥으로 치지 않을 요소(트리거) — 여기를 눌러도 닫지 않는다. 트리거가 스스로 여닫을 때 */
  ignore?: HTMLElement | null;
  role?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // 자리 — 그리기 전에 재서 깜빡임 없이. 재기 전엔 안 보이게 그려 둔다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    const place = () => {
      const at = rectOf(anchor);
      const h = el.offsetHeight;
      const w = el.offsetWidth;
      const below = at.bottom + gap;
      const top = below + h <= window.innerHeight - edge ? below : Math.max(edge, at.top - gap - h);
      const want = align === "right" ? at.right - w : at.left;
      const left = Math.max(edge, Math.min(want, window.innerWidth - w - edge));
      setPos((p) => (p && p.top === top && p.left === left ? p : { top, left }));
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [anchor, align, gap, edge]);

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const inside = (t: EventTarget | null) => t instanceof Node && (ref.current?.contains(t) || ignore?.contains(t));
    const onDown = (e: MouseEvent) => {
      if (!inside(e.target)) closeRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    // fixed라 스크롤하면 붙인 자리와 떨어진다 — 닫는다. 판 안 목록을 굴리는 건 뺀다
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Node && ref.current?.contains(e.target))) closeRef.current();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (closeOnScroll) window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [closeOnScroll, ignore]);

  const node = (
    <div
      ref={ref}
      role={role}
      className={`fixed z-[300] ${className}`}
      style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width, visibility: pos ? undefined : "hidden", ...style }}
    >
      {children}
    </div>
  );
  return portal && typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
