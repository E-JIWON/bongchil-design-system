import { useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* 날짜 달력 — 머리(‹ 달 ›) · 요일 · 7칸 · 오늘. 팝오버 안에 두는 패널 (DatePickerCalendar의 크레용 짝).
   고른 날 = 옅은 크레파스 네모 면(.crayon-pick), 오늘 = 손그림 네모 테두리(.crayon-blob + .crayon-circle-ring) */

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const toIso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayIso = () => {
  const t = new Date();
  return toIso(t.getFullYear(), t.getMonth(), t.getDate());
};

/**
 * 크레용 날짜 달력 — DatePickerCalendar처럼 value(ISO) · onChange. 팝오버 · 위치는 부르는 쪽이 감싼다.
 * 색은 color(안 주면 --color-primary)
 */
export function CrayonCalendar({
  value,
  onChange,
  color,
  allowDeselect = false,
  showToday = true,
  initialMonth,
  className,
  style,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  color?: string;
  /** 고른 날을 다시 누르면 선택을 푼다 */
  allowDeselect?: boolean;
  /** 아래 '오늘' 바로가기 */
  showToday?: boolean;
  /** value가 없을 때 처음 보여줄 달에 속한 ISO 날짜 */
  initialMonth?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const first = new Date(`${value ?? initialMonth ?? todayIso()}T00:00:00`);
  const [view, setView] = useState({ y: first.getFullYear(), m: first.getMonth() });
  const go = (dm: number) => setView(({ y, m }) => ({ y: y + Math.floor((m + dm) / 12), m: (((m + dm) % 12) + 12) % 12 }));

  const days = new Date(view.y, view.m + 1, 0).getDate();
  const lead = new Date(view.y, view.m, 1).getDay();
  const now = todayIso();

  return (
    <div
      className={["crayon-cal", className].filter(Boolean).join(" ")}
      style={{ ...(color ? ({ "--crayon": color } as CSSProperties) : {}), ...style }}
    >
      <div className="crayon-cal-head">
        <button type="button" className="crayon-cal-nav" aria-label="이전 달" onClick={() => go(-1)}>
          <ChevronLeft />
        </button>
        <span className="crayon-cal-title">{`${view.y}.${String(view.m + 1).padStart(2, "0")}`}</span>
        <button type="button" className="crayon-cal-nav" aria-label="다음 달" onClick={() => go(1)}>
          <ChevronRight />
        </button>
      </div>

      <div className="crayon-cal-week">
        {DAYS.map((d, i) => (
          <span key={d} data-sun={i === 0 || undefined}>
            {d}
          </span>
        ))}
      </div>

      <div className="crayon-cal-grid">
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const iso = toIso(view.y, view.m, day);
          const picked = iso === value;
          const today = iso === now;
          return (
            <button
              key={day}
              type="button"
              className={["crayon-cal-day", picked ? "crayon-pick" : today && "crayon-blob crayon-circle-ring"].filter(Boolean).join(" ")}
              data-sun={(lead + i) % 7 === 0 || undefined}
              aria-pressed={picked}
              aria-current={today ? "date" : undefined}
              onClick={() => onChange(allowDeselect && picked ? null : iso)}
            >
              {day}
            </button>
          );
        })}
      </div>

      {showToday && (
        <button
          type="button"
          className="crayon-cal-today"
          onClick={() => {
            const t = new Date();
            setView({ y: t.getFullYear(), m: t.getMonth() });
            onChange(todayIso());
          }}
        >
          오늘
        </button>
      )}
    </div>
  );
}
