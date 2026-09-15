"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

/** 하트 index(0~4) 채움 퍼센트 — 4.3이면 5번째 하트가 30%만 찬다 */
function heartFill(rating: number, index: number): number {
  const v = rating - index;
  if (v >= 1) return 100;
  if (v <= 0) return 0;
  return Math.round(v * 100);
}

/** 하트 한 알 — 빈 하트 위에 채운 하트를 `fill`%만큼 잘라 얹는다 (채움·빈 시각은 여기 한 곳) */
function HeartCell({ fill, size, color }: { fill: number; size: number; color: string }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <Heart size={size} strokeWidth={1.75} className="absolute inset-0" style={{ color, opacity: 0.25 }} />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
        <Heart size={size} strokeWidth={1.75} fill="currentColor" style={{ color, opacity: 0.7 }} />
      </span>
    </span>
  );
}

/**
 * 하트 5개 — 평점이든 기대지수든 하트는 이것 하나.
 *
 * - `onChange` 없음 → 보여주기. 4.3처럼 **부분 채움**까지 그린다 (아카이브 평점).
 * - `onChange` 있음 → 눌러서 **정수 1~5** 입력. 올려두면 미리 채워 보이고 키보드 포커스 링이 뜬다
 *   (끄적끄적 기대지수).
 *
 * `color`를 주면 하트가 그 색을 따른다 (바람 카테고리색 등, 기본 포인트색).
 * `showValue`면 옆에 mono 숫자(4.8)를 붙인다.
 */
export function HeartRating({
  rating,
  onChange,
  size = 13,
  color = "var(--color-primary)",
  showValue = false,
  label = "평점",
  className = "",
}: {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
  showValue?: boolean;
  /** 스크린리더용 이름 — "평점" · "기대지수" */
  label?: string;
  className?: string;
}) {
  const [hover, setHover] = useState(0);
  const value = Math.max(0, Math.min(5, rating));

  const number = showValue && (
    <span className="font-mono text-[11.5px] font-medium" style={{ color }}>
      {value.toFixed(1)}
    </span>
  );

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-[3px] ${className}`} aria-label={`${label} ${value.toFixed(1)}`}>
        <span className="inline-flex items-center gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <HeartCell key={i} fill={heartFill(value, i)} size={size} color={color} />
          ))}
        </span>
        {number}
      </span>
    );
  }

  const shown = hover || Math.round(value);
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`}>
      <span className="inline-flex items-center gap-[2px]" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${label} ${n}점`}
            aria-pressed={n === Math.round(value)}
            className="inline-flex rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <HeartCell fill={n <= shown ? 100 : 0} size={size} color={color} />
          </button>
        ))}
      </span>
      {number}
    </span>
  );
}
