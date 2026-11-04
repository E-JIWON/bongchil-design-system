"use client";

import { useEffect, useRef, useState, type KeyboardEventHandler, type ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";

/**
 * 시트 · 창 한 틀 — 브라우저 <dialog>라 포커스 가두기 · Esc 닫기 · 뒤 화면 막기가 그냥 된다. 바깥을 눌러도 닫힘.
 * 좁은 화면(1000px 아래)은 아래에서 올라오는 시트, 넓은 화면은 가운데 창. center면 늘 가운데 창.
 * 닫을 때도 들어올 때처럼 움직이고 나서 onClose (동작 줄이기면 바로).
 * title을 주면 머리 줄(뒤로 · 제목 · 닫기)을 그린다. 안 주면 내용만 — 여백은 className으로 덮어씀(p-0 등).
 * 열 때 처음 잡을 칸은 data-autofocus. 창 이름은 label 또는 labelledBy(큰 질문의 id).
 */
export function Sheet({
  open,
  onClose,
  title,
  label,
  labelledBy,
  onBack,
  wide,
  center,
  className = "",
  onKeyDown,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  /** 머리 줄 작은 제목 (예: "오늘 상태 2/6") */
  title?: ReactNode;
  label?: string;
  labelledBy?: string;
  /** 있으면 머리 왼쪽에 뒤로 */
  onBack?: () => void;
  /** 넓은 화면에서 760px (기본 440px) */
  wide?: boolean;
  /** 좁은 화면에서도 가운데 창 */
  center?: boolean;
  className?: string;
  onKeyDown?: KeyboardEventHandler;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // 열기 전에 누른 자리 — 창째 빠져도(닫기 전에 언마운트) 포커스를 거기로 돌려준다
  const from = useRef<Element | null>(null);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      from.current = document.activeElement;
      setLeaving(false);
      d.showModal();
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(
    () => () => {
      const el = from.current;
      if (el instanceof HTMLElement && el.isConnected) el.focus({ preventScroll: true });
    },
    [],
  );
  const close = () => {
    if (!onClose || leaving) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return onClose();
    setLeaving(true);
    setTimeout(onClose, 180);
  };

  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      aria-label={label}
      aria-labelledby={labelledBy}
      data-wide={wide || undefined}
      data-center={center || undefined}
      data-leaving={leaving || undefined}
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      // 바깥(뒷막)을 누르면 닫기. 뒷막 클릭도 target이 dialog라, 창 여백을 누른 것과는 자리로 가른다
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (e.target === e.currentTarget && outside) close();
      }}
    >
      <div className="sheet-grab" aria-hidden="true" />
      {title !== undefined && (
        <div className="sheet-head">
          {onBack && (
            <button type="button" className="sheet-x" aria-label="뒤로" onClick={onBack}>
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <h2 className="sheet-title">{title}</h2>
          {onClose && (
            <button type="button" className="sheet-x" aria-label="닫기" onClick={close}>
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {children}
    </dialog>
  );
}
