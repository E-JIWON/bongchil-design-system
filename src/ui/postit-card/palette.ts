/**
 * 다락방 방명록 종이(포스트잇) 색 팔레트.
 *
 * RecordsCanvas(붙은 낙서 렌더)와 FloatingDrawingBoard(낙서 작성 모달)가
 * 공유하므로 shared에 둔다. `grid`는 '종이색 ↔ 캔버스 모눈 연동'용 톤.
 */

export type PaperColorKey = "green" | "yellow" | "blue" | "pink";
export type PostItShape = "note" | "bubble";

export type PaperColor = {
  key: PaperColorKey;
  label: string;
  /** 종이 본색 (그라디언트 시작) */
  paper: string;
  /** 종이 끝색 (그라디언트 끝 · 말풍선 꼬리색) */
  edge: string;
  /** from 이름 손글씨 색 */
  from: string;
  /** 상단 테이프 색 */
  tape: string;
  /** 캔버스 모눈(그리드) 연동 색 */
  grid: string;
};

export const PAPER_COLORS: readonly PaperColor[] = [
  { key: "green",  label: "초록", paper: "#cfdcc2", edge: "#c1d0b1", from: "#5a6b4c", tape: "rgba(193,208,177,0.62)", grid: "rgba(90,107,76,0.16)" },
  { key: "yellow", label: "샌드", paper: "#ece2c4", edge: "#e0d3ae", from: "#857033", tape: "rgba(224,211,174,0.62)", grid: "rgba(133,112,51,0.14)" },
  { key: "blue",   label: "블루", paper: "#ccd8e6", edge: "#bcccdd", from: "#566b82", tape: "rgba(188,204,221,0.62)", grid: "rgba(86,107,130,0.15)" },
  { key: "pink",   label: "핑크", paper: "#e7cfd2", edge: "#dcbfc4", from: "#9b6470", tape: "rgba(220,191,196,0.62)", grid: "rgba(155,100,112,0.14)" },
];

const PAPER_COLOR_MAP = Object.fromEntries(
  PAPER_COLORS.map((c) => [c.key, c]),
) as Record<PaperColorKey, PaperColor>;

/** 색 키(레거시 문자열 포함)를 PaperColor로 해석. 못 찾으면 첫 번째(초록) 반환 */
export function getPaperColor(key?: string | null): PaperColor {
  return PAPER_COLOR_MAP[key as PaperColorKey] ?? PAPER_COLORS[0];
}

/** dataUrl이 실제 그린 낙서인지(빈 캔버스가 아닌지) 판별 — 빈 PNG는 매우 짧음 */
export function hasDrawing(dataUrl?: string | null): boolean {
  return !!dataUrl && dataUrl.length > 512;
}
