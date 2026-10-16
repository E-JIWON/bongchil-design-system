import type { ReactNode } from "react";

/**
 * 필드 그룹 — 입력 여러 칸이 **테두리 하나를 같이 쓰는 상자**.
 *
 * 짧은 부가 입력(가수·저자·위치) 하나 때문에 줄을 새로 열면, 그 줄의 대부분이 빈 채로
 * 남고 조건이 바뀔 때마다 카드 키가 뛴다. 대신 주 입력 옆에 붙이고 사이만 `FieldDivider`로
 * 가르면 줄 수가 고정된다 — 부가 칸이 생겨도 사라져도 상자 높이는 그대로다.
 *
 * 포커스 테두리는 안쪽 칸이 아니라 **상자가 통째로** 받는다(`focus-within`) —
 * 안쪽 입력은 테두리 없는 알맹이(`fieldInputClass`)라 저마다 테를 그리면 상자가 두 겹이 된다.
 *
 * 자리·폭은 호출부 몫이다: `className`으로 `flex-1`·`basis-full`·`relative`(드롭다운 앵커) 등을 준다.
 *
 * @example
 * <FieldGroup className="relative flex-1">
 *   <input className={`${fieldInputClass} flex-1`} placeholder="제목" />
 *   <FieldDivider />
 *   <input className={`${fieldInputClass} w-[76px] shrink-0`} placeholder="가수" />
 * </FieldGroup>
 */
export function FieldGroup({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`flex h-9 min-w-0 items-center gap-2.5 rounded-[10px] border border-border/70 bg-surface/70 px-3 transition-colors focus-within:border-primary/40 focus-within:bg-surface/90 ${className}`}
    >
      {children}
    </div>
  );
}

/** 칸과 칸 사이 세로선 — 상자 안에서만 쓴다 */
export function FieldDivider() {
  return <span aria-hidden className="h-4 w-px shrink-0 bg-border/80" />;
}

/**
 * 상자 안에 들어가는 알맹이 입력 — 테두리·배경 없이 글자만.
 * 모바일 16px(iOS는 16px 미만 입력에 포커스하면 자동 확대) → sm 이상에서 13px.
 */
export const fieldInputClass =
  "min-w-0 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-4 sm:text-[13px]";

/**
 * 점선 입력 칸 — 사이드 레일의 "여기에 검색하거나 붙여넣으세요" 자리.
 * 실선 상자(`FieldGroup`)가 "채워진 값"이라면 이쪽은 **아직 빈 칸**이라는 신호라서 점선을 쓴다.
 * 아이콘 + 입력을 나란히 담고, 안쪽 입력은 `dottedFieldInputClass`.
 */
export const dottedFieldClass =
  "flex h-8 min-w-0 items-center gap-1.5 rounded-[10px] border border-dotted border-border-strong/70 px-2 text-ink-5 transition-colors focus-within:border-primary/60 focus-within:bg-surface/50";

/** 점선 칸 안의 알맹이 입력 — 레일 글자 크기(10.5px) */
export const dottedFieldInputClass =
  "min-w-0 flex-1 bg-transparent text-[10.5px] text-ink outline-none placeholder:text-ink-5";
