"use client";

import { useMemo } from "react";
import { DEFAULT_PALETTE, useImagePalette } from "../../hooks/useImagePalette";

/** 블롭 가장자리를 원형으로 부드럽게 페이드 → 사각 그라데이션을 몽글한 블롭 형태로 */
const BLOB_MASK = "radial-gradient(circle,#000 30%,transparent 74%)";

/* 시드 기반 의사난수 — 사진(src)마다 블롭 위치·크기를 다르게, 렌더마다 흔들리지 않게 고정 */
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s: string | number) {
  if (typeof s === "number") return s | 0;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 이미지 색으로 물든 배경 블롭 — 크림 바탕 위 두 톤 그라데이션 블롭이 천천히 떠다닌다.
 * 라이트박스·아카이브 등 "사진이 주인공"인 화면의 몰입형 배경으로 재사용한다.
 *
 * - `src`를 주면 내부에서 `useImagePalette`로 색을 추출하고, `palette`를 직접 넘겨도 된다.
 * - 위치·크기는 `seed`(기본 src) 기반으로 매 사진 다르게 흩뿌려 뭉치지 않게 한다.
 * - 스스로 `absolute inset-0 overflow-hidden`이라 부모에 넣기만 하면 된다.
 */
export function PaletteBlobs({
  src,
  palette,
  seed,
  count = 3,
  className = "",
}: {
  /** 색을 추출할 이미지 URL (palette를 직접 주면 생략 가능) */
  src?: string;
  /** 미리 뽑아둔 "r,g,b" 팔레트 (있으면 src 추출보다 우선) */
  palette?: string[];
  /** 위치·크기 시드 — 기본은 src. 같은 시드면 항상 같은 배치 */
  seed?: string | number;
  /** 블롭 개수 (기본 3) */
  count?: number;
  className?: string;
}) {
  const auto = useImagePalette(src ?? "");
  const colors = palette ?? auto ?? DEFAULT_PALETTE;
  const key = seed ?? src ?? "palette-blobs";

  const blobs = useMemo(() => {
    const rand = mulberry32(hashSeed(String(key)));
    const at = (i: number) => colors[((i % colors.length) + colors.length) % colors.length] ?? colors[0];
    return Array.from({ length: count }, (_, i) => {
      // 중심을 기준으로 섹터를 나눠 각 블롭을 다른 방향에 배치 → 뭉침 방지 + 랜덤감
      const angle = ((i + rand() * 0.7) / count) * Math.PI * 2;
      const radius = 30 + rand() * 24; // 중심에서 % 거리
      const cx = 50 + Math.cos(angle) * radius;
      const cy = 50 + Math.sin(angle) * radius;
      const size = 560 + Math.round(rand() * 340); // 560~900px — 큼직하게
      return {
        cx,
        cy,
        size,
        background: `linear-gradient(135deg,rgba(${at(i)},0.26),rgba(${at(i + 1)},0.2))`,
        animationDuration: `${18 + rand() * 12}s`,
        animationDelay: `${-rand() * 16}s`,
      };
    });
  }, [colors, key, count]);

  return (
    // isolate → 블롭끼리만 screen 합성(겹쳐도 진해지지 않고 은은하게), 크림 배경과는 정상 합성
    <div
      className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${className}`}
      aria-hidden
    >
      {blobs.map((bl, i) => (
        <span
          key={i}
          className="palette-blob-anchor absolute"
          style={{
            left: `${bl.cx}%`,
            top: `${bl.cy}%`,
            width: bl.size,
            height: bl.size,
            transform: "translate(-50%,-50%)",
          }}
        >
          <span
            className="palette-blob block h-full w-full rounded-full blur-3xl mix-blend-screen"
            style={{
              background: bl.background,
              maskImage: BLOB_MASK,
              WebkitMaskImage: BLOB_MASK,
              animationDuration: bl.animationDuration,
              animationDelay: bl.animationDelay,
            }}
          />
        </span>
      ))}
    </div>
  );
}
