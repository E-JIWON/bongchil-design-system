"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { GrainNoise } from "../grain";
import { Button } from "../button";

/* ── Types ── */

type ToastVariant = "success" | "error" | "info";

/** 토스트 안의 단발 액션 — 되살리기처럼 "지금 이 순간만" 유효한 되돌림용 */
export type ToastAction = { label: string; onClick: () => void };

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
  exiting: boolean;
  createdAt: number;
};

type ToastAPI = {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
};

/* ── Context ── */

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ── Variant color (accent-aware via CSS vars) ── */

const TOAST_COLOR: Record<ToastVariant, string> = {
  success: "var(--color-primary)",
  // danger(rose)는 accent=rose에서 primary와 구분이 안 된다 — 실패는 주황(secondary) 고정
  error: "var(--color-secondary)",
  info: "var(--color-comment-sky-solid)",
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 7.5L6 10.5L11 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="toast-check-draw"
        />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="7" cy="10.5" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/* ── Constants ── */

const DURATION = 3000;
/** 액션(되살리기)이 붙은 토스트는 결정할 틈을 조금 더 준다 — 되돌림 유예를 재는 쪽도 이 값을 쓴다 */
export const TOAST_ACTION_MS = 5000;
const EXIT_MS = 400;

/* ── Toast Card ── */

function ToastCard({
  item,
  index,
  onDismiss,
}: {
  item: ToastItem;
  index: number;
  onDismiss: (id: number) => void;
}) {

  const color = TOAST_COLOR[item.variant];
  const offset = index * 72;

  return (
    <div
      // 상단 중앙(헤더 아래) — 하단 중앙은 발자취 독과 겹치고 시선에서 멀었다.
      // 표면이 surface 72% + blur(24)로 충분히 불투명해져 헤더 아래에서도 묻히지 않는다
      // 닫기 버튼은 없앴다(어차피 사라진다) — 대신 카드를 누르면 바로 닫힌다
      onClick={() => onDismiss(item.id)}
      className={`pointer-events-auto fixed left-1/2 cursor-pointer ${item.exiting ? "toast-blob-out" : "toast-blob-in"}`}
      style={{ top: `calc(var(--toast-top) + ${offset}px)`, transform: item.exiting ? undefined : "translateX(-50%)" }}
    >
      {/* component-lab E-2안 — 반투명 유리 위에 왼쪽 위 컬러 오라 + 그레인, 색은 카드 바깥 글로우로도 번진다.
          블러는 인라인 style로만 먹는다(Tailwind backdrop-* 무효) */}
      <div
        className="relative min-w-[248px] max-w-[360px] overflow-hidden rounded-xl border px-4 py-3"
        style={{
          borderColor: `color-mix(in srgb, ${color} 30%, var(--color-border))`,
          background: `radial-gradient(120% 150% at 0% 0%, color-mix(in srgb, ${color} 18%, transparent), transparent 62%), color-mix(in srgb, var(--color-surface) 72%, transparent)`,
          boxShadow: `0 10px 30px color-mix(in srgb, ${color} var(--toast-glow, 28%), transparent), var(--shadow-m)`,
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
        }}
      >
        <GrainNoise />

        {/* Content */}
        <div className="relative z-[1] flex items-center gap-3">
          {/* Icon */}
          <span
            className="toast-icon-pop flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
          >
            <ToastIcon variant={item.variant} />
          </span>

          {/* Message */}
          <span className="flex-1 text-sm font-medium text-ink">
            {item.message}
          </span>

          {/* 되돌림 액션 — 카드를 누르면 닫히므로 여기선 전파를 끊는다 */}
          {item.action && (
            <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="grain"
                size="sm"
                color={color}
                hoverActive
                onClick={() => {
                  item.action?.onClick();
                  onDismiss(item.id);
                }}
              >
                {item.action.label}
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Provider ── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => { setMounted(true); }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant, action?: ToastAction) => {
      const id = ++idRef.current;
      setToasts((prev) => [
        ...prev,
        { id, message, variant, action, exiting: false, createdAt: Date.now() },
      ]);
      const timer = setTimeout(() => dismiss(id), action ? TOAST_ACTION_MS : DURATION);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const api = useRef<ToastAPI>({
    success: (msg, action) => show(msg, "success", action),
    error: (msg, action) => show(msg, "error", action),
    info: (msg, action) => show(msg, "info", action),
  });

  api.current.success = (msg, action) => show(msg, "success", action);
  api.current.error = (msg, action) => show(msg, "error", action);
  api.current.info = (msg, action) => show(msg, "info", action);

  const activeToasts = toasts.filter((t) => !t.exiting);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[9999]">
            {toasts.map((t) => {
              const idx = activeToasts.indexOf(t);
              return (
                <ToastCard
                  key={t.id}
                  item={t}
                  index={idx === -1 ? 0 : idx}
                  onDismiss={dismiss}
                />
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
