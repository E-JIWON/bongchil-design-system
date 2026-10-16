"use client";

import { Search, X } from "lucide-react";
import { FieldGroup, fieldInputClass } from "../field-group";

/**
 * 검색 칸 — 돋보기 + 입력 + (글자가 있을 때만) 지우기.
 * 설정 탭 상단·카탈로그 목록처럼 "이름으로 거르는" 자리 전부 이걸로. 탭마다 다른 검색창을 그리지 않는다.
 */
export function SearchField({
  value,
  onChange,
  placeholder = "검색",
  className = "",
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <FieldGroup className={`h-8 gap-2 px-2.5 ${className}`}>
      <Search size={12} strokeWidth={2} className="shrink-0 text-ink-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className={`${fieldInputClass} flex-1`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="지우기"
          className="shrink-0 text-ink-5 transition-colors hover:text-ink-3"
        >
          <X size={11} strokeWidth={2} />
        </button>
      )}
    </FieldGroup>
  );
}
