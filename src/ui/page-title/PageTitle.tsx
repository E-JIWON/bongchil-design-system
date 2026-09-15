import type { ReactNode } from "react";

/**
 * 페이지 공통 제목 — 시적인 제목 + 설명 소제목을 한 결로.
 * 모든 페이지(다락방·발자취·끄적끄적·앨범·아카이브·설정)가 같은 폰트 크기·정렬을 공유해
 * 페이지를 오가도 제목이 흔들리지 않는다.
 *
 * `action`은 그 페이지의 주 액션 한 자리 — 월 네비게이션이든 정렬 셀렉트든 여기 하나만 온다.
 * 필터 칩처럼 여러 개짜리 줄은 제목 아래 별도 줄로 둔다.
 */
export function PageTitle({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** 우측 끝 액션 — 지정 시 제목 행이 그대로 헤더 행이 된다 */
  action?: ReactNode;
  className?: string;
}) {
  return (
    // min-h는 표준 컨트롤 한 줄 높이(34px) — 액션(월 네비·뷰 전환)이 있든 없든 행 높이가 같아야
    // 페이지를 오갈 때 제목 글자가 위아래로 안 흔들린다. 제목만 있으면 27.5px라 3px씩 튀었다.
    <div className={`flex min-h-[34px] flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {/* 제목·소제목은 베이스라인으로 묶고, 액션은 바깥 행에서 세로 중앙 정렬 */}
      <div className="flex items-baseline gap-2.5">
        <h1 className="shrink-0 text-xl font-bold leading-snug tracking-tight text-ink-2 max-sm:text-lg">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-ink-4 max-sm:hidden">{subtitle}</p>}
      </div>
      {action && <div className="ml-auto flex items-center gap-2.5">{action}</div>}
    </div>
  );
}
