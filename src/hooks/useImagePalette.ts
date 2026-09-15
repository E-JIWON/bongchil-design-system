"use client";

import { useEffect, useState } from "react";
import { getConfig } from "../config";

/** 로드 전·추출 실패 시 쓰는 기본 크림 팔레트 ("r,g,b" 문자열) */
export const DEFAULT_PALETTE = ["122,196,140", "236,214,118", "232,152,184", "142,182,224"];

function rgbToHue(r: number, g: number, b: number) {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn),
    d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/**
 * 이미지에서 대표 색 2~3개를 뽑아 "r,g,b" 문자열 배열로 돌려주는 순수 함수.
 * - 24×24로 축소 → 색상환 12칸 히스토그램 → 빈도 상위 색.
 * - 너무 어둡/밝/무채색 픽셀은 제외해 "물든 색"만 남긴다.
 * - CORS로 캔버스가 오염되거나 대표색을 못 뽑으면 `null` (호출부가 이전 값/기본값을 선택).
 *
 * 훅([[useImagePalette]])과 임베드 노드(앨범색 박제) 등에서 공유한다.
 */
export function extractImagePalette(src: string): Promise<string[] | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    // 다른 출처 이미지는 앱이 준 같은 출처 주소로 바꿔(configure proxySrc) 캔버스 오염(CORS) 없이 픽셀을 읽는다
    const proxied = getConfig().proxySrc(src);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const S = 24;
        const cv = document.createElement("canvas");
        cv.width = S;
        cv.height = S;
        const ctx = cv.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, S, S);
        const d = ctx.getImageData(0, 0, S, S).data;
        const buckets = new Map<number, { c: number; r: number; g: number; b: number }>();
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i],
            g = d[i + 1],
            b = d[i + 2];
          const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
          const l = (max + min) / 2;
          if (l < 42 || l > 224 || max - min < 26) continue;
          const key = Math.floor(rgbToHue(r, g, b) / 30);
          const cur = buckets.get(key) ?? { c: 0, r: 0, g: 0, b: 0 };
          cur.c++;
          cur.r += r;
          cur.g += g;
          cur.b += b;
          buckets.set(key, cur);
        }
        const top = [...buckets.values()]
          .sort((a, b) => b.c - a.c)
          .slice(0, 3)
          .map((v) => `${Math.round(v.r / v.c)},${Math.round(v.g / v.c)},${Math.round(v.b / v.c)}`);
        resolve(top.length >= 2 ? top : null);
      } catch {
        /* 캔버스 오염(CORS) */
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = proxied;
  });
}

/**
 * 이미지 대표 색을 구독하는 훅. 배경 그라데이션(블롭)·테마 틴트 등에 재사용한다.
 * CORS 실패 시 이전 팔레트를 유지해(리셋 안 함) 사진을 넘길 때 크림으로 튀지 않게 한다.
 */
export function useImagePalette(src: string): string[] {
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);

  useEffect(() => {
    if (!src) return;
    let done = false;
    extractImagePalette(src).then((p) => {
      if (!done && p) setPalette(p);
    });
    return () => {
      done = true;
    };
  }, [src]);

  return palette;
}
