"use client";

import { Link } from "../../config";
import { isValidElement, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CrayonTooltip } from "../../crayon/crayon";
import { useInTooltipGroup } from "../../crayon/tooltip-group";
import { CONTROL_SIZES, type ControlSize } from "../grain";
import { ChipLoop } from "./ChipLoop";

/**
 * 앱의 **단일 버튼** — 실행하는 버튼과 고르는 칩이 한 몸이다(2026-11-20 정리).
 * 크레파스 칠(.crayon-chip, crayon.css + `<CrayonDefs />` 필요) · 테두리 없음이 원칙.
 *
 * - 평소: `fill`(기본 true)이면 그 색을 옅게 칠해 두고, false면 이름만(조용한 글자 버튼 · 고르는 칩).
 * - 고른 상태(`on`): 칠한 버튼(이름 있음)은 손그림 동그라미, 칠 없는 버튼 · 아이콘 칸은 진한 칠.
 * - 색은 `color` 하나(주요 = primary, 삭제 = danger 토큰). 없으면 잉크.
 * - `add`: 「직접 적기 · + 추가」처럼 새로 만드는 버튼 — 크레파스 점선.
 * - `still`: 누를 수 없는 보여 주기(span) · `struck`: 꺼진 상태에 아이콘까지 가로지르는 취소선.
 * - 이름(children)이 없으면 아이콘만 있는 정사각 — `tooltip`으로 이름표(겸 aria-label)를 단다.
 */
/** 칩·버튼 공용 스케일 (`CONTROL_SIZES`) — xs 24 · sm 28 · md 32(기본) · lg 36 */
export type ButtonSize = ControlSize;
export type ButtonProps = {
  size?: ButtonSize;
  /** 색(CSS 값) — 칠 · 동그라미 · 아이콘이 이 색. 없으면 잉크 */
  color?: string;
  /** 마우스를 올리면 뜨는 이름표 — 아이콘만 있는 버튼에. aria-label도 이걸로 */
  tooltip?: string;
  /** lucide 컴포넌트를 주면 size에 맞춰 그린다. 직접 만든 엘리먼트도 그대로 받는다 */
  icon?: LucideIcon | ReactNode;
  /** 이름 뒤 건수 · 끝 슬롯(✕ 같은 노드도 된다) */
  count?: ReactNode;
  /** 평소에도 옅게 칠해 두기 — 기본 true. false면 이름만(글자 버튼 · 고르는 칩) */
  fill?: boolean;
  /** 고른 상태 — 주면 aria-pressed(역할에 따라 selected · checked · 링크면 current)가 붙는다 */
  on?: boolean;
  /** 새로 만드는 버튼(직접 적기 · + 추가) — 크레파스 점선 */
  add?: boolean;
  /** 누를 수 없는 보여 주기(span, 탭 순서 밖) */
  still?: boolean;
  /** 꺼진 상태에 취소선(켜고 끄는 목록에서 '뺐다') */
  struck?: boolean;
  /** 아이콘 색 — on: 고를 때만 · always: 늘 그 색(fill이면 늘 always) */
  iconColor?: "on" | "always";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  "aria-label"?: string;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick" | "disabled" | "className" | "style" | "title" | "aria-label" | "children" | "color">;

/**
 * lucide 컴포넌트면 size 표에 맞춰 그리고, 이미 만들어진 엘리먼트면 그대로 둔다.
 * ⚠️ lucide 아이콘은 `forwardRef` **객체**라 `typeof === "function"`이 아니다 — `isValidElement`로 가른다.
 */
function renderIcon(icon: ButtonProps["icon"], px: number): ReactNode {
  if (icon == null || icon === false || isValidElement(icon)) return icon as ReactNode;
  if (typeof icon === "string" || typeof icon === "number") return icon;
  const Icon = icon as LucideIcon;
  return <Icon size={px} strokeWidth={2} className="shrink-0" />;
}

const hasNode = (n: ReactNode) => n != null && n !== false && n !== "";

export function Button({
  size = "md",
  color,
  tooltip,
  icon,
  count,
  fill = true,
  on,
  add,
  still,
  struck,
  iconColor,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style,
  title,
  "aria-label": ariaLabel,
  children,
  ...rest
}: ButtonProps) {
  const inGroup = useInTooltipGroup();
  const s = CONTROL_SIZES[size];
  const iconNode = renderIcon(icon, s.icon);
  const iconOnly = !hasNode(children);

  // ── 크레파스 몸통(.crayon-chip): 아이콘 · 이름 · 건수 · 동그라미가 바로 아래 자식 ──
  const isOn = !!on;
  const isFill = !add && fill;
  const cls = [
    "crayon-chip",
    tooltip && "group",
    size !== "md" && `crayon-chip-${size}`,
    iconOnly && "crayon-chip-icon",
    struck && "crayon-chip-struck",
    disabled && "pointer-events-none opacity-40",
    className,
  ].filter(Boolean).join(" ");
  const chipStyle = { "--crayon": color ?? "var(--color-ink)", ...style } as CSSProperties;
  const data: Record<string, true | string | undefined> = {
    "data-on": isOn || undefined,
    "data-still": still || undefined,
    "data-fill": isFill || undefined,
    "data-add": add || undefined,
    "data-icon": isFill || iconColor === "always" ? "always" : undefined,
    // 모인 툴팁 안이면 이름표는 묶음이 그린다
    "data-tip": inGroup ? tooltip : undefined,
  };
  // 고른 상태는 on을 줬을 때만 알린다 — 역할에 맞게
  const role = (rest as { role?: string }).role ?? "";
  const state =
    on === undefined || still
      ? {}
      : href
        ? { "aria-current": isOn ? ("page" as const) : undefined }
        : ["tab", "option"].includes(role)
          ? { "aria-selected": isOn }
          : ["radio", "checkbox", "switch", "menuitemradio", "menuitemcheckbox"].includes(role)
            ? { "aria-checked": isOn }
            : { "aria-pressed": isOn };
  const body = (
    <>
      {iconNode}
      {!iconOnly && <span className="crayon-chip-label">{children}</span>}
      {hasNode(count) && <span className="crayon-chip-count">{count}</span>}
      {/* 동그라미는 이름 있는 칠한 버튼만 — 아이콘 칸은 켜지면 진한 칠(밖으로 번지지 않게) */}
      {isFill && !iconOnly && <ChipLoop />}
    </>
  );

  const wrap = (el: ReactNode) => (tooltip && !inGroup ? <CrayonTooltip label={tooltip} color={color}>{el}</CrayonTooltip> : el);

  if (still) {
    return wrap(
      <span {...(rest as Record<string, unknown>)} {...data} className={cls} style={chipStyle} title={title} aria-label={ariaLabel ?? tooltip}>
        {body}
      </span>
    );
  }
  if (href) {
    return wrap(
      <Link href={href} onClick={onClick} {...(rest as Record<string, unknown>)} {...state} {...data} className={cls} style={chipStyle} title={title} aria-label={ariaLabel ?? tooltip}>
        {body}
      </Link>
    );
  }
  return wrap(
    <button type={type} disabled={disabled} onClick={onClick} {...state} {...rest} {...data} className={cls} style={chipStyle} title={title} aria-label={ariaLabel ?? tooltip}>
      {body}
    </button>
  );
}
