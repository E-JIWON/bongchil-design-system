/**
 * SVG 필터 defs — liquid glass 굴절 효과.
 * `.date-picker-glass-blobs`의 굴절 림(`filter: url(#liquid-glass-refraction)`)이 참조.
 * 루트 레이아웃에 1회 렌더해 전역에서 사용.
 *
 * 튜닝: baseFrequency ↑ = 잔물결 촘촘 / scale 14~24 = 은은한 구간(30+ 구피해짐) / stdDeviation ↑ = 두꺼운 유리 느낌
 */
export function LiquidGlassDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter
        id="liquid-glass-refraction"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        colorInterpolationFilters="sRGB"
      >
        {/* 저주파 1옥타브 — 노이즈가 아니라 매끈한 렌즈 굴곡으로 */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.004 0.012"
          numOctaves="1"
          seed="7"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft"
          scale="48"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

    </svg>
  );
}
