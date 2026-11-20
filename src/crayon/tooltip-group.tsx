"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* 모인 툴팁 — 아이콘 버튼이 나란히 모인 자리(헤더 · 독 · 접힌 사이드바)에서 이름표 하나가 버튼 사이를 미끄러진다.
   부드럽게 보이는 세 가지:
   ① 자리와 폭이 같이 움직인다 — 새 글자 폭을 미리 재서 width와 위치(transform)를 같은 곡선으로 옮긴다
      (폭이 순간 바뀌면 가운데 맞춤이 튀어서 덜컥거린다).
   ② 글자는 겹쳐 바뀐다 — 앞 글자가 빠지는 동안 새 글자가 들어온다(.12s).
   ③ 첫 등장만 .25s 기다리고, 묶음 안에서 옮겨 다닐 땐 기다림 없이 따라간다. 묶음을 벗어나면 .12s 뒤 사라진다.
   안의 Button은 tooltip을 자기 이름표로 그리지 않고 data-tip으로만 알린다(아래 컨텍스트). 겉모습은 .crayon-tip-label 그대로 */

const InGroup = createContext(false);
/** Button이 묶음 안인지 — 안이면 이름표를 묶음에 맡긴다 */
export const useInTooltipGroup = () => useContext(InGroup);

type Side = "bottom" | "top" | "right";
type Tip = { text: string; prev: string | null; x: number; y: number; w: number; h: number; n: number };

export function CrayonTooltipGroup({
  side = "bottom",
  className,
  children,
}: {
  /** 이름표가 뜨는 쪽 — 가로 줄은 bottom · top, 세로 줄(접힌 사이드바)은 right */
  side?: Side;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [shown, setShown] = useState(false);
  const [slide, setSlide] = useState(false);
  const shownRef = useRef(false);
  const tipRef = useRef<Tip | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const target = useRef<HTMLElement | null>(null);

  const measure = (text: string) => {
    const r = ruler.current;
    if (!r) return { w: 0, h: 0 };
    r.textContent = text;
    return { w: r.offsetWidth, h: r.offsetHeight };
  };

  const point = (el: HTMLElement) => {
    const host = box.current;
    if (!host || el === target.current) return;
    target.current = el;
    const b = host.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const text = el.dataset.tip ?? "";
    const { w, h } = measure(text);
    const x = side === "right" ? r.right - b.left + 8 : r.left - b.left + r.width / 2 - w / 2;
    const y =
      side === "right" ? r.top - b.top + r.height / 2 - h / 2 : side === "top" ? r.top - b.top - 6 - h : r.bottom - b.top + 6;
    const prev = shownRef.current && tipRef.current && tipRef.current.text !== text ? tipRef.current.text : null;
    const next = { text, prev, x, y, w, h, n: (tipRef.current?.n ?? 0) + 1 };
    tipRef.current = next;
    setTip(next);
    clearTimeout(timer.current);
    if (shownRef.current) {
      setSlide(true);
    } else {
      setSlide(false);
      timer.current = setTimeout(() => {
        shownRef.current = true;
        setShown(true);
      }, 250);
    }
  };
  const leave = () => {
    clearTimeout(timer.current);
    target.current = null;
    // 버튼 사이 틈을 지날 때 깜빡이지 않게 아주 잠깐 기다렸다 닫는다
    timer.current = setTimeout(() => {
      shownRef.current = false;
      setShown(false);
      setSlide(false);
    }, 120);
  };
  useLayoutEffect(() => () => clearTimeout(timer.current), []);
  const find = (t: EventTarget | null) => (t instanceof Element ? (t.closest("[data-tip]") as HTMLElement | null) : null);

  return (
    <InGroup.Provider value>
      <div
        ref={box}
        className={["crayon-tip-group", className].filter(Boolean).join(" ")}
        onPointerOver={(e) => {
          const el = find(e.target);
          if (el) point(el);
          else leave();
        }}
        onPointerLeave={leave}
        onFocus={(e) => {
          const el = find(e.target);
          if (el && (e.target as HTMLElement).matches(":focus-visible")) {
            shownRef.current = true;
            setShown(true);
            point(el);
          }
        }}
        onBlur={leave}
      >
        {children}
        {/* 폭을 재는 자 — 이름표와 같은 글꼴 · 여백, 보이지 않음 */}
        <span ref={ruler} aria-hidden className="crayon-tip-label crayon-tip-ruler" />
        {tip && (
          <span
            role="tooltip"
            className="crayon-tip-label"
            data-side={side}
            data-shown={shown || undefined}
            data-slide={slide || undefined}
            style={{ width: tip.w, transform: `translate3d(${tip.x}px, ${tip.y}px, 0)` }}
          >
            {tip.prev && (
              <span key={`p${tip.n}`} className="crayon-tip-text crayon-tip-out" aria-hidden>
                {tip.prev}
              </span>
            )}
            <span key={`t${tip.n}`} className={`crayon-tip-text ${tip.prev ? "crayon-tip-in" : ""}`}>
              {tip.text}
            </span>
          </span>
        )}
      </div>
    </InGroup.Provider>
  );
}
