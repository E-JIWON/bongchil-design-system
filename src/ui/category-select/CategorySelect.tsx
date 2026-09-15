"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties, type KeyboardEvent } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { LiquidGlass } from "../liquid-glass";
import { BasicGlass } from "../basic-glass";
import { GrainNoise, grainAura, grainText, CONTROL_SIZES, type ControlSize } from "../grain";

export type CategoryOption = {
  value: string;
  label: string;
  /** 고유 아이콘 (있으면 점 대신 아이콘 렌더) */
  icon?: LucideIcon;
  /** 아이콘·점 색 (text-* 클래스) */
  color?: string;
  /** 아이콘이 없을 때 쓰는 색 점 (bg-* 클래스) */
  dot?: string;
  /** grain variant 오라 색 — CSS 색 문자열(var(--color-*) 등). 없으면 primary */
  cssColor?: string;
};

/** 칩·버튼과 같은 사이즈 언어 — 높이는 `CONTROL_SIZES` 단일 표에서 온다 */
export type CategorySelectSize = ControlSize;
/**
 * 재질 — Button의 재질 언어를 셀렉트에 그대로 옮긴 것.
 * - `liquid` : LiquidGlass 표면
 * - `grain`  : 카테고리색 오라 + 그레인 (**기본** — 카테고리 칩·버튼과 같은 재질 언어)
 * - `dotted` : 파선 테두리(열림·선택 = 실선 + 옅은 틴트)
 * - `text`   : 표면 없는 밑줄 텍스트 (가장 약한 위계)
 */
export type CategorySelectVariant = "liquid" | "grain" | "dotted" | "text";

/**
 * 중앙 그레인 오라 — 색이 가운데(50% 50%)서 좌우로 번진다.
 * 농도 기준: **액티브가 칩의 "기본" 농도**, 비액티브는 거기서 한 단계 더 옅게.
 * (액티브를 진하게 칠하면 셀렉트가 CTA 버튼처럼 튄다 — 셀렉트는 고르는 자리지 누르는 자리가 아니다)
 */
function centerGrainAura(color: string, on: boolean): CSSProperties {
  return {
    background: on
      ? `radial-gradient(70% 220% at 50% 50%, color-mix(in srgb, ${color} 44%, var(--aura-tint, #ffffff)), color-mix(in srgb, ${color} 10%, transparent))`
      : `radial-gradient(70% 220% at 50% 50%, color-mix(in srgb, ${color} 26%, var(--aura-idle-tint, #ffffff)), color-mix(in srgb, ${color} 6%, transparent))`,
    boxShadow: on
      ? `0 2px 10px color-mix(in srgb, ${color} var(--aura-glow-soft, 18%), transparent)`
      : "0 1px 6px var(--aura-idle-shadow, rgb(var(--shadow-ink)/0.06))",
  };
}

/** 드롭다운 패널 쪽 치수만 사이즈별로 따로 — 트리거는 `CONTROL_SIZES`를 그대로 쓴다 */
const MENU: Record<CategorySelectSize, { text: string; pad: string }> = {
  xs: { text: "text-[10.5px]", pad: "h-6 px-2" },
  sm: { text: "text-[11px]", pad: "h-7 px-2" },
  md: { text: "text-[12px]", pad: "h-8 px-2.5" },
  lg: { text: "text-[12.5px]", pad: "h-8 px-3" },
};

/** 트리거 치수 — 칩·버튼과 같은 표(`CONTROL_SIZES`)에서 파생해 나란히 놓아도 어긋나지 않는다 */
const SIZE = (
  Object.keys(CONTROL_SIZES) as CategorySelectSize[]
).reduce(
  (acc, key) => {
    const c = CONTROL_SIZES[key];
    acc[key] = {
      h: c.h,
      gap: c.gap,
      px: c.pad,
      text: c.text,
      iconSize: c.icon,
      menuText: MENU[key].text,
      menuPad: MENU[key].pad,
    };
    return acc;
  },
  {} as Record<
    CategorySelectSize,
    { h: string; gap: string; px: string; text: string; iconSize: number; menuText: string; menuPad: string }
  >,
);

/** 패널은 어느 재질이든 BasicGlass("가려주는 유리") — 드롭다운은 뒤가 비치면 글씨가 겹친다.
 *  재질 차이는 테두리 액센트로만 남긴다 */
const PANEL_ACCENT: Record<CategorySelectVariant, string> = {
  liquid: "",
  grain: "",
  dotted: "",
  text: "border-transparent",
};

