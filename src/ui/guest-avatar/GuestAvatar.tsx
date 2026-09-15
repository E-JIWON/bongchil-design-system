import type { CSSProperties } from "react";
import type { GuestColor } from "../../lib/guest-identity";

/**
 * 게스트 마크 재질 — **흰 액자 + 은은한 2색**.
 * 채움은 서브색 → 메인색 대각 그라데이션, 그 위에 표면색 링 → 옅은 색 링이 안쪽으로 겹친다.
 *
 * 링은 `box-shadow: inset`으로 그린다 — 자리(레이아웃)를 안 먹으니 마크 크기가 그대로다.
 * 표면색 링이 색을 배경에서 끊어 줘서, 종이 위든 유리 위든 사진 위든 색이 안 섞인다.
 *
 * 두 색은 CSS가 테마별로 들고 있다 (globals.css `--guest-sub-*` · `--guest-mark-*`).
 * ⚠️ 서브를 **역색(보색)으로 잡으면 안 된다** — 보색은 섞일수록 무채색으로 가서 가운데가
 *    통째로 흙빛이 된다(실제로 해봤다). 이웃 색상 + 낮은 채도여야 같은 계열로 이어진다.
 *
 * ⚠️ 여기까지 오면서 버린 재질들 (같은 실수 반복 방지):
 *    - **투명도로 빼는 번짐** — 색이 옅어지는 게 아니라 뒤 배경색이 올라와 얼룩으로 읽힌다.
 *    - **마스크로 가장자리 깎기** — 위와 같은 이유. 깎지 말고 다른 색으로 덮어야 한다.
 *    - **`filter: blur()`** — 형태가 사라질 만큼 흐리면 색까지 씻겨 6색이 구분되지 않는다.
 *    - **그레인 노이즈 + 흰 파선** — 24px 아래에서 재질이 아니라 때처럼 보인다.
 *
 * ⚠️ 링 굵기와 모서리는 **크기에 비례**한다. 고정값으로 두면 16px에선 링이 색을 다 먹고
 *    28px에선 실낱같이 보여, 한 화면에 섞였을 때 셋이 다른 부품으로 읽힌다.
 *
 * `GuestAvatar`(표기)와 `GuestSwatch`(고르기)가 **같은 값을 써야** 두 자리가 안 갈라진다.
 *
 * @param px 마크 한 변(px) — 자리 크기가 아니라 실제로 색이 칠해지는 사각의 크기
 */
export function guestMarkSurface(color: GuestColor, px: number): CSSProperties {
  // 마크 색은 CSS가 테마별로 들고 있다 (globals.css `--guest-mark-*`) — JS 팔레트는
  // 흰 종이 기준이라 딥 차콜(#4b453f)이 검정 위에서 사라지고, 섞기로는 살릴 수 없다.
  const deep = `var(--guest-mark-${color})`;
  const sub = `var(--guest-sub-${color})`;
  // 0.5px 단위로 스냅 — 소수로 두면 링이 서브픽셀에 걸려 한쪽만 흐려진다
  const ring = Math.max(1.5, Math.round(px * 0.085 * 2) / 2);
  // 바깥부터 안쪽으로 두 겹: 흰 띠 → 색 선 → 채움. 선은 30%로 옅게 — 액자가 "살짝 비치는" 정도.
  // ⚠️ 여기에 먹선(바깥 1px)을 두르면 액자는 또렷해지지만 마크가 무거워진다 — 시도했고 되돌렸다.
  //    모서리만 굵히는 안도 마찬가지(랩 `frameCorner` 참고): 24px 안에선 홈처럼 읽힌다.
  return {
    background: `linear-gradient(150deg, ${sub}, ${deep})`,
    boxShadow: `inset 0 0 0 ${ring}px var(--color-surface), inset 0 0 0 ${ring + 1.5}px color-mix(in srgb, ${deep} 30%, transparent)`,
    borderRadius: Math.min(6, Math.max(3, Math.round(px * 0.25))),
    outline: "none",
  };
}

/**
 * 게스트 아바타 — 정해진 6색 팔레트로만 렌더하는 정체성 마크. 이니셜 글자는 넣지 않는다.
 *
 * 도형은 **소프트 사각** — 이 앱에서 색점은 전부 사각이고(잔디 셀 · 카테고리 색점 · 도장 스와치)
 * 원은 지도 핀·아이콘 버튼의 도형이라, 원으로 두면 목록 안에서 이물감이 생긴다.
 *
 * 재질은 **흰 액자**(`guestMarkSurface`) — 상세는 그 함수 주석.
 *
 * 마크는 `size` 박스 안에 86%로 그린다 — 자리(=레이아웃 footprint)는 유지하면서
 * 마크가 가득 차 실제보다 커 보이는 걸 눌러준다.
 */
const MARK_RATIO = 0.86;

export function GuestAvatar({
  color,
  name,
  size = 28,
  frame = true,
  className,
}: {
  color: GuestColor;
  /** 접근성 라벨용 (표시는 색만) */
  name?: string;
  /** 자리 크기(px). 마크는 이 안에 86%로 그려진다 */
  size?: number;
  /**
   * 흰 액자(표면색 링). 유리·흰 카드 위에선 배경과 이어져 안 보이지만,
   * **따뜻한 종이색 위에 놓이면 흰 테두리로 도드라진다** — 그런 자리에서만 끈다.
   */
  frame?: boolean;
  className?: string;
}) {
  const mark = Math.round(size * MARK_RATIO);

  return (
    // align-middle: inline 문맥에선 inline-flex가 baseline에 걸려 글자보다 내려앉는다
    <span
      className={`inline-flex shrink-0 items-center justify-center align-middle ${className ?? ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={name || "게스트"}
    >
      <span
        className="guest-mark block"
        style={{
          ...guestMarkSurface(color, mark),
          ...(frame ? null : { boxShadow: "none" }),
          width: mark,
          height: mark,
        }}
      />
    </span>
  );
}
