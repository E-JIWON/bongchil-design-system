/**
 * bongchil-design-system — 봉칠 디자인 시스템
 *
 * 빌드 없이 소스를 그대로 내보낸다. 소비 앱이 자기 번들러로 트랜스파일한다
 * (Next: `transpilePackages: ["bongchil-design-system"]` / Vite: 기본 동작).
 *
 * CSS는 앱의 스타일시트에서 따로 불러온다:
 *   @import "tailwindcss";
 *   @import "bongchil-design-system/tokens.css";
 *   @import "bongchil-design-system/motion.css";
 *   @source "../node_modules/bongchil-design-system/src";   ← 빠지면 클래스가 전부 사라진다
 */

// ── 표면 ──
export { BasicGlass } from "./ui/basic-glass";
export { LiquidGlass, LiquidGlassDefs } from "./ui/liquid-glass";
export { ModalProvider, useModal } from "./ui/modal";

// ── 컨트롤 ──
export { Button, TONE_COLOR } from "./ui/button";
export type { ButtonProps, ButtonVariant, ButtonTone, ButtonShape, ButtonSize } from "./ui/button";
export { TodoCheckbox } from "./ui/todo-checkbox";
export { Toggle } from "./ui/toggle";
export type { ToggleProps, ToggleSize } from "./ui/toggle";
export { NavTabs } from "./ui/nav-tabs";
export { IconButton } from "./ui/icon-button";
export { Tooltip } from "./ui/tooltip";

// ── 카테고리 ──
export { CategoryChip, CategoryPill, CategoryMark, catTint, tokenColor } from "./ui/category";
export type { CategoryColor } from "./ui/category";
export { CategorySelect } from "./ui/category-select";
export type { CategoryOption, CategorySelectSize, CategorySelectVariant } from "./ui/category-select";
export {
  CategoryIcon,
  CATEGORY_ICONS,
  ICON_SUGGESTIONS,
  resolveIconKey,
  suggestIcons,
  hasCategoryIcon,
} from "./ui/category-icon";

// ── 임베드 카드 (표지 · CD · 본문 한 줄 — 09.14 디자인) ──
export { EmbedCard, EmbedSpecMount, VideoEmbed } from "./ui/embed-card";
export { blockCardSpec, lineSpec, readEmbedData, renderEmbedSpec } from "./lib/embed-markup";
export type { EmbedCardData, EmbedSpec } from "./lib/embed-markup";
export {
  IFRAME_ALLOW,
  parseEmbedUrl,
  isVideoUrl,
  videoThumbnail,
  hostOf,
  prettyUrl,
  musicSource,
  cleanMusicTitle,
  splitTint,
  embedKind,
  siteLabel,
  cleanEmbedTitle,
} from "./lib/embed";
export type { EmbedProvider, EmbedKind } from "./lib/embed";

// ── 이미지 편집 (자르기·회전 후 configure({ uploadImage })로 올린다) ──
export { ImageEditor } from "./ui/image-editor";

// ── 레이아웃·피드백 ──
export { PageTitle } from "./ui/page-title";
export { EmptyState, EMPTY_ACTIONS } from "./ui/empty-state";
export { ToastProvider, useToast, TOAST_ACTION_MS } from "./ui/toast";

// ── 재질 계산 (직접 쓸 일은 드물다 — Button이 내부에서 사용) ──
export {
  grainAura,
  grainText,
  GrainNoise,
  AURA_FADE_MASK,
  stampMask,
  CONTROL_SIZES,
  CONTROL_RADIUS,
} from "./ui/grain";
export type { ControlSize } from "./ui/grain";

// ── 앱이 채워 넣는 바깥 세계 (라우터 링크 · 이미지 업로드 · 프록시) ──
export { configure } from "./config";
export type { Config } from "./config";

// ── 추가 공용 (2차 추출) ──
export * from "./ui/bottom-sheet";
export * from "./ui/cover-frame";
export * from "./ui/date-range-text";
export * from "./ui/dock-popover";
export * from "./ui/filter-chips";
export * from "./ui/heart-rating";
export * from "./ui/month-picker";
export * from "./ui/notice-area";
export * from "./ui/page-container";
export * from "./ui/palette-blobs";
export * from "./ui/postit-card";
export * from "./ui/recommendation-icon";
export * from "./ui/skeleton";
export * from "./ui/sticker-image";
export * from "./ui/weather-icon";
export * from "./ui/wish-icon";
export * from "./ui/date-picker";
export * from "./ui/text-swapper";
export * from "./ui/guest-avatar";
export * from "./ui/guest-tag";

// ── 순수 함수 · 훅 ──
export * from "./lib/guest-identity";
export * from "./lib/random-nickname";
export * from "./lib/text-swaps";
export * from "./lib/derive-date";
export * from "./lib/date-range";
export * from "./lib/storage";
export { useImagePalette } from "./hooks/useImagePalette";
export { useFileDrop } from "./hooks/useFileDrop";
