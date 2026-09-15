import type { CSSProperties } from "react";
import { splitNickname } from "../../lib/random-nickname";
import {
  getPaperColor,
  hasDrawing,
  type PaperColorKey,
  type PostItShape,
} from "./palette";

/* eslint-disable @next/next/no-img-element */

type PostItCardProps = {
  /** 남긴 사람 이름 (손글씨) */
  from: string;
  /** 그린 낙서 dataUrl — 없거나 빈 캔버스면 텍스트 노트로 렌더 */
  dataUrl?: string;
  /** 한 줄 메모 */
  caption?: string;
  /** 종이 색 키 */
  color: PaperColorKey | string;
  /** note(정갈) · bubble(말풍선) */
  shape?: PostItShape;
  /** 상단 테이프 */
  tape?: boolean;
  /** 종이 너비(px) */
  width?: number;
  className?: string;
  /** 위치·회전 등 래퍼 스타일 (드래그 캔버스에서 주입) */
  style?: CSSProperties;
};

/**
 * 방명록 벽에 붙는 낙서 카드.
 * 위치/회전/드래그는 부모 래퍼가 담당하고, 이 컴포넌트는 종이 표현만 그린다.
 */
export function PostItCard({
  from,
  dataUrl,
  caption,
  color,
  shape = "note",
  tape = false,
  width = 168,
  className = "",
  style,
}: PostItCardProps) {
  const c = getPaperColor(color);
  const isBubble = shape === "bubble";
  const drawn = hasDrawing(dataUrl);
  // 이름과 숫자 태그(`_8693`)를 쪼갠다 — 태그는 한 단계 더 연하게 (종이 위에선 mono 대신 본문 글씨)
  const { base, num } = splitNickname(from);

  return (
    <div className={`postit-card relative ${className}`} style={{ width, ...style }}>
      {/* 상단 테이프 */}
      {tape && (
        <div
          className="absolute left-1/2 top-[-11px] z-[3] h-5 w-[58px] -translate-x-1/2 -rotate-3"
          style={{
            background: c.tape,
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "7px 100%",
            boxShadow: "0 2px 5px rgb(var(--shadow-ink)/0.13)",
          }}
          aria-hidden
        />
      )}

      {/* 종이 본체 */}
      <div
        className="postit-paper relative overflow-hidden px-3.5 pb-3 pt-3"
        style={{
          borderRadius: isBubble ? 13 : 2,
          background: `linear-gradient(158deg, ${c.paper} 0%, ${c.edge} 100%)`,
          boxShadow:
            "0 1px 2px rgb(var(--shadow-ink)/0.08), 0 9px 20px -9px rgb(var(--shadow-ink)/0.24)",
        }}
      >
        {/* 남긴 사람 — 종이색과 같은 톤으로 연하게 (내용이 주인공) */}
        <div
          className="relative z-[2] mb-1.5 text-[12px] font-medium"
          style={{ color: c.from, opacity: 0.62 }}
        >
          {base}
          {num && <span className="text-[11px] font-normal opacity-70">{num}</span>}
        </div>

        {/* 그린 낙서 */}
        {drawn && (
          <img
            src={dataUrl}
            alt=""
            draggable={false}
            className="relative z-[2] mx-auto block h-auto w-full max-w-[150px]"
          />
        )}

        {/* 한 줄 메모 */}
        {caption && (
          <div
            className={`postit-ink relative z-[2] text-center text-[12px] leading-snug ${
              drawn ? "px-1 pb-0.5" : "px-1 py-1.5"
            }`}
          >
            {caption}
          </div>
        )}
      </div>

      {/* 말풍선 꼬리 — 본체 바닥에 딱 붙는 아래꼭 삼각형(clip-path).
          윗변이 본체 바닥과 flush로 겹쳐 이음새 없이 이어지고,
          drop-shadow가 삼각형 윤곽만 따라 은은하게 진다. */}
      {isBubble && (
        <div
          className="absolute bottom-[-8px] left-6 h-[10px] w-[18px]"
          style={{
            // 본체 그라디언트는 바닥에서 edge까지 완전히 도달하지 않아
            // edge 원색을 쓰면 꼬리가 더 어둡게 뜬다 → paper와 섞어 실제 바닥색에 맞춘다
            background: `color-mix(in srgb, ${c.edge} 68%, ${c.paper} 32%)`,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            filter: "drop-shadow(0 2px 1.5px rgb(var(--shadow-ink)/0.1))",
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
