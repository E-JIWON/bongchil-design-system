"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "../button";

export type FilterChip<K extends string = string> = {
  value: K;
  label: string;
  /** 알약 앞 아이콘 (선택) */
  icon?: LucideIcon;
  /** 라벨 뒤 카운트 (선택) */
  count?: number;
  /** 칩 색 — `bg-*` 토큰 클래스. 미지정 시 ink(전체 칩 결) */
  solid?: string;
  /** @deprecated grain 재질이 틴트를 자동 계산한다 — 무시됨 */
  tint?: string;
  /** 칩 색 — `text-*` 토큰 클래스. `solid`보다 우선 */
  text?: string;
};

type Props<K extends string> = {
  items: FilterChip<K>[];
  value: K;
  onChange: (value: K) => void;
  className?: string;
};

/** `text-primary` / `bg-comment-sky-solid` 같은 토큰 클래스 → CSS 색 값 */
function tokenColor(cls: string): string {
  return `var(--color-${cls.replace(/^(text|bg)-/, "")})`;
}

/**
 * 화면 상단 필터 칩 줄의 단일 표준 — 공용 Chip(grain) `md`.
 * 메인 서랍 필터·아카이브·끄적끄적과 같은 크기로 고정한다(크기 prop 없음).
 * 색 미지정 항목은 ink(= 아카이브 "전체" 칩)로 떨어진다.
 */
export function FilterChips<K extends string>({
  items,
  value,
  onChange,
  className,
}: Props<K>) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {items.map((item) => {
        const token = item.text ?? item.solid;
        return (
          <Button
            key={item.value}
            variant="grain"
            size="md"
            icon={item.icon}
            count={item.count}
            color={token ? tokenColor(token) : "var(--color-ink)"}
            dark={!token}
            active={value === item.value}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
