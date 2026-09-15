import { Tag, type LucideIcon } from "lucide-react";
import { CategoryMark } from "./CategoryMark";
import type { CategoryColor } from "./category-color";

/**
 * 카테고리 인라인 칩 — **아이콘 + 카테고리명** 고정. 배경/카운트/컬러점 없음.
 * 상세뷰·글쓰기·라이트박스·필터 헤더·발자취 타임라인 등에서 공용 사용 (단일 크기로 통일).
 *
 * `iconKey`(레지스트리) → `icon`(LucideIcon) → `Tag` 순으로 폴백 — 사각 컬러점으로는 안 떨어진다.
 * 색: `hex`(유저 지정)가 있으면 인라인 색, 없으면 CAT_COLORS 토큰 클래스(`color.icon`).
 */
export function CategoryChip({
  color,
  label,
  className,
  icon: Icon,
  iconKey,
  hex,
}: {
  color: CategoryColor;
  label: string;
  className?: string;
  icon?: LucideIcon;
  iconKey?: string;
  hex?: string | null;
}) {
  const fgClass = hex ? "" : color.icon;
  const fgStyle = hex ? { color: hex } : undefined;

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className ?? ""}`}>
      <CategoryMark
        color={color}
        iconKey={iconKey}
        icon={Icon ?? Tag}
        hex={hex}
        size={13}
        strokeWidth={2}
      />
      <span
        className={`truncate text-[12px] font-bold leading-none tracking-[-0.01em] ${fgClass}`}
        style={fgStyle}
      >
        {label}
      </span>
    </span>
  );
}
