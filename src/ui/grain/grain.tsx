import type { CSSProperties } from "react";

/**
 * 그레인 재질 — 컨트롤(버튼·칩·셀렉트·월 피커)이 공유하는 치수·색 계산.
 * 컴포넌트가 아니라 **재료**다: 여기서 나온 값을 `Button`이 그대로 인라인 스타일로 쓴다.
 * (예전 `shared/ui/chip`에 있던 것 — `Chip`이 `Button`에 흡수되면서 재료만 남겨 옮겼다)
 */

/**
 * 컨트롤 공용 사이즈 스케일 — 한 곳에서만 치수를 바꾸도록.
 * 기준은 메인 화면 카테고리 칩(`sm`). 높이는 패딩이 아니라 `h`로 고정해서
 * 나란히 놓인 컨트롤이 절대 어긋나지 않게 한다. radius는 전부 `--radius-m`(10px).
 * - `xs` 카드 안에 끼는 보조 아이콘 버튼 · `sm` 카테고리·필터 (기준) · `md` 확인/취소 등 액션 버튼 · `lg` 끄적끄적 상단 필터
 */
export type ControlSize = "xs" | "sm" | "md" | "lg";

export const CONTROL_SIZES = {
  xs: { h: "h-6", pad: "px-2", text: "text-[10.5px]", icon: 11, gap: "gap-1" },
  sm: { h: "h-7", pad: "px-2.5", text: "text-[11px]", icon: 12, gap: "gap-1" },
  md: { h: "h-8", pad: "px-3.5", text: "text-[11.5px]", icon: 13, gap: "gap-1.5" },
  lg: { h: "h-9", pad: "px-4", text: "text-[12.5px]", icon: 14, gap: "gap-1.5" },
} as const satisfies Record<
  ControlSize,
  { h: string; pad: string; text: string; icon: number; gap: string }
>;

/** 컨트롤 공용 라운드 — globals.css `--radius-m`(10px) */
export const CONTROL_RADIUS = "rounded-m";

/** 그레인 텍스처 — SVG feTurbulence 흑백 노이즈 데이터 URI */
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** 그레인 오라 배경 (active=진하게 + 색 글로우)
 *  soft: 부드러운 active — 색을 절반만 올리고 `dotted`와 같은 파선 테두리로 구분.
 *  파선은 box-shadow로 불가능해서 outline으로 그린다 — 전역 focus-visible이 outline:none이라 충돌 없음 */
export function grainAura(color: string, on: boolean, soft = false): CSSProperties {
  return {
    background: on
      ? `radial-gradient(130% 150% at center, color-mix(in srgb, ${color} ${soft ? 48 : 78}%, var(--aura-tint, #ffffff)), color-mix(in srgb, ${color} ${soft ? 20 : 34}%, transparent) 72%)`
      : `radial-gradient(130% 150% at center, color-mix(in srgb, ${color} var(--aura-idle-mix, 34%), var(--aura-idle-tint, #ffffff)), color-mix(in srgb, var(--color-surface) 20%, transparent) 78%)`,
    boxShadow: on
      ? `0 ${soft ? "2px 10px" : "3px 16px"} color-mix(in srgb, ${color} ${soft ? "var(--aura-glow-soft, 20%)" : "var(--aura-glow, 40%)"}, transparent)`
      : `0 1px 6px var(--aura-idle-shadow, rgb(var(--shadow-ink)/0.06)), inset 0 0 0 1px var(--aura-idle-ring, transparent)`,
    ...(on && soft
      ? {
          // `dotted`와 같은 결 — 1.5px dashed · 카테고리색 45% (레이아웃 안 밀리게 border 대신 outline)
          outline: `1.5px dashed color-mix(in srgb, ${color} 45%, transparent)`,
          outlineOffset: "-1.5px",
        }
      : null),
  };
}

/** 명도 반영 텍스트 색 — active면 카테고리색을 반대 명도로 "깊게", dark 색은 오라 바탕색(=반대 명도), idle이면 원색
 *  oklab으로 섞어야 채도가 살아남는다 (srgb로 섞으면 회색·검정으로 죽음)
 *  섞는 상대는 테마 토큰(--aura-text/--aura-tint) — 다크모드에서 크림으로 뒤집힌다 */
