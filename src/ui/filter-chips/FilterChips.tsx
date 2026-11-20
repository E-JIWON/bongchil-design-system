"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "../button";

export type FilterChip<K extends string = string> = {
  value: K;
  label: string;
  /** 칩 앞 아이콘 (선택) */
  icon?: LucideIcon;
  /** 이름 뒤 건수 (선택) */
  count?: number;
  /** 칩 색 — CSS 색 값, 또는 `text-*` · `bg-*` 토큰 클래스. 없으면 ink(「전체」 칩 결) */
  color?: string;
};

type Props<K extends string> = {
  items: FilterChip<K>[];
  value: K;
  onChange: (value: K) => void;
  className?: string;
};

/** `text-primary` / `bg-comment-sky-solid` 같은 토큰 클래스 → CSS 색 값. 이미 CSS 값이면 그대로 */
function toColor(c: string): string {
  return /^(text|bg)-/.test(c) ? `var(--color-${c.replace(/^(text|bg)-/, "")})` : c;
}

/**
 * 화면 상단 필터 칩 줄의 단일 표준 — 칠한 Button(평소 옅게, 고르면 손그림 동그라미) md.
 * 메인 서랍 필터 · 아카이브 · 끄적끄적과 같은 크기로 고정한다(크기 prop 없음).
 */
export function FilterChips<K extends string>({ items, value, onChange, className }: Props<K>) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {items.map((item) => (
        <Button
          key={item.value}
          color={item.color ? toColor(item.color) : "var(--color-ink)"}
          icon={item.icon}
          count={item.count}
          on={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
