"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

export type InputVariant = "default" | "inline" | "ghost";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * default: 설정·패널의 한 칸짜리 입력 (FieldGroup과 같은 상자 결)
   * inline: 검색·필터 옆의 가벼운 칸
   * ghost: 표·목록의 제자리 편집 — 배경 없이 링만, 레이아웃이 안 움직인다
   */
  variant?: InputVariant;
}

const VARIANT: Record<InputVariant, string> = {
  default:
    "h-9 w-full rounded-[10px] border border-border/70 bg-surface/70 px-3 text-[13px] focus:border-primary/40 focus:bg-surface/90",
  inline:
    "rounded-md border border-primary/40 bg-surface px-2 py-1 text-[13px] focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary/20",
  ghost:
    "w-full rounded-md bg-transparent px-1.5 py-1 text-[13px] caret-primary ring-1 ring-inset ring-primary/30 focus:ring-primary/50",
};

/** 한 칸짜리 입력. 여러 칸이 테두리를 같이 쓰면 FieldGroup + fieldInputClass */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", variant = "default", type, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`min-w-0 text-ink outline-none transition-colors placeholder:text-ink-4 ${
        type === "number"
          ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          : ""
      } ${VARIANT[variant]} ${className}`}
      {...props}
    />
  );
});
