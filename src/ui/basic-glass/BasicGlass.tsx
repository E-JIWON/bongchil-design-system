import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type Ref } from "react";
import { Link } from "../../config";

/**
 * 베이직 글라스 — 반투명 프로스트 서피스(가독성 우선). 리퀴드 글라스와 짝을 이루는 2단계 글라스.
 *
 * - 리퀴드 글라스(`LiquidGlass`): 투명 + 블롭 + 굴절 → 뒤가 비치는 "보여주는" 유리 (플로팅 팝오버·독).
 * - 베이직 글라스(여기): `surface 84%` + blur(5) → 뒤를 적당히 가리는 "가려주는" 유리 (팝오버·컴포저·카드).
 *   `opaque`를 켜면 `surface 94%` + blur(14)로 한 단계 더 가린다 (드롭다운처럼 목록을 읽어야 하는 표면).
 *
 * 재질: `.glass` 클래스(불투명 배경 + 보더) + inline `backdrop-filter`.
 * backdrop-filter는 반드시 inline — CSS 파일 값은 이 빌드에서 죽으므로 (CLAUDE.md 규칙).
 * 블롭 없이 children을 그대로 렌더 → flex/grid 컨테이너에도 바로 쓸 수 있다.
 *
 * 폴리모픽: `as`/`href`로 요소를 바꾼다 (버튼·링크 카드도 같은 유리로).
 *
 * @example
 * <BasicGlass className="rounded-xl p-3">{children}</BasicGlass>
 * <BasicGlass as="button" onClick={fn} className="...">{children}</BasicGlass>
 */
type BasicGlassProps = ComponentPropsWithoutRef<"button"> & {
  /** 렌더 요소 — 기본 div. 버튼은 "button", 링크는 href 사용 */
  as?: "div" | "button";
  /** 있으면 next/link(<a>)로 렌더 (as 무시) */
  href?: string;
  /**
   * 진한 유리 — 목록을 "읽어야 하는" 표면(드롭다운·메뉴)에 켠다.
   * `.glass`(84%)는 뒤가 16% 비쳐서, 뒤에 색 칩·아이콘이 깔리면 글씨와 겹쳐 읽힌다.
   * ⚠️ blur를 올려도 해결되지 않는다 — blur는 형태만 뭉갤 뿐 평균 색(얼룩)은 남기므로
   *    가리는 일은 **불투명도**가 한다. blur는 남은 6%의 윤곽을 지우는 보조.
   */
  opaque?: boolean;
  /**
   * 옅은 유리 — 카드가 여러 장 깔리는 표면(벤토·여백 댓글)에 켠다. `surface 45%`로 바탕이 배어 나온다.
   * 뒤에 가릴 게 없는 자리에만 — 팝오버·드롭다운은 그대로 84%/94%를 쓴다.
   */
  airy?: boolean;
};

export const BasicGlass = forwardRef<HTMLDivElement, BasicGlassProps>(function BasicGlass(
  { as = "div", href, opaque = false, airy = false, children, className = "", style, ...rest },
  ref,
) {
  const cls = `glass ${opaque ? "glass-opaque" : ""} ${airy ? "glass-airy" : ""} ${className}`
    .replace(/\s+/g, " ")
    .trim();
  // 배경(불투명도)은 CSS 클래스가, backdrop-filter는 inline이 담당한다
  // (CSS 파일의 backdrop-filter 값은 이 빌드에서 죽으므로 — CLAUDE.md 규칙)
  const blur = opaque ? "blur(14px) saturate(1.15)" : "blur(5px)";
  const glassStyle: CSSProperties = {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    willChange: "transform",
    ...style,
  };

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as Ref<HTMLAnchorElement>}
        className={cls}
        style={glassStyle}
        {...(rest as unknown as Omit<ComponentPropsWithoutRef<typeof Link>, "href">)}
      >
        {children}
      </Link>
    );
  }
  if (as === "button") {
    return (
      <button ref={ref as Ref<HTMLButtonElement>} className={cls} style={glassStyle} {...rest}>
        {children}
      </button>
    );
  }
  return (
    <div
      ref={ref}
      className={cls}
      style={glassStyle}
      {...(rest as unknown as ComponentPropsWithoutRef<"div">)}
    >
      {children}
    </div>
  );
});
