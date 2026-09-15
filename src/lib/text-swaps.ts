/**
 * 자동 치환 짝 — 치고 나면 바로 바뀐다 (노션·아이폰과 같은 결).
 *
 * ⚠️ 줄임표는 `…`(U+2026)이 아니라 `⋯`(U+22EF)다 — 앞엣것은 글꼴이 점을 밑줄선에 붙여 그려서
 *    (Pretendard) 아이폰에서 보던 가운데 점이 안 나온다. 뒤엣것은 글꼴과 무관하게 가운데다.
 *
 * `accent`는 색을 입힐 수 있는 자리(블록 에디터)에서만 쓴다 — 한 줄 입력은 맨 글자라 무시한다.
 */
export const TEXT_SWAPS: { from: string; to: string; accent?: boolean }[] = [
  { from: "...", to: "⋯", accent: true },
  { from: "->", to: "→", accent: true },
];

/** 자동 치환으로 들어간 글자 중 **색을 입히는 것** — 본문은 마크로, 맨 글자 칸은 볼 때 감싸서 */
export const ACCENT_GLYPHS = TEXT_SWAPS.filter((s) => s.accent).map((s) => s.to);

/** 색 입힐 글자를 기준으로 쪼갠 조각들 — 조각이 곧 글자면 그 자리가 색 자리다 */
export function splitAccentGlyphs(text: string): string[] {
  return text.split(new RegExp(`([${ACCENT_GLYPHS.join("")}])`)).filter(Boolean);
}
