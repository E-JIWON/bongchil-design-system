import type { ElementType, ReactNode } from "react";

/**
 * 페이지 좌우 인셋 — **전 페이지 단일 소스**. 여기만 고치면 헤더·본문·시트가 같이 움직인다.
 * 데스크톱 48px / 태블릿(<768) 24px / 폰(<640) 12px.
 * ⚠️ 한 화면만 따로 줄이지 말 것 — 헤더와 본문이 어긋나면 세로선이 깨져 보인다.
 */
export const PAGE_INSET_X = "px-8 max-md:px-6 max-sm:px-3";

/**
 * 1044 콘텐츠 밴드 인셋 — 넓은 화면에선 밴드 가장자리에 붙고, 좁아지면 위 인셋 값으로 떨어진다.
 * 대시보드·상세·앨범 등 "밴드를 쓰는" 셸의 좌우 여백은 전부 이 상수를 쓴다.
 */
export const PAGE_BAND_X =
  "px-[max(48px,calc((100%-1044px)/2))] max-md:px-6 max-sm:px-3";

/**
 * 페이지 아래 여백 — 스크롤 화면 공통. 48 / (<768) 32 / (<640) 16.
 */
export const PAGE_BOTTOM_Y = "pb-12 max-md:pb-8 max-sm:pb-4";

/** 페이지 콘텐츠 상하 — 스크롤 화면(메인·앨범·상세·글쓰기·설정·티켓)의 단일 소스.
 *  위 20px(<768은 8)은 헤더 pb가 아니라 콘텐츠가 갖는다 — 헤더는 스크롤 컨테이너 밖이라
 *  간격을 헤더 쪽에 주면 카드 글로우·그림자가 main 위 경계에서 직선으로 잘린다 (헤더 pb-2와 짝) */
export const PAGE_BLOCK_Y = `pt-5 max-md:pt-2 ${PAGE_BOTTOM_Y}`;

/**
 * 한 화면에 꽉 차는 화면(다락방 캔버스 · 발자취 지도) 전용 상하.
 * 스크롤이 없어 아래 여백이 곧 "화면 끝 여백"이라 넉넉하면 캔버스가 그만큼 잘린다.
 */
export const PAGE_FILL_Y = "pt-5 max-md:pt-2 pb-6 max-md:pb-4 max-sm:pb-3";

/**
 * 전 페이지 공통 중앙 정렬 리딩 컬럼.
 * 폭은 globals.css `@theme`의 `--container-max`(1024px)를 단일 진실 소스로 사용.
 * 기존 페이지들이 쓰던 수평 간격을 컨테이너가 흡수한다 (좌우 인셋은 `PAGE_INSET_X`).
 */
export function PageContainer({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[var(--container-max)] ${PAGE_INSET_X} ${className}`}
    >
      {children}
    </Tag>
  );
}
