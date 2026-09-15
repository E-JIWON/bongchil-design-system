"use client";

import { useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { BasicGlass } from "../basic-glass";

/**
 * 바텀시트 표면 — **모든 하단 시트의 단일 재질**.
 * 가려주는 유리(BasicGlass opaque) + 위쪽만 라운드(버튼과 같은 10px) + 헤어라인 + 홈 인디케이터 여백.
 * 포털 시트가 아닌 "화면 안에 붙박이로 깔리는 시트"(라이트박스 하단 패널 등)는 이 클래스만 가져다 쓴다.
 */
export const SHEET_SURFACE = "rounded-t-m shadow-l pb-[max(12px,var(--safe-bottom))]";

/** 그랩 핸들 — 시트를 손가락으로 끌어 내릴 수 있다는 유일한 신호. 모든 시트가 같은 모양 */
export function SheetHandle({ className = "" }: { className?: string }) {
  return (
    <div className={`flex shrink-0 justify-center pt-2 ${className}`}>
      <div className="h-1 w-9 rounded-full bg-ink-5/40" />
    </div>
  );
}

type BottomSheetProps = {
  /** 닫히는 중(퇴장 애니메이션). 호출부가 open/closing 상태를 관리하고 closing 동안 마운트를 유지한다. */
  closing?: boolean;
  /** 배경 딤 클릭 · 아래로 끌어내리기로 닫기 */
  onClose?: () => void;
  /** 배경 딤 표시 (기본 true) */
  backdrop?: boolean;
  /** 상단 그랩 핸들 표시 (기본 true) */
  handle?: boolean;
  /** 시트 카드(내부 패널)에 덧붙일 클래스 */
  panelClassName?: string;
  children: React.ReactNode;
};

/**
 * 모바일 하단 시트 공통 셸 — 낙서 남기기·낙서 목록·아카이브 날짜·문단 댓글이 전부 이걸 쓴다.
 * 포털 + (옵션)배경 딤 + 아래→위 슬라이드 + 그랩 핸들 + 아래로 끌어 닫기 + 유리 표면.
 * 브레이크포인트 분기는 호출부가 `useMediaQuery`로 결정한다(데스크톱은 각자 플로팅 패널).
 */
export function BottomSheet({
  closing = false,
  onClose,
  backdrop = true,
  handle = true,
  panelClassName = "",
  children,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  // 아래로 끌어 닫기 — 100px 넘게 내리면 닫고, 아니면 제자리로
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    dragStartY.current = onClose ? e.touches[0].clientY : null;
  }, [onClose]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null || !panelRef.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) panelRef.current.style.transform = `translateY(${dy}px)`;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null || !panelRef.current) return;
    const dy = e.changedTouches[0].clientY - dragStartY.current;
    dragStartY.current = null;
    if (dy > 100) onClose?.();
    else panelRef.current.style.transform = "";
  }, [onClose]);

  return createPortal(
    <>
      {backdrop && (
        <div
          data-swipe-nav="off"
          className={`fixed inset-0 z-[210] bg-ink/25 backdrop-blur-[3px] transition-opacity duration-250 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
          onClick={onClose}
        />
      )}
      {/* 앱 헤더(z-200)보다 위 — 딤이 헤더를 안 덮으면 시트만 떠 있는 것처럼 보인다 */}
      <div data-swipe-nav="off" className="fixed inset-x-0 bottom-0 z-[211]">
        <BasicGlass
          opaque
          ref={panelRef}
          // 시트 뒤 캔버스(팬/줌) 등으로 이벤트가 새지 않도록 차단 — 포털이어도 합성 이벤트는 트리로 버블
          onMouseDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`${closing ? "sheet-down-exit" : "sheet-up-enter"} ${SHEET_SURFACE} ${panelClassName}`}
        >
          {handle && <SheetHandle />}
          {children}
        </BasicGlass>
      </div>
    </>,
    document.body,
  );
}
