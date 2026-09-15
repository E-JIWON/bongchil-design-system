/**
 * 일기 날짜 범위 — 여러 날에 걸친 일기(`isoDate` ~ `endIso`) 계산 단일 출처.
 *
 * `endIso`가 없거나 `isoDate`와 같으면 **하루짜리**다 = 지금까지의 모든 일기.
 * 그래서 아래 함수들은 전부 "끝날짜 없음"을 하루로 접어서 처리한다 —
 * 호출부가 `endIso ? … : …`로 갈라질 일이 없어야 화면마다 규칙이 어긋나지 않는다.
 *
 * 달력·잔디·통계가 **"그 날의 일기"를 범위 겹침으로 판정**하기로 한 게 이 파일의 존재 이유다
 * (여행 중이던 날에 달력을 눌렀는데 비어 보이는 걸 막는다).
 */

const DAY_MS = 86_400_000;

const parse = (iso: string) => new Date(`${iso}T00:00:00`);

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** iso + n일 */
export function isoAddDays(isoDate: string, n: number): string {
  const d = parse(isoDate);
  d.setDate(d.getDate() + n);
  return fmt(d);
}

/** 끝날짜 정규화 — 없거나 시작보다 앞서면 하루짜리로 접는다 */
export function normalizeEnd(isoDate: string, endIso?: string | null): string | undefined {
  if (!endIso || endIso <= isoDate) return undefined;
  return endIso;
}

/** 여러 날에 걸친 일기인가 */
export const isRangeEntry = (isoDate: string, endIso?: string | null) =>
  normalizeEnd(isoDate, endIso) !== undefined;

/** 걸친 날 수 — 하루짜리는 1 */
export function spanDays(isoDate: string, endIso?: string | null): number {
  const end = normalizeEnd(isoDate, endIso);
  if (!end) return 1;
  return Math.round((parse(end).getTime() - parse(isoDate).getTime()) / DAY_MS) + 1;
}

/** 범위가 덮는 모든 날 — 달력·잔디가 "칠할 칸"을 물어보는 함수 */
export function coveredDays(isoDate: string, endIso?: string | null): string[] {
  const n = spanDays(isoDate, endIso);
  if (n === 1) return [isoDate];
  return Array.from({ length: n }, (_, i) => isoAddDays(isoDate, i));
}

/** 이 일기가 그 날을 덮는가 — 날짜 필터의 단일 판정 */
export const coversDate = (isoDate: string, endIso: string | undefined | null, day: string) =>
  day >= isoDate && day <= (normalizeEnd(isoDate, endIso) ?? isoDate);

/** 이 일기가 그 달(`YYYY-MM`)에 걸치는가 — 월 통계·타임라인 그룹의 단일 판정 */
export function coversMonth(
  isoDate: string,
  endIso: string | undefined | null,
  monthKey: string,
): boolean {
  const end = normalizeEnd(isoDate, endIso) ?? isoDate;
  // 범위가 그 달의 [01, 말일]과 겹치면 포함. 문자열 비교로 충분하다(YYYY-MM-DD는 사전순 = 시간순)
  return isoDate.slice(0, 7) <= monthKey && end.slice(0, 7) >= monthKey;
}

/** "3박4일" — 하루짜리는 빈 문자열 */
export function nightsLabel(isoDate: string, endIso?: string | null): string {
  const n = spanDays(isoDate, endIso);
  return n <= 1 ? "" : `${n - 1}박 ${n}일`;
}
