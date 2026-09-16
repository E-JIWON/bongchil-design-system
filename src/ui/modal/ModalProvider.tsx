"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";

/* ── Types ── */

type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
};

type CustomOptions = {
  children: ReactNode;
  showClose?: boolean;
  /**
   * 카드 폭 — 기본 `sm`(270px)은 알림·확인용 좁은 폭이다.
   * 캡처·표처럼 읽을 게 있으면 `md`(480) · `lg`(720)로 넓힌다.
   */
  size?: "sm" | "md" | "lg";
};

const CUSTOM_WIDTH = { sm: "max-w-[270px]", md: "max-w-[min(480px,92vw)]", lg: "max-w-[min(720px,92vw)]" } as const;

type ModalAPI = {
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  open: (options: CustomOptions) => void;
  close: () => void;
};

/* ── Context ── */

const ModalContext = createContext<ModalAPI | null>(null);

export function useModal(): ModalAPI {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

/* ── Provider ── */

type ModalState =
  | { type: "alert"; options: AlertOptions; resolve: () => void }
  | { type: "confirm"; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { type: "custom"; options: CustomOptions }
  | null;

/**
 * `pathname`을 넘기면 라우트가 바뀔 때 열려 있던 모달을 자동으로 닫는다.
 * 라우터는 앱 것이라 주입받는다 (Next는 `usePathname()`, 안 넘기면 이 동작만 없다).
 */
export function ModalProvider({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname?: string;
}) {
  const [state, setState] = useState<ModalState>(null);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  /* ── Dismiss: card out (300ms) → backdrop out (200ms) → cleanup ── */
  const dismiss = useCallback((result: boolean) => {
    setCardVisible(false);
    setTimeout(() => {
      setBackdropVisible(false);
      setTimeout(() => {
        const s = stateRef.current;
        if (s?.type === "confirm") s.resolve(result);
        if (s?.type === "alert") s.resolve();
        setState(null);
      }, 200);
    }, 200);
  }, []);

  /* ── Route change → auto-close ── */
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname && stateRef.current) {
      dismiss(false);
    }
    prevPathname.current = pathname;
  }, [pathname, dismiss]);

  /* ── Show: backdrop first (200ms) → card appears after backdrop settles ── */
  const show = useCallback(() => {
    requestAnimationFrame(() => {
      setBackdropVisible(true);
      setTimeout(() => setCardVisible(true), 250);
    });
  }, []);

  /* ── API ── */
  const alert = useCallback(
    (options: AlertOptions): Promise<void> =>
      new Promise((resolve) => {
        setState({ type: "alert", options, resolve });
        show();
      }),
    [show],
  );

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setState({ type: "confirm", options, resolve });
        show();
      }),
    [show],
  );

  const open = useCallback((options: CustomOptions) => {
    setState({ type: "custom", options });
    show();
  }, [show]);

  const close = useCallback(() => dismiss(false), [dismiss]);

  /* ── ESC key ── */
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, dismiss]);

  const api = useRef<ModalAPI>({ alert, confirm, open, close });
  api.current = { alert, confirm, open, close };

  return (
    <ModalContext.Provider value={api.current}>
      {children}
      {state &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={backdropRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={state.type !== "custom" ? "modal-title" : undefined}
            aria-describedby={
              state.type !== "custom" ? "modal-desc" : undefined
            }
            className={`fixed inset-0 z-[9998] flex items-end justify-center p-4 pb-[calc(16px+var(--safe-bottom))] transition-all duration-200 ease-out sm:items-center ${
              backdropVisible
                ? "bg-black/40 backdrop-blur-[2px]"
                : "bg-transparent backdrop-blur-0"
            }`}
            onClick={(e) => {
              if (e.target === backdropRef.current) dismiss(false);
            }}
          >
            {state.type === "custom" ? (
              /* ── Custom ── */
              <div
                className={`modal-glass relative w-full ${CUSTOM_WIDTH[state.options.size ?? "sm"]} overflow-hidden rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  cardVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-6 opacity-0 sm:translate-y-0 sm:scale-[0.92]"
                }`}
              >
                {state.options.showClose && (
                  /* Tooltip 래퍼가 relative라 위치는 바깥 div가 잡는다 */
                  <div className="absolute right-3 top-3 z-[1]">
                    <IconButton
                      label="닫기"
                      onClick={() => dismiss(false)}
                      icon={<X size={16} />}
                    />
                  </div>
                )}
                {state.options.children}
              </div>
            ) : (
              /* ── Alert / Confirm — iOS style ── */
              <div
                className={`modal-glass w-full max-w-[270px] overflow-hidden rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  cardVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-6 opacity-0 sm:translate-y-0 sm:scale-[0.92]"
                }`}
              >
                {/* 텍스트 영역 — text-balance로 줄을 고르게 나눠 마지막 줄에 한 어절만
                    남는 걸("…해야 / 열려요.") 막고, break-keep으로 한글 어절 중간 끊김을 막는다 */}
                <div className="px-5 pb-4 pt-6">
                  {state.options.title && (
                    <h3
                      id="modal-title"
                      className="text-balance break-keep text-center text-[14px] font-bold leading-snug text-ink"
                    >
                      {state.options.title}
                    </h3>
                  )}
                  <p
                    id="modal-desc"
                    className={`text-balance break-keep text-center text-[13px] leading-relaxed text-ink-3 ${
                      state.options.title ? "mt-2" : ""
                    }`}
                  >
                    {state.options.message}
                  </p>
                </div>

                {/* 버튼 영역 — 공용 Button(grain/glass) 그대로. 모달만의 버튼 스타일은 두지 않는다 */}
                {/* 취소 30% : 확인 70% — 확인이 주액션 */}
                <div className="flex gap-2 px-4 pb-4">
                  {state.type === "confirm" && (
                    // 폭은 30%를 바닥으로만 잡는다 — w-[30%] 고정이면 4자 넘는 라벨
                    // ("머무를래요"·"계속 쓸게요")이 두 줄로 쪼개진다. 길면 그만큼 넓어지고
                    // 확인(flex-1)이 남은 폭을 가져간다
                    <Button
                      variant="text"
                      onClick={() => dismiss(false)}
                      className="min-w-[30%] shrink-0 justify-center whitespace-nowrap"
                    >
                      {state.options.cancelLabel ?? "취소"}
                    </Button>
                  )}
                  <Button
                    variant="grain"
                    tone={
                      state.type === "confirm" && state.options.variant === "danger"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => dismiss(true)}
                    hoverActive
                    className="flex-1 justify-center"
                  >
                    {state.options.confirmLabel ?? "확인"}
                  </Button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}
