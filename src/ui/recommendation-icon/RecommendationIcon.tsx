import { Sparkles } from "lucide-react";

/** 추천 전용 마커 — 필터·입력·받은 추천 목록에서 같은 모양과 선 굵기를 공유한다. */
export function RecommendationIcon({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <Sparkles size={size} strokeWidth={2.1} className={className} aria-hidden="true" />;
}
