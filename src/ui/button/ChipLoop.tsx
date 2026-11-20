/** 칠한 버튼(fill)의 고른 표시 — 손그림 동그라미 두 바퀴(시계 반대로 한 바퀴, 끝난 자리에서 이어 한 바퀴 더).
 *  viewBox 120×48을 칩 둘레에 늘린다. 획 결은 <CrayonDefs />의 #crayon-stroke, 그려지는 움직임은 crayon.css */
const LOOP_PATHS = [
  { d: "M84 4.5 C64 2 22 4 10 17 C4 26 12 40 44 44.5 C70 48 108 43 114 29 C119 18 106 6 82 4 C76 3.5 70 3.5 64 4", w: 1.6 },
  { d: "M62 6.5 C38 5.5 14 11 13 24 C12 37 36 43 60 43 C88 43 110 38 111 25 C112 13 96 7 72 6 C66 5.8 60 6 54 6.5", w: 1.4 },
];

export function ChipLoop() {
  return (
    <span className="crayon-chip-loop" aria-hidden="true">
      <svg viewBox="0 0 120 48" preserveAspectRatio="none">
        <g filter="url(#crayon-stroke)">
          {LOOP_PATHS.map((p) => (
            <path key={p.d} d={p.d} pathLength={1} strokeWidth={p.w} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </span>
  );
}
