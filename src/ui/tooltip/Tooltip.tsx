"use client";

import type { ReactNode } from "react";
import { LiquidGlass } from "../liquid-glass";
import { GrainNoise, grainText } from "../grain";

/**
 * 호버 툴팁 — 아이콘 전용 버튼처럼 라벨이 없는 컨트롤에 이름표를 붙인다.
 * CSS만으로 동작(group-hover) — 상태·포털·리스너 없음.
 * 표면은 감싼 컨트롤의 재질을 따라간다 — glass 버튼엔 LiquidGlass, grain 버튼엔 그레인 오라.
 * 네이티브 `title`과 겹치면 툴팁이 2개 보이므로 감싼 요소의 title은 제거할 것.
 *
 * @example <Tooltip label="설정"><Button shape="round" icon={<Settings />} /></Tooltip>
 */
export function Tooltip({
  label,
  children,
  /** 툴팁이 나타나는 위치 (기본 아래) */
  side = "bottom",
  /** 표면 재질 — 감싼 버튼의 variant와 맞춘다 (기본 glass) */
  variant = "glass",
  /** grain 재질의 오라 색 (CSS var/hex) */
  color = "var(--color-ink)",
  className = "",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  variant?: "glass" | "grain";
  color?: string;
  className?: string;
}) {
  const pos =
    side === "top"
      ? "bottom-[calc(100%+6px)] group-hover/tt:-translate-y-0 translate-y-1"
      : "top-[calc(100%+6px)] group-hover/tt:translate-y-0 -translate-y-1";

  const surface = `pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 scale-95 whitespace-nowrap rounded-[10px] px-2 py-1 text-[11px] font-medium text-ink-2 opacity-0 transition-all duration-150 ease-out group-hover/tt:scale-100 group-hover/tt:opacity-100 ${pos}`;

  return (
    <div className={`group/tt relative inline-flex ${className}`}>
      {children}
      {variant === "grain" ? (
        <span
          role="tooltip"
          className={`${surface} overflow-hidden`}
          // 그레인 오라보다 옅게 + 블러로 띄운다. backdrop-filter는 CSS 파일에선 안 먹어서 인라인.
          // 가장자리까지 같은 색을 옅게 깔고 끝만 투명 — 중간에 다른 색을 섞으면 버튼과 색이 어긋난다.
          // saturate()는 뒤 배경 채도를 올려 색이 틀어져 보이므로 쓰지 않는다.
          style={{
            background: `radial-gradient(130% 150% at center, color-mix(in srgb, ${color} 26%, transparent), color-mix(in srgb, ${color} 12%, transparent) 70%, transparent 94%)`,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 6px 16px rgb(var(--shadow-ink)/0.10)",
            // 글자색은 hover 중인 grain 버튼 아이콘과 같은 색 (grain active 텍스트 규칙)
            color: grainText(color, true),
          }}
        >
          <GrainNoise />
          <span className="relative z-[1]">{label}</span>
        </span>
      ) : (
        <LiquidGlass role="tooltip" className={surface}>
          {label}
        </LiquidGlass>
      )}
    </div>
  );
}
