import { useId, useState, type CSSProperties } from "react";

/* 크레용 타입 — 손으로 그린 칸 · 기둥 · 펜 획.
   칠 · 빗금 면은 crayon.css(.crayon-fill / .crayon-todo), 손그림 칸 · 펜 획은 SVG 선이라 필터 없이 이 파일 안에서 그린다.
   작은 칸에 크레파스 필터를 입히면 자갈처럼 뭉개져서, 칸은 '두 번 겹쳐 그은 휜 선 + 손빗금'으로 그린다.
   색은 color(안 주면 --crayon → --color-primary). seed가 같으면 늘 같은 모양 */

const BASE = "var(--crayon, var(--color-primary))";
const tone = (c: string, p: number) => `color-mix(in oklab, ${c} ${p}%, transparent)`;

/** 손맛 난수 — seed가 같으면 늘 같은 흔들림 */
const rng = (seed: number) => {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const jit = (r: () => number, a: number) => (r() - 0.5) * 2 * a;

/** 휜 선 하나 — 양 끝은 살짝 넘치고 가운데는 살짝 부풂 */
const line = (r: () => number, x1: number, y1: number, x2: number, y2: number, wob = 0.7) =>
  `M${(x1 + jit(r, wob)).toFixed(2)} ${(y1 + jit(r, wob)).toFixed(2)} Q${((x1 + x2) / 2 + jit(r, wob * 1.4)).toFixed(2)} ${((y1 + y2) / 2 + jit(r, wob * 1.4)).toFixed(2)} ${(x2 + jit(r, wob)).toFixed(2)} ${(y2 + jit(r, wob)).toFixed(2)}`;
/** 손으로 그린 네모 — 네 변을 따로, 모서리를 살짝 지나치게 */
const rect = (r: () => number, x: number, y: number, w: number, h: number) => {
  const o = 0.9;
  return [line(r, x - o, y, x + w + o, y), line(r, x + w, y - o, x + w, y + h + o), line(r, x + w + o, y + h, x - o, y + h), line(r, x, y + h + o, x, y - o)].join(" ");
};
/** 손빗금 — 칸 안을 45° 평행선으로 (칸 밖은 clip) */
const hachure = (r: () => number, gap: number, w: number, h: number) => {
  const out: string[] = [];
  for (let k = -h; k < w + h; k += gap) out.push(line(r, k, h + 2, k + h + 4, -2, 0.5));
  return out.join(" ");
};

/**
 * 손으로 그린 체크 칸. on이면 촘촘한 손빗금으로 메우고 펜 체크(check=false면 체크 없이 칠만),
 * 아니면 옅은 손빗금, bare면 테두리만(건너뛴 칸). h를 주면 size×h 직사각형.
 * mix: 묶음 일부만 함 — 왼쪽 절반만 촘촘히. next: 다음 할 것 — 테두리를 굵고 진하게.
 * 켤 때만 빗금이 한 줄씩 그어지고 이어서 체크가 그어진다 — 처음 그릴 때(이미 켜진 칸)는 가만히.
 */
export function CrayonCheck({
  on,
  color = BASE,
  size = 18,
  h,
  seed,
  check = true,
  bare = false,
  mix = false,
  next = false,
}: {
  on: boolean;
  color?: string;
  size?: number;
  h?: number;
  seed?: string;
  check?: boolean;
  bare?: boolean;
  mix?: boolean;
  next?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  // 켜짐이 바뀐 그 순간만 움직임 — 렌더 중 이전 값과 비교 (React의 '이전 props로 state 맞추기')
  const [was, setWas] = useState(on);
  const [drawn, setDrawn] = useState(false);
  if (on !== was) {
    setWas(on);
    setDrawn(on);
  }
  const draw = (wait: number) => (drawn ? { className: "crayon-draw", pathLength: 1, style: { animationDelay: `${wait}ms` } } : {});
  const s = seed ?? uid;
  const H = h ?? size;
  const pad = Math.min(2, H / 5, size / 5);
  const base = hash(s);
  const [r1, r2, r3, r4] = [rng(base), rng(base + 1), rng(base + 2), rng(base + 3)];
  return (
    <svg width={size} height={H} className="crayon-check" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`cc${uid}`}>
          <rect x={pad + 0.2} y={pad + 0.2} width={Math.max(0, size - pad * 2 - 0.4)} height={Math.max(0, H - pad * 2 - 0.4)} rx="1" />
        </clipPath>
        {mix && (
          <clipPath id={`cm${uid}`}>
            <rect x={pad + 0.2} y={pad + 0.2} width={Math.max(0, size / 2 - pad)} height={Math.max(0, H - pad * 2 - 0.4)} />
          </clipPath>
        )}
      </defs>
      {!bare && <path key={String(drawn)} d={hachure(r3, on ? 2.1 : 3.6, size, H)} clipPath={`url(#cc${uid})`} fill="none" stroke={tone(color, on ? 88 : 34)} strokeWidth={on ? 1.7 : 1.1} strokeLinecap="round" {...draw(0)} />}
      {mix && !on && <path d={hachure(rng(base + 4), 2.1, size, H)} clipPath={`url(#cm${uid})`} fill="none" stroke={tone(color, 88)} strokeWidth={1.7} strokeLinecap="round" />}
      <path d={rect(r1, pad, pad, size - pad * 2, H - pad * 2)} fill="none" stroke={tone(color, on || mix || next ? 100 : 72)} strokeWidth={next && !on ? 2 : 1.3} strokeLinecap="round" />
      <path d={rect(r2, pad, pad, size - pad * 2, H - pad * 2)} fill="none" stroke={tone(color, on ? 70 : 40)} strokeWidth={0.8} strokeLinecap="round" />
      {on && check && (
        <g transform={`scale(${size / 20})`}>
          <path d="M5.2 10.4 Q7 12.4 8.6 14.6 Q11.8 8.4 15.6 4.6" fill="none" stroke="var(--color-ink)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" {...draw(200)} />
          <path d={line(r4, 8.8, 14.2, 15.4, 5, 0.4)} fill="none" stroke="var(--color-ink)" strokeOpacity={0.45} strokeWidth={1.1} strokeLinecap="round" {...draw(300)} />
        </g>
      )}
    </svg>
  );
}

/** 칸 띠 — total칸 중 done칸은 메우고, skip칸은 테두리만(자리는 차지), 나머지는 옅은 손빗금. 회차 · 진행 · 출석 */
export function CrayonSteps({
  total,
  done,
  skip = [],
  color,
  size = 14,
  seed = "",
}: {
  total: number;
  done: number;
  skip?: number[];
  color?: string;
  size?: number;
  seed?: string;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <CrayonCheck key={i} on={i < done && !skip.includes(i)} bare={skip.includes(i)} check={false} color={color} size={size} seed={`${seed}${i}`} />
      ))}
    </span>
  );
}

