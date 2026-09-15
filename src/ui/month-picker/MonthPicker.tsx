"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../button";
import { BasicGlass } from "../basic-glass";
import { grainAura, grainText, GrainNoise, CONTROL_SIZES, type ControlSize } from "../grain";

/**
 * 월 선택 — 앨범·한눈에 보기·아카이브가 공유하는 단일 컨트롤.
 *
 * 트리거는 두 얼굴, 패널은 하나다.
 * - `pill`  : `2026년 7월 ⌄` — 셀렉트 자리에 놓이는 그레인 알약 (PageTitle의 action 슬롯)
 * - `title` : `‹ 2026.07 ›` — 제목 자체가 트리거. 화살표로 이웃 달을 훑는다
 * - 패널    : 연도 ‹ › + 12칸 월 그리드. 기록 있는 달엔 점, 없는 달은 흐리게(선택은 가능)
 *
 * 목록형 드롭다운(`CategorySelect`)을 월에 쓰지 않는다 — 달은 12개로 고정된 격자라
 * 스크롤 목록보다 그리드가 빠르고, 연도를 넘나드는 이동도 목록으로는 안 된다.
 */
export type MonthPickerVariant = "pill" | "title";

export type MonthPickerProps = {
  /** "YYYY-MM" */
  value: string;
  onChange: (key: string) => void;
  /** 기록이 있는 달("YYYY-MM") — 점으로 표시. 생략하면 점 없음 */
  filled?: Iterable<string>;
  variant?: MonthPickerVariant;
  /** ‹ › 이웃 달 이동 — 기본값은 title=켬 · pill=끔 */
  arrows?: boolean;
  /** pill 트리거 크기 (Button과 같은 스케일 — CONTROL_SIZES) */
  size?: ControlSize;
  color?: string;
  className?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number) => `${y}-${pad2(m + 1)}`;
const parse = (key: string) => ({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 });

/** 제목 얼굴의 글자 규격 — 놓이는 자리가 정한다 (사이드바 달력 → 페이지 제목) */
const TITLE_TEXT: Record<ControlSize, string> = {
  xs: "text-[12px] font-medium tracking-tight text-ink-2",
  sm: "text-[13px] font-medium tracking-tight text-ink-2",
  md: "text-[15px] font-semibold tracking-tight text-ink",
  lg: "text-xl font-bold leading-snug tracking-tight text-ink-2 max-sm:text-lg",
};

/** 화살표 치수 + 날짜와의 간격 — 글자가 작아지면 원도 간격도 같이 작아진다.
    화살표는 날짜보다 항상 작다(보조). 간격은 "‹ 　2026.07　 ›"처럼 넉넉히 띄운다 */
const ARROW: Record<ControlSize, { box: string; icon: number; gap: string; radius: number }> = {
  xs: { box: "!size-[14px]", icon: 8, gap: "gap-2", radius: 4 },
  // sm = 좌측 패널 달력(폭 200px) — 여기선 화살표가 날짜를 방해하지 않게 가장 작다
  sm: { box: "!size-4", icon: 9, gap: "gap-2.5", radius: 5 },
  md: { box: "!size-[18px]", icon: 11, gap: "gap-2.5", radius: 6 },
  lg: { box: "!size-[22px]", icon: 13, gap: "gap-4", radius: 7 },
};

/**
 * 연도 ‹ › 와 이웃 달 ‹ › 가 공유하는 화살표 — 오라는 포인트색, **글리프는 잉크**.
 *
 * ⚠️ 아이콘까지 포인트색으로 두면 노랑·크림 프리셋에서 옅은 오라 위 옅은 글리프가 되어
 * 화살표가 사라진다(무채색 tone="muted"도 같은 이유로 안 보였다). 오라만 색을 말하고
 * 방향은 잉크가 말한다 — 어떤 accent에서도 대비가 유지된다.
 *
 * ⚠️ `tone="primary"`는 색이 아니라 **채움 스위치**로 쓴다 — Button의 grain은 tone이
 * default/muted일 때 오라를 idle(연하게)로 깐다. 책상(desk) 배경에선 idle 오라가 배경과
 * 같은 톤이라 원이 통째로 사라진다. 채운 오라라야 "누를 수 있는 원"으로 읽힌다.
 */
