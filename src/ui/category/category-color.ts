/**
 * 카테고리 색 유틸 — 카테고리 색은 두 갈래로 온다.
 * 1) 유저 지정 hex(`cat.color`) → `catTint`로 인라인 틴트
 * 2) 없으면 `CAT_COLORS` 토큰 클래스(`text-primary` 등) → `tokenColor`로 CSS 값 변환
 */

/** 카테고리 토큰 색 묶음 — `CAT_COLORS`(entities) 한 칸의 모양 */
export type CategoryColor = {
  dot: string;
  icon: string;
  bg: string;
  stitch: string;
};

/** hex 색을 투명도 pct% 로 섞은 color-mix 문자열 (배경·보더 틴트용) */
export function catTint(hex: string, pct: number): string {
  return `color-mix(in srgb, ${hex} ${pct}%, transparent)`;
}

/** `text-primary` / `bg-comment-sky-solid` 같은 토큰 클래스 → `var(--color-*)` CSS 값 */
export function tokenColor(cls: string): string {
  return `var(--color-${cls.replace(/^(text|bg|border)-/, "")})`;
}
