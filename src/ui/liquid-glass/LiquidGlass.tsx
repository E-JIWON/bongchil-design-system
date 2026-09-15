import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type Ref } from "react";
import { Link } from "../../config";

/**
 * 리퀴드 글라스 — 투명 표면 + 네이티브 backdrop blur로 뒤 배경을 굴절·번지게 하는 유리 서피스.
 * 프로젝트의 모든 리퀴드 글라스는 **반드시 이 컴포넌트**를 쓴다 (재질 구현 단일 소스).
 *
 * 재질 구성:
 * - `.date-picker-glass` 클래스: 투명 배경 + 8겹 inset 하이라이트 box-shadow + ::before/::after 흰 광택 + isolation
 * - `.date-picker-glass-blobs` 자식: 파스텔 conic 테두리 + SVG 굴절림(`#liquid-glass-refraction`)
 * - inline `backdropFilter: var(--date-picker-glass-backdrop)` = `blur(6px) saturate(50%)`
 *   → CSS 파일의 backdrop-filter는 이 빌드에서 죽으므로 반드시 inline으로 준다 (CLAUDE.md 규칙)
 * - `will-change: transform`: 독립 GPU 레이어로 승격 → 중첩 in-flow에서도 blur가 확실히 작동
 *
 * 폴리모픽: `as`/`href`로 요소를 바꾼다 (버튼·링크도 같은 유리로).
 * - 기본 `div` — 팝오버·독·시트·카드 (블록 콘텐츠)
 * - `as="button"` — 인터랙티브 버튼 (콘텐츠는 span, `contentClassName`로 flex 등 지정)
 * - `href` — next/link 렌더 (as 무시)
 *
 * 전제: 루트에 `<LiquidGlassDefs />`가 1회 렌더돼 있어야 굴절림이 동작한다.
 *
 * @example
 * <LiquidGlass className="rounded-xl p-3">{children}</LiquidGlass>
 * <LiquidGlass as="button" onClick={fn} className="size-8 rounded-full" contentClassName="inline-flex items-center">{icon}</LiquidGlass>
 */
type LiquidGlassProps = ComponentPropsWithoutRef<"button"> & {
  /** 렌더 요소 — 기본 div. 버튼이 필요하면 "button", 링크는 href 사용 */
  as?: "div" | "button";
  /** 있으면 next/link(<a>)로 렌더 (as 무시) */
  href?: string;
  /** 인터랙티브(button/link)일 때 콘텐츠 래퍼(span)에 붙는 클래스 — inline-flex 정렬 등 */
  contentClassName?: string;
};

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
  { as = "div", href, contentClassName = "", children, className = "", style, ...rest },
  ref,
) {
  const cls = `date-picker-glass ${className}`.trim();
  const glassStyle: CSSProperties = {
    backdropFilter: "var(--date-picker-glass-backdrop)",
    WebkitBackdropFilter: "var(--date-picker-glass-backdrop)",
    willChange: "transform",
    ...style,
    // background: "rgba(155, 20, 20, 0.85)", // TEMP 디버그 틴트 — 리퀴드 글라스(LiquidGlass) 사용처=진한 빨강 (감사 후 삭제)
  };

  const body = (
    <>
      <span aria-hidden className="date-picker-glass-blobs" />
      <span className={`relative z-1 ${contentClassName}`.trim()}>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as Ref<HTMLAnchorElement>}
        className={cls}
        style={glassStyle}
        {...(rest as unknown as Omit<ComponentPropsWithoutRef<typeof Link>, "href">)}
      >
        {body}
      </Link>
    );
  }
  if (as === "button") {
    return (
      <button ref={ref as Ref<HTMLButtonElement>} className={cls} style={glassStyle} {...rest}>
        {body}
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
      {body}
    </div>
  );
});
