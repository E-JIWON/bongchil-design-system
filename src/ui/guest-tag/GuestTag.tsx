import type { CSSProperties } from "react";
import { GuestAvatar } from "../guest-avatar";
import { splitNickname } from "../../lib/random-nickname";
import type { GuestColor } from "../../lib/guest-identity";

/**
 * 방문자 표기 3단 프리셋 — 아바타 크기와 이름 글자만 단계별로 바뀐다.
 * 숫자 태그(`_NNNN`)는 **어느 단계에서도 10px font-mono 고정** (UUID 파생 불변값이라 위계가 없다).
 *
 * - `sm` 여백 댓글 스레드 · 라이트박스 한마디
 * - `md` 받은 추천 행 · 설정 우체통 · 헤더 도장 칩
 * - `lg` 도장 팝오버
 */
export type GuestTagSize = "sm" | "md" | "lg";

export const GUEST_TAG_SIZES: Record<GuestTagSize, { avatar: number; name: string; gap: string }> = {
  sm: { avatar: 16, name: "text-[11.5px] font-medium", gap: "gap-[7px]" },
  md: { avatar: 20, name: "text-[12.5px] font-semibold", gap: "gap-2" },
  lg: { avatar: 28, name: "text-[14px] font-bold tracking-[-0.01em]", gap: "gap-2.5" },
};

/** 태그는 전 단계 공통 — 10px font-mono */
const TAG_CLASS = "font-mono text-[10px] font-normal";

/**
 * 방문자 이름 — `새침한여우` + `_6713`. 아바타가 다른 자리에 있는 레이아웃(스레드 등)에서 단독 사용.
 * 아바타까지 한 줄로 필요하면 `GuestTag`.
 */
export function GuestName({
  name,
  size = "md",
  className = "",
  tagClassName = "text-ink-5",
  style,
}: {
  /** 전체 별명 (`새침한여우_6713`) — 내부에서 base/tag로 쪼갠다 */
  name: string;
  size?: GuestTagSize;
  className?: string;
  /** 숫자 태그 색만 따로 줄 때 (크기는 고정) */
  tagClassName?: string;
  style?: CSSProperties;
}) {
  const { base, num } = splitNickname(name);
  return (
    // leading-none: 줄높이 여백 때문에 세로 중앙이 어긋나는 걸 막는다 (한 줄 고정 표기)
    <span
      className={`min-w-0 truncate leading-none ${GUEST_TAG_SIZES[size].name} ${className}`}
      style={style}
    >
      {base}
      {num && <span className={`${TAG_CLASS} ${tagClassName}`}>{num}</span>}
    </span>
  );
}

/** 방문자 한 줄 — 아바타 + 이름 + 숫자 태그. 방문자를 표기하는 모든 자리의 기본형. */
export function GuestTag({
  color,
  name,
  size = "md",
  className = "",
  nameClassName = "text-ink-2",
  tagClassName = "text-ink-5",
  nameStyle,
}: {
  color: GuestColor;
  name: string;
  size?: GuestTagSize;
  className?: string;
  nameClassName?: string;
  tagClassName?: string;
  nameStyle?: CSSProperties;
}) {
  const s = GUEST_TAG_SIZES[size];
  return (
    <span className={`inline-flex min-w-0 items-center ${s.gap} ${className}`}>
      <GuestAvatar color={color} name={name} size={s.avatar} />
      <GuestName
        name={name}
        size={size}
        className={nameClassName}
        tagClassName={tagClassName}
        style={nameStyle}
      />
    </span>
  );
}