function NavArrow({
  dir,
  label,
  size = "md",
  color,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  size?: ControlSize;
  color: string;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  const a = ARROW[size];
  return (
    // 도형은 앱의 둥근 사각(서랍 관리 액션과 같은 결) — square는 hoverActive + 아이콘 모션이 규칙
    <Button
      variant="grain"
      shape="square"
      tone="primary"
      color={color}
      hoverActive
      onClick={onClick}
      aria-label={label}
      /* ⚠️ 반지름은 인라인으로 준다 — Button square의 `--radius-m`(10px)은 이 크기(16~22px)에선
         한 변의 절반을 넘어 원으로 읽힌다. 도형이 "둥근 사각"으로 보이려면 변의 1/3쯤이어야 한다.
         `!rounded-*` 클래스로 덮지 말 것(디자인 규칙) — 인라인 style은 예외로 허용된 통로다 */
      style={{ color: "var(--color-ink-2)", borderRadius: a.radius }}
      icon={<Icon size={a.icon} strokeWidth={2.6} />}
      className={`${a.box} self-center ${dir === "prev" ? "icon-chevron-nudge-left" : "icon-chevron-nudge"}`}
    />
  );
}

export function MonthPicker({
  value,
  onChange,
  filled,
  variant = "pill",
  arrows,
  size = "md",
  color = "var(--color-primary)",
  className = "",
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = parse(value);
  const [calYear, setCalYear] = useState(cur.year);
  const has = useMemo(() => new Set(filled ?? []), [filled]);
  const showArrows = arrows ?? variant === "title";
  const sz = CONTROL_SIZES[size];

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  /** 이웃 달로 — 12월/1월에서 해를 넘어간다 */
  const shift = (delta: number) => {
    const n = cur.month + delta;
    onChange(toKey(cur.year + Math.floor(n / 12), ((n % 12) + 12) % 12));
  };

  const toggle = () => {
    setCalYear(cur.year);
    setOpen((v) => !v);
  };

  const trigger =
    variant === "title" ? (
      /* 제목이 곧 트리거 — 표면 없이 PageTitle의 h1 그대로. 컨트롤이 화면에서 사라지고
         제목만 남는 게 이 얼굴의 전부다 — hover에도 알약을 띄우지 않는다. */
      <button
        type="button"
        onClick={toggle}
        title="월 선택"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`press-effect cursor-pointer ${TITLE_TEXT[size]}`}
      >
        {cur.year}
        <span className="text-comment-sand-solid">.</span>
        {pad2(cur.month + 1)}
      </button>
    ) : (
      // 그레인 알약 — 열림은 grain active와 같은 파선 언어 (CategorySelect 트리거와 같은 결)
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`press-effect relative flex items-center overflow-hidden rounded-m font-semibold transition-all ${sz.h} ${sz.pad} ${sz.text} ${sz.gap}`}
        style={{
          ...grainAura(color, open),
          color: grainText(color, open),
          outline: `1.5px dashed ${open ? `color-mix(in srgb, ${grainText(color, true)} 45%, transparent)` : "transparent"}`,
          outlineOffset: "-1.5px",
        }}
      >
        <GrainNoise />
        <span className={`relative flex min-w-0 items-center ${sz.gap}`}>
          <span className="truncate">
            {cur.year}년 {cur.month + 1}월
          </span>
          <ChevronDown
            size={12}
            strokeWidth={2.5}
            className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
    );

  return (
    /* 정렬은 놓이는 자리가 정한다.
       - lg(페이지 제목): 옆에 소제목이 서므로 items-baseline — 밑선을 맞춰야 한다
         (items-center면 이 컨테이너의 베이스라인이 화살표 기준으로 잡혀 소제목이 위로 뜬다)
       - sm·md(달력 헤더): 옆에 아무것도 없다. 베이스라인을 쓰면 화살표가 글자 line box
         기준으로 걸려 숫자보다 살짝 위로 뜬다 → 그냥 가운데 정렬이 눈에 맞는다 */
    <div
      className={`flex ${size === "lg" ? "items-baseline" : "items-center"} ${ARROW[size].gap} ${className}`}
    >
      {showArrows && (
        <NavArrow dir="prev" label="이전 달" size={size} color={color} onClick={() => shift(-1)} />
      )}

      <div ref={ref} className="relative">
        {trigger}

        {open && (
          // 페이지 제목(lg)에선 제목 왼쪽 끝에, 좁은 달력 헤더에선 트리거 가운데에 건다
          <BasicGlass
            className={`absolute top-full z-50 mt-2 w-[224px] rounded-2xl p-3 shadow-[var(--shadow-l)] ${
              size === "lg" ? "left-0" : "left-1/2 -translate-x-1/2"
            }`}
          >
            {/* 연 네비 */}
            <div className="mb-2 flex items-center justify-between px-0.5">
              <NavArrow dir="prev" label="이전 해" color={color} onClick={() => setCalYear((y) => y - 1)} />
              <span className="text-[11px] font-semibold text-ink">{calYear}년</span>
              <NavArrow dir="next" label="다음 해" color={color} onClick={() => setCalYear((y) => y + 1)} />
            </div>
            {/* 월 그리드 — 기록 있는 달엔 점 */}
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, i) => {
                const key = toKey(calYear, i);
                const current = key === value;
                const on = has.has(key);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(key);
                      close();
                    }}
                    className={`relative rounded-lg py-1.5 text-[11px] transition-colors ${
                      current
                        ? "bg-primary-subtle font-semibold text-primary"
                        : on
                          ? "font-medium text-ink-2 hover:bg-ink/5"
                          : "text-ink-5 hover:bg-ink/5"
                    }`}
                  >
                    {i + 1}월
                    {on && !current && (
                      <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-primary/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </BasicGlass>
        )}
      </div>

      {showArrows && (
        <NavArrow dir="next" label="다음 달" size={size} color={color} onClick={() => shift(1)} />
      )}
    </div>
  );
}
