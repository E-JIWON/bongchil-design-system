import type { CSSProperties } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  type LucideIcon,
} from "lucide-react";

export type WeatherKey = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "snowy" | "night";

const WEATHER_ICONS: Record<WeatherKey, LucideIcon> = {
  sunny: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  night: Moon,
};

const WEATHER_LABELS: Record<WeatherKey, string> = {
  sunny: "맑음",
  "partly-cloudy": "구름 조금",
  cloudy: "흐림",
  rainy: "비",
  snowy: "눈",
  night: "밤",
};

/** 이모지 → WeatherKey 변환 (레거시) */
const EMOJI_TO_WEATHER: Record<string, WeatherKey> = {
  "☀️": "sunny",
  "🌤️": "partly-cloudy",
  "☁️": "cloudy",
  "🌧️": "rainy",
  "❄️": "snowy",
  "🌙": "night",
};

/** 날씨별 고유 색 — active·표시 상태 틴트용 (시맨틱 토큰만 사용) */
const WEATHER_COLORS: Record<WeatherKey, string> = {
  sunny: "var(--color-comment-sand-solid)",
  "partly-cloudy": "var(--color-comment-green-solid)",
  cloudy: "var(--color-ink-4)",
  rainy: "var(--color-comment-sky-solid)",
  snowy: "var(--color-comment-mint-solid)",
  night: "var(--color-secondary)",
};

/** 날씨의 고유 CSS 색 반환 — 못 찾으면 undefined */
export function getWeatherColor(value?: string): string | undefined {
  const key = resolveWeatherKey(value);
  return key ? WEATHER_COLORS[key] : undefined;
}

export const WEATHER_KEYS: WeatherKey[] = [
  "sunny",
  "partly-cloudy",
  "cloudy",
  "rainy",
  "snowy",
  "night",
];

/** CategorySelect에 그대로 넘기는 옵션 배열 — 날씨 셀렉트가 두 곳(에디터·랩)이라 여기서 한 번만 만든다 */
export const WEATHER_OPTIONS = WEATHER_KEYS.map((w) => ({
  value: w as string,
  label: WEATHER_LABELS[w],
  icon: WEATHER_ICONS[w],
  cssColor: WEATHER_COLORS[w],
}));

/** 이모지 또는 WeatherKey를 해석 */
export function resolveWeatherKey(value?: string): WeatherKey | undefined {
  if (!value) return undefined;
  if (value in WEATHER_ICONS) return value as WeatherKey;
  return EMOJI_TO_WEATHER[value];
}

export function getWeatherLabel(value?: string): string {
  const key = resolveWeatherKey(value);
  return key ? WEATHER_LABELS[key] : "";
}

export function WeatherIcon({
  value,
  className,
  size,
  strokeWidth,
  style,
}: {
  value?: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  const key = resolveWeatherKey(value);
  if (!key) return null;
  const Icon = WEATHER_ICONS[key];
  return <Icon className={className} size={size ?? 14} strokeWidth={strokeWidth ?? 1.5} style={style} />;
}
