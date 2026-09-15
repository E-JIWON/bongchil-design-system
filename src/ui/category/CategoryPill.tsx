"use client";

import type { LucideIcon } from "lucide-react";
import { Button, type ButtonSize } from "../button";
import { CATEGORY_ICONS, resolveIconKey } from "../category-icon";
import { tokenColor, type CategoryColor } from "./category-color";

/**
 * 서랍 칩 — 아이콘 + 카테고리명 + 개수의 파스텔 그레인 필. **서랍장이 보이는 모든 곳의 단일 표준.**
 * 메인 사이드바 서랍 · 하단 독 서랍 팝오버 · 발자취 독 · 카테고리 페이지 · 상단 필터 공용.
 *
 * 색 우선순위: 유저 hex(`hex`) → 카테고리 토큰(`color.icon`) → primary.
 * 배경 없는 인라인 표기가 필요하면 `CategoryChip`.
 *
 * 폭은 글자만큼(auto) — grid 셀에 넣으면 stretch로 알아서 칸을 채운다. 줄바꿈 배치는 `flex flex-wrap`.
 */
export function CategoryPill({
  label,
  count,
  iconKey,
  icon,
  color,
  hex,
  active = false,
  href,
  onClick,
  size = "md",
  className = "",
}: {
  label: string;
  count?: number;
  iconKey?: string;
  /** iconKey가 없을 때 쓸 아이콘 (전체·지역·정렬 등) */
  icon?: LucideIcon;
  /** CAT_COLORS 토큰 색 — hex가 없을 때 사용 */
  color?: CategoryColor;
  hex?: string | null;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  /** 칩·버튼 공용 스케일. 기본 md, 좁은 화면 한 줄(lg↓ 서랍 칩)은 sm */
  size?: ButtonSize;
  className?: string;
}) {
  // 조회도 가드와 같은 해석 키로 — 레거시 이모지("📚")는 resolveIconKey를 거쳐야 레지스트리에 맞는다
  const resolved = iconKey ? resolveIconKey(iconKey) : undefined;
  const Icon = (resolved ? CATEGORY_ICONS[resolved] : undefined) ?? icon;

  return (
    <Button
      variant="grain"
      size={size}
      color={hex ?? (color ? tokenColor(color.icon) : "var(--color-primary)")}
      active={active}
      icon={Icon}
      count={count}
      href={href}
      onClick={onClick}
      // min-w-0: grid 셀보다 이름이 길면 칸을 넘지 않고 안에서 말줄임 (title로 전체 이름 확인)
      title={label}
      className={`min-w-0 ${className}`}
    >
      {label}
    </Button>
  );
}