/**
 * 기둥 줄 — 값마다 높이, 0은 바닥 선. 진하게 칠할 건 마지막 칸(기본) 또는 가장 큰 칸(peak), 나머지는 옅게.
 * live면 마지막 칸이 아직 진행 중이라 빗금. 높이는 h(px), 칸 이름은 titles(올리면 보임).
 */
export function CrayonColumns({
  values,
  color = BASE,
  h = 20,
  live,
  peak,
  titles,
}: {
  values: number[];
  color?: string;
  h?: number;
  live?: boolean;
  peak?: boolean;
  titles?: string[];
}) {
  const max = Math.max(1, ...values);
  const hot = peak ? values.indexOf(max) : values.length - 1;
  return (
    <span className="crayon-columns" style={{ height: h }}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        if (!v) return <span key={i} title={titles?.[i]} className="crayon-columns-zero" />;
        const todo = last && live;
        const c = i === hot ? color : tone(color, peak ? 30 : 45);
        return (
          <span
            key={i}
            title={titles?.[i]}
            className={todo ? "crayon-todo" : "crayon-fill crayon-block"}
            style={{ "--crayon": c, height: `${Math.max(15, (v / max) * 100)}%` } as CSSProperties}
          />
        );
      })}
    </span>
  );
}

export type CrayonRowPart = { f?: number; v?: number; color?: string; on?: boolean; title?: string };

/**
 * 칸 줄 — 칠한 칸은 .crayon-fill, 아직인 칸(on=false)은 .crayon-todo 빗금. 막대 · 띠 · 낮은 기둥을 한 결로.
 * f = 폭 몫(없으면 남은 폭을 똑같이 나눔), v = 높이 몫(없으면 꽉, 0이면 높이 0 — 자리만), 바닥 맞춤.
 * 키(h)가 12px 넘으면 키 큰 칠 결(.crayon-block). 거의 0인 칸(f ≤ 0.4%)은 안 그림
 */
