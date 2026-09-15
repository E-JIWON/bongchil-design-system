"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useFileDrop } from "../../hooks/useFileDrop";

/* eslint-disable @next/next/no-img-element */

/** 사진 없을 때 드롭존 높이 — 뜯는 동안 이 높이로 미리 내려앉혀야 해서 상수로 둔다 */
const EMPTY_H = 232;

/**
 * 표지 사진 프레임 — 248×232 라운드 + 그림자 + 캡션 줄.
 * - 읽기 모드(상세): `src`만 전달 → 이미지 + 캡션.
 * - 편집 모드(글쓰기): `onPick` 전달 → 빈 상태=드롭존, 호버 시 삭제 버튼.
 * 캡션은 부모가 `caption`(아이콘+텍스트 등)으로 자유롭게 구성한다.
 */
export function CoverFrame({
  src,
  alt = "",
  caption,
  className,
  style,
  onPick,
  onFiles,
  onRemove,
  placeholder = "대표 사진",
  fill = false,
  priority = false,
}: {
  src?: string;
  alt?: string;
  caption?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 지정 시 편집 모드 */
  onPick?: () => void;
  /** 끌어다 놓기로 사진 받기 — 고르기와 같은 흐름으로 넘긴다 */
  onFiles?: (files: File[]) => void;
  onRemove?: () => void;
  placeholder?: string;
  /** 부모 높이에 맞춰 사진을 세로로 채움 (본문 컬럼과 하단 정렬용). 기본 232px 고정 */
  fill?: boolean;
  /** 표지가 above-the-fold일 때(상세 페이지 등) 즉시 로드 — LCP 개선. 기본 lazy */
  priority?: boolean;
}) {
  const editable = !!onPick;
  const noop = () => {};
  const { dragging, dropProps } = useFileDrop(onFiles ?? noop, !onFiles);
  // 뜯기 애니메이션이 끝난 뒤에 실제 삭제 (찰칵 슬롯과 같은 연출)
  const [tearing, setTearing] = useState(false);
  // 사진 높이는 비율마다 달라서 드롭존으로 바뀔 때 아래가 확 튄다 →
  // 사진이 떨어지는 동안(=시선이 사진에 있는 동안) 틀 높이를 드롭존 높이로 미리 줄여 둔다
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxH, setBoxH] = useState<number>();
  const [photoH, setPhotoH] = useState<number>();
  // fill: 컬럼 전체 높이를 채우고(이미지 flex-1) 캡션은 바닥에.
  // 기본: 폭만 고정하고 높이는 사진 비율대로 — 극단적으로 길쭉/납작하면 min·max에 갇히고 여백이 남는다(object-contain)
  const imgH = fill ? "h-full min-h-[200px]" : "h-auto min-h-[170px] max-h-[330px] max-sm:max-h-[280px]";

  return (
    <div
      {...(onFiles ? dropProps : null)}
      className={`flex w-[248px] shrink-0 flex-col gap-[9px] max-sm:w-full ${fill ? "h-full" : ""} ${className ?? ""}`}
      style={style}
    >
      <div
        ref={boxRef}
        style={boxH ? { height: boxH } : undefined}
        className={`transition-[height] duration-[420ms] ease-out ${fill ? "flex min-h-0 flex-1 flex-col" : ""}`}
      >
      {src ? (
        /* 테이프는 프레임 밖으로 삐져나와야 해서 overflow-hidden 밖(이 래퍼)에 둔다 */
        <div style={photoH ? { height: photoH } : undefined} className={`group relative ${fill ? "min-h-0 flex-1" : "h-full"}`}>
          {editable && onRemove && (
            <div className={`deco-tape pointer-events-none ${tearing ? "archive-photo-tape-peel" : ""}`} aria-hidden>
              <div className="deco-tape-shine" />
            </div>
          )}
          <div
            onAnimationEnd={(event) => {
              if (event.animationName !== "archive-photo-fall") return;
              setTearing(false);
              setPhotoH(undefined);
              onRemove?.();
              // 드롭존이 이미 그 높이로 들어와 있어 여기서 풀어도 튀지 않는다
              requestAnimationFrame(() => setBoxH(undefined));
            }}
            className={`relative h-full overflow-hidden rounded-[18px] shadow-[0_18px_44px_rgb(var(--shadow-ink)/0.15)] transition-shadow ${
              dragging ? "ring-2 ring-primary/60" : ""
            } ${tearing ? "archive-photo-fall" : ""}`}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className={`img-vintage w-full transition-transform duration-500 hover:scale-105 ${fill ? "object-cover" : "object-contain"} ${imgH}`}
            />
            {editable && onRemove && (
              <button
                type="button"
                aria-label="표지 뜯기"
                disabled={tearing}
                onClick={() => {
                  const h = boxRef.current?.offsetHeight;
                  setPhotoH(h);
                  setBoxH(h);
                  setTearing(true);
                  // 사진이 공중에 뜬 사이 틀만 드롭존 높이로 내려앉는다
                  requestAnimationFrame(() => setBoxH(EMPTY_H));
                }}
                className={`pointer-events-none absolute inset-0 flex cursor-pointer items-center justify-center rounded-[18px] bg-ink/0 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:bg-ink/45 group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:bg-ink/45 focus-visible:opacity-100 focus-visible:outline-none [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:bg-ink/30 [@media(hover:none)]:opacity-100 ${
                  tearing ? "!pointer-events-none !opacity-0" : ""
                }`}
              >
                <span className="text-[13px] font-semibold text-surface">뜯기</span>
              </button>
            )}
          </div>
        </div>
      ) : editable ? (
        <button
          onClick={onPick}
          style={fill ? undefined : { height: EMPTY_H }}
          className={`archive-photo-slot-return flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed transition-colors [animation-duration:0.2s] hover:border-primary/70 hover:text-primary ${
            dragging
              ? "border-primary/70 bg-primary-subtle text-primary"
              : "border-primary/35 bg-surface-warm/40 text-ink-4"
          } ${fill ? "min-h-[200px] flex-1" : ""}`}
        >
          <ImageIcon size={20} strokeWidth={1.3} />
          <span className="text-xs">{placeholder}</span>
        </button>
      ) : null}
      </div>

      {/* 편집 모드는 캡션이 없어도 줄을 비워 둔다 — 뜯을 때 아래 내용이 밀려 올라오지 않게 */}
      {(caption || editable) && (
        <div className="flex min-h-[16px] items-center justify-center gap-[7px] text-[11.5px] leading-[1.4] text-ink-4">{caption}</div>
      )}
    </div>
  );
}
