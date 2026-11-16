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

/** 재질 — glass: 반투명 유리 카드(기본) · crayon: 크레파스로 칠한 진한 띠에 밝은 글자(폭 520px, 긴 글은 줄바꿈) */
export type ToastLook = "glass" | "crayon";
/** 뜨는 자리 — top: 헤더 아래 가운데(기본, --toast-top) · bottom: 아래 가운데(--toast-bottom, 기본 24px) */
export type ToastPlacement = "top" | "bottom";
/** 표시 시간(ms) — 숫자 하나면 전부, 종류별로도. action = 액션(되돌리기)이 붙은 토스트 */
export type ToastDuration = number | Partial<Record<ToastVariant | "action", number>>;

/* ── Context ── */

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ── 컴포넌트 밖에서 부르기 ──
   `toast.success("저장했어요")` — 훅을 못 쓰는 자리(이벤트 핸들러 밖 유틸 · 스토어)용.
   화면에 떠 있는 ToastProvider가 받는다. Provider가 없으면 아무 일도 안 한다 */
let live: ToastAPI | null = null;
export const toast: ToastAPI = {
  success: (message, action) => live?.success(message, action),
  error: (message, action) => live?.error(message, action),
  info: (message, action) => live?.info(message, action),
};

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
const CRAYON_EXIT_MS = 150;

/* ── 크레용 띠 (look="crayon") ──
   종류별 색: 성공 초록 · 오류 주황(위 TOAST_COLOR와 같은 이유) · 알림 · 되돌리기는 잉크.
   잉크는 고정 색 — --color-ink는 다크에서 밝아져 흰 글자가 안 보인다 */
const BAND_INK = "#4a453d";
const BAND: Record<ToastVariant, string> = {
  success: `color-mix(in oklab, var(--color-primary) 82%, ${BAND_INK})`,
  error: `color-mix(in oklab, var(--color-secondary) 88%, ${BAND_INK})`,
  info: BAND_INK,
};

