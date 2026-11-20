"use client";

import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import type { GuestColor } from "../../lib/guest-identity";
import { guestMarkSurface } from "./GuestAvatar";

/**
 * 게스트 색 **고르는 칸** — 6색 팔레트에서 하나를 집는 자리의 단일 표준.
 * (표기만 하는 자리는 `GuestAvatar`. 이 둘이 게스트 색을 그리는 유일한 두 부품이다.)
 *
 * 재질은 `GuestAvatar`와 **같은 `guestMarkSurface`로 고정** — 흰 액자(색 → 표면색 링 → 옅은 색 링).
 * 버튼이 상태별로 섞는 비율(쉬는 34% · 겨냥 48%)을 그대로 두면 마우스를 올릴 때 오히려 색이
 * 흐려지는 역전이 보인다 — 버튼은 속이 비어 있다는 전제로 만들어진 값이라서.
 *
 * 그래서 **색은 어떤 상태에서도 안 변하고**, 고른 칸은 **체크 하나**로만 알린다.
 * ⚠️ 확대(`scale`)로 알리지 않는다 — 여섯 칸이 한 줄로 붙어 있어 한 칸만 커지면 줄이 밀리고,
 *    "골랐다"가 아니라 "마우스가 올라가 있다"로 읽힌다.
 * (예전엔 호출부마다 흰링/색링 `box-shadow`를 손으로 그렸는데, 링은 게스트 색과 무관한
 *  장식이라 고른 칸이 "눌린 버튼"으로 안 읽혔다.)
 */
export function GuestSwatch({
  color,
  active = false,
  size = 20,
  onClick,
  title,
  className,
  style,
}: {
  color: GuestColor;
  /** 지금 고른 색 — 채움 + 파선이 들어오고 `aria-pressed`가 붙는다 */
  active?: boolean;
  /** 한 변(px) */
  size?: number;
  onClick?: () => void;
  title?: string;
  className?: string;
  /** 등장 애니메이션 지연 등 — 재질 스타일 위에 병합된다 */
  style?: CSSProperties;
}) {
  // 마크 색은 CSS가 테마별로 들고 있다 (globals.css `--guest-mark-*`)
  const surface = guestMarkSurface(color, size);

  return (
    // 액자 재질이라 크레파스 버튼이 아니라 맨 버튼 — 겉모습은 guestMarkSurface가 다 정한다
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      aria-label={`${color} 색`}
      className={`press-effect grid place-items-center rounded-m ${className ?? ""}`}
      style={{ ...surface, width: size, height: size, flexShrink: 0, ...style } as CSSProperties}
    >
      {/* 고른 칸 — 체크 하나. 마크 색이 진해도 읽히게 그림자를 깐다. 크기는 칸에 비례(45%) */}
      {active && (
        <Check
          size={Math.max(9, Math.round(size * 0.45))}
          strokeWidth={3}
          aria-hidden
          className="pointer-events-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
        />
      )}
    </button>
  );
}
