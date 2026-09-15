"use client";

import { Home, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GrainNoise } from "../grain";
import { Button } from "../button";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  /** primary = 강조(포인트색) · outline = 중립 */
  variant?: "primary" | "outline";
  /** owner 전용 액션 — guest에겐 아예 숨긴다 (누르면 /login으로 튕기므로) */
  ownerOnly?: boolean;
};

type Props = {
  /** full = 페이지 주체 없음, section = 섹션 내 데이터 없음, inline = 사이드바처럼 좁은 영역 */
  size?: "full" | "section" | "inline";
  icon: LucideIcon;
  /** 아이콘 배경색 */
  iconBg?: string;
  /** 아이콘 색상 */
  iconColor?: string;
  title: string;
  description?: string;
  actions?: Action[];
  /** owner 여부 — `ownerOnly` 액션 노출 판단. 인증은 앱 책임이라 주입받는다 */
  isOwner?: boolean;
};

/** 액션 버튼 — 빈 상태는 가장 약한 위계라 공용 Button의 `text` 재질로 통일 */
function ActionButton({ action, small }: { action: Action; small: boolean }) {
  const ActionIcon = action.icon;
  return (
    <Button
      variant="text"
      size={small ? "sm" : "md"}
      tone={action.variant === "primary" ? "primary" : "default"}
      href={action.href}
      onClick={action.onClick}
      icon={ActionIcon ? <ActionIcon size={small ? 13 : 14} strokeWidth={1.8} /> : undefined}
    >
      {action.label}
    </Button>
  );
}

export function EmptyState({
  size = "full",
  icon: Icon,
  iconBg = "bg-primary-subtle",
  iconColor = "text-primary",
  title,
  description,
  actions: rawActions,
  isOwner = false,
}: Props) {
  const actions = rawActions?.filter((a) => !a.ownerOnly || isOwner);

  if (size === "section" || size === "inline") {
    const compact = size === "inline";
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? "gap-2 py-5" : "gap-3 py-12"}`}>
        <div
          className={`relative flex items-center justify-center overflow-hidden ${compact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl"} ${iconBg}`}
        >
          <GrainNoise />
          <Icon size={compact ? 15 : 20} strokeWidth={1.3} className={`relative ${iconColor}`} />
        </div>
        <p className={compact ? "text-xs text-ink-4" : "text-sm text-ink-3"}>{title}</p>
        {description && <p className="text-xs text-ink-4">{description}</p>}
        {actions && actions.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            {actions.map((action, i) => (
              <ActionButton key={i} action={action} small />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl ${iconBg}`}>
        <GrainNoise />
        <Icon size={28} strokeWidth={1.3} className={`relative ${iconColor}`} />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-ink-2">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-4">{description}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, i) => (
            <ActionButton key={i} action={action} small={false} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 자주 쓰는 액션 프리셋 */
export const EMPTY_ACTIONS = {
  home: { label: "홈으로", href: "/", icon: Home, variant: "outline" as const },
  write: { label: "일기 쓰기", href: "/write", icon: PenLine, variant: "primary" as const, ownerOnly: true },
};