export function CrayonRow({ parts, h = 6, gap = 2 }: { parts: CrayonRowPart[]; h?: number; gap?: number }) {
  return (
    <span style={{ display: "flex", width: "100%", alignItems: "flex-end", height: h, gap }}>
      {parts
        .filter((p) => p.f === undefined || p.f > 0.004)
        .map((p, i) => (
          <span
            key={i}
            title={p.title}
            className={p.on === false ? "crayon-todo" : h > 12 ? "crayon-fill crayon-block" : "crayon-fill"}
            style={{
              ...(p.color ? { "--crayon": p.color } : {}),
              // 줄 안 빗금 칸은 칠한 칸 사이에 끼어서 기본(opacity .4)이면 안 보임 — 덮지 않고 진하기만 낮춤
              ...(p.on === false ? { "--crayon-todo-p": "48%", opacity: 1 } : {}),
              flex: p.f === undefined ? 1 : "none",
              width: p.f === undefined ? undefined : `${p.f * 100}%`,
              height: p.v === 0 ? 0 : `${Math.max(8, (p.v ?? 1) * 100)}%`,
              borderRadius: 1,
            } as CSSProperties}
          />
        ))}
    </span>
  );
}

/**
 * 손으로 두른 네모 — 고른 칸 표시. 변마다 따로 그은 선이 모서리에서 살짝 엇갈려 넘친다.
 * 부모(position: relative)를 꽉 채우고, 칸 비율대로 늘어나도 선 굵기는 그대로. 처음 그릴 때 펜이 그어지듯.
 */
export function CrayonFrame({ color = BASE, className }: { color?: string; className?: string }) {
  const d = "M-1.5 4.2 C 30 1.6, 68 4.4, 101 2.4 M97.2 -1.8 C 98.8 30, 96 66, 98 101.5 M101.5 96.6 C 70 99, 32 95.6, -1.2 97.8 M3.4 101.8 C 1.2 70, 4.2 34, 2 -2";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={["crayon-frame", className].filter(Boolean).join(" ")} aria-hidden="true" focusable="false">
      {([[0, 0, 1, 2.2, 0], [0.9, -0.7, 0.4, 1.6, 140]] as const).map(([dx, dy, o, w, wait]) => (
        <path
          key={wait}
          d={d}
          transform={`translate(${dx} ${dy})`}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={w}
          strokeOpacity={o}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="crayon-draw crayon-draw-slow"
          style={{ animationDelay: `${wait}ms` }}
        />
      ))}
    </svg>
  );
}

/** 펜 획 하나를 두 번 — 두 번째는 살짝 비껴 옅게. 부모(relative) 안에 absolute로, 처음 생길 때 그어짐 */
function Pen({ d, color, width, viewBox = "0 0 100 10", stretch, style, className }: { d: string; color: string; width: number; viewBox?: string; stretch?: boolean; style: CSSProperties; className?: string }) {
  // className을 주면 자리 · 크기는 부르는 쪽 (기본 자리 style은 안 씀)
  return (
    <svg viewBox={viewBox} preserveAspectRatio={stretch ? "none" : undefined} className={["crayon-pen", className].filter(Boolean).join(" ")} style={className ? undefined : style} aria-hidden="true" focusable="false">
      {([[0, 0, 1, 0], [0.6, 0.7, 0.45, 90]] as const).map(([dx, dy, o, wait]) => (
        <path key={wait} d={d} transform={`translate(${dx} ${dy})`} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeOpacity={o} strokeLinecap="round" strokeLinejoin="round" className="crayon-draw" style={{ animationDelay: `${wait}ms` }} />
      ))}
    </svg>
  );
}

/**
 * 펜 표시 — 글자를 감싼 부모(position: relative) 안에 둔다.
 * underline: 글자 아래 연필 밑줄 · strike: 끝난 것 연필 취소선. 체크는 CrayonCheck
 */
export function CrayonPen({ kind, color, className }: { kind: "underline" | "strike"; color?: string; className?: string }) {
  if (kind === "underline") return <Pen d="M1 5.5 C 30 3.6, 65 6.6, 99 4.2" stretch width={1.8} color={color ?? BASE} className={className} style={{ left: 0, bottom: -4, width: "72%", height: 8 }} />;
  return <Pen d="M-2 6 C 30 4.8, 70 6.4, 102 4.6" stretch width={1.4} color={color ?? "var(--color-ink-3)"} className={className} style={{ left: 0, top: "50%", width: "100%", height: 8, translate: "0 -50%" }} />;
}