/** 옵션의 아이콘 또는 색 점 렌더 — 선택된 자리(트리거·선택행)에선 글자색을 그대로 따라간다 */
function OptionMark({
  option,
  size,
  lit = false,
  tint,
  className = "",
}: {
  option: CategoryOption;
  size: number;
  lit?: boolean;
  /** 아이콘만 이 색으로 — 글자가 중립인 재질(유리)에서 카테고리 색을 살릴 때 */
  tint?: string;
  className?: string;
}) {
  if (option.icon) {
    const Icon = option.icon;
    return (
      <Icon
        size={size}
        strokeWidth={2.1}
        className={`shrink-0 ${className} ${option.color ?? (lit || tint ? "" : "text-ink-4")}`}
        style={tint ? { color: tint } : undefined}
      />
    );
  }
  if (option.dot) return <span className={`h-2 w-2 shrink-0 rounded-full ${option.dot}`} />;
  return null;
}

/**
 * 프로젝트 공용 셀렉트 — 아이콘/색 점 + 옅은 선택 배경 + 컬러 체크.
 * 진한 밴드 강조를 지양해 디자인 취향에 맞춘다. 끄적끄적·우체통·설정·관리 등 전역에서 쓴다.
 */
export function CategorySelect({
  value,
  onChange,
  options,
  align = "right",
  placeholder,
  size = "md",
  variant = "grain",
  footer,
  renderOptions,
  open: controlledOpen,
  onOpenChange,
}: {
  value: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  align?: "left" | "right";
  /** 선택 전 표시 — 아이콘을 곁들이려면 노드로 넘긴다 (에디터의 "🗂 서랍장") */
  placeholder?: React.ReactNode;
  size?: CategorySelectSize;
  variant?: CategorySelectVariant;
  /** 목록 아래 구분선 + 부가 액션 ("+ 새 카테고리"). 클릭하면 패널이 닫힌다 */
  footer?: React.ReactNode;
  /** 세로 목록 대신 다른 조판으로 그릴 때 (날씨 가로 세그먼트). 받은 인자로 값 선택·닫기를 한다 */
  renderOptions?: (api: { value: string; select: (v: string) => void }) => React.ReactNode;
  /** 바깥에서 여닫아야 할 때만 (에디터 발행 검증·체크리스트가 "카테고리를 고르세요"로 열어준다) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [active, setActive] = useState(0); // 키보드 하이라이트 인덱스
  const ref = useRef<HTMLDivElement>(null);
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);
  const selected = options.find((o) => o.value === value);
  const sz = SIZE[size];

  const openMenu = useCallback(() => setOpen(true), [setOpen]);

  // 열릴 때 키보드 하이라이트를 현재 값에 맞춘다.
  // effect가 아니라 렌더 중 조정(React의 "props 변화에 맞춰 state 조정" 패턴) — 바깥에서 연 경우(controlled)도
  // 같은 자리에서 걸리고, effect처럼 한 프레임 늦게 반영되지 않는다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActive(idx >= 0 ? idx : 0);
    }
  }

  function choose(idx: number) {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    close();
  }

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  /** 트리거 버튼 키 처리 — 위/아래 이동, Enter 선택, Esc 닫기 */
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close();
    }
  }

  const grain = variant === "grain";
  const triggerColor = selected?.cssColor ?? "var(--color-primary)";
  const innerGap = sz.gap;
  const trigger = `${sz.h} ${sz.gap} ${sz.px} ${sz.text}`;

  /**
   * 옵션 행 — 목록은 목록으로 읽혀야 하므로 **idle 행엔 표면을 주지 않는다**
   * (행마다 색을 채우면 알약이 흩어진 무지개가 되고 "하나의 목록"으로 안 읽힌다).
   * 재질(variant)은 **선택된 한 줄**에서만 말하고, hover는 어느 재질이든 같은 옅은 틴트.
   */
  function menuItem(opt: CategoryOption, idx: number) {
    const on = opt.value === value;
    const hi = idx === active;
    const c = opt.cssColor ?? "var(--color-primary)";
  // ⚠️ 선택행에 font-medium을 주지 말 것 — 본문 폰트(고운돋움)는 400 하나뿐이라
  // 500을 주면 브라우저가 가짜 볼드로 획을 덧그려 글자 폭이 변한다(= 선택 순간 텍스트가 흔들림).
  // "선택됨"은 색 + 옅은 채움 + 체크가 이미 말한다.
  const inner = (
      <>
        <OptionMark option={opt} size={sz.iconSize} lit={on || hi} />
        <span className="flex-1 truncate">{opt.label}</span>
        <Check
          size={13}
          strokeWidth={2.5}
          className={`shrink-0 transition-opacity ${on ? "opacity-100" : "opacity-0"}`}
        />
      </>
    );

    // 파선 재질은 모든 행이 같은 자리를 차지하도록 투명 테두리를 미리 깔아둔다(선택 시 밀림 방지)
    const base: CSSProperties = variant === "dotted" ? { border: "1.5px solid transparent" } : {};
    let style: CSSProperties = { ...base, color: "var(--color-ink-2)" };
    let grainRow = false;

    if (on) {
      if (variant === "grain") {
        grainRow = true;
        // soft 오라가 붙이는 파선은 지운다 — 파선은 트리거 "열림"의 언어로만 남긴다
        style = { ...grainAura(c, false), boxShadow: "none", outline: "none", color: grainText(c, true) };
      } else if (variant === "dotted") {
        style = {
          color: c,
          border: `1.5px solid color-mix(in srgb, ${c} 55%, transparent)`,
          background: `color-mix(in srgb, ${c} 6%, transparent)`,
        };
      } else if (variant === "text") {
        style = { color: c };
      } else {
        style = { color: c, background: `color-mix(in srgb, ${c} 6%, transparent)` };
      }
    } else if (hi) {
      style =
        variant === "text"
          ? { color: "var(--color-ink)" }
          : { ...base, color: c, background: `color-mix(in srgb, ${c} 4%, transparent)` };
    }

    return (
      <button
        key={opt.value}
        type="button"
        role="option"
        aria-selected={on}
        onClick={() => choose(idx)}
        onMouseMove={() => setActive(idx)}
        // ⚠️ shrink-0 필수 — 부모가 `flex-col` + `max-h`라 이게 없으면 flex가 행 높이(h-8)를 **압축**한다.
        // 옵션이 많아도 스크롤이 생기는 대신 전부 납작해져 다 보이는 버그가 실제로 있었다.
        className={`relative flex w-full shrink-0 items-center overflow-hidden rounded-lg text-left transition-colors ${innerGap} ${sz.menuText} ${sz.menuPad}`}
        style={style}
      >
        {grainRow && <GrainNoise />}
        <span className={`relative flex w-full items-center ${innerGap}`}>{inner}</span>
      </button>
    );
  }

  const triggerInner = (
    <>
      {selected && (
        <OptionMark
          // 고른 순간에만 튀도록 value를 key로 — 값이 바뀌면 리마운트되며 애니메이션이 다시 돈다
          key={selected.value}
          className="select-mark-pop"
          option={selected}
          size={sz.iconSize}
          lit
          // 유리는 글자를 중립(ink)으로 두므로 카테고리 색은 아이콘이 대신 말한다
          tint={variant === "liquid" ? selected.cssColor : undefined}
        />
      )}
      <span className="truncate">{selected?.label ?? placeholder}</span>
      <ChevronDown
        size={12}
        strokeWidth={2.5}
        className={`shrink-0 transition-transform duration-200 ${variant === "liquid" ? "text-primary" : ""} ${open ? "rotate-180" : ""}`}
      />
    </>
  );

  const triggerProps = {
    type: "button" as const,
    onClick: () => (open ? close() : openMenu()),
    onKeyDown,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
  };

  let triggerNode: React.ReactNode;
  if (grain) {
    triggerNode = (
      <button
        {...triggerProps}
        className={`relative flex items-center overflow-hidden rounded-[10px] font-semibold transition-all ${trigger}`}
        style={{
          ...centerGrainAura(triggerColor, open),
          color: grainText(triggerColor, open),
          // 열림 = grain active와 같은 파선 언어.
          // ⚠️ 닫힘일 때도 같은 굵기의 outline을 transparent로 미리 깔아둔다 —
          // 없다가 생기면 transition-all이 outline-width를 0→1.5px로 애니메이션해서 테두리가 움틀거린다.
          outline: `1.5px dashed ${open ? `color-mix(in srgb, ${grainText(triggerColor, true)} 45%, transparent)` : "transparent"}`,
          outlineOffset: "-1.5px",
        }}
      >
        <GrainNoise />
        <span className={`relative flex min-w-0 items-center ${innerGap}`}>{triggerInner}</span>
      </button>
    );
  } else if (variant === "dotted") {
    triggerNode = (
      <button
        {...triggerProps}
        className={`flex items-center rounded-[10px] border-[1.5px] font-semibold transition-colors ${trigger}`}
        style={{
          color: triggerColor,
          borderStyle: open ? "solid" : "dashed",
          borderColor: `color-mix(in srgb, ${triggerColor} ${open ? 65 : 45}%, transparent)`,
          background: open ? `color-mix(in srgb, ${triggerColor} 13%, transparent)` : undefined,
        }}
      >
        <span className={`flex min-w-0 items-center ${innerGap}`}>{triggerInner}</span>
      </button>
    );
  } else if (variant === "text") {
    // 표면 없음 — 밑줄만. Button variant="text"와 같은 방식(내용 span의 border-bottom)
    const c = selected?.cssColor ?? "var(--color-ink)";
    triggerNode = (
      <button
        {...triggerProps}
        className={`inline-flex items-center font-medium transition-opacity hover:opacity-70 ${sz.h} ${sz.gap} ${sz.text}`}
        style={{ color: `color-mix(in srgb, ${c} 75%, transparent)` }}
      >
        <span
          className={`-mb-[4px] flex min-w-0 items-center pb-[4px] ${innerGap}`}
          style={{ borderBottom: `1px solid color-mix(in srgb, ${c} ${open ? 45 : 22}%, transparent)` }}
        >
          {triggerInner}
        </span>
      </button>
    );
  } else {
    /* 리퀴드 — 트리거만 LiquidGlass(패널은 어느 재질이든 BasicGlass) */
    triggerNode = (
      <LiquidGlass
        as="button"
        {...triggerProps}
        className={`flex items-center rounded-[10px] text-ink transition-all ${trigger}`}
        style={{
          // 유리 위 원색은 옅은 색(모래·민트)에서 안 읽힌다 → grainText로 한 번 깊게 눌러 쓴다
          ...(selected?.cssColor ? { color: grainText(selected.cssColor, true) } : null),
          // 링은 outline으로 — box-shadow로 주면 `.date-picker-glass`의 8겹 inset 광택을 통째로 덮어
          // 열리는 순간 유리 재질이 사라졌다 돌아온다. 닫힘일 땐 transparent로 굵기만 미리 잡아둔다.
          outline: `2px solid ${open ? "var(--color-primary-subtle)" : "transparent"}`,
          outlineOffset: 0,
        }}
        contentClassName={`flex min-w-0 items-center ${innerGap}`}
      >
        {triggerInner}
      </LiquidGlass>
    );
  }

  // 패널은 트리거보다 좁아지지 않고(min-w-full) 가장 긴 옵션에 맞춰 딱 붙는다.
  // ⚠️ `w-max`(max-content)를 쓰면 안 된다 — 행 안에 `flex-1`/`w-full`이 겹쳐 있어 max-content가
  // 컨테이너 폭(1024px)까지 부풀고, 결국 `max-w`에 걸려 **항상 260px**로 열렸다(트리거의 2.6배).
  // `w-fit`(fit-content)은 내용 폭으로 정확히 줄어든다.
  // 상한은 뷰포트도 같이 본다 — 좁은 화면에서 오른쪽 정렬 패널이 화면 밖으로 나가지 않게 (DockPopover와 같은 방식)
  // 상한 180px — 260px은 이름이 긴 카테고리 하나 때문에 패널 전체가 트리거의 3배로 벌어졌다. 긴 라벨은 truncate가 받는다
  const menuBase = `select-menu-enter absolute z-50 mt-1.5 w-fit min-w-full max-w-[min(180px,calc(100vw-2rem))] overflow-hidden rounded-xl shadow-[0_10px_28px_rgb(var(--shadow-ink)/0.14)] ${
    align === "right" ? "right-0" : "left-0"
  }`;
  const items = (
    <div className="p-2">
      {renderOptions ? (
        renderOptions({ value, select: (v) => { onChange(v); close(); } })
      ) : (
        // 220px = 6행(202px) + 7행의 절반. 딱 떨어지게 자르면 "여기서 끝"으로 읽히므로
        // 일부러 한 행을 반쯤 걸쳐 더 있다는 걸 보여준다. footer는 이 스크롤 밖이라 늘 보인다.
        // ⚠️ scrollbar-hide를 붙이지 말 것 — macOS는 스크롤바가 평소 숨어 있어 잘린 티가 이것뿐이다
        <div className="flex max-h-[220px] flex-col gap-0.5 overflow-y-auto pr-0.5">
          {options.map((opt, idx) => menuItem(opt, idx))}
        </div>
      )}
      {footer && (
        // 부가 액션은 목록이 아니다 — 구분선 아래로 내리고, 누르면 패널을 닫는다.
        // whitespace-nowrap: 패널이 w-fit이라 footer 라벨도 폭 계산에 넣어야 한다 —
        // 없으면 짧은 카테고리("여행")에 맞춰진 폭에서 "새 카테고리"가 두 줄로 접혔다
        <div onClick={close} className="mt-0.5 whitespace-nowrap border-t border-border/50 pt-0.5">
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {triggerNode}

      {open && (
        <BasicGlass
          role="listbox"
          // 목록을 읽어야 하는 표면 → 진한 유리. 기본 84%로는 뒤의 카테고리 칩·아이콘이 글씨와 겹쳐 읽힌다
          opaque
          className={`${menuBase} ${PANEL_ACCENT[variant]}`}
          style={
            // `.glass`가 solid 보더를 먼저 깔아서 Tailwind border-dashed가 안 먹는다 → 인라인으로
            variant === "dotted"
              ? {
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: `color-mix(in srgb, ${triggerColor} 45%, transparent)`,
                }
              : undefined
          }
        >
          {items}
        </BasicGlass>
      )}
    </div>
  );
}
