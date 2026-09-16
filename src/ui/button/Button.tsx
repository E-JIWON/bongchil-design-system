"use client";

import { Link } from "../../config";
import { isValidElement, useState, type CSSProperties, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { LiquidGlass } from "../liquid-glass";
import { BasicGlass } from "../basic-glass";
import { grainAura, grainText, GrainNoise, CONTROL_SIZES, CONTROL_RADIUS, type ControlSize } from "../grain";

/**
 * 앱의 **단일 버튼/칩 컴포넌트** — 예전엔 `Chip`(고르는 것)과 `Button`(실행하는 것)이 따로였는데,
 * `grain` 재질이 완전히 같아 화면에서 구분되지 않았고 "이건 칩이야 버튼이야?"만 남았다 (2026-07-30 통합).
 * 재질 5종 × 도형 3종을 한 API로.
 * - `grain`  : 카테고리색 라디얼 오라 + 흑백 필름 그레인 — 서랍장·필터·CTA의 기본 재질
 * - `glass`  : LiquidGlass 표면 — **아이콘 전용**(라벨 금지), 배경 틴트 없이 tone은 글자색으로만
 * - `text`   : 표면 없는 밑줄 텍스트 (빈 상태·보조 액션 등 가장 약한 위계)
 * - `dotted` : 점선 테두리 + 색 (active=실선 + 옅은 틴트)
 * - `plain`  : 상단 NavTabs 결 — 평소엔 무채색 글씨만, active=BasicGlass 필
 *
 * **두 축이 공존한다** — `tone`은 위계(중립·약하게·삭제·CTA), `active`는 상태("지금 켜짐").
 * 목록에서 하나를 고르는 UI면 `active`, 눌러서 실행하고 끝이면 `tone`만 쓴다.
 * `color`로 색을 직접 주면 tone 색을 덮는다 (카테고리 hex 등).
 * shape = round(원형 아이콘) · square(둥근 사각 아이콘) · pill(아이콘+라벨).
 */
export type ButtonVariant = "grain" | "glass" | "text" | "dotted" | "plain";
/** 칩·버튼 공용 스케일 (`CONTROL_SIZES`) — 기본 md */
export type ButtonSize = ControlSize;
export type ButtonTone = "default" | "muted" | "danger" | "primary";
/** round=원형 아이콘 · square=둥근 사각 아이콘(캔버스 줌·인박스 액션) · pill=아이콘+라벨 */
export type ButtonShape = "round" | "square" | "pill";

/** tone → 색 (grain 재질에서 오라 색으로) — IconButton이 툴팁 오라에도 같은 색을 쓴다 */
export const TONE_COLOR: Record<ButtonTone, string> = {
  default: "var(--color-ink)",
  muted: "var(--color-ink-4)",
  danger: "var(--color-danger)",
  primary: "var(--color-primary)",
};
/* ── glass 전용 — 배경 틴트 없음, 글자색으로만 tone 구분 ── */
const TONE_TEXT: Record<ButtonTone, string> = {
  default: "text-ink-3",
  muted: "text-ink-4",
  danger: "text-danger",
  primary: "text-primary",
};

export type ButtonProps = {
  /** 재질 — 생략 시 도형이 정한다 (square=grain · round/pill=glass) */
  variant?: ButtonVariant;
  /** round=아이콘 전용 원형 · square=둥근 사각 · pill=아이콘+라벨 (기본 pill) */
  shape?: ButtonShape;
  /** sm(카테고리·필터) · md(확인/취소, 기본) · lg(끄적끄적 필터) */
  size?: ButtonSize;
  /** 위계 — default(중립) · muted(더 약하게) · danger(삭제) · primary(CTA) */
  tone?: ButtonTone;
  /**
   * 상태 — "지금 켜져 있음"을 유지한다. tone과 무관하게 채움을 켜고 `aria-pressed`가 붙는다.
   * 목록에서 하나를 고르는 UI(서랍장·필터)가 이걸 쓴다.
   */
  active?: boolean;
  /** grain·dotted 재질의 색 직접 지정 (CSS var/hex). 없으면 tone 색 사용 */
  color?: string;
  /** 어두운 색이면 켜기 → grain active 글씨를 흰색으로 (명도 대비 확보) */
  dark?: boolean;
  /** lucide 컴포넌트를 주면 size에 맞춰 자동으로 그린다. 직접 만든 엘리먼트도 그대로 받는다 */
  icon?: LucideIcon | ReactNode;
  /** 라벨 뒤 숫자 배지 (카테고리 개수 등) */
  count?: number;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** 아이콘 회전 애니메이션 */
  spin?: boolean;
  /** grain 재질에서 hover 동안 채움 + 파선으로 — "지금 겨냥 중" 표시 (square는 필수) */
  hoverActive?: boolean;
  className?: string;
  /** 커스텀 스타일 — 재질 스타일 위에 병합(뒤에서 덮음) */
  style?: CSSProperties;
  title?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

/**
 * lucide 컴포넌트면 size 표에 맞춰 그리고, 이미 만들어진 엘리먼트면 그대로 둔다.
 * ⚠️ lucide 아이콘은 `forwardRef` **객체**라 `typeof === "function"`이 아니다 —
 * 엘리먼트 여부(`isValidElement`)로 갈라야 한다.
 */
function renderIcon(icon: ButtonProps["icon"], px: number): ReactNode {
  if (icon == null || icon === false || isValidElement(icon)) return icon as ReactNode;
  if (typeof icon === "string" || typeof icon === "number") return icon;
  const Icon = icon as LucideIcon;
  return <Icon size={px} strokeWidth={2} className="shrink-0" />;
}

export function Button({
  variant: variantProp,
  shape = "pill",
  size = "md",
  tone = "default",
  active = false,
  color: colorProp,
  dark = false,
  icon,
  count,
  href,
  onClick,
  type = "button",
  disabled = false,
  spin = false,
  hoverActive = false,
  className = "",
  style: styleProp,
  title,
  "aria-label": ariaLabel,
  children,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  // 아이콘 전용 도형 2종 — 원형(round)과 둥근 사각(square). 크기는 같고 radius만 다르다
  const iconOnly = shape === "round" || shape === "square";
  // 재질 기본값은 도형이 정한다 — 원형은 유리(헤더·닫기), 둥근 사각은 그레인(목록 액션·줌).
  // 반대 조합이 필요하면 호출부에서 variant를 명시한다.
  const variant = variantProp ?? (shape === "square" ? "grain" : "glass");
  const s = CONTROL_SIZES[size];
  const shapeCls = iconOnly
    ? `${s.h} aspect-square justify-center ${shape === "round" ? "rounded-full" : CONTROL_RADIUS}`
    : `${s.h} ${CONTROL_RADIUS} ${s.pad} ${s.text} font-semibold tracking-[-0.01em]`;
  // min-w-0: 폭이 정해진 자리(grid 셀·flex-1)에서 라벨이 밖으로 삐져나오지 않고 안에서 말줄임되도록
  // w-full: 내용 span이 버튼 폭을 채워야 개수 배지의 ml-auto가 오른쪽으로 밀린다 (글자 폭 버튼엔 영향 없음).
  //         text 재질은 제외 — 밑줄이 내용 span의 border-bottom이라 남는 여백까지 그어진다
  // justify-center: 버튼이 늘어나는 자리(flex-1·w-full)에서도 라벨은 가운데 — count가 있으면
  //                 ml-auto가 남는 공간을 다 먹어 라벨 왼쪽/개수 오른쪽 배치가 그대로 유지된다
  const contentCls = `inline-flex min-w-0 items-center justify-center ${iconOnly || variant === "text" ? "" : "w-full"} ${iconOnly ? "" : s.gap} ${spin ? "animate-[spin_6s_linear_infinite]" : ""}`.trim();

  const iconNode = renderIcon(icon, s.icon);
  // 개수는 라벨보다 옅되 색은 유지 — 카테고리색을 라벨 색에 섞는다 (어떤 재질에서도 읽힌다)
  const countColor = `color-mix(in srgb, ${colorProp ?? TONE_COLOR[tone]} 65%, currentColor)`;
  // 라벨은 항상 truncate — 높이가 h-*로 고정이라 넘치면 잘리는 게 낫다
  const label = iconOnly ? null : (
    <>
      <span className="min-w-0 truncate">{children}</span>
      {count != null && (
        // 2자리 폭을 미리 잡는다 — 서버에서 세어 온 값이 0→12로 늘 때 폭이 커지면
        // 필터 줄 전체가 옆으로 밀린다 (한 줄에 여러 개라 눈에 크게 띈다)
        // ml-auto: 폭이 정해진 자리(서랍 그리드)에선 개수가 오른쪽 끝에 붙는다. 글자 폭 버튼엔 영향 없음
        <span
          style={{ color: countColor }}
          className="ml-auto min-w-[2ch] shrink-0 text-right font-mono text-[0.82em] font-normal tabular-nums"
        >
          {count}
        </span>
      )}
    </>
  );

  // 유리 표면은 아이콘 하나만 담는다 — 라벨이 필요하면 text·grain으로 (개발 중에만 경고)
  // Node 타입 없이도 쓰이는 패키지라 process 를 전역에서 더듬어 꺼낸다 (없으면 그냥 개발로 친다)
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV;
  if (nodeEnv !== "production" && variant === "glass" && !iconOnly && children) {
    console.warn("[Button] glass 재질에 텍스트 라벨을 넣지 마세요. variant='text'|'grain'을 쓰거나, 라벨을 지우고 IconButton으로 바꾸세요.", children);
  }

  // ── glass: LiquidGlass 표면 ──
  if (variant === "glass") {
    const cls = `press-effect inline-flex items-center leading-none transition-shadow ${TONE_TEXT[tone]} ${shapeCls} ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`;
    const inner = (<>{iconNode}{label}</>);
    if (href) {
      return (
        <LiquidGlass href={href} className={cls} style={styleProp} contentClassName={contentCls} title={title} aria-label={ariaLabel}>
          {inner}
        </LiquidGlass>
      );
    }
    return (
      <LiquidGlass as="button" type={type} disabled={disabled} onClick={onClick} className={cls} style={styleProp} contentClassName={contentCls} title={title} aria-label={ariaLabel}>
        {inner}
      </LiquidGlass>
    );
  }

  const color = colorProp ?? TONE_COLOR[tone];

  // ── plain: NavTabs 결 — 평소 무채색 글씨, active만 유리 필로 떠오름 ──
  if (variant === "plain") {
    const cls = `press-effect inline-flex items-center leading-none ${shapeCls} ${active ? "" : "text-ink-4 hover:text-ink-2"} ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`;
    const inner = <span className={contentCls}>{iconNode}{label}</span>;
    if (active) {
      return (
        <BasicGlass
          as="button"
          href={href}
          onClick={onClick}
          className={cls}
          style={{ color: grainText(color, true), boxShadow: `0 1px 5px color-mix(in srgb, ${color} var(--aura-glow-soft, 22%), transparent)`, ...styleProp }}
          title={title}
          aria-label={ariaLabel}
          aria-pressed
        >
          {inner}
        </BasicGlass>
      );
    }
    return href ? (
      <Link href={href} onClick={onClick} className={cls} style={styleProp} title={title} aria-label={ariaLabel}>
        {inner}
      </Link>
    ) : (
      <button type={type} disabled={disabled} onClick={onClick} className={cls} style={styleProp} title={title} aria-label={ariaLabel} aria-pressed={false}>
        {inner}
      </button>
    );
  }

  // ── grain / dotted / text: 네이티브 버튼/링크 ──
  // 채움은 상태(active)와 CTA(primary·danger)와 hover 전용. muted는 "중립보다 더 옅게"라 채우지 않는다
  // (채우면 ink 오라라 검은 알약이 됐다 — 취소·보조 액션이 삭제보다 세 보이던 원인)
  const hoverOn = hoverActive && hovered;
  const filled = active || (tone !== "default" && tone !== "muted") || hoverOn;
  const baseCls = `press-effect inline-flex items-center leading-none ${shapeCls} ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`;

  let style: CSSProperties;
  let extraCls = "";
  let body: ReactNode;

  if (variant === "grain") {
    extraCls = "relative overflow-hidden";
    // 파선은 **상태** 표시다 — 켜짐(active)·겨냥(hover/focus)에만 긋는다.
    // tone 채움(CTA)만으로는 안 긋는다: 평소에도 파선이면 "지금 뭔가 켜져 있다"는 신호가 죽는다.
    const dashed = active || hoverOn;
    style = {
      ...grainAura(color, filled, !dark),
      color: grainText(color, filled, dark),
      // !dark는 grainAura가 이미 파선을 그린다 — 상태가 아니면 지우고,
      // dark(어두운 색)는 채움을 안 낮추는 대신 파선만 흰색으로 따로 그린다
      ...(dashed
        ? dark
          ? { outline: "1.5px dashed color-mix(in srgb, var(--aura-tint, #ffffff) 45%, transparent)", outlineOffset: "-1.5px" }
          : null
        : { outline: "none" }),
      ...styleProp,
    };
    body = (<><GrainNoise /><span className={`relative ${contentCls}`}>{iconNode}{label}</span></>);
  } else if (variant === "dotted") {
    // 점선 — 평소 dashed, active면 실선 + 옅은 틴트
    extraCls = "border-[1.5px] transition-colors";
    style = {
      color,
      borderStyle: active ? "solid" : "dashed",
      borderColor: `color-mix(in srgb, ${color} ${active ? 65 : 45}%, transparent)`,
      background: active ? `color-mix(in srgb, ${color} 13%, transparent)` : undefined,
      ...styleProp,
    };
    body = <span className={contentCls}>{iconNode}{label}</span>;
  } else {
    // text — 밑줄 텍스트. 표면 없음.
    // 밑줄은 아이콘까지 한 줄로 잇는다. `text-decoration`은 flex 컨테이너에서 자식 텍스트에만
    // 그어져 아이콘 아래가 끊기므로, 내용 span의 `border-bottom`으로 긋는다 (좌우 패딩은 제외됨).
    extraCls = "transition-opacity hover:opacity-70";
    style = {
      color: `color-mix(in srgb, ${color} 62%, transparent)`,
      ...styleProp,
    };
    body = (
      <span
        // pb로 밑줄 간격을 만들고 -mb로 그만큼 상쇄 → 박스 높이가 안 변해 버튼 중앙 정렬이 유지된다
        // min-w-0: 버튼이 flex-1로 줄어들 때 내용이 밖으로 삐져나오지 않고 안에서 truncate되도록
        className={`${contentCls} min-w-0 -mb-[4px] pb-[4px]`}
        style={{ borderBottom: `1px solid color-mix(in srgb, ${color} 22%, transparent)` }}
      >
        {iconNode}
        {label}
      </span>
    );
  }

  const cls = `${baseCls} ${extraCls}`.trim();
  // 인라인 스타일(grainAura)이라 CSS :hover로는 못 덮는다 → hover를 상태로 들고 있는다
  // 키보드 포커스도 "겨냥 중"과 같은 결로 본다 (전역 focus-visible이 outline:none이라 파선이 유일한 단서)
  const hoverProps = hoverActive
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
      }
    : null;
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls} style={style} title={title} aria-label={ariaLabel} {...hoverProps}>
        {body}
      </Link>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cls}
      style={style}
      title={title}
      aria-label={ariaLabel}
      // 켜짐/꺼짐을 유지하는 버튼은 스크린리더에도 상태가 보여야 한다
      aria-pressed={active || undefined}
      {...hoverProps}
    >
      {body}
    </button>
  );
}
