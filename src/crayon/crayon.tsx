import type { CSSProperties, ReactNode } from "react";

/** 색 하나를 --crayon으로 얹는다. 안 주면 crayon.css가 --color-primary를 쓴다 */
const tint = (color?: string) => (color ? ({ "--crayon": color } as CSSProperties) : undefined);

/**
 * 페이지에 한 번. 크레파스 결 필터 셋.
 * crayon: 작은 칸(체크, 점, 축)의 가장자리 흔들림.
 * pastel: 칠한 면. 결 따라 가장자리가 울퉁불퉁하고 종이 요철 사이가 비어 보임.
 * pastel-line: 빗금·선이 손떨림처럼 흔들림.
 * graphite: 연필 선. 가는 선에 종이 결이 비침.
 */
export function CrayonDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="crayon" x="-4%" y="-60%" width="108%" height="220%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="pastel" x="-4%" y="-30%" width="108%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.55" numOctaves="2" seed="5" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="t" />
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 0 2.25" result="tooth" />
        <feComposite in="d" in2="tooth" operator="in" />
      </filter>
      <filter id="pastel-line" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="3" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* 키 큰 칠(기둥 · 칸): #pastel을 넓은 면에 쓰면 모래알처럼 구멍 나서 — 세로 결 + 요철을 덜 파냄 */}
      <filter id="pastel-block" x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5 0.06" numOctaves="2" seed="5" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="11" result="t" />
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2 0 0 0 1.85" result="tooth" />
        <feComposite in="d" in2="tooth" operator="in" />
      </filter>
      <filter id="graphite" x="-10%" y="-60%" width="120%" height="220%">
        <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="1" seed="8" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="1.2" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="4" result="t" />
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.75" result="tooth" />
        <feComposite in="d" in2="tooth" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * 크레파스 막대. 한 만큼(ratio)은 칠하고, 남은 만큼은 성긴 손빗금. 둘 사이 2px.
 * ratio가 1을 넘으면(예산 넘음) 막대 전체가 ratio가 되고, 1까지는 color · 넘친 만큼은 over 색(기본 --color-over).
 * now(0~1, 1 = 목표 자리)를 주면 그 자리에 잉크색 지금 선. 높이는 className/style로.
 */
export function CrayonBar({
  ratio,
  now,
  color,
  over = "var(--color-over, #d43f2a)",
  className,
  style,
}: {
  ratio: number;
  now?: number;
  color?: string;
  over?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
  const scale = Math.max(1, ratio); // 넘치면 막대 끝 = ratio
  const r = Math.max(0, Math.min(1, ratio)) / scale;
  return (
    <span
      className={["crayon-bar", className].filter(Boolean).join(" ")}
      style={{ ...tint(color), ...style }}
      aria-hidden="true"
    >
      {r > 0 && <span className="crayon-fill" style={{ width: pct(r) }} />}
      {ratio > 1 ? <span className="crayon-fill" style={{ flex: 1, "--crayon": over } as CSSProperties} /> : r < 1 && <span className="crayon-todo" />}
      {now !== undefined && <span className="crayon-bar-now" style={{ left: pct(now / scale) }} />}
    </span>
  );
}

/** 크레파스 형광펜: 글자 아래 절반을 칠한다. 붙을 때 왼쪽에서 오른쪽으로 칠해진다. still이면 처음부터 칠해져 있음 */
export function CrayonWash({ children, color, still }: { children: ReactNode; color?: string; still?: boolean }) {
  return (
    <span className={still ? "crayon-wash crayon-wash-still" : "crayon-wash"} style={tint(color)}>
      {children}
    </span>
  );
}

/** 손그림 동그라미: 글자(날짜, 숫자) 뒤에 칠한 동그라미. ring이면 칠 없이 크레용 테두리만 */
export function CrayonCircle({ children, ring, color, className, style }: { children: ReactNode; ring?: boolean; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={["crayon-circle crayon-blob", ring && "crayon-circle-ring", className].filter(Boolean).join(" ")} style={{ ...tint(color), ...style }}>
      {children}
    </span>
  );
}
