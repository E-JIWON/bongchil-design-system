"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { BasicGlass } from "../basic-glass";
import { Button } from "../button";

/**
 * 하단 독 팝오버 셸 — 위치(위로 펼침)·재질·패딩을 한 곳에서 정한다.
 * 발자취 독(PlacesDock)·앞으로 생길 독들이 공유 → 팝오버마다 결이 갈리지 않게.
 *
 * 제목은 두지 않는다 (독 칩이 이미 이름표다). 내용은 children만 — 자체 padding 금지.
 *
 * 폭은 내용에 맞춰 줄어들고(`w-max`) 300px에서 멈춘다 → 짧은 목록은 패널이 같이 작아져 빈 여백이 안 남는다.
 * 폭이 고정돼야 하는 내용(달력 등)은 children 쪽에서 `w-[…]`로 잡는다.
 */
export function DockPopover({ children }: { children: ReactNode }) {
  return (
    <BasicGlass className="dock-panel-enter absolute bottom-full left-1/2 mb-3 w-max max-w-[min(300px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl shadow-[var(--shadow-l)]">
      <section className="p-4">{children}</section>
    </BasicGlass>
  );
}

/** 독 팝오버 공용 초기화 — 각 팝오버가 자기 자리(검색줄·월 네비 우측 등)에 놓는다 */
export function DockReset({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="text"
      size="sm"
      onClick={onClick}
      className="shrink-0"
      icon={<RotateCcw size={11} strokeWidth={2} />}
    >
      초기화
    </Button>
  );
}
