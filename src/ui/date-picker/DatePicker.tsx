"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import { deriveDisplayDate } from "../../lib/derive-date";
import { coversDate, nightsLabel, normalizeEnd, spanDays } from "../../lib/date-range";
import { LiquidGlass } from "../liquid-glass";
import { GrainNoise } from "../grain";
import { Button } from "../button";
import { MonthPicker } from "../month-picker";

/** 선택 원·배지용 소프트 그레인 오라 — 가장자리로 갈수록 투명해져 두둥실 뜬 느낌 */
const SOFT_AURA: CSSProperties = {
  background:
    "radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 45%, var(--aura-tint, #ffffff)) 25%, color-mix(in srgb, var(--color-primary) 22%, transparent) 72%, transparent 100%)",
  color: "var(--color-primary-hover)",
};

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 잔디 겸용 달력(`density`)에서 하루 기록 수 → primary 농도(%) */
const DENSITY_PCT = [0, 26, 48, 70, 92];
const densityFill = (n: number) =>
  `color-mix(in srgb, var(--color-primary) ${DENSITY_PCT[Math.min(n, 4)]}%, transparent)`;

const toIso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ── 캘린더 패널 (positioning 없음 — 팝오버가 감싼다) ── */

export function DatePickerCalendar({
  value,
  onChange,
  dateCounts,
  onlyDatesWithCount = false,
  allowDeselect = false,
  showToday = true,
  initialMonth,
  headerRight,
  quiet = false,
  density = false,
  endValue = null,
  onRangeChange,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  /** 날짜별 기록 수. 2개 이상이면 날짜 우상단에 숫자 배지를 표시한다. */
  dateCounts?: ReadonlyMap<string, number>;
  /** dateCounts에 존재하는 날짜만 선택 가능하게 한다. */
  onlyDatesWithCount?: boolean;
  /** 선택된 날짜를 다시 누르면 선택을 해제한다. */
  allowDeselect?: boolean;
  /** 하단 '오늘' 바로가기를 표시한다. */
  showToday?: boolean;
  /** value가 없을 때 처음 보여줄 달에 속한 ISO 날짜. */
  initialMonth?: string;
  /** 헤더 우측 슬롯 (초기화 등). 주면 월 네비가 좌측 컴팩트 묶음으로 바뀐다. */
  headerRight?: ReactNode;
  /** 사이드바처럼 조용한 맥락용 — 네비 화살표 중립화·타이틀 축소·비활성 일자 후퇴·뱃지 무그레인 */
  quiet?: boolean;
  /**
   * 잔디 겸용 — 날짜 칸을 그날 기록 수 농도로 칠하고 칸 모양을 둥근 사각으로 바꾼다.
   * 농도가 개수를 이미 말하므로 우상단 count 뱃지는 숨긴다 (좌측 패널: 잔디 격자를 이걸로 대체)
   */
  density?: boolean;
  /**
   * 범위 모드 — 끝날짜. `onRangeChange`와 함께 줘야 켜진다.
   * 켜지면 두 번 클릭(시작 → 끝)과 드래그(시작에서 끝까지 끌기)를 둘 다 받는다.
   */
  endValue?: string | null;
  onRangeChange?: (start: string, end: string | null) => void;
}) {
  const range = Boolean(onRangeChange);
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const initial = parsed ?? (initialMonth ? new Date(`${initialMonth}T00:00:00`) : new Date());
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  /* ── 범위 모드 상태 ──
     `pending`: 시작만 찍고 끝을 기다리는 중 (두 번 클릭)
     `drag`   : 끌고 있는 중 — 뗄 때까지 화면을 이긴다. `moved`가 false면 그냥 클릭으로 넘긴다 */
  const [pending, setPending] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ from: string; to: string; moved: boolean } | null>(null);

  // 달력 밖에서 손을 떼도 드래그가 끝나야 한다. drag가 바뀔 때마다 다시 걸므로 클로저는 항상 최신
  useEffect(() => {
    if (!drag) return;
    const up = () => {
      setDrag(null);
      if (!drag.moved) {
        // 안 끌었으면 두 번 클릭 흐름 — 첫 번째면 시작 확정, 두 번째면 범위 완성
        if (pending === null) {
          setPending(drag.from);
          onRangeChange?.(drag.from, null);
        } else {
          const [a, b] = pending <= drag.from ? [pending, drag.from] : [drag.from, pending];
          setPending(null);
          onRangeChange?.(a, a === b ? null : b);
        }
        return;
      }
      const [a, b] = drag.from <= drag.to ? [drag.from, drag.to] : [drag.to, drag.from];
      setPending(null);
      onRangeChange?.(a, a === b ? null : b);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [drag, pending, onRangeChange]);

  /* 지금 칠해야 할 구간 — 드래그 중 > 시작만 찍은 중 > 확정값 순으로 이긴다 */
  const dragSorted = drag ? (drag.from <= drag.to ? [drag.from, drag.to] : [drag.to, drag.from]) : null;
  const bandStart = dragSorted ? dragSorted[0] : (pending ?? value);
  const bandEnd = dragSorted ? dragSorted[1] : pending ? pending : normalizeEnd(value ?? "", endValue) ?? null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDay = new Date(viewYear, viewMonth, 1).getDay();
  const selectedDay =
    parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth ? parsed.getDate() : -1;
  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  // 월 팝오버의 점 — 기록이 있는 달만
  const monthsWithDates = useMemo(
    () => (dateCounts ? [...dateCounts.keys()].map((iso) => iso.slice(0, 7)) : []),
    [dateCounts],
  );

  return (
    <div className="w-full min-w-0">
      {/* 월 네비게이션 — 앨범·아카이브·한눈에 보기와 같은 공용 MonthPicker.
          여기선 글자만 작아진다(quiet=사이드바 sm · 그 외 md). 달 이름을 누르면 12칸 그리드로 점프 */}
      <div className="mb-1.5 flex items-center px-0.5">
        <div className={headerRight ? "" : "flex flex-1 justify-center"}>
          <MonthPicker
            variant="title"
            size={quiet ? "sm" : "md"}
            value={`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`}
            onChange={(key) => {
              setViewYear(Number(key.slice(0, 4)));
              setViewMonth(Number(key.slice(5)) - 1);
            }}
            filled={monthsWithDates}
          />
        </div>
        {headerRight && <div className="ml-auto">{headerRight}</div>}
      </div>

      {/* 요일 헤더 */}
      <div className="grid w-full grid-cols-7 gap-px text-center text-[9px] font-medium text-ink-4">
        {DAYS_KR.map((d, i) => (
          <div key={d} className={`py-0.5 ${i === 0 && !quiet ? "text-danger/60" : ""}`}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드
          density(잔디 겸용)에선 달을 넘길 때 **숫자와 격자는 안 움직이고 칠만 번진다**
          (컴포넌트 랩 "숫자는 그대로 · 칠만" 안). key로 통째로 갈아 끼워야 칠이 다시 번진다 —
          칸이 day 번호로 재사용되면 지난 달 칠이 새 달 칠로 뭉개지며 서서히 지워진다 */}
      <div key={density ? `${viewYear}-${viewMonth}` : undefined} className="grid w-full grid-cols-7 gap-px text-center">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const iso = toIso(viewYear, viewMonth, day);
          const sunday = (startDay + i) % 7 === 0;
          const count = dateCounts?.get(iso) ?? 0;
          const disabled = onlyDatesWithCount && count === 0;

          /* 범위 모드에선 양 끝점만 원(선택)이고 사이는 띠(band)다.
             하루짜리는 band === "solo" — 지금까지의 단일 선택과 똑같이 보인다 */
          const inBand = range && bandStart ? coversDate(bandStart, bandEnd, iso) : false;
          const band = !inBand
            ? undefined
            : !bandEnd || bandEnd === bandStart
              ? "solo"
              : iso === bandStart
                ? "start"
                : iso === bandEnd
                  ? "end"
                  : "mid";
          const selected = range ? band === "start" || band === "end" || band === "solo" : day === selectedDay;

          return (
            <div key={day} className="relative">
              {/* 잇는 띠 — 칸 사이 gap까지 덮으려고 좌우로 넘치게 그린다. 숫자 뒤에 깔린다 */}
              {band && band !== "solo" && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-[18%] ${
                    band === "start"
                      ? "-right-px left-[10%] rounded-l-full"
                      : band === "end"
                        ? "-left-px right-[10%] rounded-r-full"
                        : "-inset-x-px"
                  }`}
                  style={{
                    background: `color-mix(in srgb, var(--color-primary) ${band === "mid" ? 14 : 26}%, transparent)`,
                  }}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                // 범위 모드는 pointerup(위 effect)이 클릭까지 맡는다 — onClick과 겹치면 두 번 발화한다
                onClick={range ? undefined : () => onChange(allowDeselect && selected ? null : iso)}
                onPointerDown={
                  range && !disabled
                    ? (e) => {
                        // 터치는 눌린 요소로 포인터가 묶여(암묵적 캡처) 옆 칸의 pointerenter가 안 뜬다 — 풀어준다
                        e.currentTarget.releasePointerCapture?.(e.pointerId);
                        setDrag({ from: iso, to: iso, moved: false });
                      }
                    : undefined
                }
                onPointerEnter={
                  range && !disabled
                    ? () => setDrag((d) => (d ? { ...d, to: iso, moved: true } : d))
                    : undefined
                }
                className={`relative flex aspect-square w-full min-w-0 select-none items-center justify-center text-[11px] transition-all ${
                  density ? "rounded-[7px]" : "rounded-full"
                } ${
                  range ? "touch-none" : ""
                } ${
                  selected
                    ? "overflow-hidden font-semibold"
                    : disabled
                      ? `cursor-default ${quiet ? "text-ink-5" : "text-ink-4/50"}`
                    : isToday(day)
                      ? "font-semibold text-primary hover:bg-primary-subtle"
                      : sunday && !quiet
                        ? "text-danger/70 hover:bg-primary-subtle hover:text-primary"
                        : "text-ink-2 hover:bg-primary-subtle hover:text-primary"
                }`}
                style={selected ? SOFT_AURA : undefined}
              >
                {selected && <GrainNoise />}
                {/* 칠 — 왼쪽 위에서 오른쪽 아래로 번지는 물결. 숫자 뒤에 깔리고 숫자는 가만히 있는다 */}
                {density && count > 0 && !selected && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-[cal-fill-in_0.34s_cubic-bezier(0.22,1,0.36,1)_both] rounded-[7px]"
                    style={{
                      backgroundColor: densityFill(count),
                      animationDelay: `${(Math.floor((startDay + i) / 7) + ((startDay + i) % 7)) * 26}ms`,
                    }}
                  />
                )}
                <span className="relative">{day}</span>
                {count > 1 && !selected && !density && (
                  quiet ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary-muted text-[7px] font-bold text-primary">
                      {count}
                    </span>
                  ) : (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center overflow-hidden rounded-full text-[7px] font-bold"
                      style={SOFT_AURA}
                    >
                      <GrainNoise />
                      <span className="relative">{count}</span>
                    </span>
                  )
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 범위 모드 안내 — 시작만 찍힌 상태에서만 뜬다 */}
      {range && pending && (
        <p className="mt-1.5 text-center text-[10px] text-ink-4">끝난 날을 한 번 더 (같은 날 = 하루)</p>
      )}
      {range && !pending && value && (
        <p className="mt-1.5 text-center font-mono text-[10px] text-primary">
          {spanDays(value, endValue) > 1 ? `${spanDays(value, endValue)}일` : "하루"}
        </p>
      )}

      {/* 오늘 */}
      {showToday && (
        <Button
          variant="text"
          size="sm"
          onClick={() => {
            const t = new Date();
            onChange(toIso(t.getFullYear(), t.getMonth(), t.getDate()));
          }}
          className="mt-1.5 w-full justify-center"
        >
          오늘
        </Button>
      )}
    </div>
  );
}

/* ── 공통 날짜 선택기 (trigger + 팝오버) ── */

export type DatePickerVariant = "field" | "inline";
export type DatePickerAlign = "left" | "right";

export function DatePicker({
  value,
  onChange,
  endValue = null,
  onRangeChange,
  variant = "field",
  align = "left",
  placeholder = "날짜 선택",
  label,
  triggerClassName = "",
}: {
  value: string;
  onChange: (iso: string) => void;
  /** 끝날짜 — `onRangeChange`와 같이 주면 범위 선택 모드가 켜진다 */
  endValue?: string | null;
  /** 범위 확정 콜백. 끝날짜가 없으면(하루짜리) `null`이 온다 */
  onRangeChange?: (start: string, end: string | null) => void;
  /** field: 아이콘+테두리 버튼 / inline: 텍스트 버튼 */
  variant?: DatePickerVariant;
  /** 팝오버 정렬 방향 */
  align?: DatePickerAlign;
  placeholder?: string;
  /** inline 트리거에 표시할 내용 오버라이드 (기본: 연도 제외 표시) */
  label?: ReactNode;
  triggerClassName?: string;
}) {
  const range = Boolean(onRangeChange);
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const positionPopup = useCallback(() => {
    const trigger = ref.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = 208;
    const estimatedHeight = 250;
    const gap = 8;
    const viewportGap = 8;
    const preferredLeft = align === "right" ? rect.right - width : rect.left;
    const left = Math.min(
      Math.max(viewportGap, preferredLeft),
      window.innerWidth - width - viewportGap,
    );
    const top =
      rect.bottom + gap + estimatedHeight <= window.innerHeight
        ? rect.bottom + gap
        : Math.max(viewportGap, rect.top - estimatedHeight - gap);
    setPopupStyle({ left, top });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const reposition = () => positionPopup();
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, positionPopup]);

  const display = deriveDisplayDate(value);
  const rangeEnd = normalizeEnd(value, endValue);
  /** 끝날짜 꼬리 — "~ 8.8 · 3박4일". 하루짜리는 빈 문자열이라 지금 표기 그대로다 */
  const tail = rangeEnd
    ? ` ~ ${Number(rangeEnd.slice(5, 7))}.${Number(rangeEnd.slice(8))} · ${nightsLabel(value, rangeEnd)}`
    : "";
  const fieldLabel = display.fullDate ? `${display.fullDate}${tail}` : placeholder;
  // inline: 연도 제외 (4월 20일 월요일)
  const inlineLabel = display.fullDate
    ? `${display.fullDate.replace(/^\d{4}년 /, "")}${tail}`
    : placeholder;

  const handleChange = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };
  const togglePopup = () => {
    if (open) {
      setOpen(false);
      return;
    }
    positionPopup();
    setOpen(true);
  };

  return (
    <div ref={ref} className="relative">
      {variant === "field" ? (
        <button
          type="button"
          onClick={togglePopup}
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-warm/60 px-2.5 py-1.5 text-[13px] text-ink transition-all hover:border-primary hover:bg-primary-subtle/50 ${triggerClassName}`}
        >
          <Calendar size={14} strokeWidth={1.8} className="text-primary" />
          <span className="font-medium">{fieldLabel}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={togglePopup}
          className={`cursor-pointer transition-colors hover:text-primary ${triggerClassName}`}
        >
          {label ?? inlineLabel}
        </button>
      )}

      {open && popupStyle && createPortal(
        <>
          {/* 바깥클릭 닫기는 document mousedown 핸들러가 처리하므로 이 레이어는 포인터를 통과시켜
              배경 스크롤을 막지 않는다(스크롤 시 scroll 리스너가 팝업을 트리거에 재정렬) */}
          <div className="date-picker-portal pointer-events-none fixed inset-0 z-[299]" aria-hidden />
          <div ref={panelRef} className="date-picker-portal fixed z-[300] w-[13rem]" style={popupStyle}>
            <LiquidGlass className="rounded-xl p-2">
              <DatePickerCalendar
                value={value}
                endValue={endValue}
                onChange={(iso) => {
                  if (iso) handleChange(iso);
                }}
                onRangeChange={
                  range
                    ? (start, end) => {
                        onRangeChange?.(start, end);
                        // 시작만 찍힌 중(end === null이고 아직 고르는 중)에는 열어둔다 —
                        // 끝을 한 번 더 눌러야 하므로. 드래그로 한 번에 그으면 end가 채워져 닫힌다
                        if (end) setOpen(false);
                      }
                    : undefined
                }
              />
            </LiquidGlass>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
