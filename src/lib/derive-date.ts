/**
 * isoDate("YYYY-MM-DD") → 표시용 날짜 문자열 파생.
 * 백엔드는 isoDate 하나만 내려주고, date/fullDate/day 표시 문자열은 프론트가 만든다.
 */

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"] as const;

export type DisplayDate = { date: string; fullDate: string; day: string };

/** "2026-07-24" 또는 "2026년 7월 24일 금요일" → "2026.07.24" (헤더 날짜 줄 공용 포맷) */
export function toDotDate(input: string | undefined | null): string {
  const m = input?.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return m ? `${m[1]}.${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}` : "";
}

export function deriveDisplayDate(iso: string | undefined | null): DisplayDate {
  if (!iso) return { date: "", fullDate: "", day: "" };
  const dt = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return { date: "", fullDate: "", day: "" };
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  const wd = DAYS_KR[dt.getDay()];
  return {
    date: `${m}.${day}`,
    fullDate: `${dt.getFullYear()}년 ${m}월 ${day}일 ${wd}요일`,
    day: wd,
  };
}
