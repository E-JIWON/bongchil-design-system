import type { LucideIcon } from "lucide-react";
import { CategoryIcon, hasCategoryIcon } from "../category-icon";
import type { CategoryColor } from "./category-color";

/**
 * 카테고리 마커 — 아이콘 우선(A안) 렌더의 단일 소스.
 * `iconKey`(레지스트리에 있는 경우) → CategoryIcon, 없고 `icon`(LucideIcon)이 있으면 그 아이콘,
 * 둘 다 없으면 사각 컬러점. 색은 `hex`(유저 지정)가 있으면 인라인, 없으면 토큰 클래스.
 *
 * `hasCategoryIcon` 가드로, 레지스트리에 없는 아이콘 키가 와도 컬러점으로 안전하게 폴백한다.
 * (CategoryIcon 단독 사용은 미해석 시 null을 반환해 마커가 사라지므로 여기서 흡수한다.)
 * CategoryChip이 내부에서 쓴다.
 */
export function CategoryMark({
  color,
  iconKey,
  icon: Icon,
  hex,
  size = 13,
  strokeWidth = 2,
  dotClassName = "h-2 w-2 rounded-[3px]",
  className,
}: {
  color: CategoryColor;
  iconKey?: string;
  icon?: LucideIcon;
  hex?: string | null;
  size?: number;
  strokeWidth?: number;
  /** 컬러점 폴백의 크기·모서리 클래스 */
  dotClassName?: string;
  className?: string;
}) {
  const fgClass = hex ? "" : color.icon;
  const fgStyle = hex ? { color: hex } : undefined;
  const iconClass = `shrink-0 ${fgClass} ${className ?? ""}`;

  if (iconKey && hasCategoryIcon(iconKey)) {
    return (
      <CategoryIcon
        categoryKey={iconKey}
        size={size}
        strokeWidth={strokeWidth}
        className={iconClass}
        style={fgStyle}
      />
    );
  }

  if (Icon) {
    return <Icon size={size} strokeWidth={strokeWidth} className={iconClass} style={fgStyle} />;
  }

  return (
    <span
      className={`shrink-0 ${dotClassName} ${hex ? "" : color.dot} ${className ?? ""}`}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  );
}
