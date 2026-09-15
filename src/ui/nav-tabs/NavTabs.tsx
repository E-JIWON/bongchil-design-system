"use client";

import { Link } from "../../config";
import { useEffect, useRef } from "react";
import { grainAura, GrainNoise } from "../grain";

/**
 * 상단 탭 — 그레인 오라 알약
 * 트랙(유리 캡슐)이 없다. 평소엔 글자만 있고 **표식 알약 하나**가 고른 탭으로 미끄러진다.
 * 알약 재질은 카테고리 칩(`Button variant="grain"` active)과 같은 것 —
 * 포인트 색 라디얼 오라 + 필름 그레인 + 파선 테두리. 앱에서 제일 자주 보는 "지금 켜짐" 언어를
 * 헤더까지 가져오되, 칩처럼 다섯 개가 늘어서지 않게 오라는 표식 하나에만 얹는다.
 *
 * 움직임은 좌표만 재서 넘기고 트위닝은 CSS에 맡긴다 (JS 루프 없음).
 * 이동 중 표정은 **잉크 번짐**(`nav-pill-ink`) — 모양이 아니라 농도가 움직인다:
 * 떠날 때 오라가 번지며 옅어졌다 도착해서 다시 모인다. 그레인·오라라는 재질에 맞춘 선택이고,
 * 늘어나는 스쿼시(`nav-pill-dash`·`-settle`·`-stamp`)는 `--nav-pill-*` 변수로 갈아끼울 수 있다.
 *
 * 늘어나는 모션을 쓸 때를 위해 origin은 계속 진행 방향 반대편에 걸어 둔다(`data-dir`).
 * **첫·마지막 탭만 origin을 안쪽으로** 뒤집는다(`data-edge`) — 바깥이 고정이면 늘어난 알약이
 * 워드마크·액션 위로 넘어간다.
 */
/** href = 페이지 이동(Link) · onSelect = 상태 토글(button). 둘 중 하나 지정 */
type Tab = { label: string; isActive: boolean; href?: string; onSelect?: () => void };

export function NavTabs({ tabs }: { tabs: Tab[] }) {
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  const ready = useRef(false);
  const activeIndex = tabs.findIndex((t) => t.isActive);
  const activeRef = useRef(activeIndex);

  /** 목표 탭 좌표 세팅 — 트위닝은 CSS transition, 스쿼시는 nav-pill-dash 키프레임 */
  function moveTo(index: number, snap: boolean) {
    const nav = navRef.current;
    const pill = pillRef.current;
    const target = tabRefs.current[index];
    if (!nav || !pill) return;
    if (!target) {
      pill.style.opacity = "0";
      return;
    }
    const x = target.offsetLeft - nav.clientLeft;
    const y = target.offsetTop - nav.clientTop;
    const prevX = Number(pill.dataset.x ?? x);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (snap || reduce) pill.style.transition = "none";
    pill.dataset.x = `${x}`;
    pill.setAttribute("data-dir", x >= prevX ? "right" : "left");
    // 첫·마지막 탭은 늘어나는 방향을 안쪽으로 뒤집는다 (바깥은 워드마크·액션 자리)
    const edge = index === 0 ? "first" : index === tabs.length - 1 ? "last" : null;
    if (edge) pill.setAttribute("data-edge", edge);
    else pill.removeAttribute("data-edge");
    pill.style.translate = `${x}px ${y}px`;
    pill.style.width = `${target.offsetWidth}px`;
    pill.style.height = `${target.offsetHeight}px`;
    pill.style.opacity = "1";

    if (snap || reduce) {
      void pill.offsetWidth; // reflow — transition:none 즉시 반영
      pill.style.transition = "";
    } else {
      // 스쿼시 재시작
      pill.classList.remove("nav-pill-dash");
      void pill.offsetWidth;
      pill.classList.add("nav-pill-dash");
    }
  }

  // 탭 수가 줄면 ref 배열에 detach된 노드가 남지 않도록 잘라낸다
  useEffect(() => {
    if (tabRefs.current.length > tabs.length) tabRefs.current.length = tabs.length;
  }, [tabs.length]);

  useEffect(() => {
    activeRef.current = activeIndex;
    moveTo(activeIndex, !ready.current);
    ready.current = true;
  }, [activeIndex]);

  /** 리사이즈·폰트 로드 시 애니메이션 없이 스냅 */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => moveTo(activeRef.current, true));
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  return (
    <nav ref={navRef} className="relative flex items-center gap-1 max-md:w-full max-md:gap-0.5">
      {/* 표식 알약 — 재질은 칩 active와 같은 grainAura(soft), 좌표·움직임만 CSS(.nav-aura-pill)가 맡는다 */}
      <span
        ref={pillRef}
        aria-hidden
        className="nav-aura-pill"
        style={grainAura("var(--color-primary)", true, true)}
      >
        <GrainNoise />
      </span>
      {tabs.map((t, i) => {
        const setRef = (el: HTMLElement | null) => {
          tabRefs.current[i] = el;
        };
        const cls = `relative z-[1] whitespace-nowrap rounded-m px-3 py-[6px] text-[11.5px] transition-colors max-md:flex-1 max-md:px-0 max-md:py-[7px] max-md:text-center ${
          t.isActive ? "text-ink" : "text-ink-4 hover:text-ink-2"
        }`;
        return t.href ? (
          <Link key={t.label} href={t.href} ref={setRef} className={cls}>
            {t.label}
          </Link>
        ) : (
          <button key={t.label} type="button" onClick={t.onSelect} ref={setRef} className={cls}>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
