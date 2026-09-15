"use client";

import { Check, Minus } from "lucide-react";
import { grainAura, grainText, GrainNoise } from "../grain";

/**
 * 공용 토글 스위치 — **뒤집히는 카드**. on/off를 "미끄러짐"이 아니라 Y축 플립으로 말한다.
 *
 * 앞면(on)은 칩 active와 같은 `grainAura`(포인트 색 라디얼 오라 + 필름 그레인) 위 체크,
 * 뒷면(off)은 `surface-subtle` "눌린 홈" 위 빼기. 도형은 칩·버튼과 같은 `--radius-m` 사각이라
 * 나란히 놓으면 같은 가족으로 읽히고, pill 트랙(44px)의 절반 폭만 쓴다.
 *
 * ⚠️ 3D를 쓰기 때문에 루트에 `overflow-hidden`을 주면 안 된다 — `overflow`가 `visible`이
 * 아니면 브라우저가 `preserve-3d`를 납작하게 만들어 플립이 죽는다. 그레인을 라운드에
 * 맞춰 자르는 `overflow-hidden`은 **각 면**에만 준다.
 *
 * ⚠️ `-translate-*` 유틸을 이 컴포넌트 안에서 쓰지 말 것 — Tailwind v4는 이를 `transform`이
 * 아니라 `translate` 속성으로 컴파일해 인라인 `transform`(rotateY)과 합산된다.
 */
export type ToggleSize = "sm" | "md" | "lg";

/** 정사각 치수 — 라벨 옆 h-6(24px) 자리에 맞춘 md가 기본, sm은 촘촘한 목록용.
 *  ⚠️ 라운드는 `--radius-m`(10px)을 쓰지 않는다 — 20~24px 박스에서 10px은 최대 반지름
 *  (변의 절반)에 거의 닿아서 **그냥 원으로 보인다**. 사각으로 읽히는 값을 직접 준다. */
const TOGGLE_SIZES = {
  sm: { box: "size-5", radius: 5, icon: 11, stroke: 3 },
  md: { box: "size-6", radius: 6, icon: 14, stroke: 3 },
  /** 사진 위처럼 멀리서도 보여야 하는 자리 */
  lg: { box: "size-8", radius: 8, icon: 18, stroke: 2.75 },
} as const satisfies Record<
  ToggleSize,
  { box: string; radius: number; icon: number; stroke: number }
>;

export type ToggleProps = {
  checked: boolean;
  /** 없으면 표시 전용(읽기 전용 미리보기) */
  onChange?: (v: boolean) => void;
  /** 스크린리더용 이름 — 옆 라벨 텍스트를 그대로 넘긴다 */
  label: string;
  size?: ToggleSize;
  /** on 상태 색 — CSS 색 문자열. 기본 포인트 색 */
  color?: string;
  className?: string;
};

export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
  color = "var(--color-primary)",
  className = "",
}: ToggleProps) {
  const s = TOGGLE_SIZES[size];
  const readOnly = !onChange;

  /* 면(face)에는 overflow-hidden을 줘도 안전하다 — preserve-3d는 부모에만 걸려 있다 */
  const face =
    "absolute inset-0 grid place-items-center overflow-hidden [backface-visibility:hidden]";

  const card = (
    <span
      aria-hidden
      className="absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] [transform-style:preserve-3d]"
      style={{ transform: `rotateY(${checked ? 0 : 180}deg)` }}
    >
      {/* 앞면 = on — 칩 active와 같은 그레인 오라 + 찍힌 체크 */}
      <span
        className={face}
        style={{
          ...grainAura(color, true),
          color: grainText(color, true),
          borderRadius: s.radius,
        }}
      >
        <GrainNoise />
        <Check size={s.icon} strokeWidth={s.stroke} className="relative" />
      </span>
      {/* 뒷면 = off — 눌린 홈. 3D에서 뒤집어 붙인다 */}
      <span
        className={`${face} text-ink-4`}
        style={{
          transform: "rotateY(180deg)",
          borderRadius: s.radius,
          background: "var(--color-surface-subtle)",
          boxShadow: "inset 0 1px 2px color-mix(in srgb, var(--color-ink) 9%, transparent)",
          outline: "1px solid var(--color-border-strong)",
          outlineOffset: "-1px",
        }}
      >
        <Minus size={s.icon} strokeWidth={s.stroke} />
      </span>
    </span>
  );

  const cls = `relative shrink-0 [perspective:400px] ${s.box} ${readOnly ? "" : "press-effect"} ${className}`;

  if (readOnly) {
    return (
      <span role="switch" aria-checked={checked} aria-label={label} className={cls}>
        {card}
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cls}
    >
      {card}
    </button>
  );
}
