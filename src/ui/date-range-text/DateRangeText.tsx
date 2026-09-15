import { nightsLabel, normalizeEnd } from "../../lib/date-range";

/**
 * 일기 날짜 표기 단일 출처 — `2026.08.05 ~ 08.08 · 3박4일`
 *
 * **글꼴·크기를 스스로 정하지 않는다.** 호출부의 날짜 줄(대부분 `font-mono`)을 그대로 물려받아야
 * 상세(12px)·필름롤(11px)·타임라인(11px)에서 각자 제 크기로 흐른다.
 * 길이(`3박4일`)만 옅은 포인트색으로 한 톤 앞에 두고, 나머지는 부모 색을 따른다.
 *
 * 하루짜리(`endIso` 없음)면 시작일 하나만 그린다 — 지금까지의 모든 일기가 이 경우다.
 */

/** 길이 표기 색 — ink보다 살짝 앞, primary 원색보다는 뒤 */
const SOFT_PRIMARY = "color-mix(in srgb, var(--color-primary) 62%, transparent)";

export type DateRangeFormat = "dot" | "short";

/** "2026-08-05" → "2026.08.05" */
const dotDate = (iso: string) => iso.replace(/-/g, ".");
/** "2026-08-05" → "8.5" (앞자리 0 없이 — 필름롤·타임라인의 기존 표기) */
const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(m)}.${Number(d)}`;
};

export function DateRangeText({
  isoDate,
  endIso,
  /** dot: `2026.08.05 ~ 08.08` (상세·글쓰기) · short: `8.5 ~ 8.8` (카드·타임라인) */
  format = "dot",
  /** 길이(`· 3박4일`)를 생략한다 — 자리가 정말 좁은 곳용 */
  hideNights = false,
  className,
}: {
  isoDate?: string | null;
  endIso?: string | null;
  format?: DateRangeFormat;
  hideNights?: boolean;
  className?: string;
}) {
  if (!isoDate) return null;

  const end = normalizeEnd(isoDate, endIso);
  const fmt = format === "short" ? shortDate : dotDate;
  const nights = end && !hideNights ? nightsLabel(isoDate, end) : "";

  return (
    <span className={className}>
      {fmt(isoDate)}
      {/* 끝날짜는 연도를 반복하지 않는다 — 같은 해면 월·일만 */}
      {end && ` ~ ${end.slice(0, 4) === isoDate.slice(0, 4) && format === "dot" ? dotDate(end).slice(5) : fmt(end)}`}
      {nights && (
        <span style={{ color: SOFT_PRIMARY }}> · {nights}</span>
      )}
    </span>
  );
}
