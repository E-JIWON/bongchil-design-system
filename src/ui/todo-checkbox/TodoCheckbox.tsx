/**
 * 할 일 체크박스 — 끄적끄적 todo의 완료 토글.
 * off는 파선 테두리(적어만 둔 것), on은 primary 채움 + 손으로 그은 체크.
 * 끄적끄적 스트림과 대시보드 "남은 할 일" 카드가 같은 손맛을 쓰도록 shared에 둔다.
 */
export function TodoCheckbox({
  done,
  readOnly = false,
  onClick,
  size = 17,
}: {
  done: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  size?: number;
}) {
  const Tag = readOnly ? "span" : "button";
  return (
    <Tag
      type={readOnly ? undefined : "button"}
      onClick={readOnly ? undefined : onClick}
      aria-pressed={readOnly ? undefined : done}
      aria-label={done ? "완료 취소" : "완료로 표시"}
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${
        done ? "border-transparent bg-primary" : "border-dashed border-ink/30 bg-surface/50"
      } ${readOnly ? "" : "hover:border-primary/60"}`}
    >
      {done && (
        <svg
          viewBox="0 0 24 24"
          width={size * 0.65}
          height={size * 0.65}
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="scribble-check-draw" d="M4 12 9 17 20 6" />
        </svg>
      )}
    </Tag>
  );
}
