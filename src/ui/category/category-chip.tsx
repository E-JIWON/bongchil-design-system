import { createElement, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CATEGORY_ICONS, resolveIconKey } from "../category-icon";
import { tokenColor, type CategoryColor } from "./category-color";

/**
 * 카테고리(서랍) 데이터 → PickChip의 icon · color. `<PickChip {...categoryChip(cat)} …>{cat.label}</PickChip>`
 * 색 우선순위: 유저 hex → 카테고리 토큰(color.icon) → primary. 아이콘: iconKey(레거시 이모지도 해석) → icon
 */
export function categoryChip({
  iconKey,
  icon,
  color,
  hex,
}: {
  iconKey?: string;
  /** iconKey가 없을 때 쓸 아이콘 (전체 · 지역 · 정렬 등) */
  icon?: LucideIcon;
  color?: CategoryColor;
  hex?: string | null;
}): { icon?: ReactNode; color: string } {
  const resolved = iconKey ? resolveIconKey(iconKey) : undefined;
  const Icon = (resolved ? CATEGORY_ICONS[resolved] : undefined) ?? icon;
  return {
    icon: Icon ? createElement(Icon) : undefined,
    color: hex ?? (color ? tokenColor(color.icon) : "var(--color-primary)"),
  };
}