function CrayonToastCard({
  item,
  closeButton,
  edge,
  onDismiss,
}: {
  item: ToastItem;
  closeButton: boolean;
  /** 가장자리 손떨림 필터(#crayon)를 쓸 수 있나 — <CrayonDefs />가 없으면 필터 없이 반듯한 띠 */
  edge: boolean;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role={item.variant === "error" ? "alert" : "status"}
      // 닫기 버튼이 없으면 유리 카드처럼 띠를 누르면 닫힌다
      onClick={closeButton ? undefined : () => onDismiss(item.id)}
      className={`pointer-events-auto relative isolate flex w-full items-center gap-3 px-4 py-3 text-[13.5px] text-white ${closeButton ? "" : "cursor-pointer"} ${item.exiting ? "toast-band-out" : "toast-band-in"}`}
    >
      {/* 칠한 면 — 큰 어두운 면에 종이 요철 필터를 쓰면 글자가 묻혀서 가장자리만 떨린다 */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[8px] shadow-[0_6px_18px_rgb(20_18_16/0.16)]"
        style={{
          backgroundColor: BAND[item.variant],
          backgroundImage:
            "repeating-linear-gradient(-7deg,transparent 0 2px,rgb(255 255 255 / .07) 2px 3px,transparent 3px 5px)",
          filter: edge ? "url(#crayon)" : undefined,
        }}
      />
      <span className="toast-icon-pop grid size-5 shrink-0 place-items-center opacity-90">
        {item.action ? (
          // 되돌릴 수 있는 알림 — 되감는 화살표
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
        ) : (
          <ToastIcon variant={item.variant} />
        )}
      </span>
      {/* 길면 자르지 않고 줄바꿈 */}
      <span className="min-w-0 flex-1 leading-5">{item.message}</span>
      {item.action && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            item.action?.onClick();
            onDismiss(item.id);
          }}
          className="shrink-0 cursor-pointer rounded-[4px] bg-white/15 px-2.5 py-1 text-[12.5px] font-semibold transition-colors hover:bg-white/25"
        >
          {item.action.label}
        </button>
      )}
      {closeButton && (
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          aria-label="닫기"
          className="shrink-0 cursor-pointer p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Toast Card ── */

function ToastCard({
  item,
  index,
  placement,
  closeButton,
  onDismiss,
}: {
  item: ToastItem;
  index: number;
  placement: ToastPlacement;
  closeButton: boolean;
  onDismiss: (id: number) => void;
}) {

  const color = TOAST_COLOR[item.variant];
  const offset = index * 72;

  return (
    <div
      // 상단 중앙(헤더 아래) — 하단 중앙은 발자취 독과 겹치고 시선에서 멀었다.
      // 표면이 surface 72% + blur(24)로 충분히 불투명해져 헤더 아래에서도 묻히지 않는다
      // 닫기 버튼은 없앴다(어차피 사라진다) — 대신 카드를 누르면 바로 닫힌다
      role={item.variant === "error" ? "alert" : "status"}
      onClick={() => onDismiss(item.id)}
      className={`pointer-events-auto fixed left-1/2 cursor-pointer ${item.exiting ? "toast-blob-out" : "toast-blob-in"}`}
      style={{
        ...(placement === "bottom"
          ? { bottom: `calc(var(--toast-bottom, 24px) + ${offset}px)` }
          : { top: `calc(var(--toast-top) + ${offset}px)` }),
        transform: item.exiting ? undefined : "translateX(-50%)",
      }}
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

          {closeButton && (
            <button type="button" aria-label="닫기" className="shrink-0 cursor-pointer p-0.5 text-ink-3 transition-colors hover:text-ink">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Provider ── */

export function ToastProvider({
  children,
  look = "glass",
  placement = "top",
  max,
  closeButton = false,
  duration,
}: {
  children: React.ReactNode;
  /** 재질 — 기본 유리 카드. "crayon"은 크레파스 진한 띠(가장자리 떨림은 <CrayonDefs />가 있을 때) */
  look?: ToastLook;
  /** 뜨는 자리 — 기본 위 가운데 */
  placement?: ToastPlacement;
  /** 한 번에 보일 수 — 넘치면 오래된 것부터 닫는다. 기본 제한 없음 */
  max?: number;
  /** 닫기(×) 버튼 — 기본 없음(누르면 닫힘) */
  closeButton?: boolean;
  /** 표시 시간(ms) — 기본 3000, 액션이 붙으면 TOAST_ACTION_MS(5000) */
  duration?: ToastDuration;
}) {
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
    }, look === "crayon" ? CRAYON_EXIT_MS : EXIT_MS);
  }, [look]);

  const lifeOf = (variant: ToastVariant, action?: ToastAction) => {
    if (typeof duration === "number") return duration;
    return (action ? duration?.action : undefined) ?? duration?.[variant] ?? (action ? TOAST_ACTION_MS : DURATION);
  };

  const show = useCallback(
    (message: string, variant: ToastVariant, action?: ToastAction) => {
      const id = ++idRef.current;
      setToasts((prev) => [
        ...prev,
        { id, message, variant, action, exiting: false, createdAt: Date.now() },
      ]);
      const timer = setTimeout(() => dismiss(id), lifeOf(variant, action));
      timersRef.current.set(id, timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lifeOf는 duration만 읽는다
    [dismiss, duration],
  );

  // 넘치면 오래된 것부터 닫는다 (max를 줬을 때만)
  useEffect(() => {
    if (!max) return;
    const alive = toasts.filter((t) => !t.exiting);
    for (const t of alive.slice(0, Math.max(0, alive.length - max))) dismiss(t.id);
  }, [toasts, max, dismiss]);

  // 가장자리 떨림 필터가 깔려 있나 — 없는 필터를 url()로 걸면 브라우저에 따라 띠가 통째로 안 그려진다
  const [edge, setEdge] = useState(false);
  useEffect(() => {
    if (look === "crayon") setEdge(Boolean(document.getElementById("crayon")));
  }, [look, toasts.length]);

  const api = useRef<ToastAPI>({
    success: (msg, action) => show(msg, "success", action),
    error: (msg, action) => show(msg, "error", action),
    info: (msg, action) => show(msg, "info", action),
  });

  api.current.success = (msg, action) => show(msg, "success", action);
  api.current.error = (msg, action) => show(msg, "error", action);
  api.current.info = (msg, action) => show(msg, "info", action);

  // 컴포넌트 밖 toast.*가 이 Provider로 오게 — 여러 개면 마지막에 뜬 것
  useEffect(() => {
    const mine = api.current;
    live = mine;
    return () => {
      if (live === mine) live = null;
    };
  }, []);

  const activeToasts = toasts.filter((t) => !t.exiting);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      {mounted &&
        createPortal(
          look === "crayon" ? (
            // 가운데 묶음에 쌓는다 — 높이가 달라도(두 줄) 겹치지 않게. 아래에 둘 땐 최신이 맨 아래
            <div
              className={`pointer-events-none fixed inset-x-0 z-[9999] mx-auto flex w-[min(520px,calc(100vw-32px))] gap-2 ${placement === "bottom" ? "flex-col" : "flex-col-reverse"}`}
              style={placement === "bottom" ? { bottom: "var(--toast-bottom, 24px)" } : { top: "var(--toast-top)" }}
            >
              {toasts.map((t) => (
                <CrayonToastCard key={t.id} item={t} closeButton={closeButton} edge={edge} onDismiss={dismiss} />
              ))}
            </div>
          ) : (
          <div className="pointer-events-none fixed inset-0 z-[9999]">
            {toasts.map((t) => {
              const idx = activeToasts.indexOf(t);
              return (
                <ToastCard
                  key={t.id}
                  item={t}
                  index={idx === -1 ? 0 : idx}
                  placement={placement}
                  closeButton={closeButton}
                  onDismiss={dismiss}
                />
              );
            })}
          </div>
          ),
          document.body,
        )}
    </ToastContext.Provider>
  );
}
