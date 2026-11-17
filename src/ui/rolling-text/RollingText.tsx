"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* 글자 · 숫자가 '새로 쓰이는' 움직임 — 바뀐 값을 눈에 띄게 할 때.
   TextScramble: 글자가 섞였다가 왼쪽부터 제자리로 (붙을 때마다)
   NumberRoll: 값이 바뀔 때만 자리마다 굴러감 (처음엔 그냥 숫자)
   IconRoll: 아이콘이 바뀔 때만 슬롯 한 칸처럼 굴러 들어옴 (처음엔 그냥 아이콘)
   동작 줄이기면 둘 다 그냥 글자 */

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.23,1,.32,1)";

/** 섞일 때 보여줄 가짜 글자 — 숫자는 숫자로, 한글은 한글로, 영문은 영문으로 (폭이 덜 흔들림) */
function glyph(c: string) {
  if (/\d/.test(c)) return String(Math.floor(Math.random() * 10));
  const code = c.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return String.fromCharCode(0xac00 + Math.floor(Math.random() * 11172));
  if (/[a-z]/i.test(c)) return String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return c;
}

/**
 * 글자 섞임(디코드) — 섞였다가 왼쪽부터 제자리로. 진짜 글자는 투명하게 자리만 잡고, 겹친 층만 바꾼다.
 * 가짜 글자는 45ms마다만 바꿔서 번쩍이는 대신 '풀리는' 것처럼 읽힌다.
 */
export function TextScramble({ children, delay = 0, duration = 520 }: { children: string; delay?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const chars = [...children];
    const start = performance.now() + delay;
    let raf = 0;
    let last = -Infinity;
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start) / duration));
      if (now - last >= 45 || p === 1) {
        last = now;
        const done = Math.floor(p * chars.length);
        el.textContent = chars.map((c, i) => (i < done || c === " " ? c : glyph(c))).join("");
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = children;
    };
  }, [children, delay, duration]);
  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
      <span style={{ visibility: "hidden" }}>{children}</span>
      <span ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {children}
      </span>
    </span>
  );
}

const ROLL_MS = 360;

/**
 * 숫자 한 자리 — 멈춰 있을 땐 그냥 글자, 값이 바뀔 때만 0~9 세로 띠를 띄워 굴림.
 * 띠를 늘 두면 화면 배율 · 줄 높이에 따라 translateY가 소수 픽셀이 돼 자리마다 위아래로 어긋나 보여서.
 * enter면 0에서 굴러 들어옴 (자릿수가 늘어 새로 생긴 자리)
 */
function Digit({ d, delay, enter }: { d: number; delay: number; enter: boolean }) {
  const [shown, setShown] = useState(enter ? 0 : d);
  // from에서 띠를 그리고, 다음 프레임에 go로 바꿔 목표까지 굴림. 굴림 시간이 지나면 다시 글자
  // (transitionend는 값이 갔다 바로 돌아오거나 탭이 숨으면 안 와서 타이머로)
  const [roll, setRoll] = useState<{ from: number; go: boolean } | null>(null);
  useEffect(() => {
    if (d === shown) {
      setRoll(null);
      return;
    }
    if (reduced()) {
      setShown(d);
      return;
    }
    // 이미 굴러가는 중이면 띠는 그대로 새 목표로 이어 가고(되감기 없이) 끝내는 타이머만 다시
    if (roll?.go) {
      const done = setTimeout(() => (setShown(d), setRoll(null)), ROLL_MS + 80);
      return () => clearTimeout(done);
    }
    setRoll({ from: shown, go: false });
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setRoll((r) => r && { ...r, go: true }));
    });
    const done = setTimeout(() => (setShown(d), setRoll(null)), delay + ROLL_MS + 80);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 값이 바뀔 때만
  }, [d]);
  if (!roll) return <span style={{ display: "inline-block", height: "1lh" }}>{shown}</span>;
  return (
    <span style={{ display: "inline-block", height: "1lh", overflow: "hidden", verticalAlign: "top" }}>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${(roll.go ? d : roll.from) * 10}%)`,
          transition: `transform ${ROLL_MS}ms ${EASE} ${delay}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ height: "1lh" }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * 숫자 굴림(오도미터) — 값이 바뀌면 바뀐 자리만 굴러감. 굴러가는 띠는 화면용, 읽기 · 복사는 숨은 진짜 숫자로.
 * 자리는 오른쪽(일의 자리)부터 세서 맞춘다 — 999 → 1,000처럼 자릿수 · 쉼표가 바뀌어도 같은 자리끼리 굴러가고,
 * 새로 생긴 앞자리는 0에서 굴러 들어옴. 굴림은 일의 자리부터 20ms씩 차례로.
 * format: 숫자 → 글자 (기본 toLocaleString — 쉼표). 통화 기호 같은 숫자 아닌 글자는 그대로 둔다
 */
export function NumberRoll({
  value,
  delay = 0,
  format = (v: number) => v.toLocaleString(),
}: {
  value: number;
  delay?: number;
  format?: (value: number) => string;
}) {
  const s = format(value);
  const chars = [...s];
  // 처음 그린 뒤에 새로 생긴 자리만 0에서 굴러 들어옴 (Digit은 enter를 처음 한 번만 읽음)
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  let place = chars.filter((c) => /\d/.test(c)).length; // 왼쪽부터 내려가며 매긴 자리 (1 = 일의 자리)
  return (
    <span style={{ position: "relative", display: "inline-flex", fontVariantNumeric: "tabular-nums" }}>
      <span className="sr-only">{s}</span>
      <span aria-hidden="true" style={{ display: "inline-flex", userSelect: "none" }}>
        {chars.map((c, i) => {
          if (!/\d/.test(c)) return <span key={`s${chars.length - i}`}>{c}</span>;
          const p = place--;
          return <Digit key={`d${p}`} d={Number(c)} delay={delay + (p - 1) * 20} enter={mounted.current} />;
        })}
      </span>
    </span>
  );
}

/**
 * 아이콘 굴림(슬롯머신 한 칸) — k가 바뀔 때마다 새 아이콘이 아래에서 올라와 살짝 넘쳤다 멈춘다.
 * 이름을 쓰는 대로 아이콘을 저절로 골라 줄 때(suggestIcons) — '골라 줬다'는 게 눈에 보이게. 처음 그릴 땐 그냥 아이콘.
 * 감싼 칸이 창(overflow hidden) 노릇이라 크기는 className · style로 (안 주면 아이콘 크기). 원래 봉칠일기 icon-roulette
 */
export function IconRoll({ k, children, className, style }: { k: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    if (!el || reduced()) return;
    el.animate(
      [
        { transform: "translateY(100%)", opacity: 0 },
        { transform: "translateY(-8%)", opacity: 1, offset: 0.5 },
        { transform: "translateY(3%)", offset: 0.75 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 350, easing: "cubic-bezier(.34,1.56,.64,1)" },
    );
  }, [k]);
  return (
    <span className={className} style={{ display: "inline-grid", placeItems: "center", overflow: "hidden", flexShrink: 0, ...style }}>
      <span ref={ref} style={{ display: "grid", placeItems: "center" }}>{children}</span>
    </span>
  );
}