export function grainText(color: string, on: boolean, dark = false): string {
  if (!on) return color;
  return dark ? "var(--aura-tint, #ffffff)" : `color-mix(in oklab, ${color} 62%, var(--aura-text, #241e18))`;
}

/**
 * 오라 페이드 마스크 — 가운데는 꽉 차고 바깥으로 갈수록 투명해져 테두리가 번진다.
 * 발자취 지도 클러스터 마커·게스트 아바타가 공유하는 "번지는 원" 레시피.
 */
export const AURA_FADE_MASK =
  "radial-gradient(circle at center, black 0%, black 38%, rgba(0,0,0,0.5) 60%, transparent 80%)";

/**
 * 우표 톱니 간격(px). **한 변이 이 값의 배수여야 한다** —
 * 소수 간격이면 타일이 딱 떨어지지 않아 반대쪽 끝 톱니가 어긋나며 깨진다.
 * 호출부는 `Math.round(px / STAMP_STEP) * STAMP_STEP`로 치수를 맞춰서 넘긴다.
 */
const STAMP_STEP = 3;

/**
 * 우표 가장자리 — 테두리를 **그리는** 게 아니라 반원을 **물어내는** 마스크.
 * 파선(dashed)은 선만 끊긴 거라 종이가 그대로 남지만, 이건 실제로 가장자리가 뜯겨 나간다.
 *
 * 마스크 두 겹을 합집합(`add`)으로 얹는다 —
 * ① 원을 뚫은 타일을 `step` 간격으로 깔아 격자마다 구멍을 내고,
 * ② 안쪽을 통째로 채우는 사각을 더해 **가장자리 줄의 구멍만** 남긴다.
 *
 * ⚠️ 마스크는 `box-shadow`(오라 글로우)까지 잘라낸다 — 우표를 씌우면 글로우가 사라진다.
 */
export function stampMask(step: number = STAMP_STEP): CSSProperties {
  // 반지름은 간격의 절반까지 — 더 키우면 옆 반원과 겹쳐 톱니가 뭉개진다.
  // 실제로 파먹는 깊이(core)는 그 82%. 이보다 얕으면 20px 안쪽 마크에서 톱니가 안 보이고,
  // 깊으면 안쪽을 채우는 사각(100%-step)이 못 가려 한가운데까지 구멍이 뚫린다.
  const r = step * 0.5;
  const core = r * 0.82;
  const layers = [
    `radial-gradient(circle ${r}px at 50% 50%, transparent ${core}px, #000 ${r}px)`,
    "linear-gradient(#000, #000)",
  ].join(", ");
  const mask = {
    maskImage: layers,
    maskSize: `${step}px ${step}px, calc(100% - ${step}px) calc(100% - ${step}px)`,
    maskPosition: `-${step / 2}px -${step / 2}px, center`,
    maskRepeat: "repeat, no-repeat",
    maskComposite: "add",
  };
  // 사파리는 접두사 계열을 따로 본다 (composite 키워드도 다르다)
  return {
    ...mask,
    WebkitMaskImage: mask.maskImage,
    WebkitMaskSize: mask.maskSize,
    WebkitMaskPosition: mask.maskPosition,
    WebkitMaskRepeat: mask.maskRepeat,
    WebkitMaskComposite: "source-over",
  } as CSSProperties;
}

/** 그레인 페이드 마스크 — 가운데 진하고 바깥으로 갈수록 연해짐 */
const GRAIN_MASK =
  "radial-gradient(ellipse at center, black 0%, rgba(0,0,0,0.55) 45%, transparent 85%)";

/** 그레인 오버레이 — 기본 screen(밝은 알갱이만, 어두운 음영 없음).
 *  ⚠️ 색이 채워진 컨트롤 위에서만 screen이 읽힌다 — **흰 종이에 가까운 판**에 얹으면
 *  밝은 알갱이가 흰 바탕에 묻혀 통째로 사라진다. 그런 자리는 `blend="multiply"`. */
export function GrainNoise({ blend = "screen" }: { blend?: "screen" | "multiply" } = {}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: GRAIN_URL,
        backgroundSize: "140px 140px",
        opacity: "var(--grain-opacity, 0.5)",
        mixBlendMode: blend,
        maskImage: GRAIN_MASK,
        WebkitMaskImage: GRAIN_MASK,
      }}
    />
  );
}
