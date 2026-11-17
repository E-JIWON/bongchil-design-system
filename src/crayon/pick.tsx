import type React from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

/* 고르기 — 메뉴 · 세로 탭. 고른 칸은 그 색을 옅게 칠한 크레파스 면(.crayon-pick) + 진한 글자.
   면 · 칩 · 막대는 crayon.css, 결은 <CrayonDefs />의 #pastel. 색은 color(안 주면 --color-primary) */

const tint = (color?: string) => (color ? ({ "--crayon": color } as CSSProperties) : undefined);

/**
 * 메뉴 한 줄 — 아이콘 · 이름. active면 옅은 크레파스 면 + 진한 글자, 아이콘은 그 색.
 * 링크 부품을 쓰려면 as로 넘긴다 (as={Link} href="/"). 안 주면 <a>.
 */
export function CrayonNavItem({
  as: Comp = "a",
  active,
  icon,
  color,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  active?: boolean;
  icon?: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Comp
      {...rest}
      aria-current={active ? "page" : undefined}
      className={["crayon-nav-item", active && "crayon-pick", className].filter(Boolean).join(" ")}
      style={{ ...tint(color), ...style }}
    >
      {icon}
      {children}
    </Comp>
  );
}

export type CrayonSideTab<T extends string> = {
  key: T;
  label: ReactNode;
  color?: string;
  /** 이름 오른쪽 작은 글자 — 개수 */
  count?: ReactNode;
  /** 이름 아래 한 줄 — 합계 · 진행 */
  sub?: ReactNode;
  /** 0~1 — 아래 크레용 막대 */
  ratio?: number;
};

/**
 * 세로 탭 — 고를 묶음을 위아래로. 묶음마다 크레용 칩 · 이름 · 개수, 아래에 한 줄 값과 크레용 막대(ratio).
 * 고른 칸은 그 묶음 색을 옅게 칠한 크레파스 면. 오른쪽에 고른 묶음의 내용을 두는 두 칸 화면의 왼쪽.
 */
export function CrayonSideTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: CrayonSideTab<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" aria-orientation="vertical" className={["crayon-side", className].filter(Boolean).join(" ")}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.key)}
            className={on ? "crayon-side-tab crayon-pick" : "crayon-side-tab"}
            style={tint(it.color)}
          >
            <span className="crayon-side-head">
              <span className="crayon-side-chip crayon-fill" />
              <span className="crayon-side-label">{it.label}</span>
              {it.count !== undefined && <span className="crayon-side-count">{it.count}</span>}
            </span>
            {it.sub && <span className="crayon-side-sub">{it.sub}</span>}
            {it.ratio !== undefined && (
              <span className="crayon-side-bar">
                <span className="crayon-fill" style={{ width: `${Math.round(Math.max(0, Math.min(1, it.ratio)) * 1000) / 10}%` }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 고르는 칩 — 아이콘 · 이름. on이면 그 색(color)을 칠한 크레파스 면 + 진한 글자, 아이콘도 그 색. 아니면 얇은 테두리만.
 * 하나 고르기(카테고리 · 계좌)와 여럿 켜고 끄기(항목 목록) 모두. 켤 때 굵기가 그대로라 폭이 흔들리지 않는다.
 * struck: 꺼진 칩에 취소선(켜고 끄는 목록에서 '뺐다'). 아이콘은 색을 직접 주지 말 것 — 칩이 칠한다. size sm = 한 줄에 많이
 */
export function CrayonChip({
  on,
  color,
  icon,
  size = "md",
  struck,
  className,
  style,
  children,
  ...rest
}: {
  on?: boolean;
  color?: string;
  icon?: ReactNode;
  size?: "sm" | "md";
  struck?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "className">) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={!!on}
      className={["crayon-chip", size === "sm" && "crayon-chip-sm", struck && "crayon-chip-struck", className].filter(Boolean).join(" ")}
      style={{ ...tint(color), ...style }}
    >
      {icon}
      <span className="crayon-chip-label">{children}</span>
    </button>
  );
}
