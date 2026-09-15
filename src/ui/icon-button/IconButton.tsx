"use client";

import type { ReactNode } from "react";
import { Button, TONE_COLOR, type ButtonShape, type ButtonSize, type ButtonTone, type ButtonVariant } from "../button";
import { Tooltip } from "../tooltip";

/**
 * 아이콘 전용 액션 버튼 — 32px 원형 리퀴드 글라스 + 호버 팝(spring) + 툴팁.
 * 라벨 없는 컨트롤(헤더 우상단·에디터 헤더)의 단일 소스라 크기·표면이 저절로 통일된다.
 *
 * 아이콘 자체의 마이크로 인터랙션은 호출부에서 `group-hover:*` 로 준다 (버튼에 `group`이 붙어 있음).
 *
 * @example
 * <IconButton label="설정" href="/settings"
 *   icon={<Settings size={15} className="text-comment-mint-solid transition-transform group-hover:rotate-180" />} />
 */
export function IconButton({
  label,
  icon,
  tone = "default",
  variant,
  color,
  shape = "round",
  size = "md",
  href,
  onClick,
  // square는 hoverActive가 짝이다 — 도형만 바꾸고 빠뜨리면 겨냥 표시가 없는 회색 칸이 된다
  hoverActive = shape === "square",
  disabled = false,
  tooltipSide = "bottom",
  className = "",
}: {
  /** 툴팁 문구 겸 aria-label */
  label: string;
  icon: ReactNode;
  tone?: ButtonTone;
  /** 재질 — 생략 시 도형이 정한다 (square=grain · round=glass) */
  variant?: ButtonVariant;
  /** grain 재질의 색 직접 지정 — 툴팁 오라도 같은 색을 쓴다 */
  color?: string;
  /** 도형 — 기본 원형. 목록 안 액션 등 둥근 사각이 어울리면 square */
  shape?: Extract<ButtonShape, "round" | "square">;
  /** Chip·Button 공용 스케일 — 기본 md(32px) */
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  /** grain 전용 — hover 시 채움 + 파선. square면 기본 on */
  hoverActive?: boolean;
  disabled?: boolean;
  /** 툴팁 방향 — 기본 아래. 화면·모달 아래쪽에 붙은 버튼은 top으로 (안 그러면 잘린다) */
  tooltipSide?: "top" | "bottom";
  /** 버튼에 덧붙일 클래스 (호버 방향 틀기 등) */
  className?: string;
}) {
  // 툴팁 표면은 버튼 재질을 따라간다 — grain 버튼 위에 유리 툴팁이 뜨면 재질이 어긋난다
  const material = variant ?? (shape === "square" ? "grain" : "glass");

  return (
    <Tooltip label={label} side={tooltipSide} variant={material === "grain" ? "grain" : "glass"} color={color ?? TONE_COLOR[tone]}>
      <Button
        variant={variant}
        shape={shape}
        size={size}
        tone={tone}
        color={color}
        href={href}
        onClick={onClick}
        hoverActive={hoverActive}
        disabled={disabled}
        aria-label={label}
        icon={icon}
        // press-effect와 공존하도록 transform·shadow만 전이 (spring easing)
        className={`group !transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-110 ${className}`}
      />
    </Tooltip>
  );
}
