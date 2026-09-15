"use client";

import { Fragment, type MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";

export type SegmentedItem<K extends string = string> = {
  value: K;
  /** 글자 칸 — 없으면 아이콘만 (그땐 title을 꼭 준다) */
  label?: string;
  icon?: LucideIcon;
  /** 툴팁 겸 aria-label (아이콘만일 때) */
  title?: string;
};

export type SegmentedGroup<K extends string = string> = {
  items: SegmentedItem<K>[];
  value: K;
  // 메서드 꼴로 적어야 값 종류가 다른 묶음(모양·정렬)을 한 배열에 같이 넘길 수 있다
  onChange(value: K): void;
};

/**
 * 눌린 칸 막대 — 옅은 바탕 한 줄 안에서 고른 칸만 흰 종이로 살짝 떠오른다. 테두리·그림자 없음.
 * 「여럿 중 하나」를 작은 자리에서 고를 때 (임베드 전환 막대: 표지·한 줄·글자 + 왼쪽·가운데).
 * 뜻이 다른 묶음은 `groups`로 나누면 사이에 가는 세로선이 들어간다. 필터·서랍장 칩은 여전히 FilterChips/Button grain.
 *
 * 누를 때 에디터 선택이 풀리지 않도록 mousedown 기본동작을 막는다 (NodeView 위에 떠도 안전).
 */
export function Segmented({ groups, className = "" }: { groups: SegmentedGroup<string>[]; className?: string }) {
  const keep = (e: MouseEvent) => e.preventDefault();
  return (
    // w-[max-content] · nowrap — 좁은 부모(가운데로 쌓인 카드 등) 안에 absolute로 떠도 칸 글자가 한 글자씩 꺾이지 않게
    <span className={`inline-flex w-[max-content] shrink-0 items-center gap-px whitespace-nowrap rounded-[7px] bg-surface-subtle p-0.5 ${className}`} onMouseDown={keep}>
      {groups.map((g, gi) => (
        <Fragment key={gi}>
          {gi > 0 && <span aria-hidden className="mx-1 h-3 w-px bg-border-strong/60" />}
          {g.items.map((item) => {
            const on = g.value === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                title={item.title}
                aria-label={item.label ? undefined : item.title}
                aria-pressed={on}
                onClick={() => g.onChange(item.value)}
                className={`flex h-6 items-center gap-1 rounded-[5px] text-[11px] transition ${item.label ? "px-2" : "px-1.5"} ${
                  on ? "bg-surface text-ink-2 shadow-[0_1px_2px_rgb(var(--shadow-ink)/0.1)]" : "text-ink-4 hover:text-ink-2"
                }`}
              >
                {Icon && <Icon size={12} strokeWidth={2} />}
                {item.label}
              </button>
            );
          })}
        </Fragment>
      ))}
    </span>
  );
}
