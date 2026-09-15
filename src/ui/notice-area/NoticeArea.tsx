import type { CSSProperties, ReactNode } from "react";

/**
 * 중요 알림 영역 — 1.5px 파선 테두리 + 옅은 틴트. "지금 눈여겨봐야 할 구획"의 공용 언어.
 * (받은 추천 인박스처럼 임시로 떠 있는 영역에 쓴다. 상시 콘텐츠 카드에는 쓰지 않는다.)
 *
 * 파선은 원래 Button `dotted` 재질이 갖던 결인데, 버튼에선 빼고 **영역 표시 전용**으로 옮겼다.
 * 색은 `borderClass`/`bgClass`(토큰 클래스)로 주거나, 없으면 secondary.
 */
export function NoticeArea({
  as: Tag = "div",
  borderClass = "border-secondary/35",
  bgClass = "bg-secondary/[0.04]",
  className = "",
  style,
  children,
}: {
  as?: "div" | "article" | "section" | "aside";
  borderClass?: string;
  bgClass?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`rounded-xl border-[1.5px] border-dashed ${borderClass} ${bgClass} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
